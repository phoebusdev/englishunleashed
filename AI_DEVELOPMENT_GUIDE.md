# AI Development Guide - English Unleashed

## 🎯 Purpose
This guide optimizes the English Unleashed codebase for AI-assisted development, ensuring maximum clarity, predictability, and safety when working with AI tools like Claude, GitHub Copilot, or other LLM-based assistants.

## 🚀 Recent Refactoring (AI-Friendly Updates)
The codebase has been comprehensively refactored for optimal AI readability:
- **Centralized Error Handling**: `/lib/errors` - Comprehensive error system with typed errors
- **Validation Schemas**: `/lib/validation` - Zod schemas for all data structures
- **Development Utilities**: `/lib/dev-utils` - Enhanced logging and debugging tools
- **Component Templates**: `/lib/component-templates` - Reusable patterns with documentation
- **API Response Standards**: `/lib/api/response` - Consistent API response formatting

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Code Patterns & Conventions](#code-patterns--conventions)
4. [Common Modification Scenarios](#common-modification-scenarios)
5. [Safety Checks & Validation](#safety-checks--validation)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [AI Assistant Tips](#ai-assistant-tips)

## Quick Start

### Essential Commands
```bash
# 1. Install dependencies
pnpm install

# 2. Set up local database
pnpm db:push

# 3. Create admin user (required for admin panel)
pnpm seed:admin

# 4. Start development server
pnpm dev

# 5. Always validate changes before committing
pnpm typecheck && pnpm lint && pnpm build
```

### Environment Setup Checklist
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `DATABASE_URL` (SQLite for local: `file:./dev.db`)
- [ ] Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
- [ ] Set `NEXTAUTH_URL` to `http://localhost:3000`
- [ ] Configure Stripe keys (optional for payments)
- [ ] Configure YouTube API (optional for video sync)

## Architecture Overview

### Tech Stack Layers
```
┌─────────────────────────────────────────┐
│           Frontend (React 19)           │
│    • Server Components (default)        │
│    • Client Components (use client)     │
│    • Tailwind CSS v4 for styling       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Next.js 15 App Router              │
│    • File-based routing                 │
│    • API Routes in /app/api             │
│    • Middleware for auth                │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Business Logic Layer            │
│    • /lib - Core utilities              │
│    • /hooks - React hooks               │
│    • /components - Reusable UI          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          Data Access Layer              │
│    • Prisma ORM                         │
│    • SQLite (dev) / PostgreSQL (prod)   │
│    • Type-safe database queries         │
└─────────────────────────────────────────┘
```

### Directory Structure Explained
```
/app                      # Next.js App Router
  /(public)              # Public pages (no auth required)
    /page.tsx           # Homepage
    /shop               # Product listing
    /videos             # Video gallery
  /account               # User dashboard (auth required)
    /page.tsx           # Account overview
    /quizzes            # Quiz history
  /admin                 # Admin panel (admin auth required)
    /page.tsx           # Admin dashboard
    /quiz-builder       # Quiz creation tool
  /api                   # Backend API routes
    /auth               # Authentication endpoints
    /admin              # Admin-only endpoints
    /webhooks           # External service webhooks
    /cron               # Scheduled jobs

/components              # Reusable UI components
  /Button               # Each component in its own folder
  /Navigation           # With .tsx and optional .stories.tsx
  /VideoPlayer          # And component-specific styles

/lib                     # Core business logic
  /errors               # Centralized error handling
  /validation           # Zod validation schemas
  /dev-utils            # Development utilities
  /component-templates  # Reusable component patterns
  /api                  # API utilities
  /auth.ts              # NextAuth configuration
  /db.ts                # Database client singleton
  /stripe.ts            # Payment processing
  /youtube.ts           # Video API integration
  /validation/          # Zod schemas for data validation

/prisma
  /schema.prisma        # Database schema definition
```

## Code Patterns & Conventions

### 1. API Route Pattern
Every API route MUST follow this structure for consistency:

```typescript
/**
 * API Route: [Description of what this endpoint does]
 * Method: [GET/POST/PUT/DELETE]
 * Auth: [public/user/admin]
 * 
 * Business Logic:
 * - [Step 1 description]
 * - [Step 2 description]
 * 
 * Error Cases:
 * - 401: User not authenticated
 * - 403: Insufficient permissions
 * - 404: Resource not found
 * - 400: Invalid request data
 * - 500: Server error
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateRequest } from '@/lib/validation/request'
import { apiErrorHandler } from '@/lib/api/error-handler'
import { createApiResponse } from '@/lib/api/response'
import { z } from 'zod'

// Define request schema for type safety and validation
const requestSchema = z.object({
  // Define expected fields with validation rules
  field1: z.string().min(1, "Field1 is required"),
  field2: z.number().positive("Field2 must be positive"),
})

export async function POST(request: Request) {
  try {
    // Step 1: Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return createApiResponse.unauthorized('Please log in to continue')
    }

    // Step 2: Parse and validate request body
    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    // Step 3: Business logic with detailed comments
    // Explain WHY we're doing each operation
    
    // Step 4: Return standardized response
    return createApiResponse.success({
      message: 'Operation completed successfully',
      data: result,
    })
    
  } catch (error) {
    // Comprehensive error handling with context
    return apiErrorHandler(error, {
      context: 'endpoint_name',
      userId: session?.user?.id,
    })
  }
}
```

### 2. Component Pattern
All components MUST be documented and type-safe:

```typescript
/**
 * ComponentName - [Brief description]
 * 
 * Purpose: [Why this component exists]
 * Usage: [Where and how it's used]
 * 
 * @example
 * ```tsx
 * <ComponentName 
 *   prop1="value"
 *   prop2={123}
 *   onAction={(data) => console.log(data)}
 * />
 * ```
 */

import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

// Define component variants using CVA for consistency
const componentVariants = cva(
  // Base classes that always apply
  'base-classes-here',
  {
    variants: {
      variant: {
        primary: 'primary-styles',
        secondary: 'secondary-styles',
      },
      size: {
        sm: 'small-size-styles',
        md: 'medium-size-styles',
        lg: 'large-size-styles',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    }
  }
)

// Define prop types with JSDoc comments
export interface ComponentNameProps 
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof componentVariants> {
  /** Required prop description */
  requiredProp: string
  
  /** Optional prop description with default */
  optionalProp?: number
  
  /** Callback fired when action occurs */
  onAction?: (data: ActionData) => void
}

export function ComponentName({
  requiredProp,
  optionalProp = 42,
  onAction,
  variant,
  size,
  className,
  ...props
}: ComponentNameProps) {
  // Component implementation with clear logic flow
  
  // Early returns for edge cases
  if (!requiredProp) {
    console.warn('ComponentName: requiredProp is required')
    return null
  }
  
  // Main render logic
  return (
    <div 
      className={twMerge(componentVariants({ variant, size }), className)}
      {...props}
    >
      {/* Component content */}
    </div>
  )
}
```

### 3. Database Query Pattern
All database operations MUST include error handling and logging:

```typescript
/**
 * Fetches [resource] with related data
 * 
 * @param id - The resource identifier
 * @param includeRelations - Whether to include related data
 * @returns The resource with optional relations
 * @throws {NotFoundError} If resource doesn't exist
 * @throws {DatabaseError} If query fails
 */
export async function getResourceById(
  id: string,
  includeRelations = false
): Promise<Resource> {
  // Validate input
  if (!id || typeof id !== 'string') {
    throw new ValidationError('Invalid resource ID provided')
  }

  try {
    // Build query with conditional includes
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: includeRelations ? {
        relatedItems: true,
        owner: true,
        metadata: true,
      } : undefined,
    })

    // Check if resource exists
    if (!resource) {
      throw new NotFoundError(`Resource with ID ${id} not found`)
    }

    // Log successful query for debugging
    console.log(`[DB] Successfully fetched resource: ${id}`)
    
    return resource
    
  } catch (error) {
    // Log error with context
    console.error(`[DB] Failed to fetch resource ${id}:`, error)
    
    // Re-throw with additional context
    if (error instanceof PrismaClientKnownRequestError) {
      throw new DatabaseError(
        `Database query failed: ${error.code}`,
        { originalError: error, resourceId: id }
      )
    }
    
    throw error
  }
}
```

### 4. State Management Pattern
Use clear, predictable state management:

```typescript
/**
 * Custom hook for managing [feature] state
 * 
 * Handles:
 * - Loading states
 * - Error handling
 * - Data caching
 * - Optimistic updates
 */
export function useFeature(initialData?: FeatureData) {
  // State declarations with clear naming
  const [data, setData] = useState<FeatureData | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Memoized values to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!data) return null
    // Processing logic here
    return processData(data)
  }, [data])
  
  // Action handlers with error boundaries
  const updateFeature = useCallback(async (updates: Partial<FeatureData>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Optimistic update
      setData(prev => prev ? { ...prev, ...updates } : null)
      
      // API call
      const response = await api.updateFeature(updates)
      
      // Update with server response
      setData(response.data)
      
    } catch (err) {
      // Rollback optimistic update
      setData(initialData || null)
      
      // Set error state
      setError(err instanceof Error ? err : new Error('Unknown error'))
      
      // Log for debugging
      console.error('[useFeature] Update failed:', err)
      
    } finally {
      setIsLoading(false)
    }
  }, [initialData])
  
  return {
    data: processedData,
    isLoading,
    error,
    actions: {
      update: updateFeature,
      reset: () => setData(initialData || null),
    }
  }
}
```

## Common Modification Scenarios

### Adding a New API Endpoint
1. Create route file in `/app/api/[feature]/route.ts`
2. Copy template from `/lib/templates/api-route.template.ts`
3. Define Zod schema for request validation
4. Implement business logic with comments
5. Add error handling using `apiErrorHandler`
6. Test with: `curl http://localhost:3000/api/[feature]`

### Adding a New Page
1. Create folder in `/app/[route]/`
2. Add `page.tsx` with metadata export
3. Implement loading state in `loading.tsx`
4. Add error boundary in `error.tsx`
5. Test authentication if required
6. Update navigation components

### Adding a New Component
1. Create folder in `/components/[ComponentName]/`
2. Copy template from `/lib/templates/component.template.tsx`
3. Define CVA variants for styling
4. Add TypeScript interfaces
5. Write JSDoc with examples
6. Create Storybook story if interactive
7. Test with: `pnpm storybook`

### Modifying Database Schema
1. Edit `/prisma/schema.prisma`
2. Run `pnpm db:push` to update dev database
3. Generate types: `pnpm prisma generate`
4. Create migration for production
5. Update seed scripts if needed
6. Test queries in Prisma Studio: `pnpm db:studio`

## Safety Checks & Validation

### Pre-Commit Checklist
Always run these before committing:
```bash
# Type checking - catches type errors
pnpm typecheck

# Linting - ensures code quality
pnpm lint

# Build test - verifies production build
pnpm build

# Format code - maintains consistency
pnpm prettier:fix
```

### Security Validations
- [ ] All user inputs validated with Zod schemas
- [ ] SQL injection prevented via Prisma parameterized queries
- [ ] XSS prevented via React's automatic escaping
- [ ] CSRF tokens used for state-changing operations
- [ ] Rate limiting applied to authentication endpoints
- [ ] Environment variables validated at startup
- [ ] File uploads restricted by type and size
- [ ] API routes check authentication and authorization

### Data Validation Patterns
```typescript
// Always validate external data
import { z } from 'zod'

// Define strict schemas
const userInputSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(100).optional(),
})

// Parse with error handling
try {
  const validated = userInputSchema.parse(untrustedInput)
  // Safe to use validated data
} catch (error) {
  if (error instanceof z.ZodError) {
    // Return specific validation errors
    return { errors: error.errors }
  }
}
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Database Connection Errors
```bash
# Error: Database connection failed
# Solution 1: Check DATABASE_URL in .env.local
# Solution 2: Reset database
rm prisma/dev.db
pnpm db:push
pnpm seed:admin
```

#### Build Failures
```bash
# Error: Build failed with type errors
# Solution: Clear cache and rebuild
rm -rf .next
rm -rf node_modules/.cache
pnpm typecheck  # See all type errors
pnpm build
```

#### Authentication Issues
```bash
# Error: Session not working
# Solution 1: Check NEXTAUTH_SECRET is set
# Solution 2: Clear cookies and try again
# Solution 3: Verify NEXTAUTH_URL matches your domain
```

#### Stripe Integration Errors
```bash
# Error: Stripe not configured
# Solution: Set STRIPE_SECRET_KEY in .env.local
# Test with: pnpm dev and check console for "✅ Stripe initialized"
```

## AI Assistant Tips

### For Best Results
1. **Always provide context**: Mention the file path and what you're trying to achieve
2. **Reference patterns**: Say "follow the API Route Pattern" or "use the Component Pattern"
3. **Include error messages**: Copy the full error including stack trace
4. **Specify the tech stack**: Mention "Next.js 15 App Router with Prisma"

### Example Prompts
```
Good: "Add a new API endpoint at /api/products/featured that returns 
      the top 5 products. Follow the API Route Pattern with Zod validation."

Better: "In /app/api/products/featured/route.ts, create a GET endpoint 
        that queries the database for products with rating > 4.5, 
        limited to 5 results. Include error handling and use the 
        standardized response format from /lib/api/response.ts"
```

### Code Generation Tips
- Request "with comprehensive comments" for better documentation
- Ask for "defensive programming" to get validation and error handling
- Specify "following existing patterns" to maintain consistency
- Request "with TypeScript types" for type safety
- Ask for "with test coverage" to get unit tests

### Debugging with AI
When asking for debugging help:
1. Share the error message
2. Include the relevant code snippet
3. Mention recent changes
4. Specify the environment (dev/prod)
5. Include any log output

## Refactored Patterns (NEW)

### Using the Centralized Error System
The codebase now includes a comprehensive error handling system in `/lib/errors`:

```typescript
import { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError,
  handleApiError,
  assert,
  ensureExists 
} from '@/lib/errors'

// In API routes:
export async function GET(request: Request) {
  try {
    // Your logic here
    const user = await prisma.user.findUnique({ where: { id } })
    
    // Ensure resource exists (throws NotFoundError if null)
    const validUser = ensureExists(user, 'User')
    
    // Assert business rules (throws custom error if false)
    assert(
      validUser.isActive,
      'User account is not active',
      BusinessLogicError
    )
    
    return successResponse(validUser)
  } catch (error) {
    // Automatic error handling with proper status codes
    return handleApiError(error)
  }
}
```

### Using Validation Schemas
All input validation uses Zod schemas from `/lib/validation`:

```typescript
import { validate, UserCreateSchema } from '@/lib/validation'

// In API route:
const body = await request.json()
const validatedData = validate(UserCreateSchema, body) // Throws ValidationError if invalid

// Type-safe data with autocompletion
console.log(validatedData.email) // TypeScript knows this exists
```

### Using Development Utilities
Enhanced logging and debugging from `/lib/dev-utils`:

```typescript
import { devLog, startTimer, devAssert } from '@/lib/dev-utils'

// Enhanced logging with context
devLog.info('Processing order', { orderId, userId })
devLog.error('Payment failed', error, { context })

// Performance monitoring
const timer = startTimer('Database query')
const result = await complexQuery()
timer.end() // Logs execution time

// Development assertions (stripped in production)
devAssert(price > 0, 'Price must be positive')
```

### Using Component Templates
Start new components from templates in `/lib/component-templates`:

```bash
# Copy template for new page
cp lib/component-templates/page-template.tsx app/new-feature/page.tsx

# Copy template for new API route
cp lib/component-templates/api-route-template.ts app/api/new-endpoint/route.ts
```

Then replace [REPLACE] placeholders with your specific implementation.

### API Response Standards
Use consistent response formatting from `/lib/api/response`:

```typescript
import { 
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse 
} from '@/lib/api/response'

// Success with data
return successResponse(data, 'Operation completed')

// Error with details
return errorResponse('Invalid input', 400, 'VALIDATION_ERROR', { fields })

// Paginated lists
return paginatedResponse(items, page, limit, total)

// Resource created
return createdResponse(resource, `/api/resource/${resource.id}`)

// Successful deletion
return noContentResponse()
```

## Pattern Library

### Error Classes
```typescript
// Use specific error classes for better error handling
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(message: string, public resource?: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}
```

### Response Helpers
```typescript
// Standardized API responses
export const createApiResponse = {
  success: (data: any, status = 200) => 
    NextResponse.json({ success: true, data }, { status }),
    
  error: (message: string, status = 400) =>
    NextResponse.json({ success: false, error: message }, { status }),
    
  unauthorized: (message = 'Unauthorized') =>
    NextResponse.json({ success: false, error: message }, { status: 401 }),
    
  notFound: (resource = 'Resource') =>
    NextResponse.json({ success: false, error: `${resource} not found` }, { status: 404 }),
}
```

### Logging Patterns
```typescript
// Consistent logging format
const log = {
  info: (action: string, data?: any) => 
    console.log(`[INFO] ${new Date().toISOString()} - ${action}`, data || ''),
    
  error: (action: string, error: any, context?: any) =>
    console.error(`[ERROR] ${new Date().toISOString()} - ${action}`, { error, context }),
    
  debug: (action: string, data?: any) =>
    process.env.NODE_ENV === 'development' && 
    console.debug(`[DEBUG] ${action}`, data || ''),
}
```

## Testing Patterns

### Unit Test Template
```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('FeatureName', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset state before each test
  })
  
  afterEach(() => {
    // Cleanup after each test
  })
  
  describe('functionName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = { /* test data */ }
      
      // Act
      const result = functionName(input)
      
      // Assert
      expect(result).toEqual(/* expected output */)
    })
    
    it('should handle edge case', () => {
      // Test edge cases and error conditions
    })
    
    it('should validate input', () => {
      // Test input validation
      expect(() => functionName(null)).toThrow(ValidationError)
    })
  })
})
```

### Integration Test Pattern
```typescript
import { GET, POST } from '@/app/api/feature/route'

describe('API: /api/feature', () => {
  it('GET should return data', async () => {
    const request = new Request('http://localhost:3000/api/feature')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
  
  it('POST should require authentication', async () => {
    const request = new Request('http://localhost:3000/api/feature', {
      method: 'POST',
      body: JSON.stringify({ test: 'data' })
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

## Performance Optimization Tips

### Database Queries
```typescript
// ❌ Bad: N+1 query problem
const users = await prisma.user.findMany()
for (const user of users) {
  const orders = await prisma.order.findMany({ where: { userId: user.id } })
}

// ✅ Good: Single query with includes
const users = await prisma.user.findMany({
  include: {
    orders: true
  }
})
```

### Component Optimization
```typescript
// Use memo for expensive computations
const ExpensiveComponent = React.memo(({ data }) => {
  const processed = useMemo(() => 
    expensiveProcess(data), 
    [data]
  )
  
  return <div>{processed}</div>
})

// Use dynamic imports for code splitting
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { 
    loading: () => <Skeleton />,
    ssr: false 
  }
)
```

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set in Vercel
- [ ] Database migrations run
- [ ] Build succeeds locally
- [ ] Tests pass
- [ ] TypeScript has no errors
- [ ] Lighthouse score acceptable

### Post-Deployment
- [ ] Test critical user flows
- [ ] Verify payment processing
- [ ] Check error monitoring
- [ ] Test email notifications
- [ ] Verify cron jobs running
- [ ] Monitor performance metrics

---

## Quick Reference

### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-date.ts`)
- API Routes: `route.ts` in folder structure
- Hooks: `use-feature-name.ts` (e.g., `use-auth.ts`)
- Types: `types.ts` or `[feature].types.ts`

### Import Order
1. External packages
2. Next.js imports
3. Internal aliases (@/)
4. Relative imports
5. Style imports

### Git Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tool changes

---

*Last Updated: [Auto-update on build]*
*Version: 1.0.0*
*Maintained by: AI Development Team*