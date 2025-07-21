import { fetchChannelVideos } from '../lib/youtube';
import { env } from '../env.mjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testYouTube() {
  console.log('Testing YouTube API...\n');
  
  console.log('Environment variables:');
  console.log('YOUTUBE_API_KEY:', env.YOUTUBE_API_KEY ? '✓ Set' : '✗ Not set');
  console.log('YOUTUBE_CHANNEL_ID:', env.YOUTUBE_CHANNEL_ID || 'Not set');
  console.log('YOUTUBE_CHANNEL_HANDLE:', env.YOUTUBE_CHANNEL_HANDLE || 'Not set');
  
  if (!env.YOUTUBE_CHANNEL_ID || !env.YOUTUBE_API_KEY) {
    console.error('\n❌ YouTube environment variables are not configured properly');
    return;
  }
  
  try {
    console.log('\nFetching videos from YouTube...');
    const videos = await fetchChannelVideos(env.YOUTUBE_CHANNEL_ID, 5);
    
    console.log(`\n✓ Found ${videos.length} videos`);
    
    videos.forEach((video, index) => {
      console.log(`\n${index + 1}. ${video.title}`);
      console.log(`   ID: ${video.id}`);
      console.log(`   Views: ${video.viewCount}`);
      console.log(`   Published: ${video.publishedAt}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error fetching videos:', error);
  }
}

testYouTube();