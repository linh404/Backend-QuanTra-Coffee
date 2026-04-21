import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
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

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required' 
        },
        { status: 403 }
      )
    }

    // Get all users with order statistics
    const users = await sql`
      SELECT 
        u.*,
        COALESCE(order_stats.total_orders, 0) as total_orders,
        COALESCE(order_stats.total_spent, 0) as total_spent
      FROM users u
      LEFT JOIN (
        SELECT 
          user_id,
          COUNT(*) as total_orders,
          SUM(total) as total_spent
        FROM orders 
        WHERE status != 'cancelled'
        GROUP BY user_id
      ) order_stats ON u.id = order_stats.user_id
      ORDER BY u.created_at DESC
    `

    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
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

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin access required' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, status, role } = body

    if (status && !role) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User status is not supported by the current MySQL schema' 
        },
        { status: 400 }
      )
    }

    if (!role) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No fields to update' 
        },
        { status: 400 }
      )
    }

    await sql`
      UPDATE users 
      SET role = ${role}, updated_at = NOW()
      WHERE id = ${userId}
    `

    const updatedUsers = await sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `

    return NextResponse.json({
      success: true,
      data: updatedUsers[0]
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user' 
      },
      { status: 500 }
    )
  }
}
