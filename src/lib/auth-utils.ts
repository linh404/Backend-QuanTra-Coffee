import { NextRequest } from 'next/server'

/**
 * AUTHENTICATION DISABLED - MOCK MODE
 * These functions always return User ID 0 (nva@gmail.com)
 */

export async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  return "0"
}

export async function getUserIdFromCookie(request: NextRequest): Promise<string | null> {
  return "0"
}

export async function getUserFromToken(request: NextRequest): Promise<any | null> {
  return {
    userId: "0",
    email: "nva@gmail.com",
    role: "buyer"
  }
}