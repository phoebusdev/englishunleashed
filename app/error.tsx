'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-8">
          We encountered an unexpected error. Don't worry, our team has been notified and is working on it.
        </p>

        {error.digest && (
          <p className="text-sm text-gray-500 mb-8">
            Error ID: {error.digest}
          </p>
        )}

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full inline-flex items-center justify-center rounded-full bg-gradient-primary text-white font-medium px-6 py-3 shadow-md hover:shadow-lg hover:opacity-90 transition-all"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center rounded-full bg-white text-gray-700 font-medium px-6 py-3 border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          Need help? <Link href="/contact" className="text-primary hover:text-primary-dark">Contact Support</Link>
        </div>
      </div>
    </div>
  )
}