import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { generateToken } from '@/lib/password'

export async function POST(req: Request) {
  try {
    const { email } = await req.json() as { email: string }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json({ 
        success: true,
        message: 'If an account exists, a reset link has been sent' 
      })
    }

    // Check if user has a password (not a guest account)
    if (!user.password) {
      return NextResponse.json(
        { error: 'This account was created through checkout. Please create a password first.' },
        { status: 400 }
      )
    }

    // Generate reset token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    })

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    })

    // Send reset email
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ 
      success: true,
      message: 'Password reset link sent to your email' 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to send reset email' },
      { status: 500 }
    )
  }
}