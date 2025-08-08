import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "English Unleashed - Learn English with PDFs",
  description: "Simple, clear English learning materials you can download and use anywhere. Learn with our proven shadowing method.",
}

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="gradient-grainy text-white py-20 relative overflow-hidden min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Learn English with
              <span className="block text-yellow-300">English Unleashed</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Master English with our proven shadowing method. Download PDF guides 
              that complement our popular YouTube lessons and podcast episodes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-white text-[#0f8080] font-semibold px-8 py-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Browse PDF Collection
              </Link>
              <Link
                href="/videos"
                className="inline-flex items-center justify-center rounded-full bg-white/20 text-white font-medium px-8 py-4 backdrop-blur-sm border border-white/30 shadow hover:bg-white/30 transition-all"
              >
                Watch Free Videos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 gradient-grainy-light relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose English Unleashed?
            </h2>
            <p className="text-lg text-gray-600">
              Proven methods that help thousands of learners worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-[#20b2aa] mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">PDF Guides</h3>
              <p className="text-gray-600">
                Downloadable materials you can use anywhere, anytime. Perfect for offline practice.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-[#20b2aa] mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Lessons</h3>
              <p className="text-gray-600">
                Free YouTube videos with clear, slow English perfect for shadowing practice.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-[#20b2aa] mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Proven Method</h3>
              <p className="text-gray-600">
                The shadowing technique helps you speak naturally and confidently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Your English Journey Today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of successful English learners worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium px-8 py-4 shadow-lg hover:shadow-xl transition-all"
            >
              View All Products
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-700 font-medium px-8 py-4 hover:border-gray-400 transition-all"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}