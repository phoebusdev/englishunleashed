'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.png" alt="English Unleashed" className="h-10 w-auto" />
                <span className="text-2xl font-bold text-gradient-primary">
                  English Unleashed
                </span>
              </Link>
            </div>
            <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-[#20b2aa] text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-[#20b2aa]/30 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/shop')
                    ? 'border-[#20b2aa] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-[#20b2aa]/30 hover:text-gray-700'
                }`}
              >
                Shop
              </Link>
              <Link
                href="/videos"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/videos')
                    ? 'border-[#20b2aa] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-[#20b2aa]/30 hover:text-gray-700'
                }`}
              >
                Videos
              </Link>
              <Link
                href="/about"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/about')
                    ? 'border-[#20b2aa] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-[#20b2aa]/30 hover:text-gray-700'
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/contact')
                    ? 'border-[#20b2aa] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-[#20b2aa]/30 hover:text-gray-700'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:ml-6 lg:flex lg:items-center">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/account"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Account
                </Link>
                {session.user?.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-[#20b2aa] hover:text-[#0f8080] px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-primary text-white hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#20b2aa] transition-colors"
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-[#20b2aa]/30 hover:text-gray-800"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-[#20b2aa]/30 hover:text-gray-800"
          >
            Shop
          </Link>
          <Link
            href="/videos"
            className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-[#20b2aa]/30 hover:text-gray-800"
          >
            Videos
          </Link>
          <Link
            href="/about"
            className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-[#20b2aa]/30 hover:text-gray-800"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-[#20b2aa]/30 hover:text-gray-800"
          >
            Contact
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {session ? (
            <div className="space-y-1">
              <Link
                href="/account"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                My Account
              </Link>
              {session.user?.isAdmin && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-base font-medium text-[#20b2aa] hover:text-[#0f8080] hover:bg-gray-100"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href="/login"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-2 text-base font-medium text-[#20b2aa] hover:text-[#0f8080] hover:bg-gray-100"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}