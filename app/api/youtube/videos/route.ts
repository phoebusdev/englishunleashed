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

export async function GET() {
  // Opt out of static rendering
  noStore()
  
  try {
    // Check if we have cached data that's less than 5 minutes old
    if (videoCache && Date.now() - videoCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({ 
        videos: videoCache.data,
        cached: true,
        cacheAge: Math.floor((Date.now() - videoCache.timestamp) / 1000 / 60) // minutes
      })
    }

    // Get channel ID from environment
    const channelId = env.YOUTUBE_CHANNEL_ID || env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
    
    if (!channelId) {
      console.error('No YouTube channel ID configured')
      return NextResponse.json({ 
        videos: [],
        error: 'Channel ID not configured',
        cached: false 
      })
    }

    // Fetch fresh data from RSS (no API quota!)
    const videos = await fetchYouTubeRSSFeed(channelId)
    
    // Store in cache
    if (videos.length > 0) {
      videoCache = {
        data: videos,
        timestamp: Date.now()
      }
    }

    return NextResponse.json({ 
      videos,
      cached: false,
      method: 'rss' // Indicate we're using RSS
    })
  } catch (error) {
    console.error('Error in YouTube RSS API:', error)
    
    // If we have any cached data, return it
    if (videoCache) {
      return NextResponse.json({ 
        videos: videoCache.data,
        cached: true,
        cacheAge: Math.floor((Date.now() - videoCache.timestamp) / 1000 / 60) // minutes
      })
    }
    
    // No cache available
    return NextResponse.json({ 
      videos: [],
      error: 'Unable to fetch videos',
      cached: false 
    })
  }
}