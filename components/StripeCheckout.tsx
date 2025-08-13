'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

// Use process.env directly for client-side environment variables
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RsTYMIXJgbHswroLtjlQu5DnDjV1J3iKzH6losuMq6gtjdGN84PUCERdhbpwpuBtxO1dL0bjZLGBNJpMWPL4c2x00b7gMUo7S'

interface StripeCheckoutProps {
  packId: string
  packTitle: string
  packDescription?: string
  packPrice: number
  productId?: string
}

export function StripeCheckout({ packId, packTitle, packDescription, packPrice, productId }: StripeCheckoutProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Initialize Stripe
      const stripe = await loadStripe(stripeKey)
      
      if (!stripe) {
        throw new Error('Failed to load Stripe')
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: productId ? undefined : packId,
          productId: productId || undefined,
          mode: 'checkout_session'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      console.log('Checkout session created:', data)

      // Redirect to Stripe Checkout using Stripe.js
      if (data.sessionId) {
        console.log('Redirecting with Stripe.js to session:', data.sessionId)
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        })

        if (stripeError) {
          throw new Error(stripeError.message)
        }
      } else if (data.url) {
        // Fallback to direct redirect
        console.log('Direct redirect to:', data.url)
        window.location.href = data.url
      } else {
        throw new Error('No session ID or URL received')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-lg mb-2">{packTitle}</h3>
        {packDescription && (
          <p className="text-gray-600 text-sm mb-3">{packDescription}</p>
        )}
        <p className="text-2xl font-bold text-[#20b2aa]">
          £{(packPrice / 100).toFixed(2)}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#20b2aa]"
            placeholder="your@email.com"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            We'll send your purchase confirmation and download links here
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading || !email}
          className="w-full bg-[#20b2aa] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#0f8080] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Redirecting to payment...' : 'Continue to Payment'}
        </button>

        <div className="flex items-center justify-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure payment powered by Stripe
        </div>
      </div>
    </div>
  )
}