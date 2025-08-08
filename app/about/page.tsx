import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About English Unleashed",
  description: "Learn about our mission to help English learners worldwide through clear, simple teaching methods.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About English Unleashed
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              English Unleashed is dedicated to making English learning accessible, 
              enjoyable, and effective for learners worldwide. We believe that anyone 
              can master English with the right approach and materials.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Method</h2>
            <p className="text-gray-600 mb-6">
              We use the proven shadowing technique - a method where learners listen 
              to native speech and repeat it simultaneously. This technique, combined 
              with our clear, slow pronunciation, helps learners develop natural 
              speaking abilities and confidence.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">What We Offer</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">
                  <strong>PDF Learning Materials:</strong> Downloadable guides that complement our video lessons
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">
                  <strong>YouTube Videos:</strong> Free lessons with clear pronunciation and practical examples
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">
                  <strong>Podcast Episodes:</strong> Regular content to keep you learning and improving
                </span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We're committed to helping English learners achieve their goals, whether 
              that's passing exams, advancing in their careers, or simply communicating 
              more confidently in English. Our materials are designed to be practical, 
              engaging, and immediately useful in real-life situations.
            </p>

            <div className="bg-purple-50 border-l-4 border-purple-600 p-6 mt-8">
              <p className="text-gray-700 italic">
                "Learning English doesn't have to be complicated. With the right method 
                and consistent practice, anyone can speak English naturally and confidently."
              </p>
              <p className="text-gray-600 mt-2 font-medium">
                - English Unleashed Team
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-full hover:shadow-lg transition-all"
            >
              Browse Our Materials
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-full hover:border-gray-400 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}