'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from 'components/Button/Button'
import { VideoPlayer } from 'components/VideoPlayer/VideoPlayer'
import { products } from 'data/products'
import { getVideosByCategory, videos } from 'data/videos'

const categories = [
  { id: 'all', name: 'All Videos' },
  { id: 'episode', name: 'Podcast Episodes' },
  { id: 'lesson', name: 'Lessons' },
  { id: 'tutorial', name: 'Tutorials' }
]

export default function VideosPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState(videos[0])
  const filteredVideos = getVideosByCategory(selectedCategory)
  
  const relatedProducts = selectedVideo?.relatedProducts
    ? products.filter(p => selectedVideo.relatedProducts?.includes(p.id))
    : []

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
                    <p className="text-sm text-gray-500 mb-4">
                      Published: {new Date(selectedVideo.publishedDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mb-6">
                      {selectedVideo.description}
                    </p>
                    
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
                          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                          alt={video.title}
                          width={96}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {video.category} • {new Date(video.publishedDate).toLocaleDateString()}
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