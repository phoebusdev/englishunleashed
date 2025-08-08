import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notifyContentReady } from '@/lib/notifications'

interface QuizQuestion {
  text: string
  options: string[]
  correctAnswer: string
  explanation?: string
  order: number
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      packId: string
      title: string
      description: string
      questions: QuizQuestion[]
    }
    const { packId, title, description, questions } = body

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        packId,
        title,
        description,
        questions: {
          create: questions.map((q: QuizQuestion) => ({
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: q.order,
          })),
        },
      },
      include: {
        questions: true,
      },
    })

    // Update pack to indicate quiz is available
    await prisma.pack.update({
      where: { id: packId },
      data: { hasQuiz: true },
    })

    // Notify users who have already purchased
    await notifyContentReady(packId, 'quiz')

    return NextResponse.json({ quiz })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      id: string
      title: string
      description: string
      questions: QuizQuestion[]
    }
    const { id, title, description, questions } = body

    // Delete existing questions
    await prisma.question.deleteMany({
      where: { quizId: id },
    })

    // Update quiz with new questions
    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        description,
        questions: {
          create: questions.map((q: QuizQuestion) => ({
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: q.order,
          })),
        },
      },
      include: {
        questions: true,
      },
    })

    return NextResponse.json({ quiz })
  } catch (error) {
    console.error('Error updating quiz:', error)
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    )
  }
}