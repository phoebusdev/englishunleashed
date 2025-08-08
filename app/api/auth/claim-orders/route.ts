import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "lib/auth"
import { prisma } from "lib/db"

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to claim orders" },
        { status: 401 }
      )
    }

    // Find all guest orders with matching email
    const guestOrders = await prisma.order.findMany({
      where: {
        customerEmail: session.user.email,
        userId: null, // Only unclaimed guest orders
      },
      include: {
        product: {
          include: {
            packs: {
              include: {
                quiz: true
              }
            }
          }
        }
      }
    })

    if (guestOrders.length === 0) {
      return NextResponse.json({
        message: "No guest orders found for this email",
        claimedCount: 0,
        quizzesUnlocked: []
      })
    }

    // Claim all guest orders
    const updateResult = await prisma.order.updateMany({
      where: {
        customerEmail: session.user.email,
        userId: null
      },
      data: {
        userId: session.user.id
      }
    })

    // Get list of quizzes now available
    const quizzesUnlocked = guestOrders
      .flatMap(order => order.product?.packs || [])
      .filter(pack => pack.quiz)
      .map(pack => ({
        packId: pack.id,
        packTitle: pack.title,
        quizId: pack.quiz?.id,
        quizTitle: pack.quiz?.title
      }))

    // Log the claim for analytics
    console.log(`User ${session.user.id} claimed ${updateResult.count} orders`)

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${updateResult.count} order(s)`,
      claimedCount: updateResult.count,
      quizzesUnlocked
    })

  } catch (error) {
    console.error("Error claiming orders:", error)
    return NextResponse.json(
      { error: "Failed to claim orders" },
      { status: 500 }
    )
  }
}