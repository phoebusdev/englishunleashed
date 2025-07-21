import { type Metadata } from "next"
import { fetchGumroadProducts } from "lib/gumroad"
import { type YouTubeVideo } from "lib/youtube"
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
  
  // Fetch latest videos using the cached API endpoint
  let latestVideos: YouTubeVideo[] = []
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/youtube/videos`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    if (response.ok) {
      const data = await response.json() as { 
        videos: YouTubeVideo[], 
        cached: boolean, 
        cacheAge?: number,
        buildTime?: boolean 
      }
      latestVideos = (data.videos || []).slice(0, 6) // Get only first 6
      if (data.cached) {
        console.log(`Using cached videos (${data.cacheAge} minutes old)`)
      }
      if (data.buildTime) {
        console.log('Build time - videos will load at runtime')
      }
    }
  } catch (error) {
    console.error('Error fetching videos for homepage:', error)
  }
  
  return <HomePageClient gumroadProducts={gumroadProducts} latestVideos={latestVideos} />
}
