import { GumroadApiResponse, ProcessedGumroadProduct } from '@/types/gumroad';

const GUMROAD_API_URL = 'https://api.gumroad.com/v2';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let cachedProducts: ProcessedGumroadProduct[] | null = null;
let cacheTimestamp: number | null = null;

export function cleanProductTitle(title: string): string {
  // Remove everything after "|" and trim
  return title.split('|')[0].trim();
}

export async function fetchGumroadProducts(): Promise<ProcessedGumroadProduct[]> {
  // Check cache
  if (cachedProducts && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedProducts;
  }

  const accessToken = process.env.GUMROAD_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('GUMROAD_ACCESS_TOKEN not found in environment variables');
    return [];
  }

  try {
    const response = await fetch(`${GUMROAD_API_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Gumroad API error: ${response.status}`);
    }

    const data: GumroadApiResponse = await response.json();

    if (!data.success) {
      throw new Error('Gumroad API returned success: false');
    }

    // Process products
    const processedProducts: ProcessedGumroadProduct[] = data.products
      .filter(product => product.published)
      .map(product => ({
        id: product.id,
        title: product.name,
        cleanTitle: cleanProductTitle(product.name),
        price: product.price / 100, // Convert from pence to pounds
        formattedPrice: product.formatted_price,
        checkoutUrl: product.short_url,
        description: product.description.replace(/<[^>]*>/g, ''), // Strip HTML
        thumbnailUrl: product.thumbnail_url,
        salesCount: product.sales_count,
        fileInfo: product.file_info ? {
          size: product.file_info.Size,
          pages: product.file_info.Length,
        } : undefined,
      }));

    // Update cache
    cachedProducts = processedProducts;
    cacheTimestamp = Date.now();

    return processedProducts;
  } catch (error) {
    console.error('Error fetching Gumroad products:', error);
    return cachedProducts || []; // Return cached data if available
  }
}

export function matchVideoToGumroadProduct(
  videoTitle: string,
  gumroadProducts: ProcessedGumroadProduct[]
): ProcessedGumroadProduct | null {
  const cleanVideoTitle = cleanProductTitle(videoTitle).toLowerCase();
  
  return gumroadProducts.find(product => {
    const productCleanTitle = product.cleanTitle.toLowerCase();
    const productFullTitle = product.title.toLowerCase();
    
    // Try exact match with clean title
    if (productCleanTitle === cleanVideoTitle) {
      return true;
    }
    
    // Try match with full title
    if (productFullTitle.includes(cleanVideoTitle)) {
      return true;
    }
    
    // Try partial match (at least 80% of words match)
    const videoWords = cleanVideoTitle.split(/\s+/);
    const productWords = productCleanTitle.split(/\s+/);
    const matchingWords = videoWords.filter(word => 
      productWords.some(pWord => pWord.includes(word) || word.includes(pWord))
    );
    
    return matchingWords.length >= videoWords.length * 0.8;
  }) || null;
}