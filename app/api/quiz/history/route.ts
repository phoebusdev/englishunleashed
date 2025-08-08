import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const quizId = searchParams.get('quizId')

    const where = {
      userId: session.user.id,
      ...(quizId && { quizId })
    }

    const attempts = await prisma.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          include: {
            pack: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Get best score for each quiz
    const quizBestScores = await prisma.quizAttempt.groupBy({
      by: ['quizId'],
      where: {
        userId: session.user.id
      },
      _max: {
        score: true
      }
    })

    const bestScores = Object.fromEntries(
      quizBestScores.map(item => [item.quizId, item._max.score])
    )

    return NextResponse.json({ 
      attempts,
      bestScores 
    })
  } catch (error) {
    console.error('Error fetching quiz history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz history' },
      { status: 500 }
    )
  }
}