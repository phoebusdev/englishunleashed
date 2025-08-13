import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  // Check if we're using Prisma Accelerate (URL starts with prisma:// or prisma+postgres://)
  const isAccelerate = process.env.DATABASE_URL?.startsWith('prisma') || 
                       process.env.DATABASE_URL?.startsWith('prisma+postgres')
  
  // Log database connection info (without exposing credentials)
  if (process.env.NODE_ENV === 'development') {
    console.log('Database URL configured:', !!process.env.DATABASE_URL)
    console.log('Using Prisma Accelerate:', isAccelerate)
    if (process.env.DATABASE_URL) {
      const urlParts = process.env.DATABASE_URL.split('@')
      if (urlParts[1]) {
        console.log('Database host:', urlParts[1].split('/')[0])
      }
    }
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  // If using Prisma Accelerate, extend with the Accelerate extension
  if (isAccelerate) {
    return client.$extends(withAccelerate())
  }

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}