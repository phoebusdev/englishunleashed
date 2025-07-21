import { fetchGumroadProducts, matchVideoToGumroadProduct } from '../lib/gumroad';
import { fetchChannelVideos } from '../lib/youtube';
import { env } from '../env.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testGumroadMatching() {
  console.log('Testing Gumroad product fetching and matching...\n');
  
  try {
    // Fetch Gumroad products
    console.log('1. Fetching Gumroad products...');
    const gumroadProducts = await fetchGumroadProducts();
    console.log(`Found ${gumroadProducts.length} Gumroad products:`);
    gumroadProducts.forEach(product => {
      console.log(`  - "${product.title}" (${product.formattedPrice})`);
    });
    
    console.log('\n2. Fetching YouTube videos...');
    const videos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID!, 10);
    console.log(`Found ${videos.length} YouTube videos`);
    
    console.log('\n3. Testing video-to-product matching:');
    videos.forEach(video => {
      const match = matchVideoToGumroadProduct(video.title, gumroadProducts);
      console.log(`\nVideo: "${video.title}"`);
      if (match) {
        console.log(`  ✓ Matched to: "${match.title}" (${match.formattedPrice})`);
      } else {
        console.log(`  ✗ No match found`);
      }
    });
    
    console.log('\n4. Summary:');
    const matchedCount = videos.filter(v => 
      matchVideoToGumroadProduct(v.title, gumroadProducts) !== null
    ).length;
    console.log(`Matched ${matchedCount} out of ${videos.length} videos`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testGumroadMatching();