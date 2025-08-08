import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from 'lib/auth'
import { prisma } from 'lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ emailId: string }> }
) {
  try {
    const { emailId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Reset email to pending status
    const email = await prisma.emailQueue.update({
      where: { id: emailId },
      data: {
        status: 'PENDING',
        attempts: 0,
        lastError: null,
        scheduledFor: new Date() // Schedule for immediate processing
      }
    })

    return NextResponse.json({ 
      success: true, 
      email 
    })
  } catch (error) {
    console.error('Retry email error:', error)
    return NextResponse.json(
      { error: 'Failed to retry email' },
      { status: 500 }
    )
  }
}