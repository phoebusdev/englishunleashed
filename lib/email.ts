import { Resend } from 'resend'
import { env } from 'env.mjs'
import { prisma } from './db'

// Initialize Resend client
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  priority?: number
  scheduledFor?: Date
  metadata?: Record<string, unknown>
}

const FROM_EMAIL = 'noreply@englishunleashed.com'
const SITE_NAME = 'English Unleashed'
const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: `Welcome to ${SITE_NAME}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #20b2aa;">Welcome to ${SITE_NAME}, ${name || 'there'}!</h1>
        <p>Thank you for creating an account. You now have access to:</p>
        <ul>
          <li>Your complete purchase history</li>
          <li>Downloadable PDFs for all your packs</li>
          <li>Quiz progress tracking</li>
          <li>Lifetime access to your content</li>
        </ul>
        <p>
          <a href="${SITE_URL}/account" style="display: inline-block; background: linear-gradient(135deg, #20b2aa 0%, #ff6b8a 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px;">
            View Your Account
          </a>
        </p>
      </div>
    `,
    text: `Welcome to ${SITE_NAME}, ${name || 'there'}! Thank you for creating an account. Visit ${SITE_URL}/account to access your content.`
  }),

  passwordReset: (resetUrl: string) => ({
    subject: `Reset your ${SITE_NAME} password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #20b2aa;">Password Reset Request</h1>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #20b2aa 0%, #ff6b8a 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 12px;">Or copy this link: ${resetUrl}</p>
      </div>
    `,
    text: `Reset your password by visiting: ${resetUrl}. This link will expire in 1 hour.`
  }),

  purchase: (orderDetails: { packTitle: string; amount: string; hasAccount: boolean; downloadUrl?: string }) => ({
    subject: `Your ${SITE_NAME} purchase confirmation`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #20b2aa;">Thank you for your purchase!</h1>
        <p>You've successfully purchased:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px 0;">${orderDetails.packTitle}</h2>
          <p style="font-size: 24px; color: #20b2aa; margin: 0;">${orderDetails.amount}</p>
        </div>
        ${!orderDetails.hasAccount ? `
          <div style="background: #e6f7ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">🎯 Secure Your Purchase</h3>
            <p>Create a free account to:</p>
            <ul>
              <li>Access your content anytime (not just 24 hours)</li>
              <li>Track your quiz progress</li>
              <li>Re-download PDFs whenever needed</li>
            </ul>
            <p>
              <a href="${SITE_URL}/account/secure?email=${encodeURIComponent(orderDetails.downloadUrl || '')}" style="display: inline-block; background: linear-gradient(135deg, #20b2aa 0%, #ff6b8a 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px;">
                Create Free Account
              </a>
            </p>
          </div>
        ` : ''}
        ${orderDetails.downloadUrl ? `
          <p>
            <a href="${orderDetails.downloadUrl}" style="display: inline-block; background: #20b2aa; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px;">
              Download Your Content
            </a>
          </p>
          ${!orderDetails.hasAccount ? '<p style="color: #666; font-size: 14px;">⏰ This link expires in 24 hours</p>' : ''}
        ` : ''}
      </div>
    `,
    text: `Thank you for purchasing ${orderDetails.packTitle} for ${orderDetails.amount}. ${orderDetails.downloadUrl ? `Download at: ${orderDetails.downloadUrl}` : ''}`
  }),

  guestUpgrade: (email: string, tempPassword: string) => ({
    subject: `Your ${SITE_NAME} account is ready!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #20b2aa;">Your Account Has Been Secured!</h1>
        <p>Great news! We've upgraded your guest purchase to a full account.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p style="color: #ff6b8a; font-weight: bold;">⚠️ Please change your password after logging in!</p>
        <p>
          <a href="${SITE_URL}/login" style="display: inline-block; background: linear-gradient(135deg, #20b2aa 0%, #ff6b8a 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px;">
            Login to Your Account
          </a>
        </p>
      </div>
    `,
    text: `Your account has been secured! Email: ${email}, Temporary Password: ${tempPassword}. Please change your password after logging in at ${SITE_URL}/login`
  }),

  contact: (details: { name: string; email: string; message: string }) => ({
    subject: `New Contact Form Submission - ${SITE_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #20b2aa;">New Contact Form Submission</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Name:</strong> ${details.name}</p>
          <p><strong>Email:</strong> ${details.email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${details.message}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          Reply directly to this email to respond to ${details.name}.
        </p>
      </div>
    `,
    text: `New contact from ${details.name} (${details.email}): ${details.message}`
  }),
}

// Main email sending function
export async function sendEmail(options: EmailOptions) {
  const { to, subject, html, text } = options

  // In development without API key, just log to console
  if (!resend) {
    console.log('📧 Email would be sent:')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('From:', FROM_EMAIL)
    if (process.env.NODE_ENV === 'development') {
      console.log('---')
      console.log('HTML Preview:', html.substring(0, 200) + '...')
      console.log('---')
    }
    return { success: true, id: 'dev-' + Date.now() }
  }

  // Production: Use Resend SDK
  try {
    const { data, error } = await resend.emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '').trim(), // Strip HTML for text version
    })

    if (error) {
      throw new Error(error.message || 'Failed to send email')
    }

    console.log('✅ Email sent successfully:', data?.id)
    return { success: true, id: data?.id || 'unknown' }
  } catch (error) {
    console.error('❌ Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper functions
export async function sendWelcomeEmail(email: string, name?: string) {
  const template = emailTemplates.welcome(name || '')
  return sendEmail({
    to: email,
    ...template
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${token}`
  const template = emailTemplates.passwordReset(resetUrl)
  return sendEmail({
    to: email,
    ...template
  })
}

export async function sendPurchaseEmail(
  email: string, 
  orderDetails: { 
    packTitle: string
    amount: string
    hasAccount: boolean
    downloadUrl?: string 
  }
) {
  const template = emailTemplates.purchase(orderDetails)
  return sendEmail({
    to: email,
    ...template
  })
}

export async function sendGuestUpgradeEmail(email: string, tempPassword: string) {
  const template = emailTemplates.guestUpgrade(email, tempPassword)
  return sendEmail({
    to: email,
    ...template
  })
}

export async function sendContactEmail(details: { name: string; email: string; message: string }) {
  const template = emailTemplates.contact(details)
  
  // Send to admin email (you can change this to your admin email)
  const adminEmail = 'admin@englishunleashed.com'
  
  return sendEmail({
    to: adminEmail,
    ...template
  })
}

// Email Queue Functions

/**
 * Queue an email for sending
 */
export async function queueEmail(options: EmailOptions) {
  const { to, subject, html, text, priority = 0, scheduledFor = new Date(), metadata } = options
  
  try {
    const email = await prisma.emailQueue.create({
      data: {
        to,
        from: `${SITE_NAME} <${FROM_EMAIL}>`,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '').trim(),
        priority,
        scheduledFor,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    })
    
    console.log('📧 Email queued:', email.id)
    return { success: true, id: email.id }
  } catch (error) {
    console.error('❌ Failed to queue email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Process email queue - typically called by a cron job
 */
export async function processEmailQueue(limit = 10) {
  if (!resend) {
    console.log('⚠️ Email processing skipped: No Resend API key configured')
    return { processed: 0, failed: 0 }
  }
  
  let processed = 0
  let failed = 0
  
  try {
    // Get pending emails
    const emails = await prisma.emailQueue.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: new Date()
        },
        attempts: {
          lt: 3 // Max 3 attempts
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit
    })
    
    // Process each email
    for (const email of emails) {
      try {
        // Mark as processing
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { 
            status: 'PROCESSING',
            attempts: { increment: 1 }
          }
        })
        
        // Send email
        const { data, error } = await resend.emails.send({
          from: email.from || `${SITE_NAME} <${FROM_EMAIL}>`,
          to: [email.to],
          subject: email.subject,
          html: email.html,
          text: email.text || undefined,
        })
        
        if (error) {
          throw new Error(error.message || 'Failed to send email')
        }
        
        // Mark as sent
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { 
            status: 'SENT',
            sentAt: new Date()
          }
        })
        
        processed++
        console.log('✅ Email sent:', email.id, data?.id)
      } catch (error) {
        failed++
        console.error('❌ Email send failed:', email.id, error)
        
        // Mark as failed or back to pending
        const isFinalAttempt = email.attempts >= 2 // Already incremented above
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { 
            status: isFinalAttempt ? 'FAILED' : 'PENDING',
            lastError: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    }
    
    return { processed, failed }
  } catch (error) {
    console.error('❌ Email queue processing error:', error)
    return { processed, failed, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Queue helper functions
 */
export async function queueWelcomeEmail(email: string, name?: string) {
  const template = emailTemplates.welcome(name || '')
  return queueEmail({
    to: email,
    ...template,
    priority: 1 // Higher priority for welcome emails
  })
}

export async function queuePasswordResetEmail(email: string, token: string) {
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${token}`
  const template = emailTemplates.passwordReset(resetUrl)
  return queueEmail({
    to: email,
    ...template,
    priority: 2 // Highest priority for password resets
  })
}

export async function queuePurchaseEmail(
  email: string, 
  orderDetails: { 
    packTitle: string
    amount: string
    hasAccount: boolean
    downloadUrl?: string 
  }
) {
  const template = emailTemplates.purchase(orderDetails)
  return queueEmail({
    to: email,
    ...template,
    priority: 1, // Higher priority for purchase confirmations
    metadata: { orderId: orderDetails.downloadUrl }
  })
}

/**
 * Get email queue stats
 */
export async function getEmailQueueStats() {
  const [pending, sent, failed] = await Promise.all([
    prisma.emailQueue.count({ where: { status: 'PENDING' } }),
    prisma.emailQueue.count({ where: { status: 'SENT' } }),
    prisma.emailQueue.count({ where: { status: 'FAILED' } }),
  ])
  
  return { pending, sent, failed, total: pending + sent + failed }
}