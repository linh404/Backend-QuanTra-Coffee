import { NextResponse } from 'next/server';
import { verifyReturnUrl } from '@/lib/vnpay';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Convert query params
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // Verify checksum + extract data
    const { isValid, orderId, amount } = verifyReturnUrl(query);

    if (!isValid) {
      console.error('[VNPay] Invalid checksum');
      return redirect(`${process.env.NEXTAUTH_URL}/payment/failed`);
    }

    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const isSuccess = vnp_ResponseCode === '00';

    // ⚠️ Validate orderId
    if (!orderId || isNaN(Number(orderId))) {
      console.error('[VNPay] Invalid orderId:', orderId);
      return redirect(`${process.env.NEXTAUTH_URL}/payment/failed`);
    }

    // Update order
    await sql`
      UPDATE orders 
      SET 
        payment_status = ${isSuccess ? 'SUCCESS' : 'FAILED'},
        status = ${isSuccess ? 'paid' : 'cancelled'},
        paid_at = ${isSuccess ? new Date() : null},
        cancelled_at = ${isSuccess ? null : new Date()},
        updated_at = NOW()
      WHERE id = ${Number(orderId)}
    `;

    console.log('[VNPay] Payment result:', {
      orderId,
      isSuccess,
      amount,
      code: vnp_ResponseCode,
    });

    // Redirect
    return redirect(
      `${process.env.NEXTAUTH_URL}/payment/${isSuccess ? 'success' : 'failed'}`
    );

  } catch (error) {
    console.error('[VNPay Return Error]:', error);
    return redirect(`${process.env.NEXTAUTH_URL}/payment/failed`);
  }
}