#!/usr/bin/env tsx

/**
 * YouTube RSS Sync Script - No API quota usage!
 * 
 * This script syncs videos from YouTube using RSS feeds.
 * Perfect for initial setup and manual syncing.
 */

import { config } from 'dotenv'
import { syncYouTubeRSSVideos, fetchYouTubeRSSFeed } from '../lib/youtube-rss'

config()

async function main() {
  const command = process.argv[2]
  const channelId = process.argv[3] || process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
  
  console.log('🎥 YouTube RSS Sync Tool (No API Quota!)')
  console.log('========================================\n')
  
  if (!channelId) {
    console.error('❌ No channel ID provided!')
    console.log('\nUsage:')
    console.log('  npm run youtube:rss-sync <channel-id>')
    console.log('  npm run youtube:rss-sync preview <channel-id>')
    console.log('\nExample:')
    console.log('  npm run youtube:rss-sync UCxxxxxxxxxxxxxxxxxxxxxx')
    console.log('\nTo find channel ID:')
    console.log('  1. Go to the YouTube channel')
    console.log('  2. View page source (Ctrl+U)')
    console.log('  3. Search for "channelId"')
    console.log('  4. Copy the UC... value (24 characters)')
    process.exit(1)
  }
  
  if (command === 'preview') {
    // Just show what videos would be synced
    console.log(`📡 Fetching RSS feed for channel: ${channelId}\n`)
    
    const videos = await fetchYouTubeRSSFeed(channelId)
    
    if (videos.length === 0) {
      console.log('❌ No videos found in RSS feed')
      console.log('   Check that the channel ID is correct')
      process.exit(1)
    }
    
    console.log(`📺 Found ${videos.length} videos:\n`)
    
    videos.slice(0, 10).forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`)
      console.log(`   Video ID: ${video.id}`)
      console.log(`   Published: ${new Date(video.publishedAt).toLocaleDateString()}`)
      console.log(`   URL: https://youtube.com/watch?v=${video.id}`)
      console.log()
    })
    
    console.log('💡 Run without "preview" to sync these videos to database')
    
  } else {
    // Actually sync the videos
    console.log(`🔄 Syncing videos from channel: ${channelId}\n`)
    
    const limit = parseInt(command) || 10
    const result = await syncYouTubeRSSVideos(channelId, limit)
    
    if (result.success) {
      console.log(`\n✅ ${result.message}`)
      console.log(`   Videos synced: ${result.synced}`)
      console.log(`   API quota used: ${result.quotaUsed} (always 0 with RSS!)`)
    } else {
      console.error(`\n❌ Sync failed: ${result.message}`)
    }
  }
  
  process.exit(0)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})