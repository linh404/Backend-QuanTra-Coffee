import { NextRequest, NextResponse } from 'next/server';
import { createMoMoPayment } from '@/lib/momo';
import { sql } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, amount, orderInfo } = body;

    if (!orderId || !amount || !orderInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify order belongs to user
    const orders = await sql`
      SELECT id FROM orders 
      WHERE id = ${orderId} AND user_id = ${userId}
    `;

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // MoMo requires unique orderId per request, so prefix with timestamp
    const momoOrderId = `${orderId}_${Date.now()}`;

    const result = await createMoMoPayment({
      orderId: momoOrderId,
      amount: Math.round(amount),
      orderInfo,
    });

    if (result.success && result.payUrl) {
      // Update order with MoMo info
      await sql`
        UPDATE orders 
        SET payment_method = 'MOMO',
            payment_status = 'PENDING',
            momo_request_id = ${result.requestId}
        WHERE id = ${orderId} AND user_id = ${userId}
      `;

      console.log('[MoMo] Payment created for order:', orderId, '-> momoOrderId:', momoOrderId);
      return NextResponse.json({ paymentUrl: result.payUrl });
    } else {
      console.error('[MoMo] Payment creation failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Could not create MoMo payment' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[MoMo Payment Error]:', error);
    return NextResponse.json(
      { error: 'Could not process MoMo payment' },
      { status: 500 }
    );
  }
}
