import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { fetchYouTubeRSSFeed } from '@/lib/youtube-rss'
import { env } from '@/env.mjs'

// In-memory cache for videos
let videoCache: {
  data: any[]
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache (RSS updates quickly)

export async function GET(request: Request) {
  // Opt out of static rendering
  noStore()
  
  // Check for debug mode
  const url = new URL(request.url)
  const debug = url.searchParams.get('debug') === 'true'
  
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      hasChannelId: !!process.env.YOUTUBE_CHANNEL_ID,
      hasPublicChannelId: !!process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID,
    },
    cache: {
      hasCache: !!videoCache,
      cacheAge: videoCache ? Math.floor((Date.now() - videoCache.timestamp) / 1000 / 60) : null,
      cacheExpired: videoCache ? Date.now() - videoCache.timestamp > CACHE_DURATION : true
    }
  }
  
  try {
    // Get channel ID from environment
    const channelId = process.env.YOUTUBE_CHANNEL_ID || 
                     process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ||
                     env.YOUTUBE_CHANNEL_ID || 
                     env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
    
    debugInfo.channelId = channelId || 'NOT_SET'
    
    if (!channelId) {
      console.error('❌ No YouTube channel ID configured')
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('YOUTUBE')))
      
      return NextResponse.json({ 
        videos: [],
        error: 'Channel ID not configured',
        cached: false,
        debug: debug ? {
          ...debugInfo,
          error: 'No channel ID found in environment variables',
          checkedVars: [
            'YOUTUBE_CHANNEL_ID',
            'NEXT_PUBLIC_YOUTUBE_CHANNEL_ID',
            'env.YOUTUBE_CHANNEL_ID',
            'env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID'
          ]
        } : undefined
      }, { status: 500 })
    }
    
    console.log(`📺 Channel ID: ${channelId}`)
    debugInfo.rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    
    // Check if we have cached data that's less than 5 minutes old
    if (videoCache && Date.now() - videoCache.timestamp < CACHE_DURATION) {
      console.log(`📦 Using cached videos (${Math.floor((Date.now() - videoCache.timestamp) / 1000 / 60)} minutes old)`)
      return NextResponse.json({ 
        videos: videoCache.data,
        cached: true,
        cacheAge: Math.floor((Date.now() - videoCache.timestamp) / 1000 / 60), // minutes
        method: 'rss',
        debug: debug ? debugInfo : undefined
      })
    }

    console.log(`🔄 Fetching fresh videos from RSS feed...`)
    debugInfo.fetchStartTime = Date.now()
    
    // Fetch fresh data from RSS (no API quota!)
    const videos = await fetchYouTubeRSSFeed(channelId)
    
    debugInfo.fetchDuration = Date.now() - debugInfo.fetchStartTime
    debugInfo.videosFound = videos.length
    
    console.log(`✅ Fetched ${videos.length} videos from RSS in ${debugInfo.fetchDuration}ms`)
    
    // Store in cache
    if (videos.length > 0) {
      videoCache = {
        data: videos,
        timestamp: Date.now()
      }
      console.log('💾 Videos cached for 5 minutes')
    } else {
      console.warn('⚠️  No videos found in RSS feed')
      debugInfo.warning = 'RSS feed returned no videos - check channel ID or channel may have no public videos'
    }

    return NextResponse.json({ 
      videos,
      cached: false,
      method: 'rss',
      debug: debug ? debugInfo : undefined
    })
  } catch (error) {
    console.error('❌ Error in YouTube RSS API:', error)
    
    debugInfo.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
    }
    
    // If we have any cached data, return it
    if (videoCache) {
      console.log('🔄 Falling back to cached data due to error')
      return NextResponse.json({ 
        videos: videoCache.data,
        cached: true,
        cacheAge: Math.floor((Date.now() - videoCache.timestamp) / 1000 / 60), // minutes
        error: 'Failed to fetch fresh data, using cache',
        debug: debug ? debugInfo : undefined
      })
    }
    
    // No cache available
    return NextResponse.json({ 
      videos: [],
      error: 'Unable to fetch videos',
      cached: false,
      debug: debug ? debugInfo : undefined
    }, { status: 500 })
  }
}

// Debug endpoint - shows detailed information
export async function POST(request: Request) {
  noStore()
  
  try {
    const body = await request.json()
    const { clearCache = false, testChannelId } = body
    
    if (clearCache) {
      videoCache = null
      console.log('🗑️  Cache cleared')
    }
    
    const channelId = testChannelId || 
                     process.env.YOUTUBE_CHANNEL_ID || 
                     process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
    
    const debugInfo = {
      cacheCleared: clearCache,
      channelId: channelId || 'NOT_SET',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
        hasYouTubeChannelId: !!process.env.YOUTUBE_CHANNEL_ID,
        hasPublicYouTubeChannelId: !!process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID,
      },
      rssUrl: channelId ? `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}` : null,
      testInstructions: {
        clearCache: 'POST with { "clearCache": true }',
        testChannel: 'POST with { "testChannelId": "UCxxxxxx" }',
        viewRSS: channelId ? `Visit: https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}` : 'Set channel ID first'
      }
    }
    
    if (testChannelId) {
      console.log(`🧪 Testing channel: ${testChannelId}`)
      const videos = await fetchYouTubeRSSFeed(testChannelId)
      return NextResponse.json({
        ...debugInfo,
        testResult: {
          channelId: testChannelId,
          videosFound: videos.length,
          videos: videos.slice(0, 3) // Return first 3 for preview
        }
      })
    }
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}