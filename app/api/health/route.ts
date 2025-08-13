import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const health = {
    status: 'checking',
    database: false,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    errors: [] as string[],
    details: {} as Record<string, any>
  }

  try {
    // Check database connection
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const queryTime = Date.now() - startTime
    
    health.database = true
    health.details.queryTime = `${queryTime}ms`
    
    // Try to count products
    try {
      const productCount = await prisma.product.count()
      health.details.productCount = productCount
    } catch (error) {
      health.errors.push(`Product table error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
    
    // Try to count packs
    try {
      const packCount = await prisma.pack.count()
      health.details.packCount = packCount
    } catch (error) {
      health.errors.push(`Pack table error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
    
    // Check environment variables
    health.details.hasDatabase = !!process.env.DATABASE_URL
    health.details.databaseProvider = process.env.DATABASE_URL?.startsWith('file:') ? 'sqlite' : 
                                      process.env.DATABASE_URL?.includes('postgres') ? 'postgresql' : 
                                      'unknown'
    
    health.status = health.errors.length === 0 ? 'healthy' : 'degraded'
    
  } catch (error) {
    health.database = false
    health.status = 'unhealthy'
    health.errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    // Log detailed error for debugging
    console.error('[Health Check] Database error:', error)
  }
  
  // Return appropriate status code
  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 206 : 503
  
  return NextResponse.json(health, { status: statusCode })
}