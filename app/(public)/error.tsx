'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Public route error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-lg">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          We hit a snag!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Something unexpected happened while loading this page. Let's get you back on track.
        </p>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full inline-flex items-center justify-center rounded-full bg-gradient-primary text-white font-medium px-6 py-3 shadow-md hover:shadow-lg hover:opacity-90 transition-all"
          >
            Refresh Page
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-white text-gray-700 font-medium px-4 py-2 border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-sm"
            >
              Browse PDFs
            </Link>
            <Link
              href="/videos"
              className="inline-flex items-center justify-center rounded-full bg-white text-gray-700 font-medium px-4 py-2 border border-gray-300 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-sm"
            >
              Watch Videos
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Still having trouble?</p>
          <Link href="/contact" className="text-primary hover:text-primary-dark font-medium">
            Let us know →
          </Link>
        </div>
      </div>
    </div>
  )
}