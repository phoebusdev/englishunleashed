'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image 
              src="/logo.png" 
              alt="English Unleashed Logo" 
              width={40} 
              height={40}
              className="object-contain"
            />
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">English Unleashed</span>
              <span className="text-xs text-gray-500">The Podcast</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Shop PDFs
            </Link>
            <a 
              href="https://www.youtube.com/@EnglishPodcastUnleashed" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Podcast
            </a>
            <Link href="/contact" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Contact
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3 pt-4">
              <Link 
                href="/shop" 
                className="text-gray-700 hover:text-primary font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop PDFs
              </Link>
              <a 
                href="https://www.youtube.com/@EnglishPodcastUnleashed" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-primary font-medium transition-colors"
              >
                Podcast
              </a>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-primary font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}