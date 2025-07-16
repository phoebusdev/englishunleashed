'use client'

import { useState } from 'react'
import { Button } from "components/Button/Button"

const categories = [
  'General Inquiry',
  'Technical Support',
  'Content Request',
  'Partnership',
  'Feedback'
]

const faqs = [
  {
    question: 'How quickly will I receive a response?',
    answer: 'We typically respond to all inquiries within 24-48 hours during business days.'
  },
  {
    question: 'Do you offer personalized English coaching?',
    answer: 'Currently, we focus on our YouTube content and digital resources. For personalized help, check our premium materials.'
  },
  {
    question: 'Can you create content on specific topics?',
    answer: 'We love content suggestions! Send us your ideas and we\'ll consider them for future YouTube episodes and PDFs.'
  },
  {
    question: 'Are there any free resources available?',
    answer: 'Yes! Our YouTube channel is completely free, plus we offer a comprehensive starter guide PDF at no cost.'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the form data
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <section className="bg-gradient-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <span className="inline-block mb-4 text-sm font-medium text-white/90 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            💬 Get in Touch
          </span>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl mb-4">
            We're Here to Help
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Have questions about our resources? Need technical support? Want to suggest content? We'd love to hear from you and help with your English learning journey.
          </p>
          <div className="mt-6 flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              24-48 hour response
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              All inquiries answered
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              {submitted ? (
                <div className="bg-green-50 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600 mb-6">Thank you for reaching out. We'll get back to you within 24-48 hours.</p>
                  <Button href="/" intent="primary">Back to Home</Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                  <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        minLength={10}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                      ></textarea>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      By submitting this form, you agree to our privacy policy and consent to being contacted by our team.
                    </div>
                    
                    <button 
                      type="submit" 
                      className="justify-center inline-flex items-center rounded-full text-center transition-all duration-200 font-medium shadow-md hover:shadow-lg bg-gradient-primary text-white border-0 hover:opacity-90 hover:scale-[1.02] min-w-36 h-12 text-base py-3 px-6 w-full"
                    >
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Help</h3>
                <div className="space-y-4">
                  <a href="https://www.youtube.com/@EnglishPodcastUnleashed" className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-gray-900 mb-1">YouTube Channel</h4>
                    <p className="text-sm text-gray-600 mb-2">Watch our latest videos and leave comments with your questions</p>
                    <span className="text-primary font-medium text-sm">Visit Channel →</span>
                  </a>
                  
                  <a href="/shop" className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-gray-900 mb-1">Browse Resources</h4>
                    <p className="text-sm text-gray-600 mb-2">Find answers in our comprehensive PDF guides and materials</p>
                    <span className="text-primary font-medium text-sm">Shop PDFs →</span>
                  </a>
                  
                  <a href="#" className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-gray-900 mb-1">Free Starter Guide</h4>
                    <p className="text-sm text-gray-600 mb-2">Get our free guide with common questions and learning tips</p>
                    <span className="text-primary font-medium text-sm">Download Free →</span>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:hello@englishunleashed.com" className="hover:text-primary transition-colors">hello@englishunleashed.com</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    @englishunleashed
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    24-48 hours response time
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Technical Support:</strong> For urgent technical issues with purchased products, please include your order number from Gumroad in your message.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions before you reach out</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}