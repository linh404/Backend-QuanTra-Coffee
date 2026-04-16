import { NextRequest, NextResponse } from 'next/server'; // Thay đổi Request thành NextRequest
import { createPaymentUrl } from '@/lib/vnpay';
import { sql } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth-utils'; // Import helper lấy ID từ token

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) { // Sử dụng NextRequest
  try {
    // Thay thế getServerSession bằng getUserIdFromToken để đồng bộ với Checkout
    const userId = getUserIdFromToken(request);
    console.log('User ID in VNPay create:', userId);
    
    if (!userId) {
      console.error('No user ID found from token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, amount, orderInfo } = body;

    if (!orderId || !amount || !orderInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const ipAddr =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';

      // Create VNPay payment URL
      const paymentUrl = createPaymentUrl({
        amount,
        orderInfo,
        orderId: orderId.toString(),
        ipAddr,
      });

      if (!paymentUrl || !paymentUrl.startsWith('https://')) {
        console.error('Invalid payment URL generated:', paymentUrl);
        return NextResponse.json(
          { error: 'Could not generate valid payment URL' },
          { status: 500 }
        );
      }

      // Verify order belongs to user
      const orders = await sql`
        SELECT id FROM orders 
        WHERE id = ${orderId} AND user_id = ${userId}
      `;

      if (orders.length === 0) {
        console.error('Order not found or does not belong to user:', { orderId, userId });
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      // Update order payment method
      await sql`
        UPDATE orders 
        SET payment_method = 'VNPAY',
            payment_status = 'PENDING'
        WHERE id = ${orderId} AND user_id = ${userId}
      `;

      console.log('Generated VNPay payment URL for order:', orderId);
      return NextResponse.json({ paymentUrl });
    } catch (err) {
      console.error('Error generating VNPay payment URL:', err);
      return NextResponse.json(
        { error: 'Could not generate payment URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Payment Error]:', error);
    return NextResponse.json(
      { error: 'Could not process payment' },
      { status: 500 }
    );
  }
}
