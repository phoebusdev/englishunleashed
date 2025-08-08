interface OrderEmailData {
  customerName?: string | null
  customerEmail: string
  packTitle: string
  orderId: string
  userId: string
  isGuest: boolean
}

export function getOrderConfirmationEmail(data: OrderEmailData) {
  const downloadToken = Buffer.from(`${data.orderId}:${data.userId}`).toString('base64')
  const downloadUrl = `${process.env.NEXTAUTH_URL}/api/download/${data.orderId}?token=${downloadToken}`

  return {
    subject: `Your English Unleashed Pack: ${data.packTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Thank you for your purchase!</h1>
        
        <p>Hi ${data.customerName || 'there'},</p>
        
        <p>You've successfully purchased: <strong>${data.packTitle}</strong></p>
        
        <h2 style="color: #1e40af;">Access Your Content</h2>
        
        <p>Click the link below to download your PDF:</p>
        <a href="${downloadUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download PDF</a>
        
        ${data.isGuest ? `
          <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 16px; margin: 24px 0; border-radius: 6px;">
            <p style="margin: 0;"><strong>⚠️ Important:</strong> This download link expires in 24 hours. Create a free account to get permanent access and unlock quizzes!</p>
            <a href="${process.env.NEXTAUTH_URL}/register" style="color: #1e40af;">Create Account →</a>
          </div>
        ` : `
          <p>You can also access your purchases anytime by logging into your account.</p>
        `}
        
        <p>If you have any questions, please don't hesitate to reach out.</p>
        
        <p>Happy learning!<br>
        The English Unleashed Team</p>
      </div>
    `,
    text: `
Thank you for your purchase!

You've successfully purchased: ${data.packTitle}

Access your content here: ${downloadUrl}

${data.isGuest ? 'Note: This link expires in 24 hours. Create an account for permanent access!' : ''}

Happy learning!
The English Unleashed Team
    `.trim()
  }
}

export function getContentReadyEmail(packTitle: string, contentType: 'pdf' | 'quiz') {
  return {
    subject: `Your ${contentType.toUpperCase()} is now available - ${packTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Great news!</h1>
        
        <p>The ${contentType} for <strong>${packTitle}</strong> is now available.</p>
        
        <p>Log into your account to access it:</p>
        <a href="${process.env.NEXTAUTH_URL}/account" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Your Content</a>
        
        <p>Happy learning!<br>
        The English Unleashed Team</p>
      </div>
    `,
    text: `
Great news!

The ${contentType} for ${packTitle} is now available.

Log into your account to access it: ${process.env.NEXTAUTH_URL}/account

Happy learning!
The English Unleashed Team
    `.trim()
  }
}