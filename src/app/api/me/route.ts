import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getUserFromToken } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const decoded = await getUserFromToken(request as any)
    
    if (!decoded) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token' 
        },
        { status: 401 }
      )
    }

    const user = await sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE id = ${decoded.userId}
    `

    if (!user || user.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user[0]
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const decoded = await getUserFromToken(request as any)

    if (!decoded) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token' 
        },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const currentPassword = formData.get('currentPassword') as string | null
    const newPassword = formData.get('newPassword') as string | null
    
    // Get current user data
    const currentUser = await sql`
      SELECT id, email, name, password_hash
      FROM users
      WHERE id = ${decoded.userId}
    `

    if (!currentUser || currentUser.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      )
    }

    const user = currentUser[0]

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Current password is required to change password' 
          },
          { status: 400 }
        )
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
      if (!isValidPassword) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Current password is incorrect' 
          },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updates: string[] = []
    const values: any[] = []

    if (name) {
      updates.push('name = ?')
      values.push(name)
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updates.push('password_hash = ?')
      values.push(hashedPassword)
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(decoded.userId)

      await sql.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      )
    }

    const updatedUser = await sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE id = ${decoded.userId}
      LIMIT 1
    `

    return NextResponse.json({
      success: true,
      data: updatedUser[0],
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile' 
      },
      { status: 500 }
    )
  }
}
