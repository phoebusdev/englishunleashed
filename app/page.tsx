import { Metadata } from "next"
import { Button } from "components/Button/Button"
import { fetchGumroadProducts } from "lib/gumroad"
import { fetchChannelVideos } from "lib/youtube"
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

export const revalidate = 3600 // Revalidate every hour

export default async function Web() {
  // Fetch actual Gumroad products
  const gumroadProducts = await fetchGumroadProducts()
  
  // Fetch latest videos
  let latestVideos = []
  try {
    if (env.YOUTUBE_CHANNEL_ID && env.YOUTUBE_API_KEY) {
      const videos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID, 6)
      latestVideos = videos
    }
  } catch (error) {
    console.error('Error fetching videos for homepage:', error)
  }
  
  return <HomePageClient gumroadProducts={gumroadProducts} latestVideos={latestVideos} />
}
