/**
 * YouTube RSS Feed Sync - No API quota usage!
 * 
 * YouTube provides RSS feeds for channels that we can use to get latest videos
 * without consuming any API quota. This is perfect for production use.
 */

import { prisma } from './db'

export interface YouTubeRSSVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
  link: string
  duration?: string
  viewCount?: string
}

/**
 * Parse YouTube RSS feed XML to extract video information
 */
function parseYouTubeRSS(xml: string): YouTubeRSSVideo[] {
  const videos: YouTubeRSSVideo[] = []
  
  // Extract all video entries
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  const entries = xml.match(entryRegex) || []
  
  for (const entry of entries) {
    // Extract video ID from yt:videoId tag
    const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null
    
    // Extract title
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/)
    const title = titleMatch ? titleMatch[1] : 'Untitled'
    
    // Extract description from media:description
    const descMatch = entry.match(/<media:description>([^<]*)<\/media:description>/)
    const description = descMatch ? descMatch[1] : ''
    
    // Extract published date
    const publishedMatch = entry.match(/<published>([^<]+)<\/published>/)
    const publishedAt = publishedMatch ? publishedMatch[1] : new Date().toISOString()
    
    // Extract thumbnail with dimensions
    const thumbnailMatch = entry.match(/<media:thumbnail url="([^"]+)"(?:\s+width="(\d+)"\s+height="(\d+)")?/)
    const thumbnailUrl = thumbnailMatch ? thumbnailMatch[1] : ''
    const thumbnailWidth = thumbnailMatch && thumbnailMatch[2] ? parseInt(thumbnailMatch[2]) : 1280
    const thumbnailHeight = thumbnailMatch && thumbnailMatch[3] ? parseInt(thumbnailMatch[3]) : 720
    
    // Extract link
    const linkMatch = entry.match(/<link rel="alternate" href="([^"]+)"/)
    const link = linkMatch ? linkMatch[1] : `https://www.youtube.com/watch?v=${videoId}`
    
    if (videoId) {
      videos.push({
        id: videoId,
        title: decodeHTMLEntities(title),
        description: decodeHTMLEntities(description),
        publishedAt,
        thumbnail: {
          url: thumbnailUrl,
          width: thumbnailWidth,
          height: thumbnailHeight
        },
        link
      })
    }
  }
  
  return videos
}

/**
 * Decode HTML entities in text
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '='
  }
  
  return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity)
}

/**
 * Fetch videos from YouTube channel RSS feed
 * No API quota usage!
 */
export async function fetchYouTubeRSSFeed(channelId: string): Promise<YouTubeRSSVideo[]> {
  try {
    // YouTube RSS feed URL
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    
    const response = await fetch(rssUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EnglishUnleashed/1.0)'
      }
    })
    
    if (!response.ok) {
      console.error('Failed to fetch RSS feed:', response.status)
      return []
    }
    
    const xml = await response.text()
    const videos = parseYouTubeRSS(xml)
    
    return videos
  } catch (error) {
    console.error('Error fetching YouTube RSS feed:', error)
    return []
  }
}

/**
 * Sync videos from YouTube RSS feed
 * This doesn't use any API quota!
 */
export async function syncYouTubeRSSVideos(channelId: string, limit = 10) {
  try {
    console.log('🔄 Syncing from YouTube RSS feed (no API quota usage)...')
    
    // Fetch videos from RSS feed
    const videos = await fetchYouTubeRSSFeed(channelId)
    
    if (videos.length === 0) {
      return {
        success: false,
        synced: 0,
        message: 'No videos found in RSS feed',
        quotaUsed: 0
      }
    }
    
    console.log(`📺 Found ${videos.length} videos in RSS feed`)
    
    let syncedCount = 0
    const videosToSync = videos.slice(0, limit)
    
    for (const video of videosToSync) {
      // Check if video already exists
      const existingPack = await prisma.pack.findFirst({
        where: { videoId: video.id }
      })
      
      if (existingPack) {
        console.log(`⏭️  Video already exists: ${video.title}`)
        continue
      }
      
      // Create product for the video
      const product = await prisma.product.create({
        data: {
          title: video.title,
          description: video.description.slice(0, 500),
          price: 0, // Free video
          type: 'PACK',
          active: true,
        }
      })
      
      // Create pack for the video
      await prisma.pack.create({
        data: {
          productId: product.id,
          title: video.title,
          description: video.description,
          videoId: video.id,
          videoUrl: video.link,
          hasPdf: false,
          hasQuiz: false,
          metadata: JSON.stringify({
            source: 'rss',
            publishedAt: video.publishedAt,
            thumbnail: video.thumbnail,
            syncedAt: new Date().toISOString()
          })
        }
      })
      
      syncedCount++
      console.log(`✅ Synced: ${video.title}`)
    }
    
    return {
      success: true,
      synced: syncedCount,
      message: `Synced ${syncedCount} new videos from RSS feed`,
      quotaUsed: 0 // No API quota used!
    }
    
  } catch (error) {
    console.error('RSS sync error:', error)
    return {
      success: false,
      synced: 0,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      quotaUsed: 0
    }
  }
}

/**
 * Get channel ID from YouTube channel URL or handle
 */
export function extractChannelId(input: string): string | null {
  // Direct channel ID
  if (input.startsWith('UC') && input.length === 24) {
    return input
  }
  
  // Channel URL with ID
  const channelIdMatch = input.match(/channel\/(UC[\w-]{22})/)
  if (channelIdMatch) {
    return channelIdMatch[1]
  }
  
  // Handle-based URL (needs API call to resolve - not supported in RSS)
  if (input.includes('@')) {
    console.warn('Channel handles (@username) need API call to resolve. Please use channel ID instead.')
    console.warn('To find channel ID: Go to channel → View page source → Search for "channelId"')
    return null
  }
  
  return null
}