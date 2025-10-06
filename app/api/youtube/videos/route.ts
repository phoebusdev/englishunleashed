import { NextResponse } from 'next/server'
import { getVideos } from '@/lib/videos'

/**
 * GET /api/youtube/videos
 * Returns list of videos from YouTube RSS + historical fallback
 */
export async function GET() {
  try {
    const videos = await getVideos()

    return NextResponse.json(
      {
        videos,
        totalCount: videos.length,
        success: true
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        }
      }
    )
  } catch (error) {
    console.error('API: Error fetching videos:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch videos',
        videos: [],
        totalCount: 0,
        success: false
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        }
      }
    )
  }
}