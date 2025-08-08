import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Count records in each table
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const packCount = await prisma.pack.count()
    const orderCount = await prisma.order.count()
    
    // Get sample data
    const sampleUsers = await prisma.user.findMany({
      take: 2,
      select: {
        email: true,
        isAdmin: true,
        createdAt: true,
      }
    })
    
    const sampleProducts = await prisma.product.findMany({
      take: 2,
      select: {
        title: true,
        price: true,
        active: true,
      }
    })
    
    const samplePacks = await prisma.pack.findMany({
      take: 3,
      select: {
        title: true,
        videoId: true,
        hasPdf: true,
      }
    })
    
    return NextResponse.json({
      status: 'connected',
      database: {
        url: process.env.DATABASE_URL ? 'Set' : 'Not set',
        urlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
      },
      counts: {
        users: userCount,
        products: productCount,
        packs: packCount,
        orders: orderCount,
      },
      samples: {
        users: sampleUsers,
        products: sampleProducts,
        packs: samplePacks,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      }
    })
  } catch (error: any) {
    console.error('Database debug error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack,
      database: {
        url: process.env.DATABASE_URL ? 'Set' : 'Not set',
        urlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
      }
    }, { status: 500 })
  }
}