import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { fetchYouTubeRSSFeed } from '@/lib/youtube-rss'
import { historicalVideos } from '@/lib/youtube-videos-static'

// Initialize storage with historical videos
const videoStorage = new Map<string, any>()

// Pre-populate with historical videos
for (const video of historicalVideos) {
  videoStorage.set(video.id, {
    ...video,
    historical: true,
    lastSeen: Date.now()
  })
}

export async function GET(request: Request) {
  noStore()
  
  try {
    // Get channel ID from environment
    const channelId = process.env.YOUTUBE_CHANNEL_ID || 
                     process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
    
    if (!channelId) {
      console.error('No YouTube channel ID configured')
      return NextResponse.json({ 
        videos: [],
        error: 'Channel ID not configured',
        method: 'none'
      }, { status: 500 })
    }

    // Fetch fresh videos from RSS
    console.log(`📺 Fetching videos from RSS for channel: ${channelId}`)
    const rssVideos = await fetchYouTubeRSSFeed(channelId)
    
    // Update storage with RSS videos (RSS has latest info)
    for (const video of rssVideos) {
      const existing = videoStorage.get(video.id)
      videoStorage.set(video.id, {
        ...video,
        historical: existing?.historical || false,
        lastSeen: Date.now(),
        fromRss: true
      })
    }
    
    // Get all stored videos (combines historical + new)
    const allVideos = Array.from(videoStorage.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    console.log(`✅ RSS found ${rssVideos.length} videos, total stored: ${allVideos.length}`)
    
    return NextResponse.json({ 
      videos: allVideos.length > 0 ? allVideos : rssVideos,
      method: 'rss+memory',
      rssCount: rssVideos.length,
      totalCount: allVideos.length,
      cached: false
    })
    
  } catch (error) {
    console.error('Error fetching videos:', error)
    
    // Return any videos we have in memory
    const cachedVideos = Array.from(videoStorage.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    if (cachedVideos.length > 0) {
      return NextResponse.json({ 
        videos: cachedVideos,
        method: 'memory-fallback',
        totalCount: cachedVideos.length,
        error: 'RSS failed, using cached videos'
      })
    }
    
    return NextResponse.json({ 
      videos: [],
      error: 'Unable to fetch videos',
      method: 'failed'
    }, { status: 500 })
  }
}

// POST endpoint to manually add historical videos if needed
export async function POST(request: Request) {
  try {
    const { videos } = await request.json()
    
    if (!videos || !Array.isArray(videos)) {
      return NextResponse.json({ 
        error: 'Invalid request - videos array required' 
      }, { status: 400 })
    }
    
    // Add videos to storage
    for (const video of videos) {
      if (video.id) {
        videoStorage.set(video.id, {
          ...video,
          addedManually: true,
          lastSeen: Date.now()
        })
      }
    }
    
    const totalVideos = videoStorage.size
    
    return NextResponse.json({
      success: true,
      message: `Added ${videos.length} videos`,
      totalVideos
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to add videos',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}