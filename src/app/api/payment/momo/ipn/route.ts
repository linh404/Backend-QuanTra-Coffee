import { NextRequest, NextResponse } from 'next/server';
import { verifyMoMoIPN, isMoMoPaymentSuccessful } from '@/lib/momo';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * MoMo IPN callback - server-to-server POST request
 * MoMo sends JSON body with payment result
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('[MoMo IPN] Received:', JSON.stringify(data, null, 2));

    if (!data) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    // Verify signature
    let signatureValid = false;
    try {
      signatureValid = verifyMoMoIPN(data);
    } catch (err) {
      console.error('[MoMo IPN] Signature verification error:', err);
    }

    if (!signatureValid) {
      console.error('[MoMo IPN] Invalid signature');
      // Still return 200 to avoid MoMo retrying
      return NextResponse.json({ message: 'Invalid signature' }, { status: 200 });
    }

    // Extract real orderId from MoMo's orderId (we prefixed with timestamp)
    const momoOrderId = data.orderId || '';
    const realOrderId = momoOrderId.split('_')[0];
    const resultCode = data.resultCode;

    if (!realOrderId || isNaN(Number(realOrderId))) {
      console.error('[MoMo IPN] Invalid orderId:', momoOrderId);
      return NextResponse.json({ message: 'Invalid orderId' }, { status: 200 });
    }

    const orderId = Number(realOrderId);

    if (isMoMoPaymentSuccessful(resultCode)) {
      // Payment successful - auto confirm the order
      await sql`
        UPDATE orders 
        SET 
          payment_status = 'SUCCESS',
          status = 'confirmed',
          paid_at = NOW(),
          momo_trans_id = ${String(data.transId || '')},
          updated_at = NOW()
        WHERE id = ${orderId}
      `;
      console.log('[MoMo IPN] Order', orderId, 'paid and auto-confirmed successfully');
    } else {
      // Payment failed
      await sql`
        UPDATE orders 
        SET 
          payment_status = 'FAILED',
          updated_at = NOW()
        WHERE id = ${orderId}
      `;
      console.log('[MoMo IPN] Order', orderId, 'payment failed, resultCode:', resultCode);
    }

    // MoMo requires HTTP 200 response
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error) {
    console.error('[MoMo IPN Error]:', error);
    return NextResponse.json({ message: 'Internal error' }, { status: 200 });
  }
}
