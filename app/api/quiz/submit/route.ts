import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      quizId: string
      score: number
      answers: Record<string, string>
    }
    const { quizId, score, answers } = body

    // Verify user has access to this quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        pack: {
          include: {
            product: {
              include: {
                orders: {
                  where: {
                    userId: session.user.id,
                    status: 'COMPLETED',
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!quiz || quiz.pack.product.orders.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        score,
        answers,
      },
    })

    return NextResponse.json({ attempt })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}