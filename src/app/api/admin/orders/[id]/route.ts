import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Yêu cầu đăng nhập' }, { status: 401 })
    }

    const { id } = await params
    const orderId = parseInt(id)
    
    const body = await request.json()
    const { action } = body 

    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Yêu cầu quyền Admin' }, { status: 403 })
    }

    let newStatus: string = ''
    switch (action) {
      case 'confirm': 
        newStatus = 'confirmed';
        break;
      case 'pay': 
        newStatus = 'paid'; 
        break;
      case 'ship':    
        newStatus = 'shipped'; 
        break;
      case 'deliver': 
        newStatus = 'delivered'; 
        break;
      case 'cancel':  
        newStatus = 'cancelled'; 
        break;
      default:
        return NextResponse.json({ success: false, error: `Hành động không hợp lệ: ${action}` }, { status: 400 })
    }

    // Thực hiện cập nhật Database
    await sql`
      UPDATE orders 
      SET 
        status = ${newStatus},
        payment_status = CASE 
          WHEN ${action} = 'pay' THEN 'SUCCESS' 
          ELSE payment_status 
        END,
        paid_at = CASE 
          WHEN ${action} = 'pay' OR (${action} = 'confirm' AND payment_status = 'SUCCESS') THEN NOW() 
          ELSE paid_at 
        END,
        shipped_at = CASE WHEN ${action} = 'ship' THEN NOW() ELSE shipped_at END,
        delivered_at = CASE WHEN ${action} = 'deliver' THEN NOW() ELSE delivered_at END,
        cancelled_at = CASE WHEN ${action} = 'cancel' THEN NOW() ELSE cancelled_at END,
        updated_at = NOW(),
        updated_by = ${user.userId}
      WHERE id = ${orderId}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Lỗi khi cập nhật đơn hàng' 
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)

    const orders = await sql`
      SELECT 
        o.*, 
        u.name as user_name, 
        u.email as user_email,
        ua.line1 as address_line1,
        ua.city,
        ua.district,
        ua.ward
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN user_addresses ua ON o.shipping_address_id = ua.id
      WHERE o.id = ${orderId}
    `

    if (orders.length === 0) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 })
    }

    const items = await sql`
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId}
    `

    return NextResponse.json({
      success: true,
      data: { ...orders[0], items }
    })
  } catch (error) {
    console.error('Error fetching order detail:', error)
    return NextResponse.json({ success: false, error: 'Lỗi server nội bộ' }, { status: 500 })
  }
}