export interface Video {
  id: string
  title: string
  youtubeId: string
  category: 'episode' | 'lesson' | 'tutorial'
  relatedProducts?: string[] // Product IDs
  description?: string
  publishedDate: string
}

export const videos: Video[] = [
  {
    id: 'ep-45',
    title: 'Episode #45: Daily Routines Vocabulary',
    youtubeId: 'abc123xyz', // Replace with actual YouTube ID
    category: 'episode',
    relatedProducts: ['daily-routines-vocabulary'],
    description: 'Learn essential vocabulary for talking about your daily routines. Perfect for beginners who want to describe their day in English.',
    publishedDate: '2024-01-15'
  },
  {
    id: 'ep-44',
    title: 'Episode #44: Small Talk Essentials',
    youtubeId: 'def456uvw', // Replace with actual YouTube ID
    category: 'episode',
    relatedProducts: ['small-talk-mastery'],
    description: 'Master the art of small talk with these essential phrases and conversation starters.',
    publishedDate: '2024-01-08'
  },
  {
    id: 'ep-43',
    title: 'Episode #43: British Pronunciation Basics',
    youtubeId: 'ghi789rst', // Replace with actual YouTube ID
    category: 'episode',
    relatedProducts: ['british-pronunciation-bundle'],
    description: 'Introduction to British pronunciation with focus on common sounds and patterns.',
    publishedDate: '2024-01-01'
  },
  {
    id: 'lesson-shadowing-intro',
    title: 'How to Use the Shadowing Method',
    youtubeId: 'jkl012mno', // Replace with actual YouTube ID
    category: 'lesson',
    description: 'Learn our proven shadowing technique for improving your English pronunciation and fluency.',
    publishedDate: '2023-12-25'
  },
  {
    id: 'tutorial-pdf-guide',
    title: 'How to Use Our PDF Materials',
    youtubeId: 'pqr345stu', // Replace with actual YouTube ID
    category: 'tutorial',
    description: 'A complete guide on how to get the most out of our PDF learning materials.',
    publishedDate: '2023-12-18'
  }
]

export const getVideosByCategory = (category: string) => 
  category === 'all' ? videos : videos.filter(v => v.category === category)

export const getVideoById = (id: string) => 
  videos.find(v => v.id === id)

export const getVideosForProduct = (productId: string) =>
  videos.filter(v => v.relatedProducts?.includes(productId))