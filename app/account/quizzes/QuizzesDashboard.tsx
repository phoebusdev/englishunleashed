'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

type Quiz = {
  quizId: string
  quizTitle: string
  quizDescription: string | null
  packId: string
  packTitle: string
  productTitle: string
  questionCount: number
  passingScore: number
  attempts: number
  bestScore: number | null
  lastAttemptDate: string | null
  isPassed: boolean
  purchaseDate: string
}

export function QuizzesDashboard() {
  const { data: session } = useSession()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [claimingOrders, setClaimingOrders] = useState(false)
  const [claimResult, setClaimResult] = useState<{
    claimedCount: number
    quizzesUnlocked: any[]
  } | null>(null)

  useEffect(() => {
    if (session) {
      claimOrders()
      fetchQuizzes()
    }
  }, [session])

  const claimOrders = async () => {
    try {
      setClaimingOrders(true)
      const response = await fetch('/api/auth/claim-orders', {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.claimedCount > 0) {
          setClaimResult(data)
          // Refresh quizzes after claiming
          setTimeout(() => fetchQuizzes(), 1000)
        }
      }
    } catch (error) {
      console.error('Error claiming orders:', error)
    } finally {
      setClaimingOrders(false)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes/my-quizzes')
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes')
      }
      const data = await response.json()
      setQuizzes(data.quizzes)
    } catch (err) {
      setError('Failed to load your quizzes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (claimResult && claimResult.claimedCount > 0) {
    return (
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-900">
              Welcome! We found your previous purchases
            </h3>
            <p className="mt-2 text-green-700">
              We've linked {claimResult.claimedCount} previous {claimResult.claimedCount === 1 ? 'order' : 'orders'} to your account.
              {claimResult.quizzesUnlocked.length > 0 && (
                <> You now have access to {claimResult.quizzesUnlocked.length} {claimResult.quizzesUnlocked.length === 1 ? 'quiz' : 'quizzes'}!</>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">No Quizzes Yet</h2>
        <p className="text-gray-600 mb-6">
          Purchase a PDF pack to unlock interactive quizzes and track your learning progress.
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-[#20b2aa] text-white rounded-md hover:bg-[#0f8080] transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-[#20b2aa]">{quizzes.length}</div>
          <div className="text-gray-600">Total Quizzes</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-green-600">
            {quizzes.filter(q => q.isPassed).length}
          </div>
          <div className="text-gray-600">Passed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-yellow-600">
            {quizzes.filter(q => q.attempts > 0 && !q.isPassed).length}
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
      </div>

      {/* Quiz List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Available Quizzes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {quizzes.map((quiz) => (
            <div key={quiz.quizId} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {quiz.quizTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    From: {quiz.productTitle} - {quiz.packTitle}
                  </p>
                  {quiz.quizDescription && (
                    <p className="text-gray-600 mb-3">{quiz.quizDescription}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {quiz.questionCount} questions
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pass: {quiz.passingScore}%
                    </div>
                    {quiz.attempts > 0 && (
                      <div className="flex items-center text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {quiz.attempts} attempts
                      </div>
                    )}
                  </div>

                  {quiz.bestScore !== null && (
                    <div className="mt-3">
                      <div className="flex items-center gap-4">
                        <div className={`text-sm font-medium ${quiz.isPassed ? 'text-green-600' : 'text-yellow-600'}`}>
                          Best Score: {quiz.bestScore}%
                        </div>
                        {quiz.isPassed && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Passed
                          </span>
                        )}
                      </div>
                      {quiz.lastAttemptDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last attempt: {new Date(quiz.lastAttemptDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <Link
                    href={`/quiz/${quiz.packId}`}
                    className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                      quiz.attempts === 0
                        ? 'bg-[#20b2aa] text-white hover:bg-[#0f8080]'
                        : quiz.isPassed
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    {quiz.attempts === 0 ? 'Start Quiz' : quiz.isPassed ? 'Review' : 'Retake'}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}