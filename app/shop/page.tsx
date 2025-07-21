import { type Metadata } from 'next'
import { fetchGumroadProducts } from 'lib/gumroad'
import ShopPageClient from './ShopPageClient'

export const metadata: Metadata = {
  title: 'Shop English Learning PDFs',
  description: 'Download premium English learning PDFs including podcast transcripts, vocabulary guides, shadowing exercises, and conversation practice materials.',
  openGraph: {
    title: 'Shop English Learning PDFs | English Unleashed',
    description: 'Premium English learning materials to complement our YouTube lessons. Instant PDF downloads for vocabulary, pronunciation, and conversation practice.',
  },
}

export const revalidate = 300 // Revalidate every 5 minutes

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
  let hasError = false
  
  // Fetch Gumroad products directly
  const gumroadProducts = await fetchGumroadProducts()
  
  if (gumroadProducts.length === 0) {
    console.error('No Gumroad products found')
    hasError = true
  }
  
  // Transform Gumroad products into the format expected by ShopPageClient
  const videoPDFs = gumroadProducts.map(product => ({
    id: product.id,
    title: product.title,
    category: categorizeVideo(product.title),
    price: product.price,
    formattedPrice: product.formattedPrice,
    checkoutUrl: product.checkoutUrl,
    description: product.description,
    fileInfo: product.fileInfo,
    gumroadId: product.id
  }))
  
  return <ShopPageClient videoPDFs={videoPDFs} hasError={hasError} />
}