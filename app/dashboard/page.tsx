import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { DownloadButton } from '@/components/DownloadButton'
import { Metadata } from 'next'
import { BookOpen, FileText, Video, ShoppingBag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard - English Unleashed',
  description: 'Your learning dashboard - access materials, quizzes, and track progress',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/dashboard')
  }

  // Fetch user with orders and quiz attempts
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: {
        where: {
          status: 'COMPLETED'
        },
        include: {
          product: {
            include: {
              packs: {
                include: {
                  quiz: {
                    include: {
                      _count: {
                        select: { questions: true }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      quizAttempts: {
        orderBy: {
          completedAt: 'desc'
        },
        take: 5,
        include: {
          quiz: {
            include: {
              pack: true
            }
          }
        }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  // Calculate some basic stats
  const totalPurchases = user.orders.length
  const totalQuizzes = user.orders.reduce((acc: number, order) => {
    return acc + order.product.packs.filter((pack) => pack.hasQuiz).length
  }, 0)
  const avgQuizScore = user.quizAttempts.length > 0
    ? Math.round(user.quizAttempts.reduce((sum: number, attempt) => sum + attempt.score, 0) / user.quizAttempts.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name || 'Learner'}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Continue your English learning journey
          </p>
        </div>

        {/* Quick Stats */}
        {totalPurchases > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Materials Owned</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalPurchases}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quizzes Available</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalQuizzes}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quiz Average</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {user.quizAttempts.length > 0 ? `${avgQuizScore}%` : 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Materials Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">My Learning Materials</h2>
            <Link
              href="/shop"
              className="text-sm text-[#20b2aa] hover:text-[#0f8080] font-medium"
            >
              Explore more →
            </Link>
          </div>

          {user.orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No materials yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by purchasing your first learning pack
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-gradient-primary text-white font-medium px-6 py-3 hover:opacity-90 transition-all"
              >
                Browse Materials
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.orders.map((order: any) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.product.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Purchased {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Owned
                    </span>
                  </div>

                  {order.product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {order.product.description}
                    </p>
                  )}

                  {/* Pack Materials */}
                  <div className="space-y-3">
                    {order.product.packs.map((pack: any) => (
                      <div key={pack.id} className="border-t pt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {pack.title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pack.hasPdf && (
                            <DownloadButton
                              orderId={order.id}
                              packId={pack.id}
                              packTitle={pack.title}
                            />
                          )}
                          {pack.hasQuiz && (
                            <Link
                              href={`/quiz/${pack.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                            >
                              <BookOpen className="w-4 h-4" />
                              Take Quiz
                              {pack.quiz && (
                                <span className="text-xs text-orange-600">
                                  ({pack.quiz._count.questions} questions)
                                </span>
                              )}
                            </Link>
                          )}
                          {pack.videoUrl && (
                            <Link
                              href={pack.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                              <Video className="w-4 h-4" />
                              Watch Video
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Activity */}
        {user.quizAttempts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Quiz Activity</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {user.quizAttempts.map((attempt: any) => (
                  <div key={attempt.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          attempt.score >= 80 ? 'bg-green-100' : attempt.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-lg font-bold ${
                            attempt.score >= 80 ? 'text-green-700' : attempt.score >= 60 ? 'text-yellow-700' : 'text-red-700'
                          }`}>
                            {attempt.score}%
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{attempt.quiz.pack.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(attempt.completedAt).toLocaleDateString()} at{' '}
                            {new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/quiz/${attempt.quiz.packId}`}
                        className="text-sm text-[#20b2aa] hover:text-[#0f8080] font-medium"
                      >
                        Retake →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/account"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Account Settings</p>
                <p className="text-sm text-gray-500">Manage your profile</p>
              </div>
            </div>
          </Link>

          <Link
            href="/videos"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Free Video Lessons</p>
                <p className="text-sm text-gray-500">Watch on YouTube</p>
              </div>
            </div>
          </Link>

          <Link
            href="/contact"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Get Help</p>
                <p className="text-sm text-gray-500">Contact support</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
