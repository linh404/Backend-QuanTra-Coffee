import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define protected API routes
  const isProtectedApiRoute = path.startsWith('/api/') && 
    !path.startsWith('/api/auth/') && 
    !path.startsWith('/api/categories') &&
    !path.startsWith('/api/products') &&
    !path.startsWith('/api/contact')

  if (isProtectedApiRoute) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    // Return error if no token found
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/cart/:path*',
    '/api/me/:path*',
    '/api/orders/:path*',
    '/api/payment/:path*',
    '/api/checkout/:path*',
    '/api/admin/:path*'
  ],
}