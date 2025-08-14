#!/usr/bin/env tsx
/**
 * Import YouTube History via API
 * 
 * This script calls the admin API endpoint to import all YouTube videos.
 * Can be run locally or after deployment.
 * 
 * Usage: pnpm youtube:import-api
 */

import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function importViaAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const apiKey = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

  if (!apiKey) {
    console.error('❌ YOUTUBE_API_KEY not found in .env.local')
    console.error('Get your API key from: https://console.cloud.google.com/apis/credentials')
    process.exit(1)
  }

  console.log('🎥 YouTube History Import (via API)')
  console.log('=====================================')
  console.log(`📍 Target: ${baseUrl}`)
  console.log(`📺 Channel: ${channelId}`)
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`)
  console.log('')

  // First, check current status
  console.log('📊 Checking current status...')
  try {
    const statusRes = await fetch(`${baseUrl}/api/admin/import-youtube-history`, {
      headers: {
        'Cookie': process.env.AUTH_COOKIE || ''
      }
    })
    
    if (statusRes.ok) {
      const status = await statusRes.json()
      console.log(`✅ Currently ${status.totalVideos} videos in database`)
      console.log('')
    } else if (statusRes.status === 401) {
      console.log('⚠️  Need admin authentication')
      console.log('   Please login as admin at: ' + baseUrl + '/login')
      console.log('   Then copy the session cookie and set AUTH_COOKIE in .env.local')
      console.log('')
    }
  } catch (error) {
    console.log('⚠️  Could not check status (may need to start dev server)')
    console.log('')
  }

  // Start import
  console.log('🔄 Starting import...')
  console.log('   This may take a few minutes depending on channel size')
  console.log('')

  try {
    const response = await fetch(`${baseUrl}/api/admin/import-youtube-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': process.env.AUTH_COOKIE || ''
      },
      body: JSON.stringify({
        apiKey,
        channelId
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Import failed:', data.error || data.message)
      
      if (response.status === 401) {
        console.log('')
        console.log('📝 To authenticate:')
        console.log('   1. Start dev server: pnpm dev')
        console.log('   2. Login as admin: http://localhost:3000/login')
        console.log('   3. Open browser DevTools → Network tab')
        console.log('   4. Find any request → Headers → Cookie')
        console.log('   5. Copy the cookie value')
        console.log('   6. Add to .env.local: AUTH_COOKIE="your-cookie-here"')
        console.log('   7. Run this script again')
      }
      
      process.exit(1)
    }

    // Success!
    console.log('✅ Import Complete!')
    console.log('')
    console.log('📊 Results:')
    console.log(`   • Found ${data.stats.videosFoundOnYouTube} videos on YouTube`)
    console.log(`   • Added ${data.stats.newVideosAdded} new videos`)
    console.log(`   • Updated ${data.stats.videosUpdated} existing videos`)
    if (data.stats.errors > 0) {
      console.log(`   • ${data.stats.errors} errors occurred`)
    }
    console.log(`   • Total videos in database: ${data.stats.totalVideosInDatabase}`)
    console.log('')
    console.log('🎉 Your videos page will now show your complete channel history!')
    console.log('   RSS will automatically add new videos as they are posted.')

    if (data.errors && data.errors.length > 0) {
      console.log('')
      console.log('⚠️  Some videos had errors:')
      data.errors.slice(0, 5).forEach((err: any) => {
        console.log(`   • ${err.title}: ${err.error}`)
      })
      if (data.errors.length > 5) {
        console.log(`   ... and ${data.errors.length - 5} more`)
      }
    }

  } catch (error) {
    console.error('❌ Request failed:', error)
    console.log('')
    console.log('Make sure:')
    console.log('   1. Dev server is running: pnpm dev')
    console.log('   2. You are logged in as admin')
    console.log('   3. AUTH_COOKIE is set in .env.local (if needed)')
    process.exit(1)
  }
}

// Run import
importViaAPI()