import { NextResponse } from 'next/server'
import { parseStringPromise } from 'xml2js'
import crypto from 'crypto'
import { syncSpecificVideo } from '@/lib/youtube-optimized'
import { prisma } from '@/lib/db'

// YouTube PubSubHubbub webhook endpoint
// This receives instant notifications when new videos are uploaded
// NO API QUOTA USAGE!

// Verify webhook challenge (for subscription confirmation)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const mode = searchParams.get('hub.mode')
  const topic = searchParams.get('hub.topic')
  const challenge = searchParams.get('hub.challenge')
  const leaseSeconds = searchParams.get('hub.lease_seconds')

  console.log('YouTube webhook verification:', { mode, topic, challenge })

  if (mode === 'subscribe' || mode === 'unsubscribe') {
    // Verify the topic is for our channel
    const expectedChannelId = process.env.YOUTUBE_CHANNEL_ID
    if (topic?.includes(expectedChannelId)) {
      console.log(`YouTube webhook ${mode} confirmed for channel ${expectedChannelId}`)
      
      // Store subscription info
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'youtube_webhook_subscribe',
          eventData: JSON.stringify({
            mode,
            topic,
            leaseSeconds,
            timestamp: new Date().toISOString()
          })
        }
      }).catch(console.error)
      
      // Return the challenge to confirm subscription
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }
  }

  return new Response('Invalid request', { status: 400 })
}

// Handle new video notifications
export async function POST(request: Request) {
  try {
    const body = await request.text()
    
    // Verify HMAC signature if secret is configured
    if (process.env.YOUTUBE_WEBHOOK_SECRET) {
      const signature = request.headers.get('x-hub-signature')
      if (!signature) {
        return new Response('Missing signature', { status: 401 })
      }

      const hmac = crypto.createHmac('sha1', process.env.YOUTUBE_WEBHOOK_SECRET)
      hmac.update(body)
      const expectedSignature = `sha1=${hmac.digest('hex')}`
      
      if (signature !== expectedSignature) {
        console.error('Invalid YouTube webhook signature')
        return new Response('Invalid signature', { status: 401 })
      }
    }

    // Parse the Atom feed
    const feed = await parseStringPromise(body)
    
    // Extract video information from the feed
    const entry = feed?.feed?.entry?.[0]
    if (!entry) {
      console.log('No entry in YouTube webhook feed')
      return new Response('No content', { status: 204 })
    }

    const videoId = entry['yt:videoId']?.[0]
    const channelId = entry['yt:channelId']?.[0]
    const title = entry.title?.[0]
    const published = entry.published?.[0]
    const updated = entry.updated?.[0]

    console.log('YouTube webhook notification:', {
      videoId,
      channelId,
      title,
      published,
      updated
    })

    // Verify it's from our channel
    if (channelId !== process.env.YOUTUBE_CHANNEL_ID) {
      console.warn('Webhook from different channel:', channelId)
      return new Response('Wrong channel', { status: 400 })
    }

    // Check if this is a new video (not an update)
    const publishedDate = new Date(published)
    const updatedDate = new Date(updated)
    const isNew = Math.abs(publishedDate.getTime() - updatedDate.getTime()) < 60000 // Within 1 minute

    if (!isNew) {
      console.log('Video update notification (not new):', videoId)
      return new Response('Update noted', { status: 200 })
    }

    // Check if video already exists
    const existingPack = await prisma.pack.findFirst({
      where: { videoId }
    })

    if (existingPack) {
      console.log('Video already exists:', videoId)
      return new Response('Already synced', { status: 200 })
    }

    // Sync the new video (uses only 1 API unit to get details)
    const result = await syncSpecificVideo(videoId)
    
    if (result.success) {
      console.log('Successfully synced video from webhook:', videoId)
      
      // Log the instant sync
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'youtube_instant_sync',
          eventData: JSON.stringify({
            videoId,
            title,
            published,
            source: 'webhook',
            timestamp: new Date().toISOString()
          })
        }
      })

      // Notify admin
      await prisma.emailQueue.create({
        data: {
          to: process.env.ADMIN_EMAIL || 'admin@englishunleashed.com',
          subject: `New Video: ${title}`,
          template: 'admin-new-video-instant',
          data: JSON.stringify({
            videoTitle: title,
            videoId,
            publishedAt: published,
            adminUrl: `${process.env.NEXTAUTH_URL}/admin`
          }),
          status: 'PENDING'
        }
      })
    }

    return NextResponse.json({
      success: result.success,
      message: result.message
    })

  } catch (error) {
    console.error('YouTube webhook error:', error)
    
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'youtube_webhook_error',
        eventData: JSON.stringify({
          error: String(error),
          timestamp: new Date().toISOString()
        })
      }
    }).catch(console.error)

    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}