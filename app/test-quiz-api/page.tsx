'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function TestQuizAPI() {
  const { data: session, status } = useSession()
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const response = await fetch('/api/quizzes/my-quizzes')
      const data = await response.json()
      
      if (!response.ok) {
        setError(`Error ${response.status}: ${data.error || 'Unknown error'}`)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError('Failed to fetch: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">Test Quiz API</h1>
          
          <div className="mb-6 p-4 bg-gray-100 rounded">
            <p className="font-semibold">Session Status: {status}</p>
            {session && (
              <>
                <p>Email: {session.user?.email}</p>
                <p>Name: {session.user?.name}</p>
              </>
            )}
          </div>
          
          <button
            onClick={testAPI}
            disabled={loading || status !== 'authenticated'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test /api/quizzes/my-quizzes'}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="mt-4 p-4 bg-green-100 rounded">
              <p className="font-semibold">Success!</p>
              <pre className="mt-2 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}