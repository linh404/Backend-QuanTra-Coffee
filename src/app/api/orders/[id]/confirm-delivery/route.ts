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

    await sql`
      UPDATE orders 
      SET status = 'delivered', delivered_at = NOW()
      WHERE id = ${orderId}
    `

    return NextResponse.json({
      success: true,
      message: 'Order marked as delivered'
    })
  } catch (error) {
    console.error('Error confirming delivery:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to confirm delivery' 
      },
      { status: 500 }
    )
  }
}
