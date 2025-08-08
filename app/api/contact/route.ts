import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendContactEmail } from 'lib/email'
import { rateLimit, rateLimitResponse } from 'lib/rate-limit'

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000)
})

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, 'contact')
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }
  
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate input
    const validation = contactSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.flatten() 
        },
        { status: 400 }
      )
    }

    const { name, email, message } = validation.data

    // Basic spam prevention - check for common spam patterns
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|prize|winner)\b/i,
      /\b(click here|buy now|order now|limited time)\b/i,
      /https?:\/\/[^\s]+/g // URLs in message (you can adjust this based on your needs)
    ]
    
    const isSpam = spamPatterns.some(pattern => pattern.test(message))
    if (isSpam) {
      // Still return success to avoid giving spammers feedback
      return NextResponse.json({ 
        success: true, 
        message: 'Thank you for your message. We\'ll get back to you soon!' 
      })
    }

    // Send email
    const emailResult = await sendContactEmail({
      name,
      email,
      message
    })

    if (!emailResult.success) {
      console.error('Failed to send contact email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      )
    }

    // Also send a confirmation to the user
    const { sendEmail, emailTemplates } = await import('lib/email')
    const confirmationTemplate = {
      subject: 'We received your message - English Unleashed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #20b2aa;">Thank you for contacting us!</h1>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap; margin-top: 10px;">${message}</p>
          </div>
          <p>Best regards,<br>The English Unleashed Team</p>
        </div>
      `,
      text: `Thank you for contacting us, ${name}! We've received your message and will get back to you soon.`
    }

    await sendEmail({
      to: email,
      ...confirmationTemplate
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message. We\'ll get back to you soon!' 
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}