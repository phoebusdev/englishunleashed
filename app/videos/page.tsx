import { type Metadata } from 'next'
import { fetchGumroadProducts, matchVideoToGumroadProduct } from 'lib/gumroad'
import { fetchChannelVideos, type YouTubeVideo } from 'lib/youtube'
import { inferVideoCategory, videoMappings } from 'data/video-mappings'
import VideoPageClient from './VideoPageClient'
import { env } from 'env.mjs'

// Simple in-memory cache for videos to handle quota issues
let videoCache: {
  data: YouTubeVideo[]
  timestamp: number
} | null = null

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export const metadata: Metadata = {
  title: 'English Learning Videos',
  description: 'Watch free English lessons, podcast episodes, and conversation practice videos. Learn vocabulary, pronunciation, and daily English expressions.',
  openGraph: {
    title: 'English Learning Videos | English Unleashed',
    description: 'Free English video lessons covering vocabulary, pronunciation, shadowing exercises, and real conversation practice.',
  },
}

// This page uses dynamic rendering to fetch videos at request time
export const dynamic = 'force-dynamic'

export default async function VideosPage() {
  // Fetch real videos from YouTube directly (not through API route)
  let youtubeVideos: YouTubeVideo[] = []
  let hasError = false
  
  try {
    if (env.YOUTUBE_CHANNEL_ID) {
      // Check cache first
      if (videoCache && Date.now() - videoCache.timestamp < CACHE_DURATION) {
        console.log('Using cached videos from memory')
        youtubeVideos = videoCache.data
      } else {
        // Fetch fresh data
        const freshVideos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID, 50)
        if (freshVideos.length > 0) {
          // Update cache
          videoCache = {
            data: freshVideos,
            timestamp: Date.now()
          }
          youtubeVideos = freshVideos
        } else if (videoCache) {
          // If fetch failed but we have cache, use it
          console.log('Using stale cache due to fetch failure')
          youtubeVideos = videoCache.data
        }
      }
    } else {
      console.warn('YouTube channel ID not configured')
    }
  } catch (error) {
    console.error('Error fetching videos:', error)
    hasError = true
    // Use cache if available
    if (videoCache) {
      console.log('Using cached videos due to error')
      youtubeVideos = videoCache.data
      hasError = false // We have data, so don't show error
    }
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