#!/usr/bin/env tsx
/**
 * Sync YouTube Video History
 * 
 * This script fetches the current RSS feed and stores all videos in the database.
 * After running this once, all future videos will be automatically added.
 * 
 * Usage: pnpm tsx scripts/sync-youtube-history.ts
 */

import { prisma } from '../lib/db'
import { fetchYouTubeRSSFeed } from '../lib/youtube-rss'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function syncYouTubeHistory() {
  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
    
    if (!channelId) {
      console.error('❌ No YouTube channel ID found in environment variables')
      console.error('Please set YOUTUBE_CHANNEL_ID in your .env.local file')
      process.exit(1)
    }
    
    console.log('🎥 YouTube Video History Sync')
    console.log('=====================================')
    console.log(`📺 Channel ID: ${channelId}`)
    console.log('')
    
    // Fetch videos from RSS feed
    console.log('🔄 Fetching videos from RSS feed...')
    const rssVideos = await fetchYouTubeRSSFeed(channelId)
    
    if (rssVideos.length === 0) {
      console.log('⚠️  No videos found in RSS feed')
      return
    }
    
    console.log(`✅ Found ${rssVideos.length} videos in RSS feed`)
    console.log('')
    
    // Check existing videos in database
    const existingCount = await prisma.youTubeVideo.count()
    console.log(`📚 Currently ${existingCount} videos in database`)
    console.log('')
    
    // Store/update videos
    console.log('💾 Syncing videos to database...')
    let newCount = 0
    let updatedCount = 0
    
    for (const video of rssVideos) {
      try {
        const existing = await prisma.youTubeVideo.findUnique({
          where: { videoId: video.id }
        })
        
        if (existing) {
          // Update existing video
          await prisma.youTubeVideo.update({
            where: { videoId: video.id },
            data: {
              title: video.title,
              description: video.description,
              thumbnailUrl: video.thumbnail.url,
              thumbnailWidth: video.thumbnail.width,
              thumbnailHeight: video.thumbnail.height,
              lastSeenAt: new Date(),
            }
          })
          updatedCount++
          console.log(`📝 Updated: ${video.title}`)
        } else {
          // Create new video
          await prisma.youTubeVideo.create({
            data: {
              videoId: video.id,
              title: video.title,
              description: video.description,
              publishedAt: new Date(video.publishedAt),
              thumbnailUrl: video.thumbnail.url,
              thumbnailWidth: video.thumbnail.width,
              thumbnailHeight: video.thumbnail.height,
              channelId: channelId,
              videoUrl: video.link || `https://www.youtube.com/watch?v=${video.id}`,
            }
          })
          newCount++
          console.log(`✨ Added: ${video.title}`)
        }
      } catch (error) {
        console.error(`❌ Failed to sync video ${video.id}:`, error)
      }
    }
    
    console.log('')
    console.log('=====================================')
    console.log('✅ Sync Complete!')
    console.log(`📊 Results:`)
    console.log(`   - ${newCount} new videos added`)
    console.log(`   - ${updatedCount} videos updated`)
    
    const finalCount = await prisma.youTubeVideo.count()
    console.log(`   - Total videos in database: ${finalCount}`)
    console.log('')
    console.log('🎉 Your videos page will now show all stored videos!')
    console.log('   New videos will be automatically added when posted.')
    
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
syncYouTubeHistory()