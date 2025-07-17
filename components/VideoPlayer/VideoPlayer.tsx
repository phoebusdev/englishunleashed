'use client'

import { useState } from 'react'

interface VideoPlayerProps {
  videoId: string
  title?: string
  aspectRatio?: '16:9' | '4:3'
  autoplay?: boolean
  className?: string
}

export function VideoPlayer({ 
  videoId, 
  title = 'YouTube video player',
  aspectRatio = '16:9',
  autoplay = false,
  className = ''
}: VideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  const paddingBottom = aspectRatio === '16:9' ? '56.25%' : '75%'
  
  // Privacy-enhanced YouTube embed URL
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${autoplay ? 'autoplay=1&' : ''}rel=0&modestbranding=1`
  
  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${className}`}>
      <div style={{ paddingBottom }} className="relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500">Loading video...</p>
            </div>
          </div>
        )}
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  )
}