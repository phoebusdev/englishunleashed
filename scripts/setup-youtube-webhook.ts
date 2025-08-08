#!/usr/bin/env tsx

import { config } from 'dotenv'
config()

const PUBSUBHUBBUB_HUB = 'https://pubsubhubbub.appspot.com/subscribe'

async function subscribeToYouTubeChannel() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/youtube`
  const secret = process.env.YOUTUBE_WEBHOOK_SECRET || ''

  if (!channelId) {
    console.error('❌ YOUTUBE_CHANNEL_ID not set in environment')
    process.exit(1)
  }

  if (!process.env.NEXTAUTH_URL) {
    console.error('❌ NEXTAUTH_URL not set in environment')
    process.exit(1)
  }

  console.log('🔔 Setting up YouTube webhook subscription')
  console.log('   Channel ID:', channelId)
  console.log('   Callback URL:', callbackUrl)
  console.log('   Secret:', secret ? 'Configured' : 'Not configured')

  const topic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`

  const params = new URLSearchParams({
    'hub.callback': callbackUrl,
    'hub.topic': topic,
    'hub.verify': 'async',
    'hub.mode': 'subscribe',
    'hub.lease_seconds': '864000', // 10 days
  })

  if (secret) {
    params.append('hub.secret', secret)
  }

  try {
    const response = await fetch(PUBSUBHUBBUB_HUB, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    if (response.status === 202) {
      console.log('✅ Subscription request accepted!')
      console.log('   YouTube will verify the webhook URL shortly.')
      console.log('   Make sure your app is deployed and accessible at:', callbackUrl)
    } else if (response.status === 204) {
      console.log('✅ Subscription verified successfully!')
    } else {
      const text = await response.text()
      console.error('❌ Subscription failed:', response.status, text)
    }

  } catch (error) {
    console.error('❌ Error subscribing to YouTube webhook:', error)
  }
}

async function unsubscribeFromYouTubeChannel() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/youtube`

  if (!channelId || !process.env.NEXTAUTH_URL) {
    console.error('❌ Required environment variables not set')
    process.exit(1)
  }

  const topic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`

  const params = new URLSearchParams({
    'hub.callback': callbackUrl,
    'hub.topic': topic,
    'hub.verify': 'async',
    'hub.mode': 'unsubscribe'
  })

  try {
    const response = await fetch(PUBSUBHUBBUB_HUB, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    if (response.status === 202 || response.status === 204) {
      console.log('✅ Unsubscribe request sent')
    } else {
      console.error('❌ Unsubscribe failed:', response.status)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Main execution
const command = process.argv[2]

console.log('YouTube Webhook Subscription Manager')
console.log('=====================================\n')

if (command === 'unsubscribe') {
  unsubscribeFromYouTubeChannel()
} else {
  subscribeToYouTubeChannel()
  console.log('\n📌 Important Notes:')
  console.log('   1. Webhook subscriptions expire after 10 days')
  console.log('   2. Set up a cron job to renew the subscription weekly')
  console.log('   3. Add YOUTUBE_WEBHOOK_SECRET to .env for security')
  console.log('\nTo unsubscribe, run: npm run youtube:webhook:unsubscribe')
}