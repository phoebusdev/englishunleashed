import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { syncLatestYouTubeVideo, getQuotaUsage } from '@/lib/youtube-optimized'
import { prisma } from '@/lib/db'

// This optimized endpoint only checks for the latest video
// Uses YouTube Activities API (1 unit) instead of Search API (100 units)
export async function GET(request: Request) {
  // Verify this is from Vercel Cron or has correct authorization
  const authHeader = headers().get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Check quota usage first
    const quota = await getQuotaUsage()
    
    if (quota.remaining < 100) {
      console.warn('YouTube API quota running low:', quota.remaining)
      
      // Log warning but continue - we only use 1 unit
      await prisma.emailQueue.create({
        data: {
          to: process.env.ADMIN_EMAIL || 'admin@englishunleashed.com',
          subject: 'YouTube API Quota Warning',
          template: 'quota-warning',
          data: JSON.stringify({
            remaining: quota.remaining,
            resetTime: quota.resetTime
          }),
          status: 'PENDING'
        }
      }).catch(console.error)
    }

    // Sync only the latest video
    const result = await syncLatestYouTubeVideo()
    
    // Log the sync attempt
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'youtube_sync',
        eventData: JSON.stringify({
          synced: result.synced,
          message: result.message,
          quotaUsed: result.quotaUsed,
          timestamp: new Date().toISOString()
        })
      }
    }).catch(console.error)
    
    return NextResponse.json({
      success: true,
      synced: result.synced,
      message: result.message,
      quotaUsed: result.quotaUsed,
      quotaRemaining: quota.remaining - result.quotaUsed,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    
    // Log error
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'youtube_sync_error',
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

// POST endpoint for manual trigger (admin only)
export async function POST(request: Request) {
  try {
    // Check for admin session or API key
    const authHeader = headers().get('authorization')
    const isAdmin = authHeader === `Bearer ${process.env.ADMIN_API_KEY}`
    
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { forceSync = false } = body

    // If forceSync is true, clear the latest video check
    if (forceSync) {
      console.log('Force sync requested - will check for new videos')
    }

    const result = await syncLatestYouTubeVideo()
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}