import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Skip API routes and static files
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.includes('.')
  ) {
    return NextResponse.next()
  }
  
  try {
    // Get the token with proper secret
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    })
    
    // Check if it's an admin route
    if (path.startsWith('/admin')) {
      if (!token) {
        const url = new URL('/login', request.url)
        url.searchParams.set('callbackUrl', path)
        return NextResponse.redirect(url)
      }
      
      // Check if user is admin
      if (!token.isAdmin) {
        return NextResponse.redirect(new URL('/account', request.url))
      }
    }
    
    // Check if it's an account route
    if (path.startsWith('/account')) {
      if (!token) {
        const url = new URL('/login', request.url)
        url.searchParams.set('callbackUrl', path)
        return NextResponse.redirect(url)
      }
    }
    
    // Check if it's a quiz route
    if (path.startsWith('/quiz')) {
      if (!token) {
        const url = new URL('/login', request.url)
        url.searchParams.set('callbackUrl', path)
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
    // On error, allow the request to continue
    // The page itself will handle auth
  }
  
  return NextResponse.next()
}

// Temporarily disable middleware to debug
export const config = {
  matcher: [
    // '/admin/:path*',
    // '/account/:path*',
    // '/quiz/:path*',
  ],
}