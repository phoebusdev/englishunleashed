#!/usr/bin/env tsx
/**
 * Fetch all videos from YouTube channel for manual import
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const API_BASE = 'https://www.googleapis.com/youtube/v3'

async function fetchAllVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID || 'UCKRp9QaI8QAzKUWp8nU0uhQ'
  
  if (!apiKey) {
    console.error('No API key')
    return
  }
  
  // First get the uploads playlist
  const channelRes = await fetch(`${API_BASE}/channels?key=${apiKey}&id=${channelId}&part=contentDetails`)
  const channelData = await channelRes.json()
  
  if (!channelData.items?.[0]) {
    console.error('Channel not found')
    return
  }
  
  const uploadsId = channelData.items[0].contentDetails.relatedPlaylists.uploads
  console.log('Uploads playlist:', uploadsId)
  
  // Fetch all videos from uploads playlist
  let allVideos: any[] = []
  let pageToken = ''
  
  do {
    const url = `${API_BASE}/playlistItems?key=${apiKey}&playlistId=${uploadsId}&part=snippet&maxResults=50${pageToken ? '&pageToken=' + pageToken : ''}`
    const res = await fetch(url)
    const data = await res.json()
    
    if (data.items) {
      allVideos = allVideos.concat(data.items)
      console.log(`Fetched ${data.items.length} videos (total: ${allVideos.length})`)
    }
    
    pageToken = data.nextPageToken || ''
  } while (pageToken)
  
  // Format for our system
  const formatted = allVideos.map(item => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description || '',
    publishedAt: item.snippet.publishedAt,
    thumbnail: {
      url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
      width: item.snippet.thumbnails.high?.width || 1280,
      height: item.snippet.thumbnails.high?.height || 720
    }
  }))
  
  console.log('\n=== All Videos ===\n')
  console.log(JSON.stringify(formatted, null, 2))
  
  return formatted
}

fetchAllVideos()