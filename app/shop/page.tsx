import { env } from 'env.mjs'
import { fetchChannelVideos, type YouTubeVideo } from 'lib/youtube'
import ShopPageClient from './ShopPageClient'

export const revalidate = 3600 // Revalidate every hour

// Function to categorize videos based on their title
function categorizeVideo(title: string): 'vocabulary' | 'conversation' | 'pronunciation' | 'business' | 'general' {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes('vocabulary') || lowerTitle.includes('words') || lowerTitle.includes('daily routine')) {
    return 'vocabulary'
  } else if (lowerTitle.includes('conversation') || lowerTitle.includes('small talk') || lowerTitle.includes('speak')) {
    return 'conversation'
  } else if (lowerTitle.includes('pronunciation') || lowerTitle.includes('accent') || lowerTitle.includes('sound')) {
    return 'pronunciation'
  } else if (lowerTitle.includes('business') || lowerTitle.includes('professional') || lowerTitle.includes('work')) {
    return 'business'
  }
  
  return 'general'
}

export default async function ShopPage() {
  let youtubeVideos: YouTubeVideo[] = []
  let hasError = false
  
  try {
    if (env.YOUTUBE_CHANNEL_ID && env.YOUTUBE_API_KEY) {
      youtubeVideos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID, 50)
    } else {
      console.error('YouTube environment variables are not configured')
      hasError = true
    }
  } catch (error) {
    console.error('Error fetching YouTube videos for shop:', error)
    hasError = true
  }
  
  // Transform videos into PDF products
  const videoPDFs = youtubeVideos.map(video => ({
    id: video.id,
    title: video.title.replace(/ \| .*$/, ''), // Remove everything after first |
    category: categorizeVideo(video.title)
  }))
  
  return <ShopPageClient videoPDFs={videoPDFs} hasError={hasError} />
}