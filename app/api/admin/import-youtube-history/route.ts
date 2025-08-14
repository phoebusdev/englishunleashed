import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const API_BASE = 'https://www.googleapis.com/youtube/v3'
const MAX_RESULTS = 50

interface YouTubePlaylistItem {
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default?: { url: string; width?: number; height?: number }
      medium?: { url: string; width?: number; height?: number }
      high?: { url: string; width?: number; height?: number }
      maxres?: { url: string; width?: number; height?: number }
    }
    resourceId: {
      videoId: string
    }
  }
}

async function getChannelUploadsPlaylistId(apiKey: string, channelId: string): Promise<string | null> {
  try {
    const url = `${API_BASE}/channels?` + new URLSearchParams({
      key: apiKey,
      id: channelId,
      part: 'contentDetails'
    })

    const response = await fetch(url)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    return data.items[0].contentDetails.relatedPlaylists.uploads
  } catch (error) {
    console.error('Error fetching channel details:', error)
    return null
  }
}

async function fetchAllVideosFromPlaylist(apiKey: string, playlistId: string): Promise<YouTubePlaylistItem[]> {
  const allVideos: YouTubePlaylistItem[] = []
  let pageToken: string | undefined = undefined
  let pageCount = 0

  do {
    pageCount++
    const params: any = {
      key: apiKey,
      playlistId: playlistId,
      part: 'snippet',
      maxResults: MAX_RESULTS.toString()
    }

    if (pageToken) {
      params.pageToken = pageToken
    }

    const url = `${API_BASE}/playlistItems?` + new URLSearchParams(params)
    
    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.error) {
        console.error('API Error:', data.error.message)
        break
      }

      if (data.items) {
        allVideos.push(...data.items)
      }

      pageToken = data.nextPageToken
      
      // Small delay to be respectful to API
      if (pageToken) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error('Error fetching page:', error)
      break
    }
  } while (pageToken)

  return allVideos
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    // Get API key and channel ID from request or environment
    const body = await request.json()
    const apiKey = body.apiKey || process.env.YOUTUBE_API_KEY
    const channelId = body.channelId || process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'YouTube API key not configured',
        message: 'Please provide apiKey in request body or set YOUTUBE_API_KEY environment variable'
      }, { status: 400 })
    }

    if (!channelId) {
      return NextResponse.json({ 
        error: 'YouTube channel ID not configured',
        message: 'Please provide channelId in request body or set YOUTUBE_CHANNEL_ID environment variable'
      }, { status: 400 })
    }

    // Get the uploads playlist ID
    const uploadsPlaylistId = await getChannelUploadsPlaylistId(apiKey, channelId)

    if (!uploadsPlaylistId) {
      return NextResponse.json({ 
        error: 'Could not find uploads playlist for channel',
        channelId 
      }, { status: 404 })
    }

    // Fetch all videos from the uploads playlist
    const videos = await fetchAllVideosFromPlaylist(apiKey, uploadsPlaylistId)

    if (videos.length === 0) {
      return NextResponse.json({ 
        message: 'No videos found in channel',
        channelId,
        uploadsPlaylistId
      })
    }

    // Check existing videos in database
    const existingCount = await prisma.youTubeVideo.count()

    // Import videos to database
    let newCount = 0
    let updatedCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (const video of videos) {
      const videoId = video.snippet.resourceId.videoId

      try {
        // Get best available thumbnail
        const thumbnail = 
          video.snippet.thumbnails.maxres ||
          video.snippet.thumbnails.high ||
          video.snippet.thumbnails.medium ||
          video.snippet.thumbnails.default

        const existing = await prisma.youTubeVideo.findUnique({
          where: { videoId }
        })

        if (existing) {
          // Update existing video
          await prisma.youTubeVideo.update({
            where: { videoId },
            data: {
              title: video.snippet.title,
              description: video.snippet.description,
              thumbnailUrl: thumbnail?.url,
              thumbnailWidth: thumbnail?.width,
              thumbnailHeight: thumbnail?.height,
              lastSeenAt: new Date(),
            }
          })
          updatedCount++
        } else {
          // Create new video
          await prisma.youTubeVideo.create({
            data: {
              videoId,
              title: video.snippet.title,
              description: video.snippet.description,
              publishedAt: new Date(video.snippet.publishedAt),
              thumbnailUrl: thumbnail?.url,
              thumbnailWidth: thumbnail?.width,
              thumbnailHeight: thumbnail?.height,
              channelId: channelId,
              videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            }
          })
          newCount++
        }
      } catch (error) {
        errorCount++
        errors.push({
          videoId,
          title: video.snippet.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const finalCount = await prisma.youTubeVideo.count()

    return NextResponse.json({
      success: true,
      message: 'YouTube history import complete',
      stats: {
        channelId,
        uploadsPlaylistId,
        videosFoundOnYouTube: videos.length,
        existingVideosBeforeImport: existingCount,
        newVideosAdded: newCount,
        videosUpdated: updatedCount,
        errors: errorCount,
        totalVideosInDatabase: finalCount
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: 'Import failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const count = await prisma.youTubeVideo.count()
    const latest = await prisma.youTubeVideo.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        videoId: true,
        title: true,
        publishedAt: true
      }
    })

    return NextResponse.json({
      totalVideos: count,
      latestVideos: latest,
      channelId: process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID,
      apiKeyConfigured: !!process.env.YOUTUBE_API_KEY
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}