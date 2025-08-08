import { env } from '@/env.mjs'
import { prisma } from './db'
import { fetchChannelVideos } from './youtube'

export async function syncYouTubeVideos() {
  if (!env.YOUTUBE_CHANNEL_ID) {
    console.error('YouTube channel ID not configured')
    return { synced: 0, errors: [] }
  }

  try {
    // Fetch latest videos from YouTube
    const videos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID, 50)
    
    let syncedCount = 0
    const errors: string[] = []

    for (const video of videos) {
      try {
        // Check if pack already exists for this video
        const existingPack = await prisma.pack.findFirst({
          where: { videoId: video.id }
        })

        if (!existingPack) {
          // Create a new product for this video
          const product = await prisma.product.create({
            data: {
              title: video.title,
              description: video.description.slice(0, 500),
              price: 999, // Default $9.99
              type: 'PACK',
              active: true, // Active immediately!
              metadata: {
                preOrder: true,
                videoPublishedAt: video.publishedAt,
              }
            }
          })

          // Create the pack
          await prisma.pack.create({
            data: {
              productId: product.id,
              title: video.title,
              description: video.description,
              videoId: video.id,
              videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
              pdfUrl: null, // Admin will add this
              hasPdf: false,
              hasQuiz: false,
              order: 0,
            }
          })

          syncedCount++
        }
      } catch (error) {
        errors.push(`Failed to sync video ${video.id}: ${error}`)
      }
    }

    return { synced: syncedCount, errors }
  } catch (error) {
    console.error('YouTube sync error:', error)
    return { synced: 0, errors: [String(error)] }
  }
}

// Get YouTube embed URL
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}