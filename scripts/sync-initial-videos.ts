#!/usr/bin/env tsx

import { config } from 'dotenv'
import { prisma } from '../lib/db'

config()

async function syncInitialVideos() {
  console.log('🎥 Syncing initial YouTube videos to database...\n')

  // Sample videos from English Unleashed channel
  // Replace these with actual video IDs from your channel
  const sampleVideos = [
    {
      videoId: 'VIDEO_ID_1', // Replace with actual video ID
      title: 'Episode 1: Introduction to English Shadowing',
      description: 'Learn the basics of the shadowing technique for improving your English pronunciation and fluency.',
    },
    {
      videoId: 'VIDEO_ID_2', // Replace with actual video ID
      title: 'Episode 2: Daily Routines Vocabulary',
      description: 'Master essential vocabulary for talking about your daily routine in English.',
    },
    {
      videoId: 'VIDEO_ID_3', // Replace with actual video ID
      title: 'Episode 3: British vs American Pronunciation',
      description: 'Understand the key differences between British and American English pronunciation.',
    },
  ]

  try {
    for (const video of sampleVideos) {
      // Check if pack with this video ID already exists
      const existingPack = await prisma.pack.findFirst({
        where: { videoId: video.videoId }
      })

      if (existingPack) {
        console.log(`⏭️  Video already exists: ${video.title}`)
        continue
      }

      // Create a new pack for the video
      const pack = await prisma.pack.create({
        data: {
          title: video.title,
          description: video.description,
          videoId: video.videoId,
          active: false, // Set to inactive by default (admin needs to add PDF)
          hasPdf: false,
          hasQuiz: false,
        }
      })

      console.log(`✅ Created pack for video: ${video.title}`)
      console.log(`   Pack ID: ${pack.id}`)
      console.log(`   Video ID: ${video.videoId}`)
    }

    console.log('\n✨ Initial video sync complete!')
    console.log('Note: Videos are set as inactive. Admin needs to add PDFs and activate them.')
    
  } catch (error) {
    console.error('❌ Error syncing videos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Instructions for getting real video IDs
console.log('📝 Instructions for getting YouTube video IDs:')
console.log('1. Go to your YouTube channel')
console.log('2. Click on a video')
console.log('3. The video ID is in the URL after "watch?v="')
console.log('   Example: https://www.youtube.com/watch?v=ABC123 → Video ID is "ABC123"')
console.log('\n4. Replace VIDEO_ID_1, VIDEO_ID_2, etc. in this script with your actual video IDs')
console.log('5. Run this script again: npm run sync:videos\n')
console.log('---\n')

// Uncomment this line when you've added real video IDs
// syncInitialVideos()

console.log('⚠️  Script is currently disabled. Add real video IDs first, then uncomment the last line.')