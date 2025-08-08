'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function SuccessClient() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isVerifying, setIsVerifying] = useState(true)
  const [order, setOrder] = useState<{
    id: string
    amount: number
    downloadExpiry?: string
    productTitle?: string
    hasQuiz?: boolean
  } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const paymentIntentId = searchParams.get('payment_intent')
    
    if (sessionId) {
      verifyPayment(sessionId, 'session')
    } else if (paymentIntentId) {
      verifyPayment(paymentIntentId, 'intent')
    } else {
      setError('No payment session found')
      setIsVerifying(false)
    }
  }, [searchParams])

  const verifyPayment = async (id: string, type: 'session' | 'intent') => {
    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const endpoint = type === 'session' ? '/api/checkout/verify' : '/api/checkout/confirm'
      const body = type === 'session' ? { sessionId: id } : { paymentIntentId: id }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to verify payment')
      } else {
        const data = await response.json()
        setOrder(data.order)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please refresh the page.')
      } else {
        setError('Failed to verify payment. Please contact support.')
      }
      console.error('Payment verification error:', err)
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="mt-4 text-gray-600">Verifying your payment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Payment Verification Failed</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-[#20b2aa] text-white rounded-md hover:bg-[#0f8080]"
        >
          Back to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="text-center">
        <div className="text-green-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {order && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
            <p className="font-semibold mb-2">Order Details:</p>
            <p className="text-sm text-gray-600">Order ID: {order.id}</p>
            {order.productTitle && (
              <p className="text-sm text-gray-600">Product: {order.productTitle}</p>
            )}
            <p className="text-sm text-gray-600">Amount: £{(order.amount / 100).toFixed(2)}</p>
            {order.downloadExpiry && (
              <p className="text-sm text-gray-600">
                Download expires: {new Date(order.downloadExpiry).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Quiz Promotion Section */}
        {order?.hasQuiz && !session && (
          <div className="bg-gradient-grainy text-white rounded-lg p-6 mb-6 max-w-lg mx-auto relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-yellow-300 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">🎉 Unlock Your Free Quiz!</h2>
              <p className="mb-4 text-white/90">
                Test your knowledge with an interactive quiz included with your purchase. 
                Create a free account to access it!
              </p>
              <div className="space-y-2">
                <Link
                  href="/signup"
                  className="block w-full px-6 py-3 bg-white text-[#20b2aa] rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Create Account & Access Quiz
                </Link>
                <Link
                  href="/login"
                  className="block w-full px-6 py-3 bg-white/20 text-white rounded-full font-medium hover:bg-white/30 transition-all"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Logged in with quiz */}
        {order?.hasQuiz && session && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-lg mx-auto">
            <div className="text-green-600 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-900">Quiz Access Granted!</h2>
            <p className="text-gray-600 mb-4">
              Your interactive quiz is ready. Test your knowledge and track your progress!
            </p>
            <Link
              href="/account/quizzes"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all"
            >
              Go to My Quizzes
            </Link>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You will receive an email confirmation shortly with your download links.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            {session ? (
              <Link
                href="/account"
                className="px-6 py-3 bg-[#20b2aa] text-white rounded-md hover:bg-[#0f8080] transition-colors"
              >
                Go to Account
              </Link>
            ) : (
              <Link
                href="/signup"
                className="px-6 py-3 bg-[#20b2aa] text-white rounded-md hover:bg-[#0f8080] transition-colors"
              >
                Create Account
              </Link>
            )}
            <Link
              href="/shop"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}