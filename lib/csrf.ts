import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_SECRET_LENGTH = 32

/**
 * Generates a new CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_SECRET_LENGTH).toString('hex')
}

/**
 * Gets the CSRF token from cookies or generates a new one
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = cookies()
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME)?.value
  
  if (existingToken) {
    return existingToken
  }
  
  const newToken = generateCsrfToken()
  cookieStore.set(CSRF_TOKEN_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
  
  return newToken
}

/**
 * Validates CSRF token from request
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  // Skip CSRF validation for GET requests
  if (request.method === 'GET') {
    return true
  }
  
  const cookieStore = cookies()
  const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  
  if (!cookieToken || !headerToken) {
    return false
  }
  
  return cookieToken === headerToken
}

/**
 * Hook to use in client components to get CSRF token
 */
export function useCsrfToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  // Read from cookie in browser
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_TOKEN_NAME}=([^;]+)`))
  return match ? match[2] : null
}