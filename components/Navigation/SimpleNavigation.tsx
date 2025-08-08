'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export function SimpleNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="container-wide">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.png" 
              alt="English Unleashed Logo" 
              width={36} 
              height={36}
              className="object-contain"
            />
            <span className="text-lg font-semibold text-gray-900">English Unleashed</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Shop
            </Link>
            <Link href="/videos" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Videos
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Contact
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Account
            </Link>
            
            <div className="flex items-center space-x-3 ml-4">
              <Link
                href="/login"
                className="btn-secondary text-sm py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm py-2"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/shop" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                href="/videos" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Videos
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/account" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Account
              </Link>
              
              <div className="border-t border-gray-100 pt-4 px-4 space-y-3">
                <Link 
                  href="/login" 
                  className="btn-secondary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="btn-primary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}