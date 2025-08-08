import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import { hashPassword, validatePassword } from '@/lib/password'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json() as {
      email: string
      password: string
      name: string
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Find guest user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      )
    }

    // Check if already has password
    if (user.password) {
      return NextResponse.json(
        { error: 'This account already has a password. Please sign in.' },
        { status: 400 }
      )
    }

    // Hash password and update user
    const hashedPassword = await hashPassword(password)
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        name: name || user.name,
        emailVerified: new Date()
      }
    })

    // Send welcome email
    await sendWelcomeEmail(email, name)

    return NextResponse.json({ 
      success: true,
      message: 'Account secured successfully' 
    })
  } catch (error) {
    console.error('Secure account error:', error)
    return NextResponse.json(
      { error: 'Failed to secure account' },
      { status: 500 }
    )
  }
}