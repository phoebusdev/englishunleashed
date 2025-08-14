import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { syncYouTubeRSSVideos } from '@/lib/youtube-rss'
import { prisma } from '@/lib/db'

/**
 * YouTube RSS Sync - No API quota usage!
 * 
 * This endpoint syncs videos from YouTube using RSS feeds instead of the API.
 * Perfect for production use as it doesn't consume any API quota.
 * 
 * Can be called by:
 * 1. Vercel Cron (every 30 minutes)
 * 2. Manual trigger from admin
 * 3. Webhook from YouTube (when configured)
 */
export async function GET(request: Request) {
  // Verify this is from Vercel Cron or has correct authorization
  const authHeader = headers().get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Get channel ID from environment
    const channelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
    
    if (!channelId) {
      console.error('No YouTube channel ID configured')
      return NextResponse.json({
        success: false,
        error: 'YouTube channel ID not configured'
      }, { status: 500 })
    }
    
    console.log(`📡 Syncing from YouTube RSS for channel: ${channelId}`)
    
    // Sync latest videos from RSS feed (no API quota!)
    const result = await syncYouTubeRSSVideos(channelId, 10)
    
    // Log the sync attempt
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'youtube_rss_sync',
        eventData: JSON.stringify({
          synced: result.synced,
          message: result.message,
          quotaUsed: 0,
          timestamp: new Date().toISOString()
        })
      }
    }).catch(console.error)
    
    // If new videos were synced, send notification
    if (result.synced > 0) {
      await prisma.emailQueue.create({
        data: {
          to: process.env.ADMIN_EMAIL || 'admin@englishunleashed.com',
          subject: `${result.synced} New Videos Synced`,
          template: 'new-videos',
          data: JSON.stringify({
            count: result.synced,
            message: result.message,
            timestamp: new Date().toISOString()
          }),
          status: 'PENDING'
        }
      }).catch(console.error)
    }
    
    return NextResponse.json({
      success: true,
      synced: result.synced,
      message: result.message,
      quotaUsed: 0,
      method: 'rss',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('RSS sync error:', error)
    
    // Log error
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'youtube_rss_sync_error',
        eventData: JSON.stringify({
          error: String(error),
          timestamp: new Date().toISOString()
        })
      }
    }).catch(console.error)
    
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}

/**
 * POST endpoint for manual trigger or initial sync
 */
export async function POST(request: Request) {
  try {
    // Check for admin session or API key
    const authHeader = headers().get('authorization')
    const isAdmin = authHeader === `Bearer ${process.env.ADMIN_API_KEY}` ||
                    authHeader === `Bearer ${process.env.CRON_SECRET}`
    
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { 
      channelId = process.env.YOUTUBE_CHANNEL_ID,
      limit = 10,
      initialSync = false 
    } = body
    
    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'Channel ID required'
      }, { status: 400 })
    }
    
    console.log(`🚀 Manual RSS sync requested for channel: ${channelId}`)
    
    // For initial sync, get more videos
    const syncLimit = initialSync ? 50 : limit
    
    const result = await syncYouTubeRSSVideos(channelId, syncLimit)
    
    return NextResponse.json({
      success: true,
      ...result,
      method: 'rss',
      initialSync
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}