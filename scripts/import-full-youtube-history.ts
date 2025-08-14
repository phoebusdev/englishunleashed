#!/usr/bin/env tsx
/**
 * Import Full YouTube Channel History
 * 
 * ONE-TIME SCRIPT: Fetches ALL videos from your YouTube channel using the API
 * and stores them in the database. After this, RSS will handle new videos.
 * 
 * API QUOTA USAGE: ~100 units per 50 videos
 * 
 * Usage: pnpm youtube:import-history
 */

import { prisma } from '../lib/db'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const API_BASE = 'https://www.googleapis.com/youtube/v3'
const MAX_RESULTS = 50 // YouTube API maximum per request

interface YouTubeAPIVideo {
  id: { videoId?: string; kind: string }
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
    channelTitle: string
  }
}

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
    channelTitle: string
    resourceId: {
      kind: string
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
      console.error('Channel not found')
      return null
    }

    // YouTube creates an "uploads" playlist for every channel
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

  console.log('📥 Fetching videos from uploads playlist...')

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
        console.log(`  📄 Page ${pageCount}: Found ${data.items.length} videos (Total: ${allVideos.length})`)
      }

      pageToken = data.nextPageToken
    } catch (error) {
      console.error('Error fetching page:', error)
      break
    }

    // Small delay to be respectful to API
    if (pageToken) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } while (pageToken)

  return allVideos
}

async function importFullHistory() {
  try {
    // Check for required environment variables
    const apiKey = process.env.YOUTUBE_API_KEY
    const channelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

    if (!apiKey) {
      console.error('❌ YOUTUBE_API_KEY not found in environment variables')
      console.error('Please add it to your .env.local file')
      console.error('Get your API key from: https://console.cloud.google.com/apis/credentials')
      process.exit(1)
    }

    if (!channelId) {
      console.error('❌ YOUTUBE_CHANNEL_ID not found in environment variables')
      console.error('Please add it to your .env.local file')
      process.exit(1)
    }

    console.log('🎥 YouTube Full History Import')
    console.log('=====================================')
    console.log(`📺 Channel ID: ${channelId}`)
    console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`)
    console.log('')

    // Get the uploads playlist ID
    console.log('🔍 Getting channel uploads playlist...')
    const uploadsPlaylistId = await getChannelUploadsPlaylistId(apiKey, channelId)

    if (!uploadsPlaylistId) {
      console.error('❌ Could not find uploads playlist for channel')
      process.exit(1)
    }

    console.log(`✅ Uploads playlist ID: ${uploadsPlaylistId}`)
    console.log('')

    // Fetch all videos from the uploads playlist
    const videos = await fetchAllVideosFromPlaylist(apiKey, uploadsPlaylistId)

    if (videos.length === 0) {
      console.log('⚠️  No videos found in channel')
      return
    }

    console.log('')
    console.log(`✅ Found ${videos.length} total videos in channel`)
    console.log('')

    // Check existing videos in database
    const existingCount = await prisma.youTubeVideo.count()
    console.log(`📚 Currently ${existingCount} videos in database`)
    console.log('')

    // Import videos to database
    console.log('💾 Importing videos to database...')
    let newCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      const videoId = video.snippet.resourceId.videoId

      // Show progress every 10 videos
      if ((i + 1) % 10 === 0) {
        console.log(`  Progress: ${i + 1}/${videos.length} videos processed...`)
      }

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
          
          // Log new videos
          if (newCount <= 5) {
            console.log(`  ✨ Added: ${video.snippet.title}`)
          }
        }
      } catch (error) {
        errorCount++
        console.error(`  ❌ Failed to import video ${videoId}:`, error)
      }
    }

    console.log('')
    console.log('=====================================')
    console.log('✅ Import Complete!')
    console.log(`📊 Results:`)
    console.log(`   - ${videos.length} videos found on YouTube`)
    console.log(`   - ${newCount} new videos added`)
    console.log(`   - ${updatedCount} videos updated`)
    if (errorCount > 0) {
      console.log(`   - ${errorCount} errors (check logs above)`)
    }

    const finalCount = await prisma.youTubeVideo.count()
    console.log(`   - Total videos in database: ${finalCount}`)
    console.log('')
    console.log('🎉 Success! Your videos page will now show your complete channel history!')
    console.log('   RSS will automatically add new videos as they are posted.')
    console.log('')
    console.log('📝 Next Steps:')
    console.log('   1. Deploy to production: git push')
    console.log('   2. Run database migration on Vercel')
    console.log('   3. Set YOUTUBE_API_KEY on Vercel (for future imports if needed)')
    console.log('   4. Your videos page will show all videos!')

  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importFullHistory()