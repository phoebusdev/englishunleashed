import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  // Disable in production for security
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints not available in production' },
      { status: 404 }
    )
  }

  console.log('=== Checkout Test Debug ===')
  console.log('Stripe object exists:', !!stripe)
  console.log('Stripe is null:', stripe === null)
  console.log('Type of stripe:', typeof stripe)
  
  if (!stripe) {
    return NextResponse.json({
      error: 'Stripe is null',
      stripeExists: false
    })
  }

  try {
    // Try to create a simple checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'Test Product',
          },
          unit_amount: 1000, // £10
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    })
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })
    
  } catch (error: any) {
    console.error('Checkout test error:', error)
    
    return NextResponse.json({
      error: 'Failed to create checkout session',
      message: error.message,
      type: error.type,
      code: error.code,
      rawError: error.raw,
      stack: error.stack?.split('\n').slice(0, 5)
    }, { status: 500 })
  }
}