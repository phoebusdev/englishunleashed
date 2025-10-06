/**
 * Video fetching logic - server-side only
 * Rebuilt from scratch with proper error handling
 */

import { fetchYouTubeRSSFeed, type YouTubeRSSVideo } from './youtube-rss'
import { historicalVideos } from './youtube-videos-static'

export interface Video {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
}

let cachedVideos: Video[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get videos from YouTube channel
 * 1. Try RSS feed (latest 15 videos, no API quota)
 * 2. Combine with historical videos
 * 3. Fall back to historical only if RSS fails
 */
export async function getVideos(): Promise<Video[]> {
  // Return cached videos if still valid
  const now = Date.now()
  if (cachedVideos && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📦 Using cached videos')
    return cachedVideos
  }

  // Get channel ID from environment
  const channelId = process.env.YOUTUBE_CHANNEL_ID ||
                   process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

  let allVideos: Video[] = []

  if (channelId) {
    try {
      console.log(`📺 Fetching videos from RSS for channel: ${channelId}`)
      const rssVideos = await fetchYouTubeRSSFeed(channelId)

      if (rssVideos.length > 0) {
        // Create a map of RSS videos by ID for quick lookup
        const rssVideoMap = new Map(rssVideos.map(v => [v.id, v]))

        // Start with RSS videos (latest 15)
        allVideos = rssVideos.map(v => ({
          id: v.id,
          title: v.title,
          description: v.description,
          publishedAt: v.publishedAt,
          thumbnail: v.thumbnail
        }))

        // Add historical videos that aren't in RSS
        const historicalOnly = historicalVideos.filter(v => !rssVideoMap.has(v.id))
        allVideos = [...allVideos, ...historicalOnly]

        console.log(`✅ Combined ${rssVideos.length} RSS + ${historicalOnly.length} historical = ${allVideos.length} total videos`)
      } else {
        console.log('⚠️ RSS returned no videos, using historical only')
        allVideos = historicalVideos
      }
    } catch (error) {
      console.error('❌ RSS fetch failed:', error)
      // Fall back to historical videos
      allVideos = historicalVideos
    }
  } else {
    console.log('📚 No channel ID configured, using historical videos')
    allVideos = historicalVideos
  }

  // Sort by published date (newest first)
  allVideos.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  // Update cache
  cachedVideos = allVideos
  cacheTimestamp = now

  return allVideos
}

/**
 * Clear the video cache
 */
export function clearVideoCache() {
  cachedVideos = null
  cacheTimestamp = 0
}
