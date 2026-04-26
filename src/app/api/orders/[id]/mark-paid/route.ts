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
    const user = await getUserFromToken(request)
    
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

    const { paymentProofUrl } = await request.json()

    await sql`
      UPDATE orders 
      SET status = 'paid', paid_at = NOW(), payment_proof_url = ${paymentProofUrl || null}
      WHERE id = ${orderId}
    `

    return NextResponse.json({
      success: true,
      message: 'Order marked as paid'
    })
  } catch (error) {
    console.error('Error marking order as paid:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to mark order as paid' 
      },
      { status: 500 }
    )
  }
}
