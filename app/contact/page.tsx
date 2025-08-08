import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with English Unleashed. We'd love to hear from you!",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            We'd love to hear from you! Whether you have questions about our materials, 
            need learning advice, or want to share your success story, don't hesitate to reach out.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email
                </h3>
                <p className="text-gray-600">
                  support@englishunleashed.com
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </h3>
                <a 
                  href="https://www.youtube.com/@EnglishPodcastUnleashed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  @EnglishPodcastUnleashed
                </a>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </h3>
                <a 
                  href="https://twitter.com/EnglishPodcastUnleashed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  @EnglishPodcastUnleashed
                </a>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  For technical support, please include your order number
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Response time is usually within 24-48 hours
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Check our FAQ section for instant answers
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Join our YouTube community for learning tips
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">How do I access my purchased PDFs?</h3>
                <p className="text-gray-600">
                  After purchase through Gumroad, you'll receive an email with download links. 
                  You can also access your purchases anytime through your Gumroad library.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">What is the shadowing method?</h3>
                <p className="text-gray-600">
                  Shadowing is a language learning technique where you listen to native speech 
                  and repeat it simultaneously. This helps develop natural pronunciation, rhythm, 
                  and fluency.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Are the YouTube videos really free?</h3>
                <p className="text-gray-600">
                  Yes! All our YouTube videos are completely free. The PDFs and courses provide 
                  additional structured practice and exercises to complement the free content.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">What level of English do I need?</h3>
                <p className="text-gray-600">
                  Our materials are designed for intermediate learners (B1-B2 level), but beginners 
                  can also benefit from our clear, slow pronunciation and simple explanations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}