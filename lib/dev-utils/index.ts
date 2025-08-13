/**
 * Development Utilities
 * 
 * This module provides utilities specifically for development and debugging.
 * These tools help developers understand code flow, catch errors early,
 * and maintain code quality during development.
 * 
 * IMPORTANT: Most of these utilities are stripped out in production builds
 * to avoid performance overhead and security risks.
 * 
 * Features:
 * - Enhanced logging with context
 * - Performance monitoring
 * - Type checking utilities
 * - Development assertions
 * - Test data generators
 * - Debugging helpers
 * 
 * @module lib/dev-utils
 */

/**
 * Check if we're in development mode
 * Used to conditionally enable development-only features
 */
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'
export const isTest = process.env.NODE_ENV === 'test'

/**
 * Enhanced console logger with context and formatting
 * 
 * Features:
 * - Colored output for different log levels
 * - Timestamp inclusion
 * - Context object support
 * - Stack trace for errors
 * - Conditional logging based on environment
 * 
 * @example
 * devLog.info('User logged in', { userId: user.id, email: user.email })
 * devLog.error('Payment failed', error, { orderId, amount })
 */
export const devLog = {
  /**
   * Log general information
   * Blue color in terminal
   */
  info: (message: string, ...args: any[]) => {
    if (!isDevelopment) return
    console.log(
      `\x1b[34m[INFO ${new Date().toISOString()}]\x1b[0m ${message}`,
      ...args
    )
  },

  /**
   * Log success messages
   * Green color in terminal
   */
  success: (message: string, ...args: any[]) => {
    if (!isDevelopment) return
    console.log(
      `\x1b[32m[SUCCESS ${new Date().toISOString()}]\x1b[0m ${message}`,
      ...args
    )
  },

  /**
   * Log warning messages
   * Yellow color in terminal
   */
  warn: (message: string, ...args: any[]) => {
    if (!isDevelopment) return
    console.warn(
      `\x1b[33m[WARN ${new Date().toISOString()}]\x1b[0m ${message}`,
      ...args
    )
  },

  /**
   * Log error messages with stack trace
   * Red color in terminal
   */
  error: (message: string, error?: Error | unknown, ...args: any[]) => {
    if (!isDevelopment) return
    console.error(
      `\x1b[31m[ERROR ${new Date().toISOString()}]\x1b[0m ${message}`,
      error,
      ...args
    )
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
  },

  /**
   * Log debug information (verbose)
   * Cyan color in terminal
   */
  debug: (message: string, ...args: any[]) => {
    if (!isDevelopment || !process.env.DEBUG) return
    console.debug(
      `\x1b[36m[DEBUG ${new Date().toISOString()}]\x1b[0m ${message}`,
      ...args
    )
  },

  /**
   * Log API requests and responses
   * Useful for debugging external service integrations
   */
  api: (method: string, url: string, data?: any, response?: any) => {
    if (!isDevelopment) return
    console.log(
      `\x1b[35m[API ${new Date().toISOString()}]\x1b[0m ${method} ${url}`
    )
    if (data) console.log('  Request:', data)
    if (response) console.log('  Response:', response)
  },

  /**
   * Log database queries (supplement to Prisma logging)
   * Useful for understanding query patterns
   */
  db: (operation: string, model: string, data?: any, result?: any) => {
    if (!isDevelopment) return
    console.log(
      `\x1b[36m[DB ${new Date().toISOString()}]\x1b[0m ${operation} ${model}`
    )
    if (data) console.log('  Data:', data)
    if (result) console.log('  Result:', result)
  },
}

/**
 * Performance monitoring utility
 * Measures execution time of functions and code blocks
 * 
 * @example
 * const timer = startTimer('API call')
 * const result = await fetch('/api/data')
 * timer.end() // Logs: "[PERF] API call took 234ms"
 */
export function startTimer(label: string) {
  if (!isDevelopment) {
    return { end: () => {} } // No-op in production
  }

  const start = performance.now()
  
  return {
    end: (additionalInfo?: string) => {
      const duration = performance.now() - start
      const color = duration < 100 ? '\x1b[32m' : duration < 500 ? '\x1b[33m' : '\x1b[31m'
      console.log(
        `${color}[PERF]\x1b[0m ${label} took ${duration.toFixed(2)}ms${
          additionalInfo ? ` - ${additionalInfo}` : ''
        }`
      )
      return duration
    },
    
    checkpoint: (checkpointName: string) => {
      const duration = performance.now() - start
      console.log(
        `\x1b[36m[PERF]\x1b[0m ${label} - ${checkpointName}: ${duration.toFixed(2)}ms`
      )
    },
  }
}

/**
 * Development-only assertion
 * Throws an error if condition is false
 * Completely removed in production builds
 * 
 * @param condition - Condition to assert
 * @param message - Error message if assertion fails
 * 
 * @example
 * devAssert(user !== null, 'User must exist at this point')
 * devAssert(price > 0, 'Price must be positive')
 */
export function devAssert(condition: unknown, message: string): asserts condition {
  if (!isDevelopment) return
  
  if (!condition) {
    const error = new Error(`Assertion failed: ${message}`)
    error.name = 'AssertionError'
    
    // Capture stack trace for better debugging
    Error.captureStackTrace(error, devAssert)
    
    // Log the error with context
    devLog.error('Assertion failed', error)
    
    throw error
  }
}

/**
 * Type checking utilities for runtime validation
 * Useful for catching type errors early in development
 */
export const typeCheck = {
  /**
   * Check if value is a non-null object
   */
  isObject: (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  },

  /**
   * Check if value is a non-empty string
   */
  isNonEmptyString: (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0
  },

  /**
   * Check if value is a valid email format
   */
  isEmail: (value: unknown): value is string => {
    if (typeof value !== 'string') return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  /**
   * Check if value is a valid UUID
   */
  isUuid: (value: unknown): value is string => {
    if (typeof value !== 'string') return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  },

  /**
   * Check if value is a valid CUID
   */
  isCuid: (value: unknown): value is string => {
    if (typeof value !== 'string') return false
    return value.startsWith('c') && value.length === 25
  },

  /**
   * Check if value is within a numeric range
   */
  isInRange: (value: unknown, min: number, max: number): value is number => {
    return typeof value === 'number' && value >= min && value <= max
  },
}

/**
 * Test data generators for development and testing
 * Creates realistic fake data for various entities
 */
export const testData = {
  /**
   * Generate a random user object
   */
  user: (overrides?: Partial<any>) => ({
    id: `test_user_${Math.random().toString(36).substr(2, 9)}`,
    email: `test${Date.now()}@example.com`,
    name: `Test User ${Math.floor(Math.random() * 1000)}`,
    password: 'TestPassword123!',
    isAdmin: false,
    emailVerified: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Generate a random product object
   */
  product: (overrides?: Partial<any>) => ({
    id: `test_product_${Math.random().toString(36).substr(2, 9)}`,
    title: `Test Product ${Math.floor(Math.random() * 1000)}`,
    description: 'This is a test product description',
    price: Math.floor(Math.random() * 10000) + 100, // 1-100 dollars in cents
    type: 'PACK',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Generate a random order object
   */
  order: (userId: string, productId: string, overrides?: Partial<any>) => ({
    id: `test_order_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    productId,
    amount: Math.floor(Math.random() * 10000) + 100,
    status: 'COMPLETED',
    stripeId: `pi_test_${Math.random().toString(36).substr(2, 16)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  /**
   * Generate random quiz data
   */
  quiz: (packId: string, overrides?: Partial<any>) => ({
    id: `test_quiz_${Math.random().toString(36).substr(2, 9)}`,
    packId,
    title: `Test Quiz ${Math.floor(Math.random() * 1000)}`,
    description: 'This is a test quiz',
    passingScore: 70,
    questions: [
      {
        id: `q1_${Date.now()}`,
        text: 'What is the correct answer?',
        options: JSON.stringify([
          { id: 'a', text: 'Option A' },
          { id: 'b', text: 'Option B' },
          { id: 'c', text: 'Correct Option' },
          { id: 'd', text: 'Option D' },
        ]),
        correctAnswer: 'c',
        order: 0,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
}

/**
 * Pretty print objects for debugging
 * Provides colored and formatted output
 * 
 * @param obj - Object to print
 * @param label - Optional label for the output
 */
export function prettyPrint(obj: unknown, label?: string): void {
  if (!isDevelopment) return
  
  if (label) {
    console.log(`\x1b[35m${label}:\x1b[0m`)
  }
  
  console.dir(obj, {
    colors: true,
    depth: null,
    maxArrayLength: null,
  })
}

/**
 * Memory usage logger
 * Helps identify memory leaks during development
 */
export function logMemoryUsage(label?: string): void {
  if (!isDevelopment) return
  
  const usage = process.memoryUsage()
  const format = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`
  
  console.log(
    `\x1b[33m[MEMORY${label ? ` - ${label}` : ''}]\x1b[0m`,
    `RSS: ${format(usage.rss)},`,
    `Heap: ${format(usage.heapUsed)}/${format(usage.heapTotal)},`,
    `External: ${format(usage.external)}`
  )
}

/**
 * Delay execution for testing async flows
 * Only works in development/test environments
 * 
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function devDelay(ms: number): Promise<void> {
  if (isProduction) return Promise.resolve()
  
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock API response for testing
 * Simulates API latency and potential errors
 * 
 * @param data - Data to return
 * @param options - Mock options
 */
export async function mockApiResponse<T>(
  data: T,
  options: {
    delay?: number
    errorRate?: number
    errorMessage?: string
  } = {}
): Promise<T> {
  if (isProduction) return data
  
  const { delay = 500, errorRate = 0, errorMessage = 'Mock API error' } = options
  
  // Simulate network delay
  await devDelay(delay)
  
  // Randomly throw errors based on error rate
  if (Math.random() < errorRate) {
    throw new Error(errorMessage)
  }
  
  return data
}

/**
 * Inspect function arguments and return value
 * Useful for debugging function calls
 * 
 * @param fn - Function to wrap
 * @param label - Label for logging
 */
export function inspectFunction<T extends (...args: any[]) => any>(
  fn: T,
  label: string = fn.name || 'Anonymous'
): T {
  if (isProduction) return fn
  
  return ((...args: Parameters<T>) => {
    console.log(`\x1b[36m[CALL ${label}]\x1b[0m Arguments:`, args)
    
    const result = fn(...args)
    
    if (result instanceof Promise) {
      return result.then(value => {
        console.log(`\x1b[32m[RETURN ${label}]\x1b[0m Result:`, value)
        return value
      }).catch(error => {
        console.log(`\x1b[31m[ERROR ${label}]\x1b[0m Error:`, error)
        throw error
      })
    }
    
    console.log(`\x1b[32m[RETURN ${label}]\x1b[0m Result:`, result)
    return result
  }) as T
}

/**
 * Environment variable checker
 * Validates that required environment variables are set
 * 
 * @param required - Array of required variable names
 * @param optional - Array of optional variable names to check
 */
export function checkEnvVars(
  required: string[],
  optional: string[] = []
): void {
  if (isProduction) return // Don't expose env details in production
  
  const missing: string[] = []
  const present: string[] = []
  const notSet: string[] = []
  
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key)
    } else {
      present.push(key)
    }
  })
  
  optional.forEach(key => {
    if (!process.env[key]) {
      notSet.push(key)
    } else {
      present.push(key)
    }
  })
  
  if (missing.length > 0) {
    console.error('\x1b[31m[ENV] Missing required environment variables:\x1b[0m')
    missing.forEach(key => console.error(`  - ${key}`))
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  if (present.length > 0) {
    console.log('\x1b[32m[ENV] Environment variables set:\x1b[0m')
    present.forEach(key => console.log(`  ✓ ${key}`))
  }
  
  if (notSet.length > 0) {
    console.log('\x1b[33m[ENV] Optional variables not set:\x1b[0m')
    notSet.forEach(key => console.log(`  - ${key}`))
  }
}