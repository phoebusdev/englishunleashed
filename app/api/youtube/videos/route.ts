import { NextResponse } from 'next/server'
import { fetchYouTubeRSSFeed } from '@/lib/youtube-rss'
import { historicalVideos } from '@/lib/youtube-videos-static'

// Cache the combined videos in memory
let cachedVideos: any[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: Request) {
  try {
    // Check if we have valid cached data
    const now = Date.now()
    if (cachedVideos && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('📦 Returning cached videos')
      return NextResponse.json(
        { 
          videos: cachedVideos,
          method: 'cached',
          totalCount: cachedVideos.length,
          cached: true
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          }
        }
      )
    }

    // Get channel ID from environment
    const channelId = process.env.YOUTUBE_CHANNEL_ID || 
                     process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
    
    let allVideos: any[] = []
    let method = 'historical'
    
    if (channelId) {
      try {
        // Try to fetch from RSS first (no API quota)
        console.log(`📺 Fetching videos from RSS for channel: ${channelId}`)
        const rssVideos = await fetchYouTubeRSSFeed(channelId)
        
        if (rssVideos.length > 0) {
          // Create a map of RSS videos by ID for quick lookup
          const rssVideoMap = new Map(rssVideos.map(v => [v.id, v]))
          
          // Start with RSS videos (they have the latest info)
          allVideos = rssVideos.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            publishedAt: v.publishedAt,
            thumbnail: v.thumbnail
          }))
          
          // Add historical videos that aren't in RSS (older than 15 latest)
          const historicalOnly = historicalVideos.filter(v => !rssVideoMap.has(v.id))
          allVideos = [...allVideos, ...historicalOnly]
          
          method = 'rss+historical'
          console.log(`✅ Combined ${rssVideos.length} RSS + ${historicalOnly.length} historical videos`)
        } else {
          // RSS failed, use historical only
          allVideos = historicalVideos
          method = 'historical-fallback'
          console.log('⚠️ RSS failed, using historical videos only')
        }
      } catch (rssError) {
        console.error('RSS fetch error:', rssError)
        // Fall back to historical videos
        allVideos = historicalVideos
        method = 'historical-fallback'
      }
    } else {
      // No channel ID, use historical videos
      allVideos = historicalVideos
      method = 'historical-only'
      console.log('📚 No channel ID, using historical videos')
    }
    
    // Sort by published date (newest first)
    allVideos.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    
    // Update cache
    cachedVideos = allVideos
    cacheTimestamp = now
    
    return NextResponse.json(
      { 
        videos: allVideos,
        method,
        totalCount: allVideos.length,
        cached: false
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        }
      }
    )
    
  } catch (error) {
    console.error('Error fetching videos:', error)
    
    // Return historical videos as ultimate fallback
    return NextResponse.json(
      { 
        videos: historicalVideos,
        error: 'Unable to fetch latest videos',
        method: 'error-fallback',
        totalCount: historicalVideos.length
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        }
      }
    )
  }
}