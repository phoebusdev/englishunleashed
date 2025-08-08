import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "lib/auth"
import { QuizzesDashboard } from "./QuizzesDashboard"

export const metadata: Metadata = {
  title: "My Quizzes - English Unleashed",
  description: "Access your quizzes and track your learning progress",
}

export default async function MyQuizzesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login?callbackUrl=/account/quizzes')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
          <p className="mt-2 text-gray-600">
            Test your knowledge and track your progress with interactive quizzes
          </p>
        </div>

        <QuizzesDashboard />
      </div>
    </div>
  )
}