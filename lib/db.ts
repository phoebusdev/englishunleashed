import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log database connection info (without exposing credentials)
if (process.env.NODE_ENV === 'development') {
  console.log('Database URL configured:', !!process.env.DATABASE_URL)
  if (process.env.DATABASE_URL) {
    const urlParts = process.env.DATABASE_URL.split('@')
    if (urlParts[1]) {
      console.log('Database host:', urlParts[1].split('/')[0])
    }
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma