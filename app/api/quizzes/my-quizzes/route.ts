import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "lib/auth"
import { prisma } from "lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view your quizzes" },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.error('User not found for email:', session.user.email)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    console.log('Fetching quizzes for user:', user.id)

    // Get all orders for this user
    const userOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED'
      },
      select: {
        id: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            title: true,
            packs: {
              select: {
                id: true,
                title: true,
                quiz: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    passingScore: true,
                    _count: {
                      select: { questions: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log('Found orders:', userOrders.length)

    // Extract unique quizzes from purchased products
    const quizzesMap = new Map()
    
    for (const order of userOrders) {
      if (order.product?.packs) {
        for (const pack of order.product.packs) {
          if (pack.quiz && !quizzesMap.has(pack.quiz.id)) {
            // Get user's attempts for this quiz
            const attempts = await prisma.quizAttempt.findMany({
              where: {
                quizId: pack.quiz.id,
                userId: user.id
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5 // Last 5 attempts
            })

            const bestScore = attempts.length > 0 
              ? Math.max(...attempts.map(a => a.score))
              : null

            const lastAttempt = attempts[0] || null

            quizzesMap.set(pack.quiz.id, {
              quizId: pack.quiz.id,
              quizTitle: pack.quiz.title,
              quizDescription: pack.quiz.description,
              packId: pack.id,
              packTitle: pack.title,
              productTitle: order.product.title,
              questionCount: pack.quiz._count.questions,
              passingScore: pack.quiz.passingScore || 70,
              attempts: attempts.length,
              bestScore,
              lastAttemptDate: lastAttempt?.createdAt,
              isPassed: bestScore !== null && bestScore >= (pack.quiz.passingScore || 70),
              purchaseDate: order.createdAt
            })
          }
        }
      }
    }

    const quizzes = Array.from(quizzesMap.values())
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())

    console.log('Returning quizzes:', quizzes.length)

    return NextResponse.json({
      quizzes,
      totalQuizzes: quizzes.length,
      completedQuizzes: quizzes.filter(q => q.isPassed).length
    })

  } catch (error) {
    console.error("Error fetching user quizzes:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch quizzes", details: errorMessage },
      { status: 500 }
    )
  }
}