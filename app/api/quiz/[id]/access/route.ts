import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "lib/auth"
import { prisma } from "lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { hasAccess: false, reason: "Not authenticated" },
        { status: 401 }
      )
    }

    const quizId = params.id

    // Check if user has purchased a product containing this quiz
    const userOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: 'completed',
        product: {
          packs: {
            some: {
              quizId: quizId
            }
          }
        }
      },
      include: {
        product: {
          include: {
            packs: {
              where: {
                quizId: quizId
              },
              include: {
                quiz: true
              }
            }
          }
        }
      }
    })

    if (userOrders.length === 0) {
      return NextResponse.json({
        hasAccess: false,
        reason: "You haven't purchased this quiz"
      })
    }

    // Get quiz details and user's attempts
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    })

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: quizId,
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const bestScore = attempts.length > 0 
      ? Math.max(...attempts.map(a => a.score))
      : null

    return NextResponse.json({
      hasAccess: true,
      quiz: {
        id: quiz?.id,
        title: quiz?.title,
        description: quiz?.description,
        questionCount: quiz?._count.questions,
        passingScore: quiz?.passingScore
      },
      userProgress: {
        attempts: attempts.length,
        bestScore,
        lastAttempt: attempts[0] || null,
        isPassed: bestScore ? bestScore >= (quiz?.passingScore || 70) : false
      },
      purchaseInfo: {
        productTitle: userOrders[0].product?.title,
        packTitle: userOrders[0].product?.packs[0]?.title,
        purchaseDate: userOrders[0].createdAt
      }
    })

  } catch (error) {
    console.error("Error checking quiz access:", error)
    return NextResponse.json(
      { hasAccess: false, reason: "Error checking access" },
      { status: 500 }
    )
  }
}