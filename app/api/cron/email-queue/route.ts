import { NextRequest, NextResponse } from 'next/server'
import { processEmailQueue } from 'lib/email'

// This endpoint can be called by Vercel Cron or any external cron service
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('📧 Processing email queue...')
    
    // Process up to 20 emails at a time
    const result = await processEmailQueue(20)
    
    console.log(`✅ Email queue processed: ${result.processed} sent, ${result.failed} failed`)
    
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Email queue cron error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process email queue',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}