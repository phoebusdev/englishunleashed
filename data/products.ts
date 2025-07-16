export interface Product {
  id: string
  title: string
  price: string
  category: 'vocabulary' | 'conversation' | 'pronunciation' | 'business'
  type: 'PDF' | 'Video' | 'Bundle'
  description: string
  features: string[]
  featured?: boolean
  relatedEpisode?: string
}

export const products: Product[] = [
  {
    id: 'daily-routines-vocabulary',
    title: 'Daily Routines Vocabulary PDF',
    price: '£9.99',
    category: 'vocabulary',
    type: 'PDF',
    description: 'Master natural daily routine expressions with our proven shadowing method. FEATURED IN ENGLISH UNLEASHED EPISODE #45 - Learn the same words and phrases you heard in the podcast, then practice them through guided shadowing exercises. Developed by experienced teachers for real-life conversations.',
    features: [
      'Shadowing exercises for 50+ daily routine expressions',
      'Slow, clear audio recordings for practice',
      'Step-by-step pronunciation guidance',
      'Real conversations you\'ll actually have',
      'Direct connection to English Unleashed Episode #45',
      'Print-friendly format for offline practice'
    ],
    featured: true,
    relatedEpisode: 'Episode #45'
  },
  {
    id: 'small-talk-mastery',
    title: 'Small Talk Mastery Video Course',
    price: '£24.99',
    category: 'conversation',
    type: 'Video',
    description: 'Build confidence in any conversation with our comprehensive shadowing-based video course. BASED ON ENGLISH UNLEASHED TEACHING METHODS - Practice real conversations through guided repetition and natural pronunciation exercises. Learn to speak naturally, just like native speakers.',
    features: [
      'Shadowing practice with slow, clear English',
      '100+ real conversation starters and responses',
      'Cultural context for natural interactions',
      'Confidence-building speaking exercises',
      'Professional and casual conversation skills',
      'Comprehensive PDF practice guide',
      'Native British pronunciation techniques'
    ],
    featured: true,
    relatedEpisode: 'Episode #44'
  },
  {
    id: 'british-pronunciation-bundle',
    title: 'British Pronunciation Complete Bundle',
    price: '£39.99',
    category: 'pronunciation',
    type: 'Bundle',
    description: 'Master British pronunciation through systematic shadowing practice and proven teaching methods. COMPREHENSIVE ENGLISH UNLEASHED PRONUNCIATION MASTERCLASS - Learn the techniques used by thousands of successful English learners. Speak clearly and naturally with confidence.',
    features: [
      'Systematic shadowing exercises for all sounds',
      '90-minute video course with proven teaching methods',
      'Slow, clear audio for perfect pronunciation practice',
      'Visual guides for correct mouth positioning',
      'Common mistakes correction with examples',
      'Progress tracking through guided practice',
      'English Unleashed signature pronunciation techniques'
    ],
    featured: true,
    relatedEpisode: 'Episode #43'
  },
  {
    id: 'business-english-phrases',
    title: 'Business English Phrases',
    price: '£14.99',
    category: 'business',
    type: 'PDF',
    description: 'Master professional English through practical shadowing exercises and real workplace scenarios. BASED ON ENGLISH UNLEASHED BUSINESS TEACHING - Learn formal and informal language for workplace success using our proven slow, clear, natural teaching approach.',
    features: [
      'Shadowing practice for 75+ business expressions',
      'Professional email templates with pronunciation guides',
      'Meeting language with confidence-building exercises',
      'Presentation skills through natural speaking practice',
      'Professional networking conversation techniques',
      'Clear audio recordings for workplace English mastery'
    ],
    relatedEpisode: 'Episodes #42, #41'
  }
]

export const getFeaturedProducts = () => products.filter(p => p.featured)
export const getProductsByCategory = (category: string) => 
  category === 'all' ? products : products.filter(p => p.category === category)