import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)
    
    // Check authentication
    const user = getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required' 
        },
        { status: 403 }
      )
    }

    const { shippingProvider, trackingNumber } = await request.json()

    await sql`
      UPDATE orders 
      SET status = 'shipped', shipped_at = NOW(), shipping_provider = ${shippingProvider}, tracking_number = ${trackingNumber}
      WHERE id = ${orderId}
    `

    return NextResponse.json({
      success: true,
      message: 'Order marked as shipped'
    })
  } catch (error) {
    console.error('Error marking order as shipped:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to mark order as shipped' 
      },
      { status: 500 }
    )
  }
}
