import { type Metadata } from "next"
import { fetchGumroadProducts } from "lib/gumroad"
import { fetchChannelVideos, type YouTubeVideo } from "lib/youtube"
import { env } from "env.mjs"
import HomePageClient from "./HomePageClient"

export const metadata: Metadata = {
  title: "English Unleashed - Learn English with PDFs & Videos",
  description: "Master English with our podcast transcripts, vocabulary guides, and shadowing exercises. Download PDFs for offline learning.",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://englishunleashed.com/",
    title: "English Unleashed - Learn English with PDFs & Videos",
    description: "Master English with our podcast transcripts, vocabulary guides, and shadowing exercises.",
  },
}

export const revalidate = 300 // Revalidate every 5 minutes

export default async function Web() {
  // Fetch actual Gumroad products
  const gumroadProducts = await fetchGumroadProducts()
  
  // Fetch latest videos
  let latestVideos: YouTubeVideo[] = []
  try {
    if (env.YOUTUBE_CHANNEL_ID && env.YOUTUBE_API_KEY) {
      const videos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID, 6)
      latestVideos = videos
      
      // If no videos returned (possibly due to quota), try the cached API
      if (latestVideos.length === 0) {
        console.log('No videos from direct API, trying cached endpoint...')
        try {
          const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000'
          const response = await fetch(`${baseUrl}/api/youtube/videos`, {
            cache: 'no-store'
          })
          if (response.ok) {
            const data = await response.json() as { 
              videos: YouTubeVideo[], 
              cached: boolean, 
              cacheAge?: number 
            }
            latestVideos = (data.videos || []).slice(0, 6) // Get only first 6
            if (data.cached) {
              console.log(`Using cached videos (${data.cacheAge} minutes old)`)
            }
          }
        } catch (cacheError) {
          console.error('Error fetching from cache API:', cacheError)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching videos for homepage:', error)
  }
  
  return <HomePageClient gumroadProducts={gumroadProducts} latestVideos={latestVideos} />
}
