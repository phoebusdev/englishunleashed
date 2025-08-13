'use client'

/**
 * Modern Stripe Checkout Component
 * Following industry best practices
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/stripe-client'

interface ModernCheckoutProps {
  productId: string
  productTitle: string
  productDescription?: string
  priceInCents: number
  userEmail?: string
}

export function ModernCheckout({
  productId,
  productTitle,
  productDescription,
  priceInCents,
  userEmail,
}: ModernCheckoutProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Generate idempotency key
      const idempotencyKey = `checkout_${productId}_${Date.now()}`
      
      // Create checkout session
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          productId,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      
      // Redirect to Stripe Checkout
      if (data.url) {
        // Modern approach - direct redirect
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
      
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
      setLoading(false)
    }
  }
  
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Product Summary */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {productTitle}
          </h2>
          {productDescription && (
            <p className="text-gray-600 text-sm">
              {productDescription}
            </p>
          )}
        </div>
        
        {/* Price Section */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Total</span>
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(priceInCents)}
            </span>
          </div>
          
          {/* User Info */}
          {userEmail && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                Purchasing as: <span className="font-medium">{userEmail}</span>
              </p>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Proceed to Payment'
            )}
          </button>
          
          {/* Security Badge */}
          <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure payment powered by Stripe
          </div>
          
          {/* Terms */}
          <p className="mt-4 text-xs text-center text-gray-400">
            By proceeding, you agree to our{' '}
            <a href="/terms" className="underline hover:text-gray-600">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-gray-600">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}