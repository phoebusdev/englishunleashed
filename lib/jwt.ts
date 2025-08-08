import jwt from 'jsonwebtoken'
import { env } from 'env.mjs'

// Use NextAuth secret for JWT signing
const JWT_SECRET = env.NEXTAUTH_SECRET || 'development-secret'

interface DownloadTokenPayload {
  orderId: string
  userId: string
  packId: string
  exp?: number
}

// Generate a secure download token
export function generateDownloadToken(
  orderId: string,
  userId: string,
  packId: string,
  expiresIn: string | number = '24h'
): string {
  const payload: DownloadTokenPayload = {
    orderId,
    userId,
    packId,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: 'englishunleashed.com',
    audience: 'download',
  })
}

// Verify and decode download token
export function verifyDownloadToken(token: string): DownloadTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'englishunleashed.com',
      audience: 'download',
    }) as DownloadTokenPayload

    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Generate a shorter, URL-safe token for email links
export function generateEmailToken<T extends Record<string, unknown>>(data: T, expiresIn: string | number = '1h'): string {
  return jwt.sign(data, JWT_SECRET, {
    expiresIn,
    issuer: 'englishunleashed.com',
  })
}

// Verify email tokens (password reset, etc.)
export function verifyEmailToken<T = Record<string, unknown>>(token: string): T | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'englishunleashed.com',
    }) as T

    return decoded
  } catch (error) {
    console.error('Email token verification failed:', error)
    return null
  }
}