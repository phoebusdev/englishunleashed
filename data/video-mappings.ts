// Map YouTube video IDs to product relationships and categories
// This allows you to enhance YouTube data with your custom metadata

export interface VideoMapping {
  episodeNumber?: number
  category: 'episode' | 'lesson' | 'tutorial'
  relatedProducts?: string[] // Product IDs from products.ts
  customTitle?: string // Override YouTube title if needed
  featured?: boolean
}

// Map video IDs to their metadata
// You'll need to update these with actual YouTube video IDs
export const videoMappings: Record<string, VideoMapping> = {
  // Example mappings - replace with actual video IDs
  '_nULHgc4-rA': {
    category: 'lesson',
    customTitle: 'How to Start Learning English for Beginners',
    featured: true
  },
  'AQnI-Ile3VY': {
    category: 'lesson',
    customTitle: 'Shadowing Practice with Video Clips'
  },
  'aSsi-kNzDXk': {
    category: 'lesson',
    customTitle: 'How to NEVER Forget English Words',
    featured: true
  },
  // Add episode mappings here as you identify them
  // 'actualVideoId': {
  //   episodeNumber: 45,
  //   category: 'episode',
  //   relatedProducts: ['daily-routines-vocabulary']
  // }
}

// Helper function to determine category from title if not mapped
export function inferVideoCategory(title: string): VideoMapping['category'] {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes('episode') || lowerTitle.includes('ep.')) {
    return 'episode'
  } else if (lowerTitle.includes('how to') || lowerTitle.includes('tutorial')) {
    return 'tutorial'
  } else {
    return 'lesson'
  }
}

// Helper to extract episode number from title
export function extractEpisodeNumber(title: string): number | null {
  const match = title.match(/(?:episode|ep\.?)\s*#?(\d+)/i)
  return match && match[1] ? parseInt(match[1]) : null
}