# Technical Standards & Architecture - English Unleashed

## Core Technology Stack

### Frontend Framework
- **Next.js 15.3.1** with App Router architecture
  - Server Components by default for optimal performance
  - Client Components only when interactivity required
  - Static generation where possible for SEO and speed
  - Edge runtime for API routes when applicable

### Language & Type Safety
- **TypeScript 5.8.3** with strict mode enabled
  - Strict null checks and no implicit any
  - Path mapping for clean imports (`@/components/*`)
  - Type-only imports to reduce bundle size
  - ts-reset library for enhanced type safety

### Styling & UI Components
- **Tailwind CSS v4** with PostCSS processing
  - Utility-first approach with design system tokens
  - Custom CSS minimal, prefer Tailwind utilities
  - Dark mode support via CSS variables

- **Radix UI** for accessible component primitives
  - Headless components for maximum customization
  - Built-in accessibility and keyboard navigation
  - ARIA compliance out of the box

- **CVA (Class Variance Authority)** for component variants
  ```typescript
  const buttonVariants = cva("base-styles", {
    variants: {
      variant: { primary: "...", secondary: "..." },
      size: { sm: "...", md: "...", lg: "..." }
    },
    defaultVariants: { variant: "primary", size: "md" }
  })
  ```

### Database & ORM
- **Prisma 6.13.0** with PostgreSQL/SQLite
  - Type-safe database queries with generated client
  - Migration system for schema evolution
  - Connection pooling via Prisma Accelerate (production)
  - Row Level Security (RLS) for multi-tenant data

### Authentication & Authorization
- **NextAuth 4.24.11** with JWT strategy
  - Server-side session validation in middleware
  - Role-based access control via user.isAdmin
  - Secure session cookies with httpOnly flag
  - Password hashing via bcryptjs

### Payment Processing
- **Stripe 18.4.0** for payment processing
  - Payment Links for simplified checkout flow
  - Webhook verification for security
  - No card data storage (PCI compliance)
  - Support for promotional codes and discounts

### File Storage & Media
- **Vercel Blob** for PDF and image storage
  - Automatic CDN distribution
  - Secure signed URLs for protected content
  - Image optimization via Next.js Image component

- **YouTube API** for video content
  - Metadata synchronization
  - Thumbnail caching and optimization
  - RSS feed parsing for new content discovery

## Architecture Patterns

### Component Architecture
```typescript
// Server Component Pattern (default)
export default async function PackList() {
  const packs = await db.pack.findMany({
    include: { product: true, quiz: true }
  })

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {packs.map(pack => (
        <PackCard key={pack.id} pack={pack} />
      ))}
    </div>
  )
}

// Client Component Pattern (interactive only)
"use client"
export function QuizQuestion({ question, onAnswer }: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{question.text}</h3>
      <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
        {question.answers.map(answer => (
          <RadioGroupItem key={answer.id} value={answer.id}>
            {answer.text}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </div>
  )
}
```

### API Route Pattern
```typescript
// Standardized API route structure
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response'
import { validate } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'

export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const body = await request.json()
    const data = validate(QuizSubmissionSchema, body)

    // 2. Authenticate user
    const session = await getServerSession(authOptions)
    if (!session) {
      return createErrorResponse("Unauthorized", 401)
    }

    // 3. Business logic
    const result = await processQuizSubmission(data, session.user.id)

    // 4. Standardized response
    return createSuccessResponse(result, "Quiz submitted successfully")

  } catch (error) {
    return handleApiError(error)
  }
}
```

### Error Handling Architecture
```typescript
// Centralized error handling
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  assert,
  ensureExists
} from '@/lib/errors'

// Use specific error types
throw new ValidationError("Invalid email format", { field: "email" })
throw new AuthenticationError("Invalid credentials")
throw new NotFoundError("Quiz not found")

// Assertions for business logic
assert(user.isAdmin, "Admin access required")
assert(quiz.isActive, "Quiz is not active")

// Ensure non-null values
const order = ensureExists(
  await db.order.findUnique({ where: { id } }),
  "Order"
)
```

### Validation Schema Pattern
```typescript
// Zod schemas for all data structures
import { z } from 'zod'

export const QuizSubmissionSchema = z.object({
  quizId: z.string().cuid(),
  answers: z.array(z.object({
    questionId: z.string().cuid(),
    answerId: z.string().cuid()
  })),
  startTime: z.number().positive(),
  endTime: z.number().positive()
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time"
})

export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>
```

## Development Tools & Workflow

### Code Quality Tools
- **ESLint 9** with Next.js and TypeScript rules
- **Prettier 3.0.3** for consistent formatting
- **TypeScript** strict mode for type safety
- **Husky** for git hooks (pre-commit, pre-push)

### Testing Strategy
```typescript
// Unit Testing with Jest
describe('formatPrice utility', () => {
  it('should format price in cents to dollars', () => {
    expect(formatPrice(2999)).toBe('$29.99')
  })
})

// Component Testing with React Testing Library
import { render, screen } from '@testing-library/react'

test('QuizCard displays quiz information', () => {
  render(<QuizCard quiz={mockQuiz} />)
  expect(screen.getByText('Sample Quiz')).toBeInTheDocument()
})

// E2E Testing with Playwright
test('complete purchase flow', async ({ page }) => {
  await page.goto('/shop')
  await page.click('[data-testid="pack-1"]')
  await page.click('[data-testid="purchase-button"]')
  // Stripe checkout flow...
})
```

### Performance Standards
- **Bundle Size**: Monitor and maintain <500KB total
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
- **Lighthouse Score**: Maintain >90 across all metrics

### Security Requirements

#### Input Validation
```typescript
// All user inputs validated with Zod
const userData = validate(UserRegistrationSchema, requestBody)

// Never trust client-side data
const userId = session.user.id // From server session, not request
```

#### Database Security
```typescript
// Use Prisma for SQL injection prevention
const users = await db.user.findMany({
  where: { email: { contains: searchTerm } }
})

// Never use raw SQL for user input
// ❌ await db.$executeRaw`SELECT * FROM users WHERE email = ${email}`
// ✅ await db.user.findFirst({ where: { email } })
```

#### Authentication Security
```typescript
// JWT tokens for temporary access only
const downloadToken = jwt.sign(
  { orderId, userId, type: 'download' },
  process.env.NEXTAUTH_SECRET,
  { expiresIn: '24h' }
)

// Session validation in middleware
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (isProtectedRoute(request.nextUrl.pathname) && !token) {
    return NextResponse.redirect('/login')
  }
}
```

## Dependency Management

### Core Dependencies (Never Remove)
- `next` - Framework foundation
- `react` - UI library
- `typescript` - Type safety
- `prisma` - Database ORM
- `next-auth` - Authentication
- `stripe` - Payment processing
- `zod` - Runtime validation

### Development Dependencies
- `eslint` - Code linting
- `prettier` - Code formatting
- `jest` - Unit testing
- `playwright` - E2E testing
- `storybook` - Component development

### Update Strategy
- **Patch updates**: Auto-update via Renovate bot
- **Minor updates**: Review and test before merging
- **Major updates**: Manual review and testing required
- **Security updates**: Immediate priority

## Performance Optimization

### Next.js Optimizations
```typescript
// Dynamic imports for code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />
})

// Image optimization
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Route optimization
export const runtime = 'edge' // For simple API routes
export const revalidate = 3600 // For static pages with ISR
```

### Database Optimizations
```typescript
// Efficient queries with includes
const pack = await db.pack.findUnique({
  where: { id },
  include: {
    product: { select: { title: true, price: true } },
    quiz: {
      include: {
        questions: {
          include: { answers: true },
          orderBy: { order: 'asc' }
        }
      }
    }
  }
})

// Connection pooling in production
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRISMA_ACCELERATE_URL
    }
  }
})
```

### Caching Strategy
```typescript
// Next.js cache for static data
export async function getStaticProps() {
  const packs = await db.pack.findMany()

  return {
    props: { packs },
    revalidate: 3600 // 1 hour
  }
}

// React Query for client-side caching
const { data: quizHistory } = useQuery({
  queryKey: ['quizHistory', userId],
  queryFn: () => fetchQuizHistory(userId),
  staleTime: 5 * 60 * 1000 // 5 minutes
})
```

## Deployment Architecture

### Vercel Configuration
```javascript
// next.config.ts
export default {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['img.youtube.com', 'blob.vercel-storage.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false }
    return config
  }
}

// vercel.json
{
  "functions": {
    "app/api/webhooks/stripe/route.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup-expired",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Environment Management
```typescript
// T3 Env for type-safe environment variables
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_")
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_")
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    // ... other variables
  }
})
```

## Code Organization Standards

### File Naming Conventions
- **Components**: PascalCase (`QuizCard.tsx`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **Pages**: Next.js convention (`page.tsx`, `layout.tsx`)
- **API Routes**: `route.ts` in appropriate directory
- **Types**: PascalCase with `.types.ts` suffix
- **Tests**: Same name with `.test.ts` or `.spec.ts`

### Import Organization
```typescript
// 1. React and Next.js imports
import { useState } from 'react'
import Image from 'next/image'

// 2. Third-party libraries
import { Button } from '@radix-ui/react-button'
import { z } from 'zod'

// 3. Internal utilities and types
import { cn } from '@/lib/utils'
import { QuizAttempt } from '@/types/quiz.types'

// 4. Internal components
import { QuizCard } from '@/components/quiz/QuizCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
```

### Directory Structure Standards
```
/app                     # Next.js App Router
  /(public)             # Public pages (no auth)
  /account              # Authenticated pages
  /admin                # Admin-only pages
  /api                  # API routes

/lib                    # Core utilities
  /errors               # Error handling system
  /validation           # Zod schemas
  /dev-utils           # Development helpers
  /api                 # API utilities

/components             # Reusable components
  /ui                  # Base UI components
  /quiz                # Feature-specific components
  /shop                # E-commerce components

/hooks                 # Custom React hooks
/types                 # TypeScript type definitions
/styles               # Global styles
```

This technical architecture ensures scalability, maintainability, and performance while providing clear guidelines for all development work on English Unleashed.