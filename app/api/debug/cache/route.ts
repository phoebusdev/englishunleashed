import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Only enable in development or with debug flag
const isDebugEnabled = process.env.NODE_ENV === 'development' || 
                      process.env.ENABLE_DEBUG_ENDPOINTS === 'true';

export async function GET() {
  if (!isDebugEnabled) {
    return NextResponse.json(
      { error: 'Debug endpoint not available' },
      { status: 404 }
    );
  }

  // Return cache status info
  return NextResponse.json({
    cacheSettings: {
      gumroadCacheDuration: '5 minutes',
      pageRevalidation: '5 minutes',
      youtubeCacheDuration: '1 hour',
    },
    endpoints: {
      manualRevalidation: '/api/revalidate',
      webhook: '/api/webhook/revalidate',
    },
    testCommands: {
      local: 'npm run test:cache',
      manual: 'npm run test:cache:manual',
    }
  });
}

export async function POST(request: NextRequest) {
  if (!isDebugEnabled) {
    return NextResponse.json(
      { error: 'Debug endpoint not available' },
      { status: 404 }
    );
  }

  const { action } = await request.json();

  switch (action) {
    case 'clear-all':
      // Force revalidation of all pages
      await revalidatePath('/', 'layout');
      await revalidatePath('/shop');
      await revalidatePath('/videos');
      
      return NextResponse.json({
        success: true,
        message: 'All caches cleared',
        timestamp: new Date().toISOString()
      });

    case 'test-products':
      // Simulate product update
      await revalidatePath('/shop');
      await revalidatePath('/');
      
      return NextResponse.json({
        success: true,
        message: 'Product pages revalidated',
        timestamp: new Date().toISOString()
      });

    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }
}