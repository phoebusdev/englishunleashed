'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "components/Button/Button"
import { ProcessedGumroadProduct } from "types/gumroad"
import { YouTubeVideo } from "lib/youtube"

interface HomePageClientProps {
  gumroadProducts: ProcessedGumroadProduct[]
  latestVideos: YouTubeVideo[]
}

export default function HomePageClient({ gumroadProducts, latestVideos }: HomePageClientProps) {
  // Get first 3 products for showcase
  const featuredProducts = gumroadProducts.slice(0, 3)
  const latestVideo = latestVideos[0]

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:py-32">
          <div className="mx-auto max-w-3xl">
            <span className="inline-block mb-4 text-sm font-medium text-white/90 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              🎧 Learn English with Podcast + PDFs
            </span>
            <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight md:text-5xl xl:text-7xl">
              Master English with<br />
              <span className="text-yellow-300">Shadowing Practice</span>
            </h1>
            <p className="mb-8 text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto">
              Download PDF transcripts, vocabulary guides, and exercises for every podcast episode. 
              Practice speaking with our proven shadowing method.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/shop" intent="secondary" size="lg" className="bg-white text-gray-800 hover:bg-gray-100">
                Browse PDF Materials
              </Button>
              <Button href="/videos" size="lg" className="bg-white/20 text-white border-2 border-white/50 hover:bg-white/30 backdrop-blur-sm">
                Watch Videos
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Popular PDF Materials
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Each PDF includes full transcripts, vocabulary exercises, and speaking practice guides
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg p-8 transition-all hover:shadow-xl">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{product.cleanTitle}</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">{product.formattedPrice}</span>
                      {product.fileInfo && (
                        <span className="text-sm text-gray-500">{product.fileInfo.pages}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                  <a
                    href={product.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full justify-center inline-flex items-center rounded-full text-center transition-all duration-200 font-medium shadow-md hover:shadow-lg bg-gradient-primary text-white border-0 hover:opacity-90 hover:scale-[1.02] min-w-36 h-12 text-base py-3 px-6"
                  >
                    Get This PDF
                  </a>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/shop" className="inline-flex items-center text-primary hover:text-secondary font-medium transition-colors text-lg">
                View All PDFs 
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Video Preview Section */}
      {latestVideo && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Learn with Video + PDF
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Watch our latest episode, then download the PDF to practice offline. 
                  Each PDF includes the full transcript, vocabulary exercises, and speaking prompts.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Full Transcript</h3>
                      <p className="text-gray-600">Follow along word-by-word with the complete episode script</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Vocabulary Quiz</h3>
                      <p className="text-gray-600">Test your understanding with targeted vocabulary exercises</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Speaking Practice</h3>
                      <p className="text-gray-600">Improve pronunciation with shadowing exercises</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Button href="/videos" intent="primary" size="lg">
                    Watch All Episodes
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={latestVideo.thumbnail.url}
                  alt={latestVideo.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Link 
                    href="/videos" 
                    className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <svg className="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Link>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-white font-semibold text-lg line-clamp-2">{latestVideo.title}</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="bg-gradient-light">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why English Unleashed?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of learners improving their English with our method
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Focused Learning</h3>
              <p className="text-gray-600">
                Clear, structured lessons designed for A1-B2 learners
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learn Anywhere</h3>
              <p className="text-gray-600">
                Download PDFs to practice offline, anytime, anywhere
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗣️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Shadowing Method</h3>
              <p className="text-gray-600">
                Proven technique to improve pronunciation and fluency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Improve Your English?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Watch our videos or download a PDF to begin practicing today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/videos" intent="secondary" size="lg">
              Watch Videos
            </Button>
            <Button href="/shop" intent="primary" size="lg">
              Get PDF Materials
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}