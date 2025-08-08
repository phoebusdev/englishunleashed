import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { QuizTaker } from './QuizTaker'

export default async function QuizPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    redirect('/login')
  }

  // Get the pack and check if user has access
  const pack = await prisma.pack.findUnique({
    where: { id },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { order: 'asc' }
          }
        }
      },
      product: {
        include: {
          orders: {
            where: {
              userId: user.id,
              status: 'COMPLETED'
            }
          }
        }
      }
    }
  })

  if (!pack || !pack.quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h1>
            <p className="text-gray-600 mb-6">This quiz doesn't exist or hasn't been created yet.</p>
            <a href="/account" className="text-[#20b2aa] hover:text-[#0f8080] font-medium">
              Back to Account
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has purchased this pack
  const hasAccess = pack.product.orders.length > 0

  if (!hasAccess && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
            <p className="text-gray-600 mb-6">You need to purchase this pack to access the quiz.</p>
            <a href="/shop" className="text-[#20b2aa] hover:text-[#0f8080] font-medium">
              Browse Products
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <QuizTaker 
          quiz={pack.quiz} 
          userId={user.id}
          packTitle={pack.title}
        />
      </div>
    </div>
  )
}