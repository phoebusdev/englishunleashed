import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  // Disable in production for security
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints not available in production' },
      { status: 404 }
    )
  }

  const session = await getServerSession(authOptions)
  
  return NextResponse.json({
    session,
    timestamp: new Date().toISOString()
  })
}