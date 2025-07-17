'use client'

import { useState } from 'react'
import { Button } from 'components/Button/Button'
import { VideoModal } from 'components/VideoModal/VideoModal'

interface ProductCardProps {
  title: string
  price: string
  category: string
  description: string
  href?: string
  gumroadUrl?: string
  previewVideoId?: string
  featured?: boolean
}

export function ProductCard({ 
  title, 
  price, 
  category, 
  description, 
  href = '#', 
  gumroadUrl,
  previewVideoId,
  featured = false 
}: ProductCardProps) {
  const [showPreview, setShowPreview] = useState(false)
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 transition-all hover:shadow-xl ${featured ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
      {featured && (
        <span className="inline-block bg-gradient-primary text-white text-xs px-3 py-1 rounded-full mb-4 font-medium">
          Featured Product
        </span>
      )}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 capitalize">{category}</span>
          <span className="text-2xl font-bold text-primary">{price}</span>
        </div>
      </div>
      <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3">{description}</p>
      <div className="space-y-3">
        {gumroadUrl ? (
          <a 
            href={gumroadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="justify-center inline-flex items-center rounded-full text-center transition-all duration-200 font-medium shadow-md hover:shadow-lg bg-gradient-primary text-white border-0 hover:opacity-90 hover:scale-[1.02] min-w-36 h-12 text-base py-3 px-6 w-full"
          >
            Buy on Gumroad
          </a>
        ) : (
          <Button href={href} className="w-full" intent="primary">
            Learn More
          </Button>
        )}
        {previewVideoId && (
          <button
            onClick={() => setShowPreview(true)}
            className="w-full justify-center inline-flex items-center rounded-full text-center transition-all duration-200 font-medium shadow-md hover:shadow-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 min-w-36 h-12 text-base py-3 px-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Watch Preview
          </button>
        )}
      </div>
      {previewVideoId && (
        <VideoModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          videoId={previewVideoId}
          title={`${title} - Preview`}
        />
      )}
    </div>
  )
}