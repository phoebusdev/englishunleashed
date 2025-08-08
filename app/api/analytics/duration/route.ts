import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      pathname: string
      sessionId: string
      duration: number
    }
    const { pathname, sessionId, duration } = body

    // Update the last page view with duration
    const lastPageView = await prisma.pageView.findFirst({
      where: {
        pathname,
        sessionId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (lastPageView) {
      await prisma.pageView.update({
        where: { id: lastPageView.id },
        data: { duration }
      })
    }

    // Update session duration
    await prisma.analyticsSession.update({
      where: { sessionId },
      data: {
        duration: { increment: duration },
        endedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Duration tracking error:', error)
    return NextResponse.json({ error: 'Failed to track duration' }, { status: 500 })
  }
}