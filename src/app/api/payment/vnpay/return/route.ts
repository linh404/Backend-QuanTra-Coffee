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
      const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:5173';
      return redirect(`${frontendUrl}/checkout-success?status=failed&method=vnpay`);
    }

    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const isSuccess = vnp_ResponseCode === '00';

    // Validate orderId
    if (!orderId || isNaN(Number(orderId))) {
      console.error('[VNPay] Invalid orderId:', orderId);
      const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:5173';
      return redirect(`${frontendUrl}/checkout-success?status=failed&method=vnpay`);
    }

    // Update order - AUTO CONFIRM on successful payment (no admin needed)
    if (isSuccess) {
      await sql`
        UPDATE orders 
        SET 
          payment_status = 'SUCCESS',
          status = 'confirmed',
          paid_at = NOW(),
          updated_at = NOW()
        WHERE id = ${Number(orderId)}
      `;
    } else {
      await sql`
        UPDATE orders 
        SET 
          payment_status = 'FAILED',
          updated_at = NOW()
        WHERE id = ${Number(orderId)}
      `;
    }

    console.log('[VNPay] Payment result:', {
      orderId,
      isSuccess,
      amount,
      code: vnp_ResponseCode,
    });

    // Redirect to frontend
    const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return redirect(
      `${frontendUrl}/checkout-success?status=${isSuccess ? 'success' : 'failed'}&method=vnpay&orderId=${orderId}`
    );

  } catch (error) {
    console.error('[VNPay Return Error]:', error);
    const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:5173';
    return redirect(`${frontendUrl}/checkout-success?status=failed&method=vnpay`);
  }
}