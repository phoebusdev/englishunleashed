'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { env } from 'env.mjs'

// Initialize Stripe with test key
const stripeKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RsTYMIXJgbHswroLtjlQu5DnDjV1J3iKzH6losuMq6gtjdGN84PUCERdhbpwpuBtxO1dL0bjZLGBNJpMWPL4c2x00b7gMUo7S'
const stripePromise = loadStripe(stripeKey)

interface CheckoutFormProps {
  packTitle: string
  amount: number
  packId: string
}

function CheckoutForm({ packTitle, amount, packId }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: email,
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required',
      })

      if (submitError) {
        console.error('Payment error:', submitError)
        if (submitError.type === 'card_error' || submitError.type === 'validation_error') {
          setError(submitError.message || 'An error occurred')
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
        setProcessing(false)
        return
      }

    if (paymentIntent?.status === 'succeeded') {
      // Confirm the payment on the backend
      try {
        const response = await fetch('/api/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            paymentIntentId: paymentIntent.id,
            email: email 
          }),
        })

        if (response.ok) {
          // Redirect to success page
          router.push(`/success?payment_intent=${paymentIntent.id}`)
        } else {
          const data = await response.json()
          setError(data.error || 'Failed to confirm payment')
          setProcessing(false)
        }
      } catch (err) {
        setError('Failed to confirm payment')
        setProcessing(false)
      }
    } catch (err: any) {
      console.error('Payment processing error:', err)
      setError(err.message || 'Payment processing failed')
      setProcessing(false)
    }
  }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">{packTitle}</h3>
        <p className="text-2xl font-bold text-[#20b2aa]">
          £{(amount / 100).toFixed(2)}
        </p>
      </div>

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
        />
        <p className="mt-1 text-sm text-gray-500">
          We'll send your purchase confirmation and download links here
        </p>
      </div>

      <PaymentElement 
        options={{
          layout: 'tabs'
        }}
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-[#20b2aa] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#0f8080] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? 'Processing...' : `Pay £${(amount / 100).toFixed(2)}`}
      </button>

      <div className="flex items-center justify-center text-sm text-gray-500">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Secure payment powered by Stripe
      </div>
    </form>
  )
}

interface EmbeddedCheckoutProps {
  packId: string
  packTitle: string
  packDescription?: string
  promoCode?: string
}

export function EmbeddedCheckout({ packId, packTitle, packDescription, promoCode }: EmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packId,
        promoCode,
        mode: 'payment_intent'
      }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create payment intent')
        }
        return data
      })
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          setAmount(data.amount)
          console.log('Payment intent initialized successfully')
        } else {
          throw new Error('No client secret received')
        }
      })
      .catch((err) => {
        console.error('Checkout initialization error:', err)
        setError(err.message || 'Failed to initialize checkout')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [packId, promoCode])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-center mb-2">Checkout Error</h2>
        <p className="text-gray-600 text-center">{error}</p>
      </div>
    )
  }

  if (!clientSecret) {
    return null
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#20b2aa',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '4px',
    },
  }

  const options = {
    clientSecret,
    appearance,
    loader: 'auto' as const,
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
      <Elements options={options} stripe={stripePromise}>
        <CheckoutForm 
          packTitle={packTitle} 
          amount={amount}
          packId={packId}
        />
      </Elements>
    </div>
  )
}