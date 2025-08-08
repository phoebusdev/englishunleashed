import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { syncSpecificVideo, syncLatestYouTubeVideo, getQuotaUsage } from '@/lib/youtube-optimized'
import { prisma } from '@/lib/db'

// GET: Check sync status and quota
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get quota usage
    const quota = await getQuotaUsage()
    
    // Get recent syncs
    const recentSyncs = await prisma.pack.findMany({
      where: {
        videoId: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        videoId: true,
        createdAt: true,
        hasPdf: true,
        hasQuiz: true,
        product: {
          select: {
            active: true
          }
        }
      }
    })

    // Get last sync from analytics
    const lastSync = await prisma.analyticsEvent.findFirst({
      where: {
        eventType: { in: ['youtube_sync', 'youtube_instant_sync'] }
      },
      orderBy: { createdAt: 'desc' }
    })

    const lastSyncData = lastSync ? JSON.parse(lastSync.eventData as string) : null

    return NextResponse.json({
      quota,
      recentSyncs,
      lastSync: lastSyncData,
      webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/youtube`,
      channelId: process.env.YOUTUBE_CHANNEL_ID
    })

  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}

// POST: Manually sync a video
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { videoId, syncLatest } = body

    let result

    if (syncLatest) {
      // Sync only the latest video from channel
      result = await syncLatestYouTubeVideo()
    } else if (videoId) {
      // Sync specific video by ID
      // Extract video ID if URL was provided
      const id = extractVideoId(videoId)
      if (!id) {
        return NextResponse.json(
          { error: 'Invalid video ID or URL' },
          { status: 400 }
        )
      }
      result = await syncSpecificVideo(id)
    } else {
      return NextResponse.json(
        { error: 'Must provide videoId or set syncLatest to true' },
        { status: 400 }
      )
    }

    // Log the manual sync
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'youtube_manual_sync',
        eventData: JSON.stringify({
          ...result,
          adminId: session.user.id,
          timestamp: new Date().toISOString()
        })
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in manual sync:', error)
    return NextResponse.json(
      { error: 'Sync failed: ' + error },
      { status: 500 }
    )
  }
}

// Helper to extract video ID from URL or ID
function extractVideoId(input: string): string | null {
  // If it's already an ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input
  }

  // Try to extract from URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }
  
  return null
}