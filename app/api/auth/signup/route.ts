import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import { hashPassword, validatePassword } from '@/lib/password'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Apply rate limiting (5 requests per 15 minutes)
  const rateLimitResult = await rateLimit(req, 'auth')
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const { name, email, password } = await req.json() as {
      name: string
      email: string
      password: string
    }

    // Validate input
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      // If it's a guest account (no password), allow upgrade
      if (!existingUser.password) {
        const hashedPassword = await hashPassword(password)
        
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            name: name || existingUser.name,
            emailVerified: new Date() // Mark as verified since they had purchases
          }
        })

        // Send welcome email
        await sendWelcomeEmail(email, name)

        return NextResponse.json({ 
          success: true, 
          message: 'Guest account upgraded successfully',
          isUpgrade: true 
        })
      } else {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Create new user
    const hashedPassword = await hashPassword(password)
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        emailVerified: new Date() // For now, auto-verify. Later can add email verification
      }
    })

    // Send welcome email
    await sendWelcomeEmail(email, name)

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully' 
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}