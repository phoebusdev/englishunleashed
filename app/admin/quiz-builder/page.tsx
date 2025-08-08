import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import QuizBuilder from './QuizBuilder'

export default async function QuizBuilderPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user?.isAdmin) {
    redirect('/account')
  }

  // Get all packs for the admin to choose from
  const packs = await prisma.pack.findMany({
    include: {
      product: true,
      quiz: {
        include: {
          questions: {
            orderBy: { order: 'asc' }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Builder</h1>
          <p className="mt-2 text-gray-600">
            Create and manage quizzes for your educational packs
          </p>
        </div>

        <QuizBuilder packs={packs} />
      </div>
    </div>
  )
}