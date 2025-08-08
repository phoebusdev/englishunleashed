import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { env } from 'env.mjs'
import { stripe } from 'lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      packId: string
      promoCode?: string
      mode?: 'payment_intent' | 'checkout_session'
    }
    const { packId, promoCode, mode = 'checkout_session' } = body
    
    // Get the authenticated user session
    const authSession = await getServerSession(authOptions)

    // Fetch pack details
    const pack = await prisma.pack.findUnique({
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
              productId: pack.productId
            }
          }
        }
      })

      if (promo) {
        if (promo.discountType === 'PERCENTAGE') {
          discountAmount = Math.round(pack.product.price * (promo.discountValue / 100))
        } else if (promo.discountType === 'FIXED_AMOUNT') {
          discountAmount = promo.discountValue
        }
      }
    }

    const finalPrice = Math.max(100, pack.product.price - discountAmount) // Minimum £1

    // Create payment intent for embedded checkout
    if (mode === 'payment_intent') {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: finalPrice,
          currency: 'gbp',
          metadata: {
            packId: pack.id,
            promoCode: promoCode || '',
            originalPrice: pack.product.price.toString(),
            discountAmount: discountAmount.toString(),
            userId: authSession?.user?.id || '',
            productTitle: pack.title,
          },
          payment_method_types: ['card'],
        })

        console.log('Created payment intent:', paymentIntent.id, 'for amount:', finalPrice)

        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          amount: finalPrice,
          packTitle: pack.title,
          packDescription: pack.description,
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
    const origin = request.headers.get('origin') || env.NEXTAUTH_URL
    console.log('Creating checkout session with origin:', origin)

    // Create Stripe checkout session (fallback)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: pack.title,
              description: pack.description || undefined,
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
        promoCode: promoCode || '',
        originalPrice: pack.product.price.toString(),
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
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}