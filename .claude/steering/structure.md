# Codebase Organization - English Unleashed

## High-Level Directory Structure

```
englishunleashed/
├── app/                      # Next.js App Router
├── components/               # Reusable UI components
├── lib/                     # Core business logic & utilities
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
├── prisma/                  # Database schema & migrations
├── public/                  # Static assets
├── styles/                  # Global styles
├── tests/                   # Test files
├── scripts/                 # Build & utility scripts
├── docs/                    # Project documentation
└── .claude/                 # AI assistant guidance (new)
└── specs/                   # Feature specifications (new)
```

## App Router Structure (`/app`)

### Route Organization
```
/app
├── (public)/                # Public routes (no authentication)
│   ├── page.tsx            # Homepage
│   ├── layout.tsx          # Public layout
│   ├── shop/               # Pack listing & details
│   │   ├── page.tsx        # Pack grid display
│   │   └── [packId]/       # Individual pack pages
│   ├── videos/             # Video gallery
│   │   ├── page.tsx        # Video listing
│   │   └── [videoId]/      # Individual video pages
│   ├── checkout/           # Purchase flow
│   │   ├── [packId]/       # Pack-specific checkout
│   │   └── product/        # Generic product checkout
│   ├── login/              # Authentication
│   └── signup/             # User registration
│
├── account/                 # Authenticated user area
│   ├── page.tsx            # Account dashboard
│   ├── layout.tsx          # Account layout with navigation
│   ├── quizzes/            # Quiz history & management
│   │   ├── page.tsx        # Quiz list
│   │   └── [quizId]/       # Individual quiz results
│   └── orders/             # Purchase history
│       ├── page.tsx        # Order list
│       └── [orderId]/      # Order details & downloads
│
├── admin/                   # Admin panel (role-protected)
│   ├── page.tsx            # Admin dashboard
│   ├── layout.tsx          # Admin layout with sidebar
│   ├── packs/              # Pack management
│   │   ├── page.tsx        # Pack list with actions
│   │   ├── create/         # New pack creation
│   │   └── [packId]/       # Edit existing pack
│   ├── quiz-builder/       # Quiz creation & editing
│   │   ├── page.tsx        # Quiz list
│   │   ├── create/         # New quiz builder
│   │   └── [quizId]/       # Edit existing quiz
│   ├── orders/             # Order management
│   │   ├── page.tsx        # Order overview
│   │   └── [orderId]/      # Order details & actions
│   └── analytics/          # Usage & performance metrics
│
├── quiz/                    # Quiz taking interface
│   └── [id]/               # Individual quiz pages
│       ├── page.tsx        # Quiz taking interface
│       └── results/        # Quiz results page
│
└── api/                     # Backend API endpoints
    ├── auth/               # Authentication endpoints
    │   ├── [...nextauth]/  # NextAuth configuration
    │   ├── signup/         # User registration
    │   ├── session/        # Session management
    │   └── reset-password/ # Password reset flow
    │
    ├── admin/              # Admin-only endpoints
    │   ├── packs/          # Pack CRUD operations
    │   ├── quizzes/        # Quiz management
    │   ├── orders/         # Order management
    │   └── analytics/      # Analytics data
    │
    ├── quiz/               # Quiz operations
    │   ├── [id]/           # Quiz retrieval
    │   └── submit/         # Quiz submission
    │
    ├── download/           # Secure file downloads
    │   └── [orderId]/      # Order-specific downloads
    │
    ├── webhooks/           # External service webhooks
    │   ├── stripe/         # Stripe payment webhooks
    │   └── youtube/        # YouTube content webhooks
    │
    ├── cron/               # Scheduled tasks
    │   ├── cleanup-expired/ # Remove expired tokens
    │   └── process-emails/ # Email queue processing
    │
    └── analytics/          # Usage tracking
        ├── track/          # Event tracking
        ├── duration/       # Time tracking
        └── geo/            # Geographic analytics
```

## Component Organization (`/components`)

### Component Hierarchy
```
/components
├── ui/                     # Base UI components (Radix + custom)
│   ├── Button.tsx          # Button variants with CVA
│   ├── Card.tsx            # Content cards
│   ├── Dialog.tsx          # Modal dialogs
│   ├── Form.tsx            # Form components
│   ├── Input.tsx           # Form inputs
│   ├── Select.tsx          # Dropdown selects
│   ├── Tabs.tsx            # Tab navigation
│   └── Toast.tsx           # Notification toasts
│
├── layout/                 # Layout components
│   ├── Header.tsx          # Site header with navigation
│   ├── Footer.tsx          # Site footer
│   ├── Sidebar.tsx         # Admin sidebar navigation
│   ├── Navigation.tsx      # Main navigation menu
│   └── MobileMenu.tsx      # Mobile navigation drawer
│
├── quiz/                   # Quiz-specific components
│   ├── QuizCard.tsx        # Quiz preview card
│   ├── QuizQuestion.tsx    # Individual question display
│   ├── QuizProgress.tsx    # Progress indicator
│   ├── QuizResults.tsx     # Results summary
│   ├── QuizTimer.tsx       # Countdown timer
│   └── QuizHistory.tsx     # Historical attempts
│
├── shop/                   # E-commerce components
│   ├── PackCard.tsx        # Product pack display
│   ├── PackGrid.tsx        # Pack listing grid
│   ├── PriceDisplay.tsx    # Price formatting
│   ├── PurchaseButton.tsx  # Stripe checkout trigger
│   └── CartSummary.tsx     # Order summary
│
├── admin/                  # Admin panel components
│   ├── PackForm.tsx        # Pack creation/editing
│   ├── QuizBuilder.tsx     # Quiz creation interface
│   ├── OrderTable.tsx      # Order management table
│   ├── AnalyticsDashboard.tsx # Metrics display
│   └── FileUpload.tsx      # PDF upload component
│
├── video/                  # Video-related components
│   ├── VideoPlayer.tsx     # YouTube player wrapper
│   ├── VideoCard.tsx       # Video preview card
│   ├── VideoGrid.tsx       # Video listing grid
│   └── VideoMetadata.tsx   # Video information display
│
└── auth/                   # Authentication components
    ├── LoginForm.tsx       # User login
    ├── SignupForm.tsx      # User registration
    ├── ForgotPassword.tsx  # Password reset
    └── AuthGuard.tsx       # Route protection
```

## Core Logic Organization (`/lib`)

### Utility Structure
```
/lib
├── errors/                 # Centralized error handling
│   ├── index.ts           # Error classes and handlers
│   ├── api-errors.ts      # API-specific errors
│   ├── validation-errors.ts # Input validation errors
│   └── auth-errors.ts     # Authentication errors
│
├── validation/             # Zod schemas for data validation
│   ├── index.ts           # Schema exports
│   ├── user.schemas.ts    # User-related schemas
│   ├── quiz.schemas.ts    # Quiz-related schemas
│   ├── order.schemas.ts   # Order-related schemas
│   └── admin.schemas.ts   # Admin operation schemas
│
├── api/                   # API utilities
│   ├── response.ts        # Standardized API responses
│   ├── middleware.ts      # API middleware utilities
│   └── rate-limit.ts      # Rate limiting configuration
│
├── dev-utils/             # Development utilities
│   ├── index.ts           # Development helpers
│   ├── logger.ts          # Enhanced logging
│   ├── timer.ts           # Performance timing
│   └── env-check.ts       # Environment validation
│
├── utils/                 # General utilities
│   ├── index.ts           # Utility exports
│   ├── format.ts          # Data formatting
│   ├── date.ts            # Date utilities
│   ├── crypto.ts          # Encryption helpers
│   └── constants.ts       # Application constants
│
├── auth.ts                # NextAuth configuration
├── db.ts                  # Prisma client initialization
├── stripe.ts              # Stripe client configuration
├── youtube.ts             # YouTube API client
├── email.ts               # Email service configuration
└── blob.ts                # File storage utilities
```

## Database Schema (`/prisma`)

### Schema Organization
```
/prisma
├── schema.prisma          # Main database schema
├── migrations/            # Database migrations
│   ├── 20240101_init/     # Initial schema
│   ├── 20240215_add_quiz/ # Quiz system addition
│   └── 20240301_analytics/ # Analytics tables
├── seed.ts                # Database seeding script
└── generators/            # Code generation scripts
```

### Key Model Relationships
```
User ──┬── Order ── Product ── Pack ──┬── Quiz ── Question ── Answer
       │                              │
       ├── QuizAttempt ───────────────┘
       ├── Session
       └── PasswordReset

EmailQueue ── User
Analytics ── User
DownloadLog ── Order
```

## Type Definitions (`/types`)

### Type Organization
```
/types
├── index.ts               # Main type exports
├── auth.types.ts          # Authentication types
├── quiz.types.ts          # Quiz system types
├── order.types.ts         # E-commerce types
├── admin.types.ts         # Admin panel types
├── api.types.ts           # API response types
└── database.types.ts      # Generated Prisma types
```

## Testing Structure (`/tests`)

### Test Organization
```
/tests
├── __mocks__/             # Jest mocks
│   ├── prisma.ts          # Database mocks
│   └── stripe.ts          # Stripe mocks
├── fixtures/              # Test data
│   ├── users.json         # User test data
│   ├── quizzes.json       # Quiz test data
│   └── orders.json        # Order test data
├── utils/                 # Test utilities
│   ├── setup.ts           # Test environment setup
│   ├── helpers.ts         # Common test helpers
│   └── factories.ts       # Data factories
├── unit/                  # Unit tests
│   ├── lib/               # Library function tests
│   ├── components/        # Component tests
│   └── api/               # API route tests
├── integration/           # Integration tests
│   ├── auth.test.ts       # Authentication flow
│   ├── purchase.test.ts   # Purchase flow
│   └── quiz.test.ts       # Quiz taking flow
└── e2e/                   # End-to-end tests
    ├── purchase-flow.spec.ts
    ├── quiz-taking.spec.ts
    └── admin-panel.spec.ts
```

## Scripts & Automation (`/scripts`)

### Script Organization
```
/scripts
├── build-production.sh    # Production build script
├── seed-admin.ts          # Create admin user
├── sync-youtube-videos.ts # YouTube content sync
├── cleanup-database.ts    # Database maintenance
├── generate-types.ts      # Type generation
└── deploy-vercel.sh       # Deployment script
```

## Static Assets (`/public`)

### Asset Organization
```
/public
├── images/                # Static images
│   ├── logo.png           # Site logo
│   ├── hero-bg.jpg        # Homepage hero
│   └── placeholders/      # Placeholder images
├── icons/                 # Icon assets
│   ├── favicon.ico        # Site favicon
│   └── apple-touch-icon.png
├── documents/             # Static documents
│   ├── privacy-policy.pdf
│   └── terms-of-service.pdf
└── manifest.json          # PWA manifest
```

## Code Location Quick Reference

### Where to Find...
- **Authentication logic**: `/lib/auth.ts` + `/app/api/auth/*`
- **Database queries**: Server components + API routes
- **Payment processing**: `/app/api/webhooks/stripe/route.ts`
- **Quiz logic**: `/components/quiz/*` + `/app/api/quiz/*`
- **Admin features**: `/app/admin/*` + `/app/api/admin/*`
- **Error handling**: `/lib/errors/*`
- **Validation schemas**: `/lib/validation/*`
- **Email templates**: `/lib/email-templates/*`
- **File uploads**: `/app/api/admin/upload/*`

### Where to Add...
- **New page**: Create `page.tsx` in appropriate `/app` directory
- **New API endpoint**: Create `route.ts` in `/app/api/[path]`
- **New component**: Add to appropriate `/components` subdirectory
- **New utility function**: Add to `/lib/utils` or create new module
- **New validation schema**: Add to `/lib/validation`
- **New database model**: Update `/prisma/schema.prisma`
- **New test**: Mirror the structure in `/tests`

### Route Protection Patterns
- **Public routes**: `/app/(public)/*` - No authentication required
- **User routes**: `/app/account/*` - Requires authentication
- **Admin routes**: `/app/admin/*` - Requires admin role
- **API protection**: Via middleware and session validation

### File Naming Patterns
- **Pages**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **API routes**: `route.ts` (Next.js convention)
- **Components**: PascalCase (e.g., `QuizCard.tsx`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **Types**: PascalCase with `.types.ts` suffix
- **Tests**: Same name with `.test.ts` or `.spec.ts`

This structure provides clear organization for the English Unleashed codebase while maintaining scalability and ease of navigation for developers and AI assistants.