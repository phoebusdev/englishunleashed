import { NextResponse } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { fetchYouTubeRSSFeed } from '@/lib/youtube-rss'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  noStore()
  
  try {
    // Get channel ID from environment
    const channelId = process.env.YOUTUBE_CHANNEL_ID || 
                     process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
    
    if (!channelId) {
      console.error('No YouTube channel ID configured')
      
      // Still return videos from database even without channel ID
      const dbVideos = await prisma.youTubeVideo.findMany({
        orderBy: { publishedAt: 'desc' }
      })
      
      return NextResponse.json({ 
        videos: dbVideos.map(v => ({
          id: v.videoId,
          title: v.title,
          description: v.description || '',
          publishedAt: v.publishedAt.toISOString(),
          thumbnail: {
            url: v.thumbnailUrl || '',
            width: v.thumbnailWidth,
            height: v.thumbnailHeight
          }
        })),
        error: 'Channel ID not configured',
        method: 'database-only'
      })
    }

    // Fetch fresh videos from RSS
    console.log(`📺 Fetching videos from RSS for channel: ${channelId}`)
    const rssVideos = await fetchYouTubeRSSFeed(channelId)
    
    // Update database with RSS videos (upsert to avoid duplicates)
    for (const video of rssVideos) {
      await prisma.youTubeVideo.upsert({
        where: { videoId: video.id },
        update: {
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnail.url,
          thumbnailWidth: video.thumbnail.width,
          thumbnailHeight: video.thumbnail.height,
          source: 'rss',
          updatedAt: new Date()
        },
        create: {
          videoId: video.id,
          title: video.title,
          description: video.description,
          publishedAt: new Date(video.publishedAt),
          thumbnailUrl: video.thumbnail.url,
          thumbnailWidth: video.thumbnail.width,
          thumbnailHeight: video.thumbnail.height,
          videoUrl: video.link || `https://www.youtube.com/watch?v=${video.id}`,
          source: 'rss'
        }
      })
    }
    
    // Get all videos from database (includes historical + new)
    const allVideos = await prisma.youTubeVideo.findMany({
      orderBy: { publishedAt: 'desc' }
    })
    
    console.log(`✅ RSS found ${rssVideos.length} videos, database has ${allVideos.length} total`)
    
    // Convert to API format
    const formattedVideos = allVideos.map(v => ({
      id: v.videoId,
      title: v.title,
      description: v.description || '',
      publishedAt: v.publishedAt.toISOString(),
      thumbnail: {
        url: v.thumbnailUrl || '',
        width: v.thumbnailWidth,
        height: v.thumbnailHeight
      }
    }))
    
    return NextResponse.json({ 
      videos: formattedVideos,
      method: 'rss+database',
      rssCount: rssVideos.length,
      totalCount: allVideos.length,
      cached: false
    })
    
  } catch (error) {
    console.error('Error fetching videos:', error)
    
    // Return videos from database as fallback
    try {
      const cachedVideos = await prisma.youTubeVideo.findMany({
        orderBy: { publishedAt: 'desc' }
      })
      
      if (cachedVideos.length > 0) {
        return NextResponse.json({ 
          videos: cachedVideos.map(v => ({
            id: v.videoId,
            title: v.title,
            description: v.description || '',
            publishedAt: v.publishedAt.toISOString(),
            thumbnail: {
              url: v.thumbnailUrl || '',
              width: v.thumbnailWidth,
              height: v.thumbnailHeight
            }
          })),
          method: 'database-fallback',
          totalCount: cachedVideos.length,
          error: 'RSS failed, using database videos'
        })
      }
    } catch (dbError) {
      console.error('Database fallback also failed:', dbError)
    }
    
    return NextResponse.json({ 
      videos: [],
      error: 'Unable to fetch videos',
      method: 'failed'
    }, { status: 500 })
  }
}

// POST endpoint to manually add historical videos
export async function POST(request: Request) {
  try {
    const { videos } = await request.json()
    
    if (!videos || !Array.isArray(videos)) {
      return NextResponse.json({ 
        error: 'Invalid request - videos array required' 
      }, { status: 400 })
    }
    
    // Add videos to database
    let addedCount = 0
    for (const video of videos) {
      if (video.id) {
        try {
          await prisma.youTubeVideo.upsert({
            where: { videoId: video.id },
            update: {
              title: video.title,
              description: video.description || '',
              thumbnailUrl: video.thumbnail?.url || '',
              thumbnailWidth: video.thumbnail?.width || 1280,
              thumbnailHeight: video.thumbnail?.height || 720,
              updatedAt: new Date()
            },
            create: {
              videoId: video.id,
              title: video.title,
              description: video.description || '',
              publishedAt: new Date(video.publishedAt),
              thumbnailUrl: video.thumbnail?.url || '',
              thumbnailWidth: video.thumbnail?.width || 1280,
              thumbnailHeight: video.thumbnail?.height || 720,
              videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
              source: 'manual'
            }
          })
          addedCount++
        } catch (err) {
          console.error(`Failed to add video ${video.id}:`, err)
        }
      }
    }
    
    const totalVideos = await prisma.youTubeVideo.count()
    
    return NextResponse.json({
      success: true,
      message: `Added/updated ${addedCount} videos`,
      totalVideos
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to add videos',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}