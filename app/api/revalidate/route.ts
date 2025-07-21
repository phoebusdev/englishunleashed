import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from 'env.mjs';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!env.REVALIDATE_API_KEY) {
      return NextResponse.json(
        { error: 'Revalidation endpoint not configured' },
        { status: 503 }
      );
    }

    // Simple API key authentication
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey !== env.REVALIDATE_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Revalidate all product pages
    await revalidatePath('/', 'layout');
    await revalidatePath('/shop');
    await revalidatePath('/videos');

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString()
    });
    
  } catch {
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}