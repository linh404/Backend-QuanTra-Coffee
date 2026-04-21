import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('Checkout request started')
    const body = await request.json()
    console.log('Request body:', body)
    
    const { addressId, paymentMethod } = body

    if (!addressId) {
      console.log('Missing addressId')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Address ID is required' 
        },
        { status: 400 }
      )
    }

    if (!paymentMethod || !['COD', 'VNPAY'].includes(paymentMethod)) {
      console.log('Invalid payment method:', paymentMethod)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid payment method' 
        },
        { status: 400 }
      )
    }

    // Get user ID from token
    const userId = getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    // Get cart with items
    const carts = await sql`
      SELECT * FROM carts WHERE user_id = ${userId}
    `

    if (carts.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cart is empty' 
        },
        { status: 400 }
      )
    }

    const cart = carts[0]

    // Get cart items with product details
    const items = await sql`
      SELECT 
        ci.*,
        p.name as product_name,
        p.price as current_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ${cart.id}
    `

    if (items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cart is empty' 
        },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.unit_price_snapshot) * item.qty)
    }, 0)

    const shippingFee = 30000 // Fixed shipping fee as specified
    const total = subtotal + shippingFee

    // Get shipping address
    console.log('Getting shipping address:', { addressId, userId })
    const address = await sql`
      SELECT * FROM user_addresses WHERE id = ${addressId} AND user_id = ${userId}
    `
    console.log('Found address:', address)

    if (address.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid shipping address' 
        },
        { status: 400 }
      )
    }

    // Create order with payment info
    console.log('Creating order with:', {
      userId,
      subtotal,
      shippingFee,
      total,
      paymentMethod,
      addressId
    })
    await sql`
      INSERT INTO orders (
        user_id, 
        status, 
        subtotal, 
        shipping_fee, 
        total, 
        payment_method,
        payment_status,
        shipping_address_id,
        placed_at, 
        updated_at
      )
      VALUES (
        ${userId}, 
        'pending', 
        ${subtotal}, 
        ${shippingFee}, 
        ${total},
        ${paymentMethod},
        'PENDING',
        ${addressId},
        NOW(), 
        NOW()
      )
    `

    const createdOrders = await sql`
      SELECT *
      FROM orders
      WHERE user_id = ${userId}
      ORDER BY placed_at DESC, id DESC
      LIMIT 1
    `

    const order = createdOrders[0]

    // Create order items
    const orderItems = await Promise.all(
      items.map(item =>
        sql`
          INSERT INTO order_items (order_id, product_id, qty, unit_price, total, updated_at)
          VALUES (${order.id}, ${item.product_id}, ${item.qty}, ${item.unit_price_snapshot}, ${parseFloat(item.unit_price_snapshot) * item.qty}, NOW())
        `
      )
    )

    // Clear cart
    await sql`
      DELETE FROM cart_items WHERE cart_id = ${cart.id}
    `

    return NextResponse.json({
      success: true,
      data: {
        order,
        orderItems: orderItems.map(item => item[0])
      }
    })
  } catch (error: any) {
    console.error('Error during checkout:', {
      error,
      message: error.message,
      code: error.code,
      detail: error.detail
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process checkout',
        detail: error.message || error.detail
      },
      { status: 500 }
    )
  }
}
