import { inferVideoCategory, videoMappings } from 'data/video-mappings'
import { env } from 'env.mjs'
import { fetchChannelVideos, type YouTubeVideo } from 'lib/youtube'
import VideoPageClient from './VideoPageClient'

export const revalidate = 3600 // Revalidate every hour

export default async function VideosPage() {
  // Fetch real videos from YouTube
  let youtubeVideos: YouTubeVideo[] = []
  let hasError = false
  
  console.log('YouTube Channel ID:', env.YOUTUBE_CHANNEL_ID)
  console.log('YouTube API Key exists:', !!env.YOUTUBE_API_KEY)
  
  try {
    if (env.YOUTUBE_CHANNEL_ID) {
      youtubeVideos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID, 50)
      console.log('Fetched videos count:', youtubeVideos.length)
    } else {
      console.log('No YouTube Channel ID configured')
    }
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    hasError = true
  }
  
  // Transform YouTube videos with our mappings
  const enhancedVideos = youtubeVideos.map(video => {
    const mapping = videoMappings[video.id]
    const category = mapping?.category || inferVideoCategory(video.title)
    
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
      episodeNumber: mapping?.episodeNumber
    }
  })
  
  // Pass to client component
  return <VideoPageClient videos={enhancedVideos} hasError={hasError} />
}