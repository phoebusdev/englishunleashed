'use client'

import { useState } from 'react'
import Link from 'next/link'

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'vocabulary', name: 'Vocabulary' },
  { id: 'conversation', name: 'Conversation' },
  { id: 'pronunciation', name: 'Pronunciation' },
  { id: 'business', name: 'Business' }
]

interface VideoPDF {
  id: string
  title: string
  category: 'vocabulary' | 'conversation' | 'pronunciation' | 'business' | 'general'
  price: number
  formattedPrice: string
  checkoutUrl: string
  description: string
  fileInfo?: {
    size: string
    pages: string
  }
}

interface ShopPageClientProps {
  videoPDFs: VideoPDF[]
  hasError: boolean
}

export default function ShopPageClient({ videoPDFs, hasError }: ShopPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const filteredPDFs = selectedCategory === 'all' 
    ? videoPDFs 
    : videoPDFs.filter(pdf => pdf.category === selectedCategory)

  return (
    <>
      <section className="bg-gradient-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <span className="inline-block mb-4 text-sm font-medium text-white/90 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            📚 Digital PDF Shop
          </span>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
            English PDF Materials
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Download PDF guides to practice English. Simple learning materials from English Unleashed.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <p className="text-center mt-6 text-gray-600 font-medium">
              {filteredPDFs.length} PDFs
            </p>
          </div>

          {hasError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-yellow-800 text-center">
                Unable to load all PDFs. Showing available content.
              </p>
            </div>
          )}

          {filteredPDFs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredPDFs.map((pdf) => (
                <div key={pdf.id} className="bg-white rounded-2xl shadow-lg p-8 transition-all hover:shadow-xl">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pdf.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 capitalize">{pdf.category}</span>
                      <span className="text-2xl font-bold text-primary">{pdf.formattedPrice}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {pdf.description}
                  </p>
                  {pdf.fileInfo && (
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                      <span>📄 {pdf.fileInfo.pages}</span>
                      <span>💾 {pdf.fileInfo.size}</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    <a
                      href={pdf.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full justify-center inline-flex items-center rounded-full text-center transition-all duration-200 font-medium shadow-md hover:shadow-lg bg-gradient-primary text-white border-0 hover:opacity-90 hover:scale-[1.02] min-w-36 h-12 text-base py-3 px-6"
                    >
                      Buy Now - {pdf.formattedPrice}
                    </a>
                    <Link
                      href="/videos"
                      className="w-full justify-center inline-flex items-center rounded-full text-center transition-all duration-200 font-medium shadow-md hover:shadow-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 min-w-36 h-12 text-base py-3 px-6"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Watch Video
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No products found
                </h3>
                <p className="text-gray-600 mb-8">
                  Try adjusting your search criteria or browse all categories.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-8 py-3 bg-gradient-primary text-white rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Show All PDFs
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}