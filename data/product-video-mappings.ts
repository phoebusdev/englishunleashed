// Map Gumroad product titles/IDs to specific YouTube video IDs
// This allows each PDF's "Watch Video" button to link to its related YouTube video

export const productVideoMappings: Record<string, string> = {
  // Map product titles (or partial matches) to YouTube video IDs
  // Format: 'Product Title Pattern': 'YouTube Video ID'
  
  // Based on video-mappings.ts, we have these known video IDs:
  'how to start learning': '_nULHgc4-rA',
  'beginner': '_nULHgc4-rA',
  'shadowing practice': 'AQnI-Ile3VY',
  'video clips': 'AQnI-Ile3VY',
  'never forget': 'aSsi-kNzDXk',
  'forget english words': 'aSsi-kNzDXk',
  
  // Map products to their most relevant videos (you'll need to update these with actual video IDs)
  // Daily Routines
  'daily routine': '_nULHgc4-rA', // Placeholder - update with actual daily routine video
  'daily routines vocabulary': '_nULHgc4-rA',
  
  // Small Talk
  'small talk': 'AQnI-Ile3VY', // Placeholder - update with actual small talk video
  'small talk mastery': 'AQnI-Ile3VY',
  
  // Pronunciation
  'british pronunciation': 'aSsi-kNzDXk', // Placeholder - update with actual pronunciation video
  'pronunciation complete': 'aSsi-kNzDXk',
  
  // Business English
  'business english': '_nULHgc4-rA', // Placeholder - update with actual business video
  'business english phrases': '_nULHgc4-rA',
  
  // Episode-based products (you'll need to add actual episode video IDs)
  'episode 45': '_nULHgc4-rA', // Replace with Episode 45 video ID
  'episode 44': 'AQnI-Ile3VY', // Replace with Episode 44 video ID
  'episode 43': 'aSsi-kNzDXk', // Replace with Episode 43 video ID
  'episode 42': '_nULHgc4-rA', // Replace with Episode 42 video ID
  'episode 41': 'AQnI-Ile3VY', // Replace with Episode 41 video ID
  
  // Add more mappings as you identify the actual video IDs
}

// Helper function to find the best matching video for a product
export function getVideoIdForProduct(productTitle: string): string | null {
  const lowerTitle = productTitle.toLowerCase()
  
  // First try exact match
  if (productVideoMappings[lowerTitle]) {
    return productVideoMappings[lowerTitle]
  }
  
  // Then try partial match
  for (const [pattern, videoId] of Object.entries(productVideoMappings)) {
    if (lowerTitle.includes(pattern)) {
      return videoId
    }
  }
  
  return null
}

// Helper to build YouTube video URL
export function getYouTubeVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

// Helper to build YouTube channel URL (fallback)
export function getYouTubeChannelUrl(): string {
  return 'https://www.youtube.com/@EnglishPodcastUnleashed'
}