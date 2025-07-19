'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from 'components/Button/Button'
import { VideoPlayer } from 'components/VideoPlayer/VideoPlayer'
import { products } from 'data/products'
import { formatViewCount, getRelativeTime } from 'lib/youtube'

interface EnhancedVideo {
  id: string
  title: string
  description: string
  youtubeId: string
  category: 'episode' | 'lesson' | 'tutorial'
  relatedProducts: string[]
  publishedDate: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
  duration?: string
  viewCount?: string
  featured?: boolean
  episodeNumber?: number
  gumroadProduct?: {
    price: number
    formattedPrice: string
    checkoutUrl: string
  } | null
}

interface VideoPageClientProps {
  videos: EnhancedVideo[]
  hasError: boolean
}

const categories = [
  { id: 'all', name: 'All Videos' },
  { id: 'episode', name: 'Podcast Episodes' },
  { id: 'lesson', name: 'Lessons' },
  { id: 'tutorial', name: 'Tutorials' }
]

export default function VideoPageClient({ videos, hasError }: VideoPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState(videos && videos.length > 0 ? videos[0] : null)
  
  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory)
  
  const relatedProducts = selectedVideo?.relatedProducts
    ? products.filter(p => selectedVideo.relatedProducts.includes(p.id))
    : []
  
  // Update selected video when category changes
  useEffect(() => {
    if (filteredVideos.length > 0 && (!selectedVideo || !filteredVideos.find(v => v.id === selectedVideo.id))) {
      setSelectedVideo(filteredVideos[0])
    }
  }, [filteredVideos, selectedVideo])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load videos</h2>
          <p className="text-gray-600 mb-6">Please try again later.</p>
          <Button href="/" intent="primary">Go Home</Button>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No videos available</h2>
          <p className="text-gray-600 mb-6">Check back soon for new content!</p>
          <Button href="/" intent="primary">Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <section className="bg-gradient-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <span className="inline-block mb-4 text-sm font-medium text-white/90 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            🎥 Video Library
          </span>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
            Learn with English Unleashed
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Watch our free lessons, podcast episodes, and tutorials. Practice with our proven shadowing method.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <p className="text-center mt-6 text-gray-600 font-medium">
              {filteredVideos.length} Videos
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {selectedVideo && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <VideoPlayer
                    videoId={selectedVideo.youtubeId}
                    title={selectedVideo.title}
                  />
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedVideo.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{formatViewCount(selectedVideo.viewCount || '0')}</span>
                      <span>•</span>
                      <span>{getRelativeTime(selectedVideo.publishedDate)}</span>
                      {selectedVideo.duration && (
                        <>
                          <span>•</span>
                          <span>{selectedVideo.duration}</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600 mb-6 whitespace-pre-line">
                      {selectedVideo.description.length > 300 
                        ? selectedVideo.description.substring(0, 300) + '...' 
                        : selectedVideo.description}
                    </p>
                    
                    {/* PDF Download Section */}
                    <div className="border-t pt-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📄 PDF Learning Materials
                      </h3>
                      {selectedVideo.gumroadProduct ? (
                        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Download PDF Guide</p>
                              <p className="text-sm text-gray-600">Full transcript, vocabulary quiz, and exercises</p>
                            </div>
                            <a
                              href={selectedVideo.gumroadProduct.checkoutUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-3 bg-gradient-primary text-white rounded-full font-medium hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
                            >
                              Get PDF - {selectedVideo.gumroadProduct.formattedPrice}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">PDF Guide Coming Soon</p>
                              <p className="text-sm text-gray-600">We're working on creating a PDF for this video</p>
                            </div>
                            <button
                              disabled
                              className="px-6 py-3 bg-gray-300 text-gray-500 rounded-full font-medium cursor-not-allowed"
                            >
                              Coming Soon
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {relatedProducts.length > 0 && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          📚 Related Learning Materials
                        </h3>
                        <div className="space-y-3">
                          {relatedProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                              <div>
                                <h4 className="font-medium text-gray-900">{product.title}</h4>
                                <p className="text-sm text-gray-600">{product.price}</p>
                              </div>
                              {product.gumroadUrl ? (
                                <a
                                  href={product.gumroadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-gradient-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                  Buy Now
                                </a>
                              ) : (
                                <Button href={`/shop/${product.id}`} size="sm" intent="primary">
                                  Learn More
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Video Playlist
              </h3>
              <div className="space-y-3 max-h-[800px] overflow-y-auto">
                {filteredVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`w-full text-left bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                      selectedVideo?.id === video.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-24 h-16 bg-gray-200 rounded overflow-hidden relative">
                        <Image
                          src={video.thumbnail.url}
                          alt={video.title}
                          width={96}
                          height={64}
                          className="object-cover"
                        />
                        {video.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                            {video.duration}
                          </span>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatViewCount(video.viewCount || '0')} • {getRelativeTime(video.publishedDate)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}