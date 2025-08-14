'use client'

import { useEffect } from 'react'

interface Video {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
}

export function VideoHistory({ videos }: { videos: Video[] }) {
  useEffect(() => {
    if (videos.length === 0) return
    
    try {
      // Get existing stored videos
      const stored = localStorage.getItem('youtube-videos')
      const existingVideos: Record<string, Video> = stored ? JSON.parse(stored) : {}
      
      // Add new videos to storage
      let hasNewVideos = false
      for (const video of videos) {
        if (!existingVideos[video.id]) {
          existingVideos[video.id] = video
          hasNewVideos = true
        }
      }
      
      // Save back to localStorage if we have new videos
      if (hasNewVideos) {
        localStorage.setItem('youtube-videos', JSON.stringify(existingVideos))
        console.log(`Stored ${Object.keys(existingVideos).length} total videos in browser`)
        
        // Also send to server memory (optional)
        fetch('/api/youtube/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videos: Object.values(existingVideos) })
        }).catch(() => {}) // Ignore errors
      }
    } catch (error) {
      console.error('Failed to store videos:', error)
    }
  }, [videos])
  
  return null
}