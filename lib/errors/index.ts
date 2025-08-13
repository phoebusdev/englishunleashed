/**
 * Centralized Error Handling System
 * 
 * This module provides a comprehensive error handling system for the entire application.
 * It ensures consistent error responses, proper logging, and user-friendly messages.
 * 
 * Architecture:
 * - AppError: Base class for all application errors
 * - Specific error types for different scenarios
 * - Error serialization for API responses
 * - Development vs production error details
 * 
 * Usage Examples:
 * ```typescript
 * // Throwing a validation error
 * throw new ValidationError('Invalid email format', { field: 'email', value: email })
 * 
 * // Throwing an auth error
 * throw new AuthenticationError('Invalid credentials')
 * 
 * // Handling errors in API routes
 * try {
 *   // ... operation
 * } catch (error) {
 *   return handleApiError(error)
 * }
 * ```
 * 
 * @module lib/errors
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Base error class for all application errors
 * 
 * Features:
 * - Preserves stack trace
 * - Categorizes errors by type
 * - Includes metadata for debugging
 * - Provides user-friendly messages
 * 
 * All custom errors should extend this class
 */
export class AppError extends Error {
  /**
   * HTTP status code for this error
   * Used when converting to API response
   */
  statusCode: number
  
  /**
   * Error code for client-side handling
   * Allows frontend to show specific UI based on error type
   */
  code: string
  
  /**
   * Whether this error should be reported to error tracking
   * Set to false for expected errors (validation, auth, etc.)
   */
  isOperational: boolean
  
  /**
   * Additional context for debugging
   * Can include user ID, request ID, etc.
   */
  metadata?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    metadata?: Record<string, any>
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.metadata = metadata

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
    
    // Set the name to the class name for better debugging
    this.name = this.constructor.name
  }

  /**
   * Converts error to JSON for API responses
   * Excludes sensitive information in production
   */
  toJSON() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      // Only include metadata and stack in development
      ...(isDevelopment && {
        metadata: this.metadata,
        stack: this.stack,
      }),
    }
  }
}

/**
 * Validation Error - 400 Bad Request
 * 
 * Thrown when:
 * - Input data fails validation
 * - Required fields are missing
 * - Data format is incorrect
 * 
 * Examples:
 * - Invalid email format
 * - Password too short
 * - Invalid date format
 */
export class ValidationError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', true, metadata)
  }
}

/**
 * Authentication Error - 401 Unauthorized
 * 
 * Thrown when:
 * - User is not logged in
 * - Session has expired
 * - Invalid credentials provided
 * 
 * Security: Never reveal if email exists or password is wrong
 * Always use generic "Invalid credentials" message
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', metadata?: Record<string, any>) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, metadata)
  }
}

/**
 * Authorization Error - 403 Forbidden
 * 
 * Thrown when:
 * - User lacks required permissions
 * - Attempting to access admin resources
 * - Resource ownership check fails
 * 
 * Different from AuthenticationError:
 * - User IS logged in but lacks permission
 * - vs User is NOT logged in
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', metadata?: Record<string, any>) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, metadata)
  }
}

/**
 * Not Found Error - 404 Not Found
 * 
 * Thrown when:
 * - Requested resource doesn't exist
 * - Database query returns null
 * - File not found
 * 
 * Security: Be careful not to reveal existence of sensitive resources
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', metadata?: Record<string, any>) {
    super(`${resource} not found`, 404, 'NOT_FOUND', true, metadata)
  }
}

/**
 * Conflict Error - 409 Conflict
 * 
 * Thrown when:
 * - Duplicate entry (email already exists)
 * - Resource state conflict
 * - Concurrent modification detected
 */
export class ConflictError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 409, 'CONFLICT_ERROR', true, metadata)
  }
}

/**
 * Rate Limit Error - 429 Too Many Requests
 * 
 * Thrown when:
 * - API rate limit exceeded
 * - Too many failed login attempts
 * - Spam detection triggered
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', metadata?: Record<string, any>) {
    super(message, 429, 'RATE_LIMIT_ERROR', true, metadata)
  }
}

/**
 * External Service Error - 503 Service Unavailable
 * 
 * Thrown when:
 * - Stripe API is down
 * - Database connection fails
 * - Email service unavailable
 * 
 * These errors should trigger alerts and may need manual intervention
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(
      `External service error: ${service}`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      false, // Not operational - needs investigation
      { service, originalError: originalError?.message }
    )
  }
}

/**
 * Payment Error - 402 Payment Required
 * 
 * Thrown when:
 * - Payment processing fails
 * - Insufficient funds
 * - Invalid payment method
 * - Subscription expired
 */
export class PaymentError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 402, 'PAYMENT_ERROR', true, metadata)
  }
}

/**
 * Business Logic Error - 422 Unprocessable Entity
 * 
 * Thrown when:
 * - Business rule violation
 * - Invalid state transition
 * - Precondition not met
 * 
 * Examples:
 * - Can't submit quiz twice
 * - Can't purchase already owned item
 * - Can't delete user with active orders
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', true, metadata)
  }
}

/**
 * Handles errors in API routes and returns appropriate response
 * 
 * Features:
 * - Converts all errors to consistent format
 * - Logs errors for debugging
 * - Hides sensitive information in production
 * - Handles Zod validation errors specially
 * 
 * @param error - The error to handle
 * @param context - Additional context for logging
 * @returns NextResponse with appropriate status and message
 */
export function handleApiError(error: unknown, context?: Record<string, any>): NextResponse {
  // Log error with context for debugging
  console.error('[API Error]', {
    error,
    context,
    timestamp: new Date().toISOString(),
    // Include request details if available
    ...(context?.request && {
      method: context.request.method,
      url: context.request.url,
    }),
  })

  // Handle Zod validation errors specially
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    )
  }

  // Handle our custom AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === 'development' && {
          metadata: error.metadata,
          stack: error.stack,
        }),
      },
      { status: error.statusCode }
    )
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'field'
      return NextResponse.json(
        {
          error: `${field} already exists`,
          code: 'DUPLICATE_ENTRY',
        },
        { status: 409 }
      )
    }
    
    // Record not found
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      )
    }
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    const isDevelopment = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        error: isDevelopment ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(isDevelopment && {
          name: error.name,
          stack: error.stack,
        }),
      },
      { status: 500 }
    )
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        details: String(error),
      }),
    },
    { status: 500 }
  )
}

/**
 * Type guard to check if an error is operational
 * Operational errors are expected and don't indicate bugs
 * Non-operational errors should trigger alerts
 * 
 * @param error - Error to check
 * @returns True if error is operational
 */
export function isOperationalError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

/**
 * Wraps an async function to catch and handle errors
 * Useful for wrapping API route handlers
 * 
 * @param fn - Async function to wrap
 * @returns Wrapped function that handles errors
 * 
 * @example
 * export const GET = withErrorHandler(async (req) => {
 *   // Your logic here
 *   return NextResponse.json({ data })
 * })
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T> | NextResponse> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      return handleApiError(error, { 
        function: fn.name,
        args: args.length > 0 ? 'provided' : 'none' 
      })
    }
  }
}

/**
 * Creates a safe version of a function that returns a Result type
 * Instead of throwing, returns { success: false, error } or { success: true, data }
 * 
 * Useful for operations where you want to handle errors explicitly
 * 
 * @example
 * const safeParseJSON = createSafeFunction(JSON.parse)
 * const result = safeParseJSON('{"valid": "json"}')
 * if (result.success) {
 *   console.log(result.data)
 * } else {
 *   console.error(result.error)
 * }
 */
export function createSafeFunction<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => 
  | { success: true; data: ReturnType<T> }
  | { success: false; error: Error } {
  return (...args: Parameters<T>) => {
    try {
      const result = fn(...args)
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }
}

/**
 * Asserts a condition and throws if false
 * Provides better error messages than regular assertions
 * 
 * @param condition - Condition to check
 * @param message - Error message if condition is false
 * @param ErrorClass - Error class to throw (defaults to AppError)
 * 
 * @example
 * assert(user !== null, 'User must exist', NotFoundError)
 * assert(price > 0, 'Price must be positive', ValidationError)
 */
export function assert(
  condition: unknown,
  message: string,
  ErrorClass: typeof AppError = AppError
): asserts condition {
  if (!condition) {
    throw new ErrorClass(message)
  }
}

/**
 * Ensures a value is not null or undefined
 * Throws NotFoundError if value is nullish
 * 
 * @param value - Value to check
 * @param resourceName - Name of the resource for error message
 * @returns The non-null value
 * 
 * @example
 * const user = ensureExists(await findUser(id), 'User')
 */
export function ensureExists<T>(
  value: T | null | undefined,
  resourceName: string = 'Resource'
): T {
  if (value === null || value === undefined) {
    throw new NotFoundError(resourceName)
  }
  return value
}

/**
 * Default error messages for common scenarios
 * Ensures consistent messaging across the application
 */
export const ErrorMessages = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  ACCOUNT_LOCKED: 'Account has been locked due to multiple failed attempts',
  
  // Authorization
  ADMIN_ONLY: 'This action requires administrator privileges',
  OWNER_ONLY: 'You can only modify your own resources',
  SUBSCRIPTION_REQUIRED: 'This feature requires an active subscription',
  
  // Validation
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
  TOO_SHORT: (field: string, min: number) => `${field} must be at least ${min} characters`,
  TOO_LONG: (field: string, max: number) => `${field} must be at most ${max} characters`,
  
  // Business Logic
  ALREADY_EXISTS: (resource: string) => `${resource} already exists`,
  CANNOT_DELETE: (resource: string) => `Cannot delete ${resource} with existing dependencies`,
  INVALID_STATE: (action: string) => `Cannot ${action} in current state`,
  
  // External Services
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  EMAIL_FAILED: 'Failed to send email. Please contact support.',
  DATABASE_ERROR: 'Database operation failed. Please try again.',
  
  // Generic
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again later.',
  NOT_IMPLEMENTED: 'This feature is not yet implemented',
} as const