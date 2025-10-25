import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, validatePassword } from '@/lib/password'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Apply rate limiting (5 requests per 15 minutes)
  const rateLimitResult = await rateLimit(req, 'auth')
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const { token, password } = await req.json() as {
      token: string
      password: string
    }

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join('. ') },
        { status: 400 }
      )
    }

    // Find valid reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordReset.delete({
        where: { id: resetToken.id }
      })
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
        emailVerified: new Date() // Verify email if not already
      }
    })

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully' 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}