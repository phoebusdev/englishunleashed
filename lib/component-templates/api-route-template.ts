/**
 * API Route Template
 * 
 * This template provides a standard structure for Next.js API routes with
 * comprehensive error handling, validation, authentication, and documentation.
 * 
 * Endpoint: /api/[REPLACE: endpoint-path]
 * Purpose: [REPLACE: What this endpoint does]
 * 
 * Features:
 * - Request validation with Zod schemas
 * - Authentication and authorization checks
 * - Rate limiting protection
 * - Comprehensive error handling
 * - Standardized response format
 * - Database transaction support
 * - Audit logging
 * 
 * Security Considerations:
 * - CSRF protection for state-changing operations
 * - Input sanitization and validation
 * - SQL injection prevention via Prisma
 * - Rate limiting to prevent abuse
 * - Proper error messages (no data leakage)
 * 
 * @module app/api/[route]/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessLogicError,
  handleApiError,
  assert,
  ensureExists,
} from '@/lib/errors'
import { 
  validate,
  PaginationSchema,
  // [REPLACE: Import your schemas]
} from '@/lib/validation'
import { 
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
} from '@/lib/api/response'
import { devLog, startTimer } from '@/lib/dev-utils'
// import { rateLimit } from '@/lib/rate-limit' // Uncomment if using rate limiting
// import { validateCSRF } from '@/lib/csrf' // Uncomment for CSRF protection

/**
 * Request/Response Schemas
 * 
 * Define Zod schemas for request validation and response typing.
 * This ensures type safety and automatic validation.
 */

// [REPLACE: Define your request schemas]
const GetRequestSchema = z.object({
  // Query parameters for GET requests
  id: z.string().optional(),
  ...PaginationSchema.shape, // Include pagination if needed
})

const PostRequestSchema = z.object({
  // Body schema for POST requests
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  // Add more fields as needed
})

const PutRequestSchema = z.object({
  // Body schema for PUT requests
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
})

const DeleteRequestSchema = z.object({
  // Parameters for DELETE requests
  id: z.string(),
})

/**
 * Type definitions inferred from schemas
 */
type GetRequest = z.infer<typeof GetRequestSchema>
type PostRequest = z.infer<typeof PostRequestSchema>
type PutRequest = z.infer<typeof PutRequestSchema>
type DeleteRequest = z.infer<typeof DeleteRequestSchema>

/**
 * GET /api/[endpoint]
 * 
 * Retrieves resource(s) from the database.
 * 
 * Query Parameters:
 * - id: Optional resource ID for single item
 * - page: Page number for pagination (default: 1)
 * - limit: Items per page (default: 10)
 * - sort: Sort direction (asc/desc)
 * 
 * Response:
 * - 200: Success with data
 * - 401: Not authenticated
 * - 404: Resource not found
 * - 500: Server error
 * 
 * @example
 * GET /api/resource?page=1&limit=10
 * GET /api/resource?id=123
 */
export async function GET(request: NextRequest) {
  const timer = startTimer('GET /api/[endpoint]')
  
  try {
    // Step 1: Authentication check (if required)
    // Uncomment if endpoint requires authentication
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   throw new AuthenticationError('Authentication required')
    // }
    
    // Step 2: Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const params = validate(GetRequestSchema, searchParams)
    
    devLog.api('GET', request.url, params)
    
    // Step 3: Fetch data based on parameters
    if (params.id) {
      // Fetch single item
      const item = await prisma.model.findUnique({
        where: { id: params.id },
        // [REPLACE: Add your includes/selects]
      })
      
      // Ensure item exists
      const validItem = ensureExists(item, 'Resource')
      
      timer.end('Single item fetched')
      return successResponse(validItem, 'Resource retrieved successfully')
    }
    
    // Fetch paginated list
    const { page = 1, limit = 10, sort = 'desc' } = params
    const skip = (page - 1) * limit
    
    // Execute queries in parallel for performance
    const [items, total] = await Promise.all([
      prisma.model.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: sort },
        // [REPLACE: Add your includes/selects]
      }),
      prisma.model.count(),
    ])
    
    timer.end(`${items.length} items fetched`)
    return paginatedResponse(items, page, limit, total)
    
  } catch (error) {
    timer.end('Error occurred')
    return handleApiError(error, { 
      endpoint: 'GET /api/[endpoint]',
      request: { url: request.url }
    })
  }
}

/**
 * POST /api/[endpoint]
 * 
 * Creates a new resource.
 * 
 * Request Body: PostRequestSchema
 * 
 * Response:
 * - 201: Resource created successfully
 * - 400: Invalid input data
 * - 401: Not authenticated
 * - 403: Insufficient permissions
 * - 409: Resource already exists
 * - 500: Server error
 * 
 * @example
 * POST /api/resource
 * Body: { name: "Example", description: "..." }
 */
export async function POST(request: NextRequest) {
  const timer = startTimer('POST /api/[endpoint]')
  
  try {
    // Step 1: Authentication check
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new AuthenticationError('Authentication required')
    }
    
    // Step 2: CSRF protection (if needed)
    // await validateCSRF(request)
    
    // Step 3: Parse and validate request body
    const body = await request.json()
    const data = validate(PostRequestSchema, body)
    
    devLog.api('POST', request.url, data)
    
    // Step 4: Check for conflicts (e.g., duplicate names)
    // const existing = await prisma.model.findUnique({
    //   where: { name: data.name }
    // })
    // if (existing) {
    //   throw new ConflictError('Resource with this name already exists')
    // }
    
    // Step 5: Apply business logic validations
    // assert(
    //   data.someField > 0,
    //   'Field must be positive',
    //   BusinessLogicError
    // )
    
    // Step 6: Create resource in database (with transaction if needed)
    const created = await prisma.$transaction(async (tx) => {
      // Create main resource
      const resource = await tx.model.create({
        data: {
          ...data,
          userId: session.user.id, // Associate with user
          // [REPLACE: Map your data fields]
        },
      })
      
      // Create related records if needed
      // await tx.relatedModel.create({ ... })
      
      // Log audit trail
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE',
          resourceType: 'MODEL',
          resourceId: resource.id,
          metadata: JSON.stringify(data),
        },
      })
      
      return resource
    })
    
    timer.end('Resource created')
    
    // Step 7: Return success response
    return createdResponse(
      created,
      `/api/[endpoint]/${created.id}` // Location header
    )
    
  } catch (error) {
    timer.end('Error occurred')
    return handleApiError(error, {
      endpoint: 'POST /api/[endpoint]',
      userId: (await getServerSession(authOptions))?.user?.id,
    })
  }
}

/**
 * PUT /api/[endpoint]/[id]
 * 
 * Updates an existing resource.
 * 
 * Request Body: PutRequestSchema
 * 
 * Response:
 * - 200: Resource updated successfully
 * - 400: Invalid input data
 * - 401: Not authenticated
 * - 403: Insufficient permissions
 * - 404: Resource not found
 * - 500: Server error
 * 
 * @example
 * PUT /api/resource/123
 * Body: { name: "Updated Name" }
 */
export async function PUT(request: NextRequest) {
  const timer = startTimer('PUT /api/[endpoint]')
  
  try {
    // Step 1: Authentication check
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new AuthenticationError('Authentication required')
    }
    
    // Step 2: Parse and validate request
    const body = await request.json()
    const data = validate(PutRequestSchema, body)
    
    devLog.api('PUT', request.url, data)
    
    // Step 3: Check resource exists and user has permission
    const existing = await prisma.model.findUnique({
      where: { id: data.id },
    })
    
    const resource = ensureExists(existing, 'Resource')
    
    // Check ownership or admin permission
    // if (resource.userId !== session.user.id && !session.user.isAdmin) {
    //   throw new AuthorizationError('You can only edit your own resources')
    // }
    
    // Step 4: Apply business logic validations
    // Validate state transitions, business rules, etc.
    
    // Step 5: Update resource
    const updated = await prisma.$transaction(async (tx) => {
      // Update main resource
      const result = await tx.model.update({
        where: { id: data.id },
        data: {
          ...data,
          updatedAt: new Date(),
          // [REPLACE: Map your update fields]
        },
      })
      
      // Log audit trail
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE',
          resourceType: 'MODEL',
          resourceId: result.id,
          metadata: JSON.stringify({
            before: resource,
            after: data,
          }),
        },
      })
      
      return result
    })
    
    timer.end('Resource updated')
    return successResponse(updated, 'Resource updated successfully')
    
  } catch (error) {
    timer.end('Error occurred')
    return handleApiError(error, {
      endpoint: 'PUT /api/[endpoint]',
      userId: (await getServerSession(authOptions))?.user?.id,
    })
  }
}

/**
 * DELETE /api/[endpoint]/[id]
 * 
 * Deletes a resource.
 * 
 * Parameters:
 * - id: Resource ID to delete
 * 
 * Response:
 * - 204: Resource deleted successfully (no content)
 * - 401: Not authenticated
 * - 403: Insufficient permissions
 * - 404: Resource not found
 * - 409: Cannot delete due to dependencies
 * - 500: Server error
 * 
 * @example
 * DELETE /api/resource/123
 */
export async function DELETE(request: NextRequest) {
  const timer = startTimer('DELETE /api/[endpoint]')
  
  try {
    // Step 1: Authentication check
    const session = await getServerSession(authOptions)
    if (!session) {
      throw new AuthenticationError('Authentication required')
    }
    
    // Step 2: Parse parameters
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      throw new ValidationError('Resource ID is required')
    }
    
    const params = validate(DeleteRequestSchema, { id })
    
    devLog.api('DELETE', request.url, params)
    
    // Step 3: Check resource exists and user has permission
    const existing = await prisma.model.findUnique({
      where: { id: params.id },
      include: {
        // [REPLACE: Include related records to check dependencies]
        // relatedModel: true,
      },
    })
    
    const resource = ensureExists(existing, 'Resource')
    
    // Check ownership or admin permission
    // if (resource.userId !== session.user.id && !session.user.isAdmin) {
    //   throw new AuthorizationError('You can only delete your own resources')
    // }
    
    // Step 4: Check for dependencies that prevent deletion
    // if (resource.relatedModel && resource.relatedModel.length > 0) {
    //   throw new ConflictError('Cannot delete resource with existing dependencies')
    // }
    
    // Step 5: Delete resource (soft delete or hard delete)
    await prisma.$transaction(async (tx) => {
      // Option 1: Soft delete
      // await tx.model.update({
      //   where: { id: params.id },
      //   data: { deletedAt: new Date() }
      // })
      
      // Option 2: Hard delete
      await tx.model.delete({
        where: { id: params.id },
      })
      
      // Log audit trail
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE',
          resourceType: 'MODEL',
          resourceId: params.id,
          metadata: JSON.stringify(resource),
        },
      })
    })
    
    timer.end('Resource deleted')
    return noContentResponse()
    
  } catch (error) {
    timer.end('Error occurred')
    return handleApiError(error, {
      endpoint: 'DELETE /api/[endpoint]',
      userId: (await getServerSession(authOptions))?.user?.id,
    })
  }
}

/**
 * OPTIONS /api/[endpoint]
 * 
 * Returns allowed methods and CORS headers.
 * Used for CORS preflight requests.
 * 
 * Response:
 * - 204: No content with appropriate headers
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

/**
 * Helper Functions
 * 
 * Reusable logic for this endpoint.
 * Keep these close to where they're used.
 */

/**
 * Check if user owns the resource or is admin
 * 
 * @param resource - Resource to check
 * @param userId - User ID to check against
 * @param isAdmin - Whether user is admin
 * @throws {AuthorizationError} If user lacks permission
 */
function checkResourcePermission(
  resource: { userId: string },
  userId: string,
  isAdmin: boolean
): void {
  if (resource.userId !== userId && !isAdmin) {
    throw new AuthorizationError('Insufficient permissions for this resource')
  }
}

/**
 * Apply complex business logic validations
 * 
 * @param data - Data to validate
 * @param context - Additional context for validation
 * @throws {BusinessLogicError} If business rules are violated
 */
function validateBusinessRules(
  data: any,
  context: { user: any; existing?: any }
): void {
  // [REPLACE: Add your business logic validations]
  // Examples:
  // - Check state transitions
  // - Validate against external constraints
  // - Apply domain-specific rules
}