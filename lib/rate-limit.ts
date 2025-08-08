import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

// Create a simple in-memory store for development
class InMemoryStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map()

  async increment(identifier: string, windowMs: number): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now()
    const key = identifier
    const resetAt = now + windowMs

    const current = this.store.get(key)
    
    if (current && current.resetAt > now) {
      // Window is still active
      current.count++
      const remaining = Math.max(0, 10 - current.count) // Assuming limit of 10
      return {
        success: current.count <= 10,
        limit: 10,
        remaining,
        reset: current.resetAt
      }
    } else {
      // New window
      this.store.set(key, { count: 1, resetAt })
      
      // Clean up old entries
      for (const [k, v] of this.store.entries()) {
        if (v.resetAt < now) {
          this.store.delete(k)
        }
      }
      
      return {
        success: true,
        limit: 10,
        remaining: 9,
        reset: resetAt
      }
    }
  }
}

// Create rate limiter instances
let rateLimiters: {
  auth?: Ratelimit
  api?: Ratelimit
  contact?: Ratelimit
} = {}

// Initialize rate limiters
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Production: Use Upstash Redis
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  rateLimiters = {
    // Strict limit for auth endpoints
    auth: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
      analytics: true,
      prefix: 'ratelimit:auth',
    }),
    // Moderate limit for general API
    api: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '15 m'), // 100 requests per 15 minutes
      analytics: true,
      prefix: 'ratelimit:api',
    }),
    // Specific limit for contact form
    contact: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 messages per hour
      analytics: true,
      prefix: 'ratelimit:contact',
    }),
  }
} else {
  // Development: Log warnings but don't block
  console.log('⚠️ Rate limiting using in-memory store (development only)')
}

// Helper to get client identifier
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  // Use the first available IP
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown'
  
  return ip
}

// Rate limiting middleware for different endpoint types
export async function rateLimit(
  request: NextRequest,
  type: 'auth' | 'api' | 'contact' = 'api'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const identifier = getClientIdentifier(request)
  
  // In development without Redis, use in-memory rate limiting
  if (!rateLimiters[type]) {
    if (process.env.NODE_ENV === 'development') {
      // Simple in-memory rate limiting for development
      const store = new InMemoryStore()
      const windowMs = type === 'auth' ? 15 * 60 * 1000 : type === 'contact' ? 60 * 60 * 1000 : 15 * 60 * 1000
      return store.increment(identifier, windowMs)
    }
    
    // In production without Redis, allow all requests but log warning
    console.warn('⚠️ Rate limiting not configured - allowing request')
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
  
  const result = await rateLimiters[type]!.limit(identifier)
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}

// Export rate limit response helper
export function rateLimitResponse(result: { limit: number; remaining: number; reset: number }) {
  return new Response('Too many requests. Please try again later.', {
    status: 429,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      'Retry-After': Math.max(0, Math.ceil((result.reset - Date.now()) / 1000)).toString(),
    },
  })
}