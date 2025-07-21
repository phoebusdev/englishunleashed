import crypto from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

// Webhook secret for security (store in environment variable)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook authenticity
    const signature = request.headers.get('x-webhook-signature');
    const body = await request.text();
    
    // Verify signature (example for HMAC SHA256)
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 2. Parse webhook payload
    const payload = JSON.parse(body) as { event?: string };
    
    // 3. Handle different webhook events
    switch (payload.event) {
      case 'video.uploaded':
      case 'product.created':
      case 'product.updated':
        // Revalidate all pages that show products
        await revalidatePath('/', 'layout');
        await revalidatePath('/shop');
        await revalidatePath('/videos');
        
        // Optional: Clear specific cache tags
        await revalidateTag('gumroad-products');
        await revalidateTag('youtube-videos');
        
        console.log(`Cache revalidated for event: ${payload.event}`);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${payload.event}`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Cache revalidated successfully'
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    endpoint: '/api/webhook/revalidate',
    method: 'POST'
  });
}