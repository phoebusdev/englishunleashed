import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Check if it's an admin route
  if (path.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check if user is admin (you might need to add isAdmin to the token)
    if (!token.isAdmin) {
      return NextResponse.redirect(new URL('/account', request.url))
    }
  }
  
  // Check if it's an account route
  if (path.startsWith('/account')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // Check if it's a quiz route
  if (path.startsWith('/quiz')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/quiz/:path*',
  ],
}