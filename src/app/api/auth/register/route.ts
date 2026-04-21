import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
  const { email, password, name, role = 'buyer', line1, city, district, ward } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email, password, and name are required' 
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User already exists' 
        },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    await sql`
      INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
      VALUES (${email}, ${passwordHash}, ${name}, ${role}, NOW(), NOW())
    `

    const createdUsers = await sql`
      SELECT id, email, name, role
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `

    const user = createdUsers[0]
    
    // If address fields provided, save into user_addresses
    if (line1 && city && district && ward) {
      try {
        await sql`
          INSERT INTO user_addresses (user_id, line1, city, district, ward, is_default, created_at, updated_at)
          VALUES (${user.id}, ${line1}, ${city}, ${district}, ${ward}, true, NOW(), NOW())
        `
      } catch (err) {
        console.error('Failed to save user address during registration:', err)
        // non-blocking: continue registration even if address insert fails
      }
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    })
  } catch (error) {
    console.error('Error registering user:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register user' 
      },
      { status: 500 }
    )
  }
}
