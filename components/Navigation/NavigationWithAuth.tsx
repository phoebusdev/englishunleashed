'use client'

import { BookOpen, LayoutDashboard, LogOut, Shield, ShoppingBag, User, UserCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

export function NavigationWithAuth() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {/* Conditional navigation based on auth state */}
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/account" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  My Materials
                </Link>
                <Link href="/videos" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Videos
                </Link>
              </>
            ) : (
              <>
                <Link href="/shop" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Shop PDFs
                </Link>
                <Link href="/videos" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Videos
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-primary font-medium transition-colors">
                  Contact
                </Link>
              </>
            )}

            {/* Auth section */}
            {status === 'loading' ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />
            ) : session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{session.user?.name || 'Account'}</span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserCircle className="w-4 h-4" />
                      Account Settings
                    </Link>

                    <Link
                      href="/shop"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Browse Shop
                    </Link>

                    {session.user?.isAdmin && (
                      <>
                        <hr className="my-2" />
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </>
                    )}

                    <hr className="my-2" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-full px-4 py-2 bg-gradient-primary text-white font-medium hover:opacity-90 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
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
              {/* Conditional mobile navigation based on auth state */}
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Materials
                  </Link>
                  <Link
                    href="/videos"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Videos
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/shop"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Shop PDFs
                  </Link>
                  <Link
                    href="/videos"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Videos
                  </Link>
                  <Link
                    href="/contact"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </>
              )}

              <hr className="my-2" />

              {session ? (
                <>
                  <div className="px-4 py-2 bg-gray-50 rounded-lg mb-2">
                    <p className="text-sm font-medium text-gray-900">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                  </div>

                  <Link
                    href="/account"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <Link
                    href="/shop"
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Browse Shop
                  </Link>

                  {session.user?.isAdmin && (
                    <>
                      <hr className="my-2" />
                      <Link
                        href="/admin"
                        className="text-gray-700 hover:text-primary font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    </>
                  )}

                  <hr className="my-2" />
                  <button
                    onClick={handleSignOut}
                    className="text-left text-gray-700 hover:text-primary font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="text-gray-700 hover:text-primary font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}