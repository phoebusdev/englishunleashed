import { inferVideoCategory, videoMappings } from 'data/video-mappings'
import { env } from 'env.mjs'
import { fetchGumroadProducts, matchVideoToGumroadProduct } from 'lib/gumroad'
import { fetchChannelVideos, type YouTubeVideo } from 'lib/youtube'
import VideoPageClient from './VideoPageClient'

export const revalidate = 3600 // Revalidate every hour

export default async function VideosPage() {
  // Fetch real videos from YouTube
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
    console.error('Error fetching YouTube videos:', error)
    hasError = true
  }
  
  // Fetch Gumroad products
  const gumroadProducts = await fetchGumroadProducts()
  
  // Transform YouTube videos with our mappings
  const enhancedVideos = youtubeVideos.map(video => {
    const mapping = videoMappings[video.id]
    const category = mapping?.category || inferVideoCategory(video.title)
    const gumroadProduct = matchVideoToGumroadProduct(video.title, gumroadProducts)
    
    return {
      id: video.id,
      title: mapping?.customTitle || video.title,
      description: video.description,
      youtubeId: video.id,
      category,
      relatedProducts: mapping?.relatedProducts || [],
      publishedDate: video.publishedAt,
      thumbnail: video.thumbnail,
      duration: video.duration,
      viewCount: video.viewCount,
      featured: mapping?.featured || false,
      episodeNumber: mapping?.episodeNumber,
      gumroadProduct: gumroadProduct ? {
        price: gumroadProduct.price,
        formattedPrice: gumroadProduct.formattedPrice,
        checkoutUrl: gumroadProduct.checkoutUrl
      } : null
    }
  })
  
  // Pass to client component
  return <VideoPageClient videos={enhancedVideos} hasError={hasError} />
}