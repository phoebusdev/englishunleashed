import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  
  if (!stripeKey) {
    return NextResponse.json({
      error: 'No Stripe key found',
      hasKey: false
    })
  }

  try {
    // Try to initialize Stripe with different configurations
    console.log('Testing Stripe with key:', stripeKey.substring(0, 20) + '...')
    
    // Test 1: Basic initialization
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    })
    
    // Test 2: Try to list products (simple API call)
    console.log('Attempting to list products...')
    const products = await stripe.products.list({ limit: 1 })
    
    return NextResponse.json({
      success: true,
      message: 'Stripe connection successful',
      productsFound: products.data.length,
      stripeVersion: stripe.VERSION,
      apiVersion: '2024-11-20.acacia',
    })
    
  } catch (error: any) {
    console.error('Stripe test error:', error)
    
    return NextResponse.json({
      error: 'Stripe connection failed',
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      rawMessage: error.raw?.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}