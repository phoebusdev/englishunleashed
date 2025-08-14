import { type Metadata } from 'next'
import { unstable_noStore as noStore } from 'next/cache'

export const metadata: Metadata = {
  title: 'English Learning Videos',
  description: 'Watch free English lessons, podcast episodes, and conversation practice videos. Learn vocabulary, pronunciation, and daily English expressions.',
  openGraph: {
    title: 'English Learning Videos | English Unleashed',
    description: 'Free English video lessons covering vocabulary, pronunciation, shadowing exercises, and real conversation practice.',
  },
}

interface YouTubeVideo {
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

export default async function VideosPage() {
  noStore()
  
  // Fetch videos from our API
  let videos: YouTubeVideo[] = []
  let hasError = false
  
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/youtube/videos`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (response.ok) {
      const data = await response.json()
      videos = data.videos || []
      console.log(`Loaded ${videos.length} videos (${data.method})`)
    } else {
      console.error('Failed to fetch videos:', response.status)
      hasError = true
    }
  } catch (error) {
    console.error('Error fetching videos:', error)
    hasError = true
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free English Lessons
          </h1>
          <p className="text-lg text-gray-600">
            Watch our YouTube videos and practice with the shadowing method
          </p>
        </div>

        {hasError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              Unable to load videos at the moment. Please try again later.
            </p>
          </div>
        )}

        {videos.length === 0 && !hasError ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos available yet</h3>
            <p className="text-gray-500">Check back soon for new English learning videos!</p>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video, index) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-purple-600 font-medium mb-2">
                    Episode #{videos.length - index}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {video.description}
                    </p>
                  )}
                  <div className="mt-4 text-xs text-gray-500">
                    {new Date(video.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-12 text-center">
          <a
            href="https://www.youtube.com/@EnglishPodcastUnleashed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Subscribe on YouTube
          </a>
          <p className="text-gray-600 mt-4">
            New lessons every week!
          </p>
        </div>
      </div>
    </div>
  )
}