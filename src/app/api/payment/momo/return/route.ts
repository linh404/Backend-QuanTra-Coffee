import { NextRequest } from 'next/server';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * MoMo return URL - user is redirected here after payment
 * MoMo sends result as query parameters (GET request)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('[MoMo Return] Full Params:', Object.fromEntries(searchParams.entries()));

    const momoOrderId = searchParams.get('orderId') || '';
    const resultCode = searchParams.get('resultCode');
    
    // MoMo resultCode '0' is success. We check for both string '0' and number 0.
    const isSuccess = resultCode === '0' || resultCode === '00'; 
    
    // Fallback: Nếu không có resultCode nhưng có transId và message=Success thì cũng coi là thành công
    const message = searchParams.get('message');
    const transId = searchParams.get('transId');
    const finalSuccess = isSuccess || (message?.toLowerCase() === 'success' && transId);

    // Extract real orderId from prefixed MoMo orderId
    const realOrderId = momoOrderId.split('_')[0];

    if (!realOrderId || isNaN(Number(realOrderId))) {
      console.error('[MoMo Return] Invalid orderId:', momoOrderId);
      return redirect(`${process.env.NEXTAUTH_URL || 'http://localhost:5173'}/checkout-success?status=failed&method=momo`);
    }

    const orderId = Number(realOrderId);

    console.log('[MoMo Return] Payment result:', {
      orderId,
      isSuccess: finalSuccess,
      resultCode,
    });

    // Update order status (IPN may have already done this, but as a fallback)
    if (finalSuccess) {
      await sql`
        UPDATE orders 
        SET 
          payment_status = 'SUCCESS',
          status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
          paid_at = COALESCE(paid_at, NOW()),
          updated_at = NOW()
        WHERE id = ${orderId}
      `;
    } else {
      await sql`
        UPDATE orders 
        SET 
          payment_status = 'FAILED',
          updated_at = NOW()
        WHERE id = ${orderId}
      `;
    }

    // Redirect to frontend (Sử dụng port 3000 nếu không có NEXTAUTH_URL)
    const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    return redirect(
      `${frontendUrl}/checkout-success?status=${finalSuccess ? 'success' : 'failed'}&method=momo&orderId=${orderId}`
    );

  } catch (error) {
    console.error('[MoMo Return Error]:', error);
    const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:5173';
    return redirect(`${frontendUrl}/checkout-success?status=failed&method=momo`);
  }
}
