/**
 * MoMo Payment Service
 * 
 * Uses HMAC-SHA256 signature (different from VNPay which uses SHA512).
 * Amount is sent as-is (integer VND), NOT multiplied by 100.
 * Raw signature fields must be in ALPHABETICAL order.
 */

import crypto from 'crypto';

interface MoMoPaymentParams {
  orderId: string;
  amount: number;
  orderInfo: string;
  returnUrl?: string;
  notifyUrl?: string;
}

interface MoMoPaymentResult {
  success: boolean;
  payUrl: string | null;
  qrCodeUrl?: string | null;
  deeplink?: string | null;
  requestId: string;
  error: string | null;
  resultCode?: number;
}

interface MoMoIPNData {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  amount?: string | number;
  orderInfo?: string;
  orderType?: string;
  transId?: string | number;
  resultCode?: number;
  message?: string;
  payType?: string;
  responseTime?: string | number;
  extraData?: string;
  signature?: string;
}

function getMoMoConfig() {
  return {
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMONPMB20210629',
    accessKey: process.env.MOMO_ACCESS_KEY || 'Q2XhhSdgpKUlQ4Ky',
    secretKey: process.env.MOMO_SECRET_KEY || 'k6B53GQKSjktZGJBK2MyrDa7w9S6RyCf',
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    queryEndpoint: process.env.MOMO_QUERY_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/query',
  };
}

function generateSignature(rawSignature: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature, 'utf-8')
    .digest('hex');
}

export async function createMoMoPayment({
  orderId,
  amount,
  orderInfo,
  returnUrl,
  notifyUrl,
}: MoMoPaymentParams): Promise<MoMoPaymentResult> {
  const config = getMoMoConfig();
  const requestId = crypto.randomUUID();

  // Build default URLs if not provided
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const finalReturnUrl = returnUrl || `${baseUrl}/api/payment/momo/return`;
  const finalNotifyUrl = notifyUrl || `${baseUrl}/api/payment/momo/ipn`;

  const requestType = 'captureWallet';
  const extraData = '';

  // IMPORTANT: Raw signature fields MUST be in ALPHABETICAL order
  const rawSignature =
    `accessKey=${config.accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${finalNotifyUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${config.partnerCode}` +
    `&redirectUrl=${finalReturnUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  const signature = generateSignature(rawSignature, config.secretKey);

  const requestBody = {
    partnerCode: config.partnerCode,
    accessKey: config.accessKey,
    requestId,
    amount: String(amount),
    orderId,
    orderInfo,
    redirectUrl: finalReturnUrl,
    ipnUrl: finalNotifyUrl,
    extraData,
    requestType,
    signature,
    lang: 'vi',
  };

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (result.resultCode === 0) {
      return {
        success: true,
        payUrl: result.payUrl,
        qrCodeUrl: result.qrCodeUrl || null,
        deeplink: result.deeplink || null,
        requestId,
        error: null,
      };
    } else {
      console.error('[MoMo] Payment creation failed:', result);
      return {
        success: false,
        payUrl: null,
        requestId,
        error: result.message || 'Unknown MoMo error',
        resultCode: result.resultCode,
      };
    }
  } catch (err: any) {
    console.error('[MoMo] API request failed:', err);
    return {
      success: false,
      payUrl: null,
      requestId,
      error: err.message || 'MoMo API request failed',
    };
  }
}

export function verifyMoMoIPN(data: MoMoIPNData): boolean {
  const config = getMoMoConfig();
  const receivedSignature = data.signature || '';

  // IMPORTANT: IPN signature fields are DIFFERENT from create request
  // and MUST be in ALPHABETICAL order
  const rawSignature =
    `accessKey=${config.accessKey}` +
    `&amount=${data.amount || ''}` +
    `&extraData=${data.extraData || ''}` +
    `&message=${data.message || ''}` +
    `&orderId=${data.orderId || ''}` +
    `&orderInfo=${data.orderInfo || ''}` +
    `&orderType=${data.orderType || ''}` +
    `&partnerCode=${data.partnerCode || ''}` +
    `&payType=${data.payType || ''}` +
    `&requestId=${data.requestId || ''}` +
    `&responseTime=${data.responseTime || ''}` +
    `&resultCode=${data.resultCode ?? ''}` +
    `&transId=${data.transId || ''}`;

  const expectedSignature = generateSignature(rawSignature, config.secretKey);

  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, 'utf-8'),
    Buffer.from(expectedSignature, 'utf-8')
  );
}

export function isMoMoPaymentSuccessful(resultCode: number): boolean {
  return resultCode === 0;
}

export async function queryMoMoTransactionStatus(
  orderId: string,
  requestId: string
): Promise<any> {
  const config = getMoMoConfig();

  const rawSignature =
    `accessKey=${config.accessKey}` +
    `&orderId=${orderId}` +
    `&partnerCode=${config.partnerCode}` +
    `&requestId=${requestId}`;

  const signature = generateSignature(rawSignature, config.secretKey);

  const requestBody = {
    partnerCode: config.partnerCode,
    accessKey: config.accessKey,
    requestId,
    orderId,
    signature,
    lang: 'vi',
  };

  try {
    const response = await fetch(config.queryEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    return await response.json();
  } catch (err: any) {
    console.error('[MoMo] Query failed:', err);
    return { error: err.message };
  }
}
