import { NextResponse } from 'next/server'

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  
  return NextResponse.json({
    hasStripeKey: !!stripeKey,
    keyLength: stripeKey?.length || 0,
    keyPrefix: stripeKey ? stripeKey.substring(0, 7) + '...' : 'not set',
    startsWithSk: stripeKey?.startsWith('sk_') || false,
    isTestKey: stripeKey?.includes('test') || false,
    nodeEnv: process.env.NODE_ENV,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    timestamp: new Date().toISOString()
  })
}