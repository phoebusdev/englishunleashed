import { type Metadata } from 'next'
import { fetchGumroadProducts, matchVideoToGumroadProduct } from 'lib/gumroad'
import { fetchChannelVideos, type YouTubeVideo } from 'lib/youtube'
import { inferVideoCategory, videoMappings } from 'data/video-mappings'
import { env } from 'env.mjs'
import VideoPageClient from './VideoPageClient'

export const metadata: Metadata = {
  title: 'English Learning Videos',
  description: 'Watch free English lessons, podcast episodes, and conversation practice videos. Learn vocabulary, pronunciation, and daily English expressions.',
  openGraph: {
    title: 'English Learning Videos | English Unleashed',
    description: 'Free English video lessons covering vocabulary, pronunciation, shadowing exercises, and real conversation practice.',
  },
}

export const revalidate = 300 // Revalidate every 5 minutes

export default async function VideosPage() {
  // Fetch real videos from YouTube
  let youtubeVideos: YouTubeVideo[] = []
  let hasError = false
  
  try {
    if (env.YOUTUBE_CHANNEL_ID && env.YOUTUBE_API_KEY) {
      youtubeVideos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID, 50)
      
      // If no videos returned (possibly due to quota), try the cached API
      if (youtubeVideos.length === 0) {
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
            youtubeVideos = data.videos || []
            if (data.cached) {
              console.log(`Using cached videos (${data.cacheAge} minutes old)`)
            }
          }
        } catch (cacheError) {
          console.error('Error fetching from cache API:', cacheError)
        }
      }
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
  
  // If we have Gumroad products but no matching, use the first product as a fallback
  const fallbackProduct = gumroadProducts.length > 0 ? gumroadProducts[0] : null
  
  // Transform YouTube videos with our mappings
  const enhancedVideos = youtubeVideos.map(video => {
    const mapping = videoMappings[video.id]
    const category = mapping?.category || inferVideoCategory(video.title)
    let gumroadProduct = matchVideoToGumroadProduct(video.title, gumroadProducts)
    
    // If no match found and we have products, use a product based on category
    if (!gumroadProduct && gumroadProducts.length > 0 && fallbackProduct) {
      // Try to find a product that matches the video category
      const categoryProduct = gumroadProducts.find(p => 
        p.title.toLowerCase().includes(category)
      )
      gumroadProduct = categoryProduct || fallbackProduct
    }
    
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