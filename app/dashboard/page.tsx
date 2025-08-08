'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAdmin = session.user?.isAdmin

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Session Info:</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Name:</strong> {session.user?.name || 'Not set'}</p>
              <p><strong>Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Links:</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Link 
                href="/account" 
                className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <h3 className="font-semibold text-blue-900">My Account</h3>
                <p className="text-sm text-blue-700">View your account details and orders</p>
              </Link>

              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <h3 className="font-semibold text-purple-900">Admin Panel</h3>
                  <p className="text-sm text-purple-700">Manage products, users, and content</p>
                </Link>
              )}

              <Link 
                href="/shop" 
                className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <h3 className="font-semibold text-green-900">Shop</h3>
                <p className="text-sm text-green-700">Browse available products</p>
              </Link>

              <Link 
                href="/videos" 
                className="block p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
              >
                <h3 className="font-semibold text-yellow-900">Videos</h3>
                <p className="text-sm text-yellow-700">Watch lesson videos</p>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Direct Navigation (Debug):</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.location.href = '/account'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Force Navigate to Account
              </button>
              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Force Navigate to Admin
                </button>
              )}
              <button
                onClick={() => window.location.href = '/api/auth/session'}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Check Session API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}