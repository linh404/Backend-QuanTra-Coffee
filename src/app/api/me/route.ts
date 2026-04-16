import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No token provided' 
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      
      const user = await sql`
        SELECT id, email, name, role, avatar, created_at FROM users WHERE id = ${decoded.userId}
      `

      if (!user) {
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
    } catch (jwtError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token' 
        },
        { status: 401 }
      )
    }
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
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No token provided' 
        },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const avatar = formData.get('avatar') as File | null
    const currentPassword = formData.get('currentPassword') as string | null
    const newPassword = formData.get('newPassword') as string | null
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      
      // Get current user data
      const currentUser = await sql`
        SELECT id, email, name, password_hash FROM users WHERE id = ${decoded.userId}
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

      // Handle avatar upload
      let avatarUrl = null
      if (avatar) {
        const bytes = await avatar.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileName = Date.now() + '-' + avatar.name
        const uploadPath = path.join(process.cwd(), 'public/uploads', fileName)
        
        await writeFile(uploadPath, buffer)
        avatarUrl = '/uploads/' + fileName
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date()
      }

      if (name) updateData.name = name
      if (newPassword) {
        updateData.password_hash = await bcrypt.hash(newPassword, 12)
      }

      // Build dynamic update query
      let updateQuery = 'UPDATE users SET '
      const updateValues: any[] = []
      let paramIndex = 1
      
      if (updateData.name) {
        updateQuery += `name = $${paramIndex}, `
        updateValues.push(updateData.name)
        paramIndex++
      }
      
      if (updateData.password_hash) {
        updateQuery += `password_hash = $${paramIndex}, `
        updateValues.push(updateData.password_hash)
        paramIndex++
      }
      
      if (avatarUrl) {
        updateQuery += `avatar = $${paramIndex}, `
        updateValues.push(avatarUrl)
        paramIndex++
      }
      
      updateQuery += `updated_at = $${paramIndex} WHERE id = $${paramIndex + 1} RETURNING id, email, name, role, avatar, created_at, updated_at`
      updateValues.push(updateData.updated_at, decoded.userId)
      
      const updatedUser = await sql.query(updateQuery, updateValues)

      return NextResponse.json({
        success: true,
        data: updatedUser[0],
        message: 'Profile updated successfully'
      })

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token' 
        },
        { status: 401 }
      )
    }
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
