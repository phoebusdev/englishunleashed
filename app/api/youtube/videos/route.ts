import { NextResponse } from 'next/server'
import { fetchChannelVideos } from 'lib/youtube'
import { env } from 'env.mjs'

// In-memory cache for videos
let videoCache: {
  data: any[]
  timestamp: number
} | null = null

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export async function GET() {
  try {
    // During build time, always return empty to avoid API calls
    if (!process.env.VERCEL_URL && process.env.VERCEL) {
      console.log('Build time detected - returning empty videos')
      return NextResponse.json({ 
        videos: [],
        cached: false,
        buildTime: true
      })
    }
    
    // Check if we have cached data that's less than 1 hour old
    if (videoCache && Date.now() - videoCache.timestamp < CACHE_DURATION) {
      // Try to fetch fresh data
      try {
        const freshVideos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID!, 50)
        if (freshVideos.length > 0) {
          // Update cache with fresh data
          videoCache = {
            data: freshVideos,
            timestamp: Date.now()
          }
          return NextResponse.json({ 
            videos: freshVideos,
            cached: false 
          })
        }
      } catch (error) {
        console.log('Using cached videos due to API error:', error)
        // If fresh fetch fails, use cached data
        return NextResponse.json({ 
          videos: videoCache.data,
          cached: true,
          cacheAge: Math.floor((Date.now() - videoCache.timestamp) / 1000 / 60) // minutes
        })
      }
    }

    // No cache or cache is too old, fetch fresh data
    const videos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID!, 50)
    
    // Store in cache
    if (videos.length > 0) {
      videoCache = {
        data: videos,
        timestamp: Date.now()
      }
    }

    return NextResponse.json({ 
      videos,
      cached: false 
    })
  } catch (error) {
    console.error('Error in YouTube videos API:', error)
    
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

// Force dynamic rendering to prevent API calls during build
export const dynamic = 'force-dynamic'