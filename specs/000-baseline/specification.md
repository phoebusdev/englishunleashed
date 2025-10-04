# English Unleashed - Baseline Specification
*Current State Documentation - feature/quiz-system-final branch*

## Product Overview

English Unleashed is a comprehensive e-commerce platform for English learning materials, combining video instruction, downloadable PDFs, and interactive quizzes. Built on the Next.js Enterprise Boilerplate foundation, it specializes in delivering high-quality educational content through a streamlined purchase-to-access flow.

## Current User Journeys

### Primary Flow: Pack Purchase & Access
1. **Discovery**: User browses homepage displaying video pack grid
2. **Selection**: User clicks pack to view details (video preview, description, price)
3. **Purchase**: User redirected to Stripe Payment Link for checkout
4. **Access**: Upon payment completion:
   - Guest users: 24-hour download access via JWT tokens
   - Registered users: Permanent access in account dashboard
5. **Consumption**: User streams videos, downloads PDFs, takes quizzes

### Secondary Flow: Quiz Taking
1. **Access**: User navigates to quiz from pack or account dashboard
2. **Taking**: Interactive multiple-choice questions with progress tracking
3. **Submission**: Answers submitted with timing data
4. **Results**: Immediate score display with correct/incorrect breakdown
5. **History**: Quiz attempts saved to account (registered users only)

### Admin Flow: Content Management
1. **Authentication**: Admin login with elevated permissions
2. **Pack Creation**: Create packs, upload PDFs to Vercel Blob
3. **Quiz Building**: Add questions with multiple-choice answers
4. **Publishing**: Link Stripe Payment Links and activate packs
5. **Analytics**: Monitor orders, quiz performance, user engagement

## Technical Architecture

### Database Schema (Current State)
```sql
-- Core entities
User {
  id: String (CUID)
  email: String (unique)
  password: String? (nullable for guests)
  isAdmin: Boolean (default: false)
  emailVerified: DateTime?
}

Product {
  id: String (CUID)
  title: String
  price: Int (cents)
  type: ProductType (PACK|SUBSCRIPTION|BUNDLE)
  stripePaymentLinkId: String?
  stripePaymentLinkUrl: String?
}

Pack {
  id: String (CUID)
  productId: String (FK)
  title: String
  videoId: String? (YouTube ID)
  videoUrl: String? (full URL)
  pdfUrl: String? (Vercel Blob URL)
  hasPdf: Boolean
  hasQuiz: Boolean
}

Quiz {
  id: String (CUID)
  packId: String (FK)
  title: String
  timeLimit: Int? (seconds)
}

Question {
  id: String (CUID)
  quizId: String (FK)
  text: String
  order: Int
}

Answer {
  id: String (CUID)
  questionId: String (FK)
  text: String
  isCorrect: Boolean
}

Order {
  id: String (CUID)
  userId: String (FK)
  productId: String (FK)
  amount: Int (cents)
  status: OrderStatus (PENDING|COMPLETED|FAILED|REFUNDED)
  stripeId: String? (payment intent ID)
  downloadExpiry: DateTime? (guest access)
}

QuizAttempt {
  id: String (CUID)
  userId: String (FK)
  quizId: String (FK)
  score: Int
  totalQuestions: Int
  startTime: DateTime
  endTime: DateTime
  answers: Json (question/answer mapping)
}
```

### API Architecture
```
/app/api/
├── auth/
│   ├── [...nextauth]/         # NextAuth handlers
│   ├── signup/               # User registration
│   ├── reset-password/       # Password reset flow
│   └── session/              # Session management
├── admin/
│   ├── packs/               # Pack CRUD operations
│   ├── quizzes/             # Quiz management
│   ├── orders/              # Order management
│   └── analytics/           # Admin analytics
├── quiz/
│   ├── [id]/                # Quiz retrieval
│   └── submit/              # Quiz submission
├── download/
│   └── [orderId]/           # Secure PDF downloads
├── webhooks/
│   └── stripe/              # Payment webhooks
└── cron/
    ├── cleanup-expired/     # Cleanup expired tokens
    └── process-emails/      # Email queue processing
```

### Authentication & Authorization
- **NextAuth Configuration**: JWT strategy with credentials provider
- **Session Management**: Server-side session validation
- **Guest Access**: JWT tokens for 24-hour download access
- **Admin Protection**: Role-based access via `user.isAdmin` flag
- **Middleware**: Route protection and security headers

### Payment Processing Flow
1. User clicks purchase → redirect to Stripe Payment Link
2. Stripe processes payment → webhook to `/api/webhooks/stripe`
3. Webhook validates signature → creates Order with COMPLETED status
4. Email notification queued → download URLs generated
5. User receives access confirmation email with download links

### File Storage & Content Delivery
- **PDFs**: Uploaded to Vercel Blob storage with secure URLs
- **Videos**: YouTube API integration for metadata and streaming
- **Images**: Next.js Image optimization with automatic resizing
- **Downloads**: JWT-secured URLs with configurable expiry

## Current Capabilities

### Video Management
- YouTube API integration for video metadata
- RSS feed parsing for new video discovery
- Manual video synchronization via admin scripts
- Video thumbnail caching and optimization
- Embedded YouTube player with custom controls

### Quiz System
- Multiple-choice question support
- Timed quiz attempts with progress tracking
- Immediate scoring and feedback
- Quiz history and analytics
- Admin quiz builder with drag-drop ordering

### E-commerce Features
- Stripe Payment Links integration
- Guest checkout with temporary access
- Order tracking and history
- Promotional codes and discounts
- Revenue analytics and reporting

### Security Measures
- Input validation via Zod schemas
- SQL injection prevention via Prisma
- CSRF protection on state-changing operations
- Rate limiting on authentication endpoints
- Secure JWT tokens for file downloads
- Environment variable validation

## Known Limitations

### Technical Limitations
1. **YouTube Webhook Integration**: Incomplete - requires manual sync
2. **Quiz Question Types**: Limited to multiple choice only
3. **Email Queue**: Basic implementation without retry logic
4. **Database Connections**: No connection pooling optimization
5. **CDN Integration**: Static assets served from origin only

### Feature Limitations
1. **Subscription Model**: Infrastructure ready but not implemented
2. **Progress Tracking**: No video progress or bookmark system
3. **Social Features**: No user reviews or community features
4. **Mobile App**: Web-only, no native mobile applications
5. **Offline Access**: No offline quiz or content capabilities

### Business Limitations
1. **Payment Methods**: Stripe only, no PayPal or crypto
2. **Localization**: English only, no multi-language support
3. **Currency Support**: USD only via Stripe
4. **Refund Process**: Manual via Stripe dashboard

## Integration Points

### External Services
- **Stripe**: Payment processing and webhook events
- **YouTube API**: Video metadata and synchronization
- **Vercel Blob**: PDF file storage and delivery
- **Resend**: Transactional email delivery
- **Vercel Analytics**: Performance and usage tracking

### Database Providers
- **Development**: SQLite with file-based storage
- **Production**: PostgreSQL via Vercel Postgres
- **Migration Strategy**: Prisma migrations with manual deployment

### Authentication Providers
- **Current**: Email/password via NextAuth credentials provider
- **Future Ready**: OAuth providers (Google, GitHub) can be added

## Performance Characteristics

### Current Metrics
- **Lighthouse Score**: 82/100 (good but improvable)
- **Bundle Size**: ~450KB (monitored via GitHub Actions)
- **Database Query Performance**: Good with Prisma optimization
- **Video Loading**: Fast via YouTube CDN
- **PDF Download**: Dependent on Vercel Blob performance

### Scaling Considerations
- **Database**: Prisma Accelerate ready for connection pooling
- **File Storage**: Vercel Blob scales automatically
- **Compute**: Vercel serverless functions auto-scale
- **CDN**: Ready for CloudFront or similar CDN integration

## Deployment Architecture

### Current Setup
- **Hosting**: Vercel with automatic deployments
- **Database**: Vercel Postgres for production
- **File Storage**: Vercel Blob for PDFs
- **Environment**: Environment variables via Vercel dashboard
- **Monitoring**: Vercel Analytics and error tracking

### Branch Strategy
- **Production**: `main` branch auto-deploys
- **Feature Development**: `feature/*` branches for new features
- **Current Active**: `feature/quiz-system-final` (ready for merge)

## Data Flow Patterns

### Purchase Flow
```
User Selection → Stripe Payment Link → Webhook → Order Creation → Email Queue → Access Granted
```

### Quiz Flow
```
Quiz Access → Question Retrieval → Answer Collection → Submission → Scoring → History Storage
```

### Content Sync Flow
```
YouTube API → Video Metadata → Database Storage → Admin Review → Publication
```

## Security Model

### Data Protection
- **User Data**: Encrypted passwords via bcrypt
- **Payment Data**: PCI compliance via Stripe (no card storage)
- **File Access**: JWT-secured download URLs
- **Session Management**: Secure HTTP-only cookies

### Access Control
- **Public**: Homepage, pack browsing, video streaming
- **Authenticated**: Account dashboard, quiz history, downloads
- **Admin**: Content management, analytics, order processing
- **Guest**: Temporary 24-hour access via JWT tokens

## Environment Configuration

### Required Variables
```env
DATABASE_URL                  # Database connection
NEXTAUTH_URL                 # Authentication URL
NEXTAUTH_SECRET              # JWT signing secret
STRIPE_SECRET_KEY            # Payment processing
STRIPE_WEBHOOK_SECRET        # Webhook verification
BLOB_READ_WRITE_TOKEN        # File storage access
RESEND_API_KEY               # Email delivery
YOUTUBE_API_KEY              # Video integration
```

### Optional Variables
```env
PRISMA_ACCELERATE_URL        # Connection pooling
CRON_SECRET                  # Scheduled job security
ADMIN_EMAIL                  # Admin notifications
YOUTUBE_WEBHOOK_SECRET       # Webhook security
```

This baseline specification documents the current state of English Unleashed as of the `feature/quiz-system-final` branch, providing a foundation for all future development specifications.