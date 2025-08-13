/**
 * Modern Stripe Checkout Session API
 * Following Stripe best practices and industry standards
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

// Request validation schema
const checkoutSchema = z.object({
  productId: z.string().min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  promoCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    return NextResponse.json(
      { error: 'Payment system is not configured' },
      { status: 503 }
    )
  }

  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = checkoutSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.flatten() 
        },
        { status: 400 }
      )
    }
    
    const { productId, successUrl, cancelUrl, promoCode } = validation.data
    
    // Get authenticated user (optional)
    const session = await getServerSession(authOptions)
    
    // Fetch product from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        packs: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    if (!product.active) {
      return NextResponse.json(
        { error: 'Product is not available for purchase' },
        { status: 400 }
      )
    }
    
    // Get base URL for redirects
    const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Create idempotency key (optional but recommended)
    const idempotencyKey = request.headers.get('Idempotency-Key') || undefined
    
    // Calculate price (with promo code if applicable)
    let finalPrice = product.price
    let discountAmount = 0
    
    if (promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: {
          code: promoCode,
          active: true,
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } }
          ],
          products: {
            some: {
              productId: product.id
            }
          }
        }
      })
      
      if (promo) {
        // Update usage count
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } }
        })
        
        if (promo.discountType === 'PERCENTAGE') {
          discountAmount = Math.round(product.price * (promo.discountValue / 100))
        } else {
          discountAmount = promo.discountValue
        }
        
        finalPrice = Math.max(100, product.price - discountAmount) // Min £1
      }
    }
    
    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.title,
            description: product.description || undefined,
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl || `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/checkout/product/${productId}`,
      customer_email: session?.user?.email || undefined,
      metadata: {
        productId: product.id,
        userId: session?.user?.id || 'guest',
        originalPrice: product.price.toString(),
        discountAmount: discountAmount.toString(),
        promoCode: promoCode || '',
        packIds: product.packs.map(p => p.id).join(','),
      },
      allow_promotion_codes: false,
      billing_address_collection: 'auto',
      locale: 'auto',
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    })
    
    // Log for monitoring
    console.log('Checkout session created:', {
      sessionId: checkoutSession.id,
      productId: product.id,
      amount: finalPrice,
      customer: session?.user?.email || 'guest',
    })
    
    // Return session details
    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      expires: checkoutSession.expires_at,
      amount: finalPrice,
      currency: 'gbp',
    }, {
      headers: {
        // Cache control
        'Cache-Control': 'no-store, max-age=0',
        // CORS if needed
        'Access-Control-Allow-Origin': baseUrl,
      }
    })
    
  } catch (error) {
    console.error('Checkout session creation failed:', error)
    
    // Stripe-specific error handling
    if (error instanceof Error) {
      // Check for Stripe errors
      if ('type' in error) {
        const stripeError = error as any
        
        switch (stripeError.type) {
          case 'StripeCardError':
            return NextResponse.json(
              { error: 'Card was declined', code: stripeError.code },
              { status: 400 }
            )
          case 'StripeRateLimitError':
            return NextResponse.json(
              { error: 'Too many requests', code: 'rate_limit' },
              { status: 429 }
            )
          case 'StripeInvalidRequestError':
            return NextResponse.json(
              { error: 'Invalid request', code: stripeError.code },
              { status: 400 }
            )
          case 'StripeAPIError':
            return NextResponse.json(
              { error: 'Payment service error', code: 'api_error' },
              { status: 502 }
            )
          case 'StripeConnectionError':
            return NextResponse.json(
              { error: 'Network error', code: 'connection_error' },
              { status: 503 }
            )
          case 'StripeAuthenticationError':
            return NextResponse.json(
              { error: 'Configuration error', code: 'auth_error' },
              { status: 500 }
            )
          default:
            return NextResponse.json(
              { error: 'Payment processing failed', code: 'unknown' },
              { status: 500 }
            )
        }
      }
      
      // Generic error
      return NextResponse.json(
        { 
          error: 'Failed to create checkout session',
          message: error.message 
        },
        { status: 500 }
      )
    }
    
    // Unknown error
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key',
      'Access-Control-Max-Age': '86400',
    },
  })
}