import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Authentication disabled as requested
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/cart/:path*',
    '/api/me',
    '/api/me/:path*',
    '/api/orders/:path*',
    '/api/payment/:path*',
    '/api/checkout/:path*',
    '/api/admin/:path*'
  ],
}