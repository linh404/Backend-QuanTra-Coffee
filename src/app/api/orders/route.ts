import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'
import { createPaymentUrl } from '@/lib/vnpay'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const orders = await sql`
      SELECT 
        id,
        user_id as userId,
        status,
        total as totalAmount,
        payment_method as paymentMethod,
        payment_status as paymentStatus,
        placed_at as createdAt,
        shipping_address_id as shippingAddressId
      FROM orders 
      WHERE user_id = ${userId}
      ORDER BY placed_at DESC
    `

    return NextResponse.json({
      success: true,
      data: orders
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { 
      items, 
      subtotal, 
      shippingFee, 
      total, 
      paymentMethod, 
      shippingAddressId 
    } = await request.json()

    if (!items || items.length === 0 || shippingAddressId === undefined || shippingAddressId === null) {
      return NextResponse.json(
        { success: false, error: 'Missing order information (items or address)' },
        { status: 400 }
      )
    }


    // 1. Stock Check
    for (const item of items) {
      const products = await sql`SELECT stock, name FROM products WHERE id = ${item.product.id}`
      if (products.length === 0) {
        return NextResponse.json(
          { success: false, error: `Product ${item.product.name} not found` },
          { status: 404 }
        )
      }
      if (products[0].stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Sản phẩm ${products[0].name} không đủ tồn kho (còn lại: ${products[0].stock})` },
          { status: 400 }
        )
      }
    }

    // 2. Create the order
    await sql`
      INSERT INTO orders (
        user_id, status, subtotal, shipping_fee, total, 
        payment_method, payment_status, shipping_address_id, 
        placed_at, updated_at
      )
      VALUES (
        ${userId}, 'pending', ${subtotal}, ${shippingFee}, ${total}, 
        ${paymentMethod}, 'PENDING', ${shippingAddressId}, 
        NOW(), NOW()
      )
    `

    const newOrders = await sql`
      SELECT id FROM orders 
      WHERE user_id = ${userId} 
      ORDER BY placed_at DESC 
      LIMIT 1
    `
    const orderId = newOrders[0].id

    // 3. Create order items and Reduce Stock
    for (const item of items) {
      const itemTotal = item.product.price * item.quantity
      // Insert item
      await sql`
        INSERT INTO order_items (order_id, product_id, qty, unit_price, total, updated_at)
        VALUES (${orderId}, ${item.product.id}, ${item.quantity}, ${item.product.price}, ${itemTotal}, NOW())
      `
      // Reduce stock
      await sql`
        UPDATE products 
        SET stock = stock - ${item.quantity}
        WHERE id = ${item.product.id}
      `
    }

    // 4. Clear Cart
    // First find the cart ID
    const carts = await sql`SELECT id FROM carts WHERE user_id = ${userId}`
    if (carts.length > 0) {
      await sql`DELETE FROM cart_items WHERE cart_id = ${carts[0].id}`
    }

    // 5. Handle Payment Flow
    let paymentUrl = null
    if (paymentMethod === 'VNPAY' || paymentMethod === 'vnpay') {
      try {
        paymentUrl = createPaymentUrl({
          amount: total,
          orderId: String(orderId),
          orderInfo: `Thanh toan don hang ${orderId}`,
          ipAddr: request.headers.get('x-forwarded-for') || '127.0.0.1'
        })
      } catch (err: any) {
        console.error('VNPay error:', err)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        paymentUrl,
        message: paymentUrl ? 'Redirecting to payment' : 'Order placed successfully'
      }
    })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to place order',
        detail: error.message
      },
      { status: 500 }
    )
  }
}


