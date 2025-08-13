/**
 * Standardized API Response Utilities
 * 
 * This module provides consistent response formatting for all API endpoints,
 * ensuring predictable response structures that AI assistants can easily understand.
 * 
 * Response Structure:
 * - Success: { success: true, data: T, message?: string }
 * - Error: { success: false, error: string, details?: any }
 * 
 * Benefits:
 * - Consistent response format across all endpoints
 * - Type-safe response creation
 * - Built-in status codes for common scenarios
 * - Detailed error information in development
 * 
 * @module lib/api/response
 */

import { NextResponse } from 'next/server'

/**
 * Standard API Response Types
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  metadata?: {
    timestamp: string
    requestId?: string
    [key: string]: any
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
  stack?: string // Only in development
  metadata?: {
    timestamp: string
    requestId?: string
    [key: string]: any
  }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Create standardized API responses
 * 
 * @example
 * ```typescript
 * // Success response
 * return createApiResponse.success({ user: userData })
 * 
 * // Error response
 * return createApiResponse.error('User not found', 404)
 * 
 * // With additional metadata
 * return createApiResponse.success(data, 'Operation completed', { requestId: '123' })
 * ```
 */
export const createApiResponse = {
  /**
   * Create a success response
   * 
   * @param data - The response data
   * @param message - Optional success message
   * @param metadata - Optional metadata
   * @param status - HTTP status code (default: 200)
   */
  success: <T = any>(
    data: T,
    message?: string,
    metadata?: Record<string, any>,
    status = 200
  ): NextResponse<ApiSuccessResponse<T>> => {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }
    
    return NextResponse.json(response, { status })
  },

  /**
   * Create an error response
   * 
   * @param error - Error message
   * @param status - HTTP status code (default: 400)
   * @param code - Optional error code for client handling
   * @param details - Additional error details
   */
  error: (
    error: string,
    status = 400,
    code?: string,
    details?: any
  ): NextResponse<ApiErrorResponse> => {
    const response: ApiErrorResponse = {
      success: false,
      error,
      ...(code && { code }),
      ...(details && { details }),
      metadata: {
        timestamp: new Date().toISOString()
      }
    }
    
    // Add stack trace in development only
    if (process.env.NODE_ENV === 'development' && details instanceof Error) {
      response.stack = details.stack
    }
    
    return NextResponse.json(response, { status })
  },

  /**
   * Common error responses with predefined messages and status codes
   */
  
  /**
   * 400 Bad Request - Invalid input data
   */
  badRequest: (
    message = 'Invalid request data',
    details?: any
  ): NextResponse<ApiErrorResponse> => {
    return createApiResponse.error(message, 400, 'BAD_REQUEST', details)
  },

  /**
   * 401 Unauthorized - Authentication required
   */
  unauthorized: (
    message = 'Authentication required'
  ): NextResponse<ApiErrorResponse> => {
    return createApiResponse.error(message, 401, 'UNAUTHORIZED')
  },

  /**
   * 403 Forbidden - Insufficient permissions
   */
  forbidden: (
    message = 'Insufficient permissions'
  ): NextResponse<ApiErrorResponse> => {
    return createApiResponse.error(message, 403, 'FORBIDDEN')
  },

  /**
   * 404 Not Found - Resource doesn't exist
   */
  notFound: (
    resource = 'Resource',
    id?: string
  ): NextResponse<ApiErrorResponse> => {
    const message = id 
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`
    return createApiResponse.error(message, 404, 'NOT_FOUND')
  },

  /**
   * 409 Conflict - Resource already exists
   */
  conflict: (
    message = 'Resource already exists'
  ): NextResponse<ApiErrorResponse> => {
    return createApiResponse.error(message, 409, 'CONFLICT')
  },

  /**
   * 422 Unprocessable Entity - Validation failed
   */
  validationError: (
    errors: Record<string, string[]> | string
  ): NextResponse<ApiErrorResponse> => {
    const message = typeof errors === 'string' 
      ? errors 
      : 'Validation failed'
    const details = typeof errors === 'object' ? errors : undefined
    
    return createApiResponse.error(
      message,
      422,
      'VALIDATION_ERROR',
      details
    )
  },

  /**
   * 429 Too Many Requests - Rate limit exceeded
   */
  rateLimited: (
    retryAfter?: number
  ): NextResponse<ApiErrorResponse> => {
    const response = createApiResponse.error(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMITED',
      { retryAfter }
    )
    
    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString())
    }
    
    return response
  },

  /**
   * 500 Internal Server Error - Unexpected error
   */
  serverError: (
    message = 'An unexpected error occurred',
    error?: Error
  ): NextResponse<ApiErrorResponse> => {
    // Log the full error server-side
    console.error('[API] Server error:', error)
    
    // Don't expose internal error details in production
    const details = process.env.NODE_ENV === 'development' 
      ? { message: error?.message, stack: error?.stack }
      : undefined
    
    return createApiResponse.error(
      message,
      500,
      'INTERNAL_ERROR',
      details
    )
  },

  /**
   * 503 Service Unavailable - Service temporarily down
   */
  serviceUnavailable: (
    message = 'Service temporarily unavailable'
  ): NextResponse<ApiErrorResponse> => {
    return createApiResponse.error(message, 503, 'SERVICE_UNAVAILABLE')
  }
}

/**
 * Helper function to handle different error types consistently
 * 
 * @param error - The error to handle
 * @returns Appropriate error response based on error type
 * 
 * @example
 * ```typescript
 * try {
 *   // API logic
 * } catch (error) {
 *   return handleApiError(error)
 * }
 * ```
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'name' in error) {
    if (error.name === 'ZodError') {
      const zodError = error as any
      const errors: Record<string, string[]> = {}
      
      zodError.errors?.forEach((err: any) => {
        const path = err.path.join('.')
        if (!errors[path]) errors[path] = []
        errors[path].push(err.message)
      })
      
      return createApiResponse.validationError(errors)
    }
  }
  
  // Handle known Error instances
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('Unauthorized')) {
      return createApiResponse.unauthorized()
    }
    
    if (error.message.includes('Not found')) {
      return createApiResponse.notFound()
    }
    
    if (error.message.includes('Rate limit')) {
      return createApiResponse.rateLimited()
    }
    
    // Default to server error
    return createApiResponse.serverError(
      'An unexpected error occurred',
      error
    )
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return createApiResponse.error(error, 500)
  }
  
  // Unknown error type
  return createApiResponse.serverError('An unexpected error occurred')
}

/**
 * Wrap an API handler with standard error handling
 * 
 * @param handler - The API handler function
 * @returns Wrapped handler with error handling
 * 
 * @example
 * ```typescript
 * export const GET = withErrorHandling(async (request) => {
 *   // Your API logic here
 *   return createApiResponse.success(data)
 * })
 * ```
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }) as T
}

/**
 * Create a typed API response handler
 * 
 * @example
 * ```typescript
 * interface UserData {
 *   id: string
 *   name: string
 * }
 * 
 * const response = createTypedResponse<UserData>()
 * return response.success({ id: '1', name: 'John' })
 * ```
 */
export function createTypedResponse<T>() {
  return {
    success: (data: T, message?: string, metadata?: Record<string, any>) =>
      createApiResponse.success<T>(data, message, metadata),
    error: createApiResponse.error,
    ...createApiResponse
  }
}