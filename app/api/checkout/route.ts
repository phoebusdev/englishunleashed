import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { env } from 'env.mjs'
import { stripe, isStripeConfigured } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!isStripeConfigured() || !stripe) {
    console.error('Stripe is not configured')
    return NextResponse.json(
      { error: 'Payment system is not configured. Please contact support.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json() as {
      packId?: string
      productId?: string
      promoCode?: string
      mode?: 'payment_intent' | 'checkout_session'
    }
    const { packId, productId, promoCode, mode = 'checkout_session' } = body
    
    // Get the authenticated user session
    const authSession = await getServerSession(authOptions)

    // Determine if we're checking out a pack or a product
    let pack: any
    let product: any
    
    if (productId) {
      // Product-based checkout
      product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          packs: {
            orderBy: { order: 'asc' }
          }
        }
      })
      
      if (!product || !product.active || product.packs.length === 0) {
        return NextResponse.json(
          { error: 'Product not found or inactive' },
          { status: 404 }
        )
      }
      
      // Use the first pack as primary for metadata
      pack = product.packs[0]
      pack.product = product
    } else if (packId) {
      // Pack-based checkout (legacy)
      pack = await prisma.pack.findUnique({
        where: { id: packId },
        include: {
          product: true,
        },
      })

      if (!pack || !pack.product.active) {
        return NextResponse.json(
          { error: 'Pack not found or inactive' },
          { status: 404 }
        )
      }
      
      product = pack.product
    } else {
      return NextResponse.json(
        { error: 'Either packId or productId is required' },
        { status: 400 }
      )
    }

    // Calculate discount if promo code is provided
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
        if (promo.discountType === 'PERCENTAGE') {
          discountAmount = Math.round(product.price * (promo.discountValue / 100))
        } else if (promo.discountType === 'FIXED_AMOUNT') {
          discountAmount = promo.discountValue
        }
      }
    }

    const finalPrice = Math.max(100, product.price - discountAmount) // Minimum £1

    // Create payment intent for embedded checkout
    if (mode === 'payment_intent') {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: finalPrice,
          currency: 'gbp',
          metadata: {
            packId: pack.id,
            productId: product.id,
            promoCode: promoCode || '',
            originalPrice: product.price.toString(),
            discountAmount: discountAmount.toString(),
            userId: authSession?.user?.id || '',
            productTitle: product.title,
          },
          payment_method_types: ['card'],
        })

        console.log('Created payment intent:', paymentIntent.id, 'for amount:', finalPrice)

        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          amount: finalPrice,
          packTitle: product.title,
          packDescription: product.description,
        })
      } catch (stripeError: any) {
        console.error('Stripe payment intent error:', stripeError)
        return NextResponse.json(
          { error: stripeError.message || 'Failed to create payment intent' },
          { status: 500 }
        )
      }
    }


    // Get the origin URL from request headers for proper redirect
    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    console.log('Creating checkout session with origin:', origin)

    // Create Stripe checkout session (fallback)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: product.title,
              description: product.description || undefined,
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/${packId}`,
      metadata: {
        packId: pack.id,
        productId: product.id,
        promoCode: promoCode || '',
        originalPrice: product.price.toString(),
        discountAmount: discountAmount.toString(),
        userId: authSession?.user?.id || '',
      },
      // Pre-fill email if user is authenticated
      customer_email: authSession?.user?.email || undefined,
      // Simplified configuration
      allow_promotion_codes: false,
      submit_type: 'pay',
    })

    console.log('Checkout session created:', session.id)
    console.log('Checkout URL:', session.url)

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error: any) {
    console.error('Checkout session error:', error)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    })
    
    // Return more specific error message
    const errorMessage = error.message || 'Failed to create checkout session'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error.statusCode || 500 }
    )
  }
}