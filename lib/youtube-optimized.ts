import { env } from '@/env.mjs'
import { prisma } from './db'

const API_BASE = 'https://www.googleapis.com/youtube/v3'

interface YouTubeVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnail: string
}

interface YouTubeAPIQuota {
  search: number  // 100 units per call
  videos: number  // 1 unit per call
  channels: number // 1 unit per call
}

const QUOTA_COSTS: YouTubeAPIQuota = {
  search: 100,
  videos: 1,
  channels: 1
}

// Store last sync info in database
async function getLastSyncInfo() {
  const lastPack = await prisma.pack.findFirst({
    where: { 
      videoId: { not: null },
      NOT: { videoId: '' }
    },
    orderBy: { createdAt: 'desc' },
    select: { 
      videoId: true, 
      createdAt: true,
      metadata: true 
    }
  })
  
  return lastPack
}

// Fetch only the latest video from channel (minimal API usage)
export async function fetchLatestVideo(channelId: string): Promise<YouTubeVideo | null> {
  if (!env.YOUTUBE_API_KEY) {
    console.error('YouTube API key not configured')
    return null
  }

  try {
    // Use activities API endpoint - costs only 1 unit!
    const url = `${API_BASE}/activities?` + new URLSearchParams({
      key: env.YOUTUBE_API_KEY,
      channelId: channelId,
      part: 'snippet,contentDetails',
      maxResults: '1'  // Only get the latest activity
    })

    const response = await fetch(url, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      console.error('YouTube API error:', response.status)
      return null
    }
    
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return null
    }

    const activity = data.items[0]
    
    // Check if it's an upload activity
    if (activity.snippet.type !== 'upload') {
      return null
    }

    const videoId = activity.contentDetails.upload.videoId
    
    return {
      id: videoId,
      title: activity.snippet.title,
      description: activity.snippet.description || '',
      publishedAt: activity.snippet.publishedAt,
      thumbnail: activity.snippet.thumbnails?.high?.url || ''
    }
    
  } catch (error) {
    console.error('Error fetching latest video:', error)
    return null
  }
}

// Optimized sync that only checks for new videos
export async function syncLatestYouTubeVideo() {
  if (!env.YOUTUBE_CHANNEL_ID) {
    console.error('YouTube channel ID not configured')
    return { synced: 0, message: 'No channel ID configured', quotaUsed: 0 }
  }

  try {
    // Get the last synced video
    const lastSync = await getLastSyncInfo()
    
    // Fetch only the latest video
    const latestVideo = await fetchLatestVideo(env.YOUTUBE_CHANNEL_ID)
    
    if (!latestVideo) {
      return { 
        synced: 0, 
        message: 'No new videos found', 
        quotaUsed: 1 // Activities API costs 1 unit
      }
    }

    // Check if this video is already synced
    if (lastSync && lastSync.videoId === latestVideo.id) {
      console.log('Latest video already synced:', latestVideo.id)
      return { 
        synced: 0, 
        message: 'Already up to date', 
        quotaUsed: 1 
      }
    }

    // Check if video exists in database (just in case)
    const existingPack = await prisma.pack.findFirst({
      where: { videoId: latestVideo.id }
    })

    if (existingPack) {
      console.log('Video already exists in database:', latestVideo.id)
      return { 
        synced: 0, 
        message: 'Video already in database', 
        quotaUsed: 1 
      }
    }

    // Create new product and pack for this video
    const product = await prisma.product.create({
      data: {
        title: latestVideo.title,
        description: latestVideo.description.slice(0, 500),
        price: 1499, // Default £14.99
        type: 'PACK',
        active: false, // Set to false initially, admin will activate
        metadata: JSON.stringify({
          youtubeVideoId: latestVideo.id,
          publishedAt: latestVideo.publishedAt,
          thumbnail: latestVideo.thumbnail,
          syncedAt: new Date().toISOString()
        })
      }
    })

    const pack = await prisma.pack.create({
      data: {
        productId: product.id,
        title: latestVideo.title,
        description: latestVideo.description,
        videoId: latestVideo.id,
        videoUrl: `https://www.youtube.com/watch?v=${latestVideo.id}`,
        pdfUrl: null,
        hasPdf: false,
        hasQuiz: false,
        order: 0,
        metadata: JSON.stringify({
          publishedAt: latestVideo.publishedAt,
          thumbnail: latestVideo.thumbnail
        })
      }
    })

    console.log('Successfully synced new video:', latestVideo.title)
    
    // Send notification to admin (optional)
    await notifyAdminOfNewVideo(latestVideo, pack.id)

    return { 
      synced: 1, 
      message: `Synced: ${latestVideo.title}`,
      videoId: latestVideo.id,
      packId: pack.id,
      quotaUsed: 1
    }

  } catch (error) {
    console.error('YouTube sync error:', error)
    return { 
      synced: 0, 
      message: `Error: ${error}`,
      quotaUsed: 0
    }
  }
}

// Notify admin when new video is available
async function notifyAdminOfNewVideo(video: YouTubeVideo, packId: string) {
  try {
    // Add to email queue for admin notification
    await prisma.emailQueue.create({
      data: {
        to: env.ADMIN_EMAIL || 'admin@englishunleashed.com',
        subject: 'New YouTube Video Ready for Content',
        template: 'admin-new-video',
        data: JSON.stringify({
          videoTitle: video.title,
          videoId: video.id,
          packId: packId,
          publishedAt: video.publishedAt,
          adminUrl: `${env.NEXTAUTH_URL}/admin/packs/${packId}`
        }),
        status: 'PENDING'
      }
    })
  } catch (error) {
    console.error('Failed to queue admin notification:', error)
  }
}

// Manual sync for specific video ID (for admin use)
export async function syncSpecificVideo(videoId: string) {
  if (!env.YOUTUBE_API_KEY) {
    return { success: false, message: 'YouTube API key not configured' }
  }

  try {
    // Check if already exists
    const existing = await prisma.pack.findFirst({
      where: { videoId }
    })

    if (existing) {
      return { success: false, message: 'Video already synced' }
    }

    // Fetch video details (costs only 1 unit)
    const url = `${API_BASE}/videos?` + new URLSearchParams({
      key: env.YOUTUBE_API_KEY,
      id: videoId,
      part: 'snippet'
    })

    const response = await fetch(url)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return { success: false, message: 'Video not found' }
    }

    const video = data.items[0]

    // Create product and pack
    const product = await prisma.product.create({
      data: {
        title: video.snippet.title,
        description: video.snippet.description.slice(0, 500),
        price: 1499,
        type: 'PACK',
        active: false,
        metadata: JSON.stringify({
          youtubeVideoId: videoId,
          publishedAt: video.snippet.publishedAt,
          manualSync: true
        })
      }
    })

    await prisma.pack.create({
      data: {
        productId: product.id,
        title: video.snippet.title,
        description: video.snippet.description,
        videoId: videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        pdfUrl: null,
        hasPdf: false,
        hasQuiz: false,
        order: 0
      }
    })

    return { 
      success: true, 
      message: `Synced: ${video.snippet.title}`,
      quotaUsed: 1
    }

  } catch (error) {
    return { 
      success: false, 
      message: `Error: ${error}`,
      quotaUsed: 0
    }
  }
}

// Get quota usage estimate for today
export async function getQuotaUsage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Count API calls made today (you'd need to implement logging for this)
  // For now, return an estimate based on sync frequency
  const syncsToday = await prisma.pack.count({
    where: {
      createdAt: { gte: today },
      videoId: { not: null }
    }
  })

  return {
    estimated: syncsToday * 1, // Each sync uses 1 unit with activities API
    limit: 10000,
    remaining: 10000 - (syncsToday * 1),
    resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
  }
}