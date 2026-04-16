import crypto from 'crypto';

interface VNPayParams {
  amount: number;
  orderInfo: string;
  orderType?: string;
  bankCode?: string;
  language?: string;
  orderId: string;
  ipAddr: string;
}

export function createPaymentUrl({
  amount,
  orderInfo,
  orderType = 'billpayment',
  bankCode = '',
  language = 'vn',
  orderId,
  ipAddr,
}: VNPayParams): string {

  // ✅ LẤY ENV BÊN TRONG FUNCTION (QUAN TRỌNG)
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;

  if (!tmnCode || !secretKey) {
    throw new Error('Missing VNPay config');
  }

  const vnpUrl =
    process.env.VNPAY_URL ||
    'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

  const returnUrl =
    process.env.VNPAY_RETURN_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/payment/vnpay/return`
      : 'http://localhost:3000/api/payment/vnpay/return');

  const createDate = formatVnpDate(new Date());
  const expireDate = formatVnpDate(new Date(Date.now() + 15 * 60 * 1000));

  const currCode = 'VND';
  const normalizedOrderInfo = normalizeOrderInfo(orderInfo, orderId);

  const vnpParams: Record<string, string | number> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: language,
    vnp_CurrCode: currCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: normalizedOrderInfo,
    vnp_OrderType: orderType,
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) {
    vnpParams.vnp_BankCode = bankCode;
  }

  const sortedParams = sortObject(vnpParams);
  const signData = stringifyVnpParams(sortedParams);

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  sortedParams['vnp_SecureHash'] = signed;

  return `${vnpUrl}?${stringifyVnpParams(sortedParams)}`;
}

export function verifyReturnUrl(query: Record<string, string>) {

  const secretKey = process.env.VNPAY_HASH_SECRET;

  if (!secretKey) {
    throw new Error('Missing VNPay config');
  }

  const vnpParams = Object.keys(query)
    .filter((key) => key.startsWith('vnp_'))
    .reduce((acc: Record<string, string>, key) => {
      acc[key] = query[key];
      return acc;
    }, {});

  const secureHash = vnpParams['vnp_SecureHash'];

  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType'];

  const sortedParams = sortObject(vnpParams);
  const signData = stringifyVnpParams(sortedParams);

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  const orderId = vnpParams['vnp_TxnRef'];
  const amount = Number(vnpParams['vnp_Amount']) / 100;

  return {
    isValid: secureHash === signed,
    orderId,
    amount,
  };
}

function sortObject(obj: Record<string, string | number>) {
  const sorted: Record<string, string | number> = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    if (obj[key]) {
      sorted[key] = obj[key];
    }
  }

  return sorted;
}

function stringifyVnpParams(
  obj: Record<string, string | number>
) {
  return Object.entries(obj)
    .map(([key, value]) => {
      const normalizedValue = String(value);
      return `${encodeURIComponent(key)}=${encodeURIComponent(normalizedValue).replace(
        /%20/g,
        '+'
      )}`;
    })
    .join('&');
}

function formatVnpDate(date: Date) {
  const vietnamDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
  );

  return `${vietnamDate.getFullYear()}${String(vietnamDate.getMonth() + 1).padStart(2, '0')}${String(
    vietnamDate.getDate()
  ).padStart(2, '0')}${String(vietnamDate.getHours()).padStart(2, '0')}${String(
    vietnamDate.getMinutes()
  ).padStart(2, '0')}${String(vietnamDate.getSeconds()).padStart(2, '0')}`;
}

function normalizeOrderInfo(orderInfo: string, orderId: string) {
  const asciiText = orderInfo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return asciiText || `Thanh toan don hang ${orderId}`;
}
