import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Simple API key authentication
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey !== process.env.REVALIDATE_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Revalidate all product pages
    await revalidatePath('/', 'layout');
    await revalidatePath('/shop');
    await revalidatePath('/videos');
    
    // Clear Gumroad cache if needed
    if (global.gumroadCache) {
      global.gumroadCache = undefined;
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}