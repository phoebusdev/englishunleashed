#!/usr/bin/env tsx
/**
 * Import historical YouTube videos into database
 * Run with: pnpm tsx scripts/import-youtube-videos.ts
 */

import { prisma } from '../lib/db'
import { historicalVideos } from '../lib/youtube-videos-static'

async function importVideos() {
  console.log('🚀 Starting YouTube video import...')
  console.log(`📺 Found ${historicalVideos.length} historical videos to import`)
  
  let imported = 0
  let updated = 0
  let failed = 0
  
  for (const video of historicalVideos) {
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
            updatedAt: new Date()
          }
        })
        updated++
        console.log(`✏️  Updated: ${video.title}`)
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
            videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
            source: 'manual'
          }
        })
        imported++
        console.log(`✅ Imported: ${video.title}`)
      }
    } catch (error) {
      failed++
      console.error(`❌ Failed to import video ${video.id}:`, error)
    }
  }
  
  console.log('\n📊 Import Summary:')
  console.log(`   New videos imported: ${imported}`)
  console.log(`   Existing videos updated: ${updated}`)
  console.log(`   Failed imports: ${failed}`)
  
  const totalInDb = await prisma.youTubeVideo.count()
  console.log(`   Total videos in database: ${totalInDb}`)
  
  await prisma.$disconnect()
  console.log('\n✨ Import complete!')
}

// Run the import
importVideos().catch(error => {
  console.error('Import failed:', error)
  process.exit(1)
})