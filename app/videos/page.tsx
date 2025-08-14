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

interface DebugInfo {
  channelId?: string
  apiUrl?: string
  error?: any
  response?: {
    status: number
    statusText: string
    headers?: any
  }
  data?: any
  timestamp: string
  environment: {
    NODE_ENV?: string
    VERCEL?: string
    VERCEL_ENV?: string
    VERCEL_URL?: string
    hasChannelId: boolean
    hasPublicChannelId: boolean
  }
}

export default async function VideosPage() {
  // Opt out of static rendering
  noStore()
  
  // Initialize debug info
  const debugInfo: DebugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      hasChannelId: !!process.env.YOUTUBE_CHANNEL_ID,
      hasPublicChannelId: !!process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID,
    }
  }
  
  // Fetch videos from RSS feed (no API quota!)
  let videos: YouTubeVideo[] = []
  let hasError = false
  let errorDetails: any = null
  
  try {
    // Get channel ID for debugging
    debugInfo.channelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || 'NOT_SET'
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    debugInfo.apiUrl = `${baseUrl}/api/youtube/videos`
    
    console.log('🎥 Fetching videos from:', debugInfo.apiUrl)
    console.log('📺 Channel ID:', debugInfo.channelId)
    
    const response = await fetch(`${baseUrl}/api/youtube/videos`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    debugInfo.response = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    }
    
    const responseText = await response.text()
    let data: any
    
    try {
      data = JSON.parse(responseText)
      debugInfo.data = data
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', responseText)
      debugInfo.error = {
        type: 'JSON_PARSE_ERROR',
        message: 'Response was not valid JSON',
        responseText: responseText.substring(0, 500)
      }
      hasError = true
      errorDetails = debugInfo
    }
    
    if (response.ok && data) {
      videos = data.videos || []
      if (data.cached) {
        console.log(`Using cached videos (${data.cacheAge} minutes old)`)
      }
      if (data.method === 'rss') {
        console.log('Videos fetched via RSS (zero API quota!)')
      }
      if (data.error) {
        console.error('API returned error:', data.error)
        hasError = true
        errorDetails = { ...debugInfo, apiError: data.error }
      }
    } else if (!response.ok) {
      console.error('YouTube RSS response not OK:', response.status, response.statusText)
      hasError = true
      errorDetails = debugInfo
    }
  } catch (error) {
    console.error('Error fetching videos:', error)
    hasError = true
    debugInfo.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    }
    errorDetails = debugInfo
  }
  
  // Show debug mode in development or when there's an error
  const showDebug = process.env.NODE_ENV === 'development' || hasError
  
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

        {/* Debug Information Panel */}
        {showDebug && errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-red-900 mb-4">
              🔍 Debug Information (Testing Deployment)
            </h2>
            
            <div className="space-y-4 text-sm">
              {/* Environment Check */}
              <div className="bg-white rounded p-3">
                <h3 className="font-semibold text-red-800 mb-2">1. Environment Variables:</h3>
                <ul className="space-y-1 text-red-700">
                  <li>✓ NODE_ENV: {errorDetails.environment.NODE_ENV || 'not set'}</li>
                  <li>✓ VERCEL: {errorDetails.environment.VERCEL || 'not set'}</li>
                  <li>✓ VERCEL_ENV: {errorDetails.environment.VERCEL_ENV || 'not set'}</li>
                  <li className={errorDetails.environment.hasChannelId ? 'text-green-700' : 'text-red-700'}>
                    {errorDetails.environment.hasChannelId ? '✅' : '❌'} YOUTUBE_CHANNEL_ID: {errorDetails.environment.hasChannelId ? 'SET' : 'NOT SET'}
                  </li>
                  <li className={errorDetails.environment.hasPublicChannelId ? 'text-green-700' : 'text-red-700'}>
                    {errorDetails.environment.hasPublicChannelId ? '✅' : '❌'} NEXT_PUBLIC_YOUTUBE_CHANNEL_ID: {errorDetails.environment.hasPublicChannelId ? 'SET' : 'NOT SET'}
                  </li>
                  <li>📺 Channel ID Used: <code className="bg-gray-100 px-1">{errorDetails.channelId}</code></li>
                </ul>
              </div>

              {/* API Request Info */}
              <div className="bg-white rounded p-3">
                <h3 className="font-semibold text-red-800 mb-2">2. API Request:</h3>
                <ul className="space-y-1 text-red-700">
                  <li>URL: <code className="bg-gray-100 px-1 text-xs break-all">{errorDetails.apiUrl}</code></li>
                  <li>Base URL: <code className="bg-gray-100 px-1">{process.env.VERCEL_URL || 'localhost:3000'}</code></li>
                </ul>
              </div>

              {/* Response Info */}
              {errorDetails.response && (
                <div className="bg-white rounded p-3">
                  <h3 className="font-semibold text-red-800 mb-2">3. Response Details:</h3>
                  <ul className="space-y-1 text-red-700">
                    <li>Status: {errorDetails.response.status} {errorDetails.response.statusText}</li>
                    <li>Content-Type: {errorDetails.response.headers?.['content-type'] || 'unknown'}</li>
                  </ul>
                </div>
              )}

              {/* Error Details */}
              {errorDetails.error && (
                <div className="bg-white rounded p-3">
                  <h3 className="font-semibold text-red-800 mb-2">4. Error Details:</h3>
                  <div className="text-red-700">
                    <p>Type: {errorDetails.error.type}</p>
                    <p>Message: {errorDetails.error.message}</p>
                    {errorDetails.error.responseText && (
                      <div className="mt-2">
                        <p>Response Preview:</p>
                        <pre className="bg-gray-100 p-2 mt-1 text-xs overflow-x-auto">
                          {errorDetails.error.responseText}
                        </pre>
                      </div>
                    )}
                    {errorDetails.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer">Stack Trace</summary>
                        <pre className="bg-gray-100 p-2 mt-1 text-xs overflow-x-auto">
                          {errorDetails.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* API Response Data */}
              {errorDetails.data && (
                <div className="bg-white rounded p-3">
                  <h3 className="font-semibold text-red-800 mb-2">5. API Response Data:</h3>
                  <pre className="bg-gray-100 p-2 text-xs overflow-x-auto">
                    {JSON.stringify(errorDetails.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Quick Fix Instructions */}
              <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                <h3 className="font-semibold text-yellow-900 mb-2">🛠️ To Fix This:</h3>
                <ol className="list-decimal list-inside space-y-2 text-yellow-800">
                  {!errorDetails.environment.hasChannelId && !errorDetails.environment.hasPublicChannelId && (
                    <li>
                      <strong>Add YouTube Channel ID to Vercel:</strong>
                      <br />
                      Go to Vercel Dashboard → Settings → Environment Variables
                      <br />
                      Add: <code className="bg-yellow-100 px-1">YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxxx</code>
                      <br />
                      <span className="text-xs">(Find your channel ID: YouTube channel → View Page Source → search "channelId")</span>
                    </li>
                  )}
                  <li>
                    <strong>Test RSS Feed Directly:</strong>
                    <br />
                    <a 
                      href={`https://www.youtube.com/feeds/videos.xml?channel_id=${errorDetails.channelId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs"
                    >
                      Click here to test RSS feed for channel: {errorDetails.channelId}
                    </a>
                  </li>
                  <li>
                    <strong>Test API Endpoint:</strong>
                    <br />
                    <a 
                      href="/api/youtube/videos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs"
                    >
                      Click here to test /api/youtube/videos directly
                    </a>
                  </li>
                  <li>
                    <strong>Verify Deployment:</strong>
                    <br />
                    <span className="text-xs">Redeploy on Vercel after adding environment variables</span>
                  </li>
                </ol>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-gray-500 text-right">
                Debug timestamp: {errorDetails.timestamp}
              </div>
            </div>
          </div>
        )}

        {hasError && !showDebug && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              Unable to load latest videos. Please try again later.
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
            
            {/* Show debug hint if no videos but no error */}
            {showDebug && (
              <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
                <p>📝 No videos returned from RSS feed.</p>
                <p>Channel ID: <code className="bg-blue-100 px-1">{process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || 'NOT SET'}</code></p>
                <p>This could mean:</p>
                <ul className="list-disc list-inside mt-2 text-left max-w-md mx-auto">
                  <li>Channel has no public videos</li>
                  <li>Channel ID is incorrect</li>
                  <li>RSS feed is temporarily unavailable</li>
                </ul>
              </div>
            )}
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
                  {/* Debug: Show video ID in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-400">
                      ID: {video.id}
                    </div>
                  )}
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

        {/* Footer Debug Info */}
        {showDebug && (
          <div className="mt-12 p-4 bg-gray-100 rounded text-xs text-gray-600">
            <p className="font-semibold mb-2">System Info:</p>
            <ul className="space-y-1">
              <li>Page rendered at: {new Date().toISOString()}</li>
              <li>Videos loaded: {videos.length}</li>
              <li>Has error: {hasError ? 'Yes' : 'No'}</li>
              <li>Cache status: Using 5-minute cache on API route</li>
              <li>Method: RSS Feed (Zero API Quota)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}