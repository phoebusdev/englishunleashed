import { NextResponse } from 'next/server'
import { trackPageView } from '@/lib/analytics'

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      pathname: string
      sessionId: string
      userId?: string
      referrer?: string
      userAgent?: string
      geo?: any
    }
    const { pathname, sessionId, userId, referrer, userAgent, geo } = body

    await trackPageView({
      pathname,
      sessionId,
      userId,
      referrer,
      userAgent,
      geo,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}