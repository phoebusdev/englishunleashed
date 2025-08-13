/**
 * Database Connection Management
 * 
 * This module manages the Prisma client instance for database operations.
 * It implements the singleton pattern to prevent multiple database connections
 * and supports both standard PostgreSQL and Prisma Accelerate connections.
 * 
 * Architecture Decisions:
 * - Singleton pattern: Prevents connection pool exhaustion in serverless environments
 * - Global storage: Survives hot reloads in development
 * - Prisma Accelerate: Automatic detection and configuration for edge deployments
 * - Conditional logging: Verbose in development, minimal in production
 * 
 * Environment Variables:
 * - DATABASE_URL: Connection string (PostgreSQL, SQLite, or Prisma Accelerate)
 *   Examples:
 *   - SQLite: "file:./dev.db"
 *   - PostgreSQL: "postgresql://user:pass@localhost:5432/db"
 *   - Prisma Accelerate: "prisma://accelerate.prisma-data.net/?api_key=..."
 * 
 * Usage:
 * ```typescript
 * import { prisma } from '@/lib/db'
 * 
 * // Simple query
 * const users = await prisma.user.findMany()
 * 
 * // With error handling
 * try {
 *   const user = await prisma.user.create({ data })
 * } catch (error) {
 *   // Handle Prisma errors
 * }
 * ```
 * 
 * @module lib/db
 */

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

/**
 * Type augmentation for Node.js global object
 * This allows us to store the Prisma client instance globally
 * to survive hot reloads in development
 */
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

/**
 * Creates and configures a Prisma client instance
 * 
 * Features:
 * - Automatic Prisma Accelerate detection
 * - Environment-specific logging
 * - Connection pool configuration
 * - Error handling setup
 * 
 * @returns Configured Prisma client instance
 * 
 * Implementation Notes:
 * - Prisma Accelerate URLs start with "prisma://" or "prisma+postgres://"
 * - Standard URLs use "postgresql://", "mysql://", or "file:" (SQLite)
 * - The client is configured differently based on the connection type
 */
function createPrismaClient() {
  // IMPORTANT: Check if we're using Prisma Accelerate
  // Prisma Accelerate provides connection pooling and caching at the edge
  // It requires a different client configuration
  const isAccelerate = process.env.DATABASE_URL?.startsWith('prisma') || 
                       process.env.DATABASE_URL?.startsWith('prisma+postgres')
  
  // Development logging for debugging connection issues
  // This helps identify database configuration problems early
  if (process.env.NODE_ENV === 'development') {
    console.log('[Database] Configuration:')
    console.log('  - URL configured:', !!process.env.DATABASE_URL)
    console.log('  - Using Prisma Accelerate:', isAccelerate)
    
    // Extract and log the host (without credentials) for debugging
    // This helps verify we're connecting to the right database
    if (process.env.DATABASE_URL) {
      try {
        const urlParts = process.env.DATABASE_URL.split('@')
        if (urlParts[1]) {
          const host = urlParts[1].split('/')[0]
          console.log('  - Database host:', host)
        }
      } catch (error) {
        // Silently ignore parsing errors for non-standard URLs
      }
    }
  }

  /**
   * Create the base Prisma client with appropriate logging
   * 
   * Logging levels:
   * - 'query': Log all SQL queries (very verbose, avoid in production)
   * - 'info': General information messages
   * - 'warn': Warning messages for potential issues
   * - 'error': Error messages for failures
   * 
   * In development: Show errors and warnings to catch issues early
   * In production: Only show errors to reduce log noise
   */
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    
    // Additional configuration could go here:
    // errorFormat: 'pretty', // Better error messages in development
    // datasources: { db: { url: process.env.DATABASE_URL } },
  })

  /**
   * Prisma Accelerate Extension
   * 
   * When using Prisma Accelerate:
   * - Adds automatic caching capabilities
   * - Provides connection pooling at the edge
   * - Reduces database load through intelligent query caching
   * - Improves performance for read-heavy workloads
   * 
   * The extension modifies the client to route queries through
   * Prisma's edge infrastructure instead of direct database connections
   */
  if (isAccelerate) {
    console.log('[Database] Configuring Prisma Accelerate extension')
    return client.$extends(withAccelerate())
  }

  // Return standard client for non-Accelerate connections
  return client
}

/**
 * Singleton Prisma client instance
 * 
 * Why singleton pattern?
 * - Prevents multiple database connections in serverless environments
 * - Reuses connection pool across requests
 * - Survives hot reloads in development (via global storage)
 * - Ensures consistent database state across the application
 * 
 * How it works:
 * 1. Check if a client already exists in global storage
 * 2. If not, create a new client and store it
 * 3. Return the existing or newly created client
 * 
 * IMPORTANT: This pattern is crucial for Next.js applications
 * to prevent "Too many database connections" errors
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

/**
 * Store the client in global storage for development
 * 
 * In development, Next.js hot reloads modules frequently
 * Without global storage, this would create a new database
 * connection on every reload, eventually exhausting the pool
 * 
 * In production, we don't store globally as the process
 * is long-lived and doesn't hot reload
 */
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Database Health Check
 * 
 * Use this function to verify database connectivity
 * Useful for health check endpoints and startup validation
 * 
 * @returns Promise that resolves to true if connected, false otherwise
 * 
 * @example
 * if (await isDatabaseConnected()) {
 *   console.log('Database is ready')
 * } else {
 *   console.error('Database connection failed')
 * }
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    // Execute a simple query to test the connection
    // $queryRaw is used to bypass any model-specific logic
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('[Database] Connection check failed:', error)
    return false
  }
}

/**
 * Graceful shutdown handler
 * 
 * Call this function when shutting down the application
 * to properly close database connections
 * 
 * @example
 * process.on('SIGTERM', async () => {
 *   await disconnectDatabase()
 *   process.exit(0)
 * })
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('[Database] Disconnected successfully')
  } catch (error) {
    console.error('[Database] Error during disconnect:', error)
    // Force exit even if disconnect fails
    process.exit(1)
  }
}