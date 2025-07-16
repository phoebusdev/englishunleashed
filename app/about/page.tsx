import { Button } from "components/Button/Button"

const stats = [
  { value: '25K+', label: 'YouTube Subscribers' },
  { value: '500K+', label: 'Total Video Views' },
  { value: '120+', label: 'English Lessons' },
  { value: '500+', label: 'PDF Downloads' }
]

const timeline = [
  {
    year: '2022',
    title: 'English Unleashed is Born',
    description: 'Experienced teachers launch YouTube channel focusing on natural British English through shadowing practice and real-life conversations.'
  },
  {
    year: '2023',
    title: 'Teaching Method Refined',
    description: 'Thousands of learners embrace our shadowing technique. Community grows to 25K+ subscribers who love our slow, clear, natural teaching approach.'
  },
  {
    year: '2024',
    title: 'Comprehensive Learning Platform',
    description: 'L2+ platform launches with premium materials that deepen podcast learning — PDFs, exercises, and resources for serious English improvement.'
  }
]

const philosophyItems = [
  {
    title: 'Experienced Teachers',
    description: 'Created by qualified educators with years of experience teaching English to learners worldwide. We understand the challenges you face because we\'ve helped thousands overcome them.'
  },
  {
    title: 'Real English for Real Life',
    description: 'No boring textbook English here. We teach words and expressions you\'ll actually hear and use — in conversations, at work, while traveling, or chatting with friends.'
  },
  {
    title: 'Proven Shadowing Method',
    description: 'Our signature technique: You listen. You repeat. You improve. Guided shadowing opportunities help you speak more naturally, just like native speakers.'
  },
  {
    title: 'For All Levels',
    description: 'Beginner to Advanced — we start from the basics and gradually build your skills in vocabulary, pronunciation, fluency, and confidence through clear, accessible teaching.'
  }
]

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:py-28">
          <span className="inline-block mb-4 text-sm font-medium text-white/90 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            🎧 About English Unleashed
          </span>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl xl:text-6xl mb-6 max-w-3xl mx-auto">
            From First Words to<br />Fluent Conversation
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
            English Unleashed is your trusted companion on the journey to confident, natural English. We speak slowly, clearly, and naturally — making learning accessible for beginners while helping advanced learners refine their skills through proven shadowing techniques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="https://www.youtube.com/@EnglishPodcastUnleashed" intent="secondary" size="lg" className="bg-white text-gray-800 hover:bg-gray-100">
              Visit Our YouTube Channel
            </Button>
            <Button href="/shop" size="lg" className="bg-white/20 text-white border-2 border-white/50 hover:bg-white/30 backdrop-blur-sm">
              Browse Learning Materials
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Real Teachers, Real Results</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join thousands of learners worldwide who are mastering English through our proven shadowing method and experienced teaching approach
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Teaching English the Right Way</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-6">
                English Unleashed was created by experienced teachers who understand that learning a language shouldn't feel overwhelming. We speak slowly, clearly, and naturally — so beginners can understand and advanced learners can refine their pronunciation.
              </p>
              <p className="mb-6">
                Our core method is <strong>shadowing practice</strong> — a proven technique where you listen to natural English and repeat it back. This helps you develop the rhythm, intonation, and flow of native speakers while building confidence in real conversations.
              </p>
              <p>
                Every lesson focuses on practical English you'll actually use — no boring textbook language. From daily routines to professional conversations, we teach the words and expressions that matter in real life, backed by years of teaching experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Teaching Philosophy</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These core principles guide our approach to helping learners master English naturally and confidently
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {philosophyItems.map((item, index) => (
              <div key={index} className="bg-gradient-light rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Teaching Journey</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From experienced classroom teachers to YouTube educators — how we've refined our approach to help thousands of learners
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                    {item.year.slice(2)}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.year}: {item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-primary text-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your English Journey Today</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of learners who are mastering English through our proven shadowing method. Begin with free resources or accelerate your progress with premium materials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="#" intent="secondary" size="lg" className="bg-white text-gray-800 hover:bg-gray-100">
              Try Shadowing Practice
            </Button>
            <Button href="/shop" size="lg" className="bg-white/20 text-white border-2 border-white/50 hover:bg-white/30 backdrop-blur-sm">
              Explore Learning Materials
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}