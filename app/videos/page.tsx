import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Video Lessons",
  description: "Watch free English lessons on YouTube. Learn with our clear, slow pronunciation perfect for shadowing practice.",
}

// Sample video data - replace with actual YouTube video IDs
const videos = [
  {
    id: "1",
    title: "Daily Routines Vocabulary",
    youtubeId: "dQw4w9WgXcQ", // Replace with actual video ID
    description: "Learn essential vocabulary for talking about your daily routine",
    episode: "Episode #45"
  },
  {
    id: "2",
    title: "Small Talk Essentials",
    youtubeId: "dQw4w9WgXcQ", // Replace with actual video ID
    description: "Master the art of small talk in English conversations",
    episode: "Episode #44"
  },
  {
    id: "3",
    title: "British Pronunciation Tips",
    youtubeId: "dQw4w9WgXcQ", // Replace with actual video ID
    description: "Perfect your British accent with these pronunciation tips",
    episode: "Episode #43"
  },
]

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free English Lessons
          </h1>
          <p className="text-lg text-gray-600">
            Watch our YouTube videos and practice with the shadowing method
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video bg-gray-200 relative">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-purple-600 font-medium mb-2">
                  {video.episode}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://www.youtube.com/@EnglishPodcastUnleashed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-full hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Subscribe on YouTube
          </a>
          <p className="text-gray-600 mt-4">
            New lessons every week!
          </p>
        </div>
      </div>
    </div>
  )
}