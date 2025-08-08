#!/usr/bin/env tsx

import { config } from 'dotenv'
import { syncLatestYouTubeVideo, syncSpecificVideo, getQuotaUsage } from '../lib/youtube-optimized'

config()

async function main() {
  const command = process.argv[2]
  
  console.log('🎥 YouTube Manual Sync Tool')
  console.log('===========================\n')

  // Check quota first
  const quota = await getQuotaUsage()
  console.log('📊 Quota Status:')
  console.log(`   Used: ${10000 - quota.remaining} / ${quota.limit}`)
  console.log(`   Remaining: ${quota.remaining}`)
  console.log(`   Resets: ${new Date(quota.resetTime).toLocaleString()}\n`)

  if (quota.remaining < 10) {
    console.error('⚠️  WARNING: Quota is very low!')
    const answer = await prompt('Continue anyway? (y/n): ')
    if (answer !== 'y') {
      process.exit(0)
    }
  }

  if (command === 'latest') {
    console.log('🔄 Syncing latest video from channel...')
    const result = await syncLatestYouTubeVideo()
    
    if (result.synced > 0) {
      console.log(`✅ Successfully synced: ${result.message}`)
      if (result.videoId) {
        console.log(`   Video ID: ${result.videoId}`)
        console.log(`   Pack ID: ${result.packId}`)
      }
    } else {
      console.log(`ℹ️  ${result.message}`)
    }
    console.log(`   Quota used: ${result.quotaUsed} units`)
    
  } else if (command && command.length > 0) {
    // Sync specific video
    console.log(`🔄 Syncing specific video: ${command}`)
    const result = await syncSpecificVideo(command)
    
    if (result.success) {
      console.log(`✅ ${result.message}`)
    } else {
      console.error(`❌ ${result.message}`)
    }
    console.log(`   Quota used: ${result.quotaUsed || 0} units`)
    
  } else {
    console.log('Usage:')
    console.log('  npm run youtube:sync latest                    # Sync latest video')
    console.log('  npm run youtube:sync <video-id>               # Sync specific video')
    console.log('  npm run youtube:sync <youtube-url>            # Sync from URL')
    console.log('\nExamples:')
    console.log('  npm run youtube:sync dQw4w9WgXcQ')
    console.log('  npm run youtube:sync https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  }

  process.exit(0)
}

function prompt(question: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    readline.question(question, (answer: string) => {
      readline.close()
      resolve(answer)
    })
  })
}

main().catch(console.error)