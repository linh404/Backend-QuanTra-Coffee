import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

/**
 * AUTHENTICATION UTILS
 * Handles user extraction from JWT tokens in cookies
 */

export async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const user = await getUserFromToken(request)
  return user ? user.userId : null
}

export async function getUserIdFromCookie(request: NextRequest): Promise<string | null> {
  return getUserIdFromToken(request)
}

export async function getUserFromToken(request: NextRequest): Promise<any | null> {
  // Try to get token from cookie
  const token = request.cookies.get('token')?.value
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      return {
        userId: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role
      }
    } catch (err) {
      console.error('JWT verification failed:', err)
    }
  }

  // Fallback to mock for development
  return {
    userId: "0",
    email: "nva@gmail.com",
    role: "admin"
  }
}