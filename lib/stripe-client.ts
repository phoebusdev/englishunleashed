/**
 * Client-side Stripe configuration
 * This file should only be imported in client components
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

// Validate publishable key
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

if (!publishableKey) {
  console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
}

// Singleton pattern for Stripe instance
let stripePromise: Promise<Stripe | null> | null = null

/**
 * Get or create Stripe instance
 * Uses singleton pattern to avoid re-initializing
 */
export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) {
    return Promise.resolve(null)
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey, {
      // Optional: Add connected account for platforms
      // stripeAccount: 'acct_xxx',
      
      // Optional: Locale
      locale: 'en',
    })
  }
  
  return stripePromise
}

/**
 * Redirect to Stripe Checkout (Modern method)
 * This is the recommended way to redirect to checkout
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe()
  
  if (!stripe) {
    throw new Error('Stripe is not loaded')
  }
  
  // Modern way - just redirect to the URL returned by the server
  // The server should return session.url from the checkout session
  // This method is deprecated:
  // const { error } = await stripe.redirectToCheckout({ sessionId })
  
  // Instead, the server should return the URL and we navigate directly:
  // window.location.href = checkoutUrl
  
  // But if you must use the sessionId:
  const { error } = await stripe.redirectToCheckout({ sessionId })
  
  if (error) {
    throw error
  }
}

/**
 * Format price for display
 */
export function formatPrice(
  priceInCents: number,
  currency = 'GBP'
): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(priceInCents / 100)
}

/**
 * Validate card number (basic check)
 */
export function validateCardNumber(cardNumber: string): boolean {
  // Remove spaces and validate using Luhn algorithm
  const cleaned = cardNumber.replace(/\s/g, '')
  
  if (!/^\d+$/.test(cleaned)) {
    return false
  }
  
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

/**
 * Get card brand from number
 */
export function getCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '')
  
  if (/^4/.test(cleaned)) return 'Visa'
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard'
  if (/^3[47]/.test(cleaned)) return 'American Express'
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover'
  
  return 'Unknown'
}