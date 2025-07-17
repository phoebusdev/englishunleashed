import { env } from '../env.mjs'

const API_BASE = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
  duration?: string
  viewCount?: string
}

export interface YouTubeChannel {
  id: string
  title: string
  description: string
  customUrl?: string
  thumbnail?: {
    url: string
    width: number
    height: number
  }
}

// Get channel ID from handle (e.g., @EnglishPodcastUnleashed)
export async function getChannelByHandle(handle: string): Promise<YouTubeChannel | null> {
  if (!env.YOUTUBE_API_KEY) {
    console.error('YouTube API key not configured')
    return null
  }

  try {
    // Remove @ if present
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle
    
    const url = `${API_BASE}/channels?` + new URLSearchParams({
      key: env.YOUTUBE_API_KEY,
      forHandle: cleanHandle,
      part: 'id,snippet'
    })

    const response = await fetch(url, {
      next: { revalidate: 86400 } // Cache for 24 hours (channel info rarely changes)
    })
    const data = await response.json() as {
      items?: Array<{
        id: string
        snippet: {
          title: string
          description: string
          customUrl?: string
          thumbnails?: { high?: { url: string; width: number; height: number } }
        }
      }>
    }

    if (!data.items || data.items.length === 0) {
      console.error('Channel not found for handle:', handle)
      return null
    }

    const channel = data.items[0]
    if (!channel) return null
    
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl,
      thumbnail: channel.snippet.thumbnails?.high
    }
  } catch (error) {
    console.error('Error fetching channel by handle:', error)
    return null
  }
}

// Fetch videos from a channel
export async function fetchChannelVideos(
  channelId: string, 
  maxResults = 50
): Promise<YouTubeVideo[]> {
  if (!env.YOUTUBE_API_KEY) {
    console.error('YouTube API key not configured')
    return []
  }

  try {
    // First, search for videos in the channel
    const searchUrl = `${API_BASE}/search?` + new URLSearchParams({
      key: env.YOUTUBE_API_KEY,
      channelId: channelId,
      part: 'id,snippet',
      type: 'video',
      order: 'date',
      maxResults: maxResults.toString()
    })

    const searchResponse = await fetch(searchUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!searchResponse.ok) {
      console.error('YouTube API error:', searchResponse.status, searchResponse.statusText)
      const errorData = await searchResponse.text()
      console.error('Error details:', errorData)
      return []
    }
    
    const searchData = await searchResponse.json() as {
      items?: Array<{ id: { videoId: string } }>
      error?: { message: string }
    }
    
    if (searchData.error) {
      console.error('YouTube API error:', searchData.error.message)
      return []
    }

    if (!searchData.items || searchData.items.length === 0) {
      console.log('No videos found for channel:', channelId)
      return []
    }

    // Get video IDs
    const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',')

    // Fetch detailed video information
    const videosUrl = `${API_BASE}/videos?` + new URLSearchParams({
      key: env.YOUTUBE_API_KEY,
      id: videoIds,
      part: 'snippet,contentDetails,statistics'
    })

    const videosResponse = await fetch(videosUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    const videosData = await videosResponse.json() as {
      items: Array<{
        id: string
        snippet: {
          title: string
          description: string
          publishedAt: string
          thumbnails: { high: { url: string; width: number; height: number } }
        }
        contentDetails: { duration: string }
        statistics: { viewCount: string }
      }>
    }

    // Transform to our format
    return videosData.items.map((video: {
      id: string
      snippet: {
        title: string
        description: string
        publishedAt: string
        thumbnails: { high: { url: string; width: number; height: number } }
      }
      contentDetails: { duration: string }
      statistics: { viewCount: string }
    }) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnail: video.snippet.thumbnails.high,
      duration: parseDuration(video.contentDetails.duration),
      viewCount: video.statistics.viewCount
    }))
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    return []
  }
}

// Convert ISO 8601 duration to readable format
function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return ''
  
  const hours = (match[1] || '').replace('H', '')
  const minutes = (match[2] || '').replace('M', '')
  const seconds = (match[3] || '').replace('S', '')
  
  const parts = []
  if (hours) parts.push(hours.padStart(2, '0'))
  parts.push((minutes || '0').padStart(2, '0'))
  parts.push((seconds || '0').padStart(2, '0'))
  
  return parts.join(':')
}

// Helper to format view count
export function formatViewCount(count: string): string {
  const num = parseInt(count)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`
  }
  return `${num} views`
}

// Helper to get relative time
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}