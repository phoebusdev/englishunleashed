import { Metadata } from "next"
import Link from "next/link"
import { getFeaturedProducts } from "data/products"

export const metadata: Metadata = {
  title: "English Unleashed - Learn English with PDFs",
  description: "Simple, clear English learning materials you can download and use anywhere. Learn with our proven shadowing method.",
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://englishunleashed.com/",
    title: "English Unleashed - Learn English with PDFs",
    description: "Simple, clear English learning materials you can download and use anywhere.",
  },
}

export default function Web() {
  const featuredProduct = getFeaturedProducts()[0]
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Learn English with
              <span className="block">English Unleashed</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Master English with our proven shadowing method. Download PDF guides 
              that complement our popular YouTube lessons and podcast episodes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-white text-gray-900 font-medium px-8 py-4 shadow-lg hover:shadow-xl transition-all"
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
      
      {/* Featured Product Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          {featuredProduct && (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured PDF</h2>
                <p className="text-lg text-gray-600">Start your English learning journey today</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">
                    {featuredProduct.title.replace(' - English Unleashed Edition', '')}
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {featuredProduct.description}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {featuredProduct.price}
                  </span>
                  <Link 
                    href={`/checkout/${featuredProduct.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-primary text-white font-medium px-6 py-3 shadow-md hover:shadow-lg hover:opacity-90 transition-all"
                  >
                    Get This PDF
                  </Link>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Link 
                  href="/shop" 
                  className="inline-flex items-center bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 font-medium transition-opacity group"
                >
                  See All PDFs 
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}