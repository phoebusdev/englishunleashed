import { Metadata } from "next"
import Link from "next/link"
import { prisma } from "lib/db"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Shop - English Learning Materials",
  description: "Download our English learning PDFs and video courses. Master English with the shadowing method.",
}

export default async function ShopPage() {
  // Get products with their packs from the database
  const products = await prisma.product.findMany({
    where: {
      active: true
    },
    include: {
      packs: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            English Learning Materials
          </h1>
          <p className="text-lg text-gray-600">
            High-quality PDFs and courses to accelerate your English learning
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-500">Check back soon for new English learning materials!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-[#20b2aa] capitalize">
                      {product.type.toLowerCase()}
                    </span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      {product.active ? 'Available' : 'Coming Soon'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">
                    {product.title}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  {product.packs.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Included:</p>
                      <div className="space-y-1">
                        {product.packs.map((pack) => (
                          <div key={pack.id} className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>{pack.title}</span>
                            <div className="flex items-center ml-2 space-x-1">
                              {pack.hasPdf && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">PDF</span>
                              )}
                              {pack.hasQuiz && (
                                <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">Quiz</span>
                              )}
                              {pack.videoId && (
                                <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Video</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      £{(product.price / 100).toFixed(2)}
                    </span>
                    {product.active && product.packs.length > 0 ? (
                      <Link
                        href={`/checkout/${product.packs[0].id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-gradient-primary text-white font-medium rounded-full hover:shadow-lg hover:scale-105 transition-all"
                      >
                        Buy Now
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-500 font-medium rounded-full cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">Why Choose English Unleashed?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[#20b2aa] mb-2">
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium">Instant Access</p>
                <p className="text-gray-600">Download immediately after purchase</p>
              </div>
              <div>
                <div className="text-[#20b2aa] mb-2">
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="font-medium">Proven Method</p>
                <p className="text-gray-600">Shadowing technique for natural learning</p>
              </div>
              <div>
                <div className="text-[#20b2aa] mb-2">
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="font-medium">Complete System</p>
                <p className="text-gray-600">PDFs, videos, and interactive quizzes</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            All purchases are processed securely with Stripe
          </p>
          <Link
            href="/videos"
            className="text-[#20b2aa] hover:text-[#0f8080] font-medium transition-colors"
          >
            Watch free lessons on YouTube →
          </Link>
        </div>
      </div>
    </div>
  )
}