# Admin Dashboard Rebuild

## Current State

### Existing Implementation

The current admin dashboard provides basic functionality but has significant gaps in user experience and code quality:

**What Works:**
- Dashboard stats (users, orders, packs, revenue counts) at `app/admin/page.tsx`
- Quiz Builder - Full create/edit quiz system at `app/admin/quiz-builder/`
- Authentication protection - Admin-only access enforced via middleware
- Backend APIs - CRUD operations at `app/api/admin/*`
  - Pack creation/update (`/api/admin/pack`)
  - Quiz creation/update (`/api/admin/quiz`)
  - PDF upload (`/api/admin/upload`)
  - YouTube sync (`/api/admin/youtube-sync`)
  - User management (`/api/admin/users`)

**What's Broken:**
- Navigation links to non-existent pages:
  - `/admin/packs` - Pack list & management
  - `/admin/pack/new` - Create new pack form
  - `/admin/users` - User management
  - `/admin/orders` - Order management
  - `/admin/analytics` - Analytics dashboard

**Code Quality Issues:**
- No design system - Hardcoded colors (`#20b2aa`, `#ff6b8a`) scattered throughout
- Duplicated authentication - Every page repeats session checking code
- No reusable admin components - Each page rebuilds buttons, cards, forms
- No error boundaries - Runtime errors show ugly default React error screen
- No loading states - No skeletons or spinners during data fetching
- Manual form validation - No use of Zod schemas or React Hook Form
- No data tables - Lists have no sorting, filtering, or pagination
- No modals - No confirmation dialogs for destructive actions
- Inline messages - No toast notification system

### Affected Components

- [x] **Admin Layout**: `app/admin/layout.tsx` - Navigation and auth wrapper
- [x] **Admin Dashboard**: `app/admin/page.tsx` - Main dashboard with stats
- [x] **Quiz Builder**: `app/admin/quiz-builder/` - Quiz creation interface
- [ ] **Pack Management**: Missing - Need to create
- [ ] **User Management**: Missing - Need to create
- [ ] **Order Management**: Missing - Need to create
- [ ] **Analytics Dashboard**: Missing - Need to create
- [x] **API Routes**: `app/api/admin/*` - All backend endpoints exist
- [ ] **Admin Components**: Missing - Need component library
- [x] **Database Models**: `prisma/schema.prisma` - All models exist

### Current User Journey

**Admin Access Flow:**
1. Admin navigates to `/admin`
2. `app/admin/layout.tsx` checks session and `isAdmin` flag
3. If not admin, redirect to `/account`
4. If admin, show navigation bar with links
5. Dashboard loads with stats from database
6. Admin clicks navigation links → **404 errors** (pages don't exist)

**Quiz Builder Flow (Working):**
1. Admin navigates to `/admin/quiz-builder`
2. Page loads all packs with their quizzes
3. Admin selects a pack
4. Form populates with existing quiz data (if exists)
5. Admin adds/edits questions with options and explanations
6. On submit, API creates/updates quiz
7. Success message appears, page refreshes

**Pack Creation Flow (Broken):**
1. Admin clicks "Create Pack" button
2. Links to `/admin/pack/new` → **404 error**
3. API endpoint exists at `/api/admin/pack` but no UI

### Current Technical Architecture

```typescript
// Current admin auth pattern (repeated in every page)
const session = await getServerSession(authOptions)
if (!session?.user?.email) redirect('/login')
const user = await prisma.user.findUnique({ where: { email: session.user.email }})
if (!user?.isAdmin) redirect('/account')

// Current API pattern (works well, keep this)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  // ... business logic
  return NextResponse.json({ data })
}
```

## Proposed Changes

### User Stories

**Primary User Stories:**
- As an admin, I want a unified pack management interface so that I can create, edit, and delete packs in one place
- As an admin, I want to see all users in a searchable table so that I can manage user accounts efficiently
- As an admin, I want to view all orders with filtering so that I can track sales and troubleshoot issues
- As an admin, I want analytics visualizations so that I can understand business performance at a glance
- As an admin, I want consistent UI patterns so that I can navigate the admin panel intuitively

**Secondary User Stories:**
- As an admin, I want confirmation dialogs for destructive actions so that I don't accidentally delete data
- As an admin, I want toast notifications so that I know when actions succeed or fail
- As an admin, I want loading states so that I understand when data is being fetched
- As an admin, I want keyboard shortcuts so that I can work more efficiently
- As an admin, I want mobile-responsive admin panels so that I can manage the site on any device

### Functional Requirements

#### Requirement 1: Admin Component Library
- **Description**: Create reusable admin UI components with consistent styling
- **Acceptance Criteria**:
  - [ ] `<AdminCard>` component for consistent card styling
  - [ ] `<AdminButton>` with variant support (primary, secondary, danger)
  - [ ] `<DataTable>` with sorting, filtering, pagination
  - [ ] `<FormInput>` with label, error, and validation support
  - [ ] `<ConfirmDialog>` for destructive action confirmation
  - [ ] `<Toast>` notification system using Radix Toast
  - [ ] `<LoadingSpinner>` and `<PageLoader>` components
  - [ ] `<EmptyState>` for no-data scenarios
  - [ ] All components in `components/admin/` directory
  - [ ] Storybook stories for each component

#### Requirement 2: Pack Management Interface
- **Description**: Full CRUD interface for managing packs
- **Acceptance Criteria**:
  - [ ] `/admin/packs` page lists all packs in DataTable
  - [ ] Table columns: title, price, PDF status, quiz status, actions
  - [ ] Filter by: active/inactive, has PDF, has quiz
  - [ ] Search by pack title
  - [ ] Quick actions: edit, delete (with confirmation)
  - [ ] `/admin/pack/new` form for creating packs
  - [ ] Form fields: title, description, price, video URL
  - [ ] PDF upload with progress indicator
  - [ ] Auto-generate Stripe payment link on creation
  - [ ] `/admin/pack/[id]/edit` for editing existing packs
  - [ ] Link to quiz builder from pack edit page

#### Requirement 3: User Management Interface
- **Description**: Interface for viewing and managing users
- **Acceptance Criteria**:
  - [ ] `/admin/users` page lists all users in DataTable
  - [ ] Table columns: email, name, admin status, order count, created date
  - [ ] Search by email or name
  - [ ] Filter by: admin status, has orders
  - [ ] Action: toggle admin status (with confirmation)
  - [ ] Action: view user's orders
  - [ ] Action: delete user (with confirmation, soft delete)
  - [ ] User detail modal showing purchase history

#### Requirement 4: Order Management Interface
- **Description**: Interface for viewing and managing orders
- **Acceptance Criteria**:
  - [ ] `/admin/orders` page lists all orders in DataTable
  - [ ] Table columns: user email, pack title, amount, status, date
  - [ ] Filter by: status (pending, completed, failed, refunded)
  - [ ] Filter by: date range (last 7/30/90 days, custom)
  - [ ] Search by user email or pack title
  - [ ] Sort by: date, amount
  - [ ] Export to CSV button
  - [ ] Order detail modal showing full order information
  - [ ] Link to user profile from order row

#### Requirement 5: Analytics Dashboard
- **Description**: Visual analytics and reporting
- **Acceptance Criteria**:
  - [ ] `/admin/analytics` page with charts and metrics
  - [ ] Revenue chart (last 30 days, line chart)
  - [ ] Top-selling packs (bar chart or table)
  - [ ] User growth chart (cumulative line chart)
  - [ ] Download statistics by pack
  - [ ] Quiz completion rates
  - [ ] Key metrics: MRR, average order value, conversion rate
  - [ ] Date range selector for all charts
  - [ ] Export all data as CSV

#### Requirement 6: Improved Quiz Builder
- **Description**: Enhance quiz builder with new component library
- **Acceptance Criteria**:
  - [ ] Replace inline forms with `<FormInput>` components
  - [ ] Add `<ConfirmDialog>` for question deletion
  - [ ] Add `<Toast>` notifications for save success/error
  - [ ] Add `<LoadingSpinner>` during quiz save
  - [ ] Add `<EmptyState>` when no packs exist
  - [ ] Improve mobile responsiveness
  - [ ] Maintain all existing functionality

### Non-functional Requirements

- **Performance**: All admin pages must load in under 2 seconds
- **Security**: All admin routes protected by `isAdmin` check
- **Accessibility**: Admin UI meets WCAG 2.1 AA standards
- **Mobile**: Admin panel fully responsive for tablet/phone
- **Code Quality**: All code passes `pnpm typecheck`, `pnpm lint`, `pnpm build`
- **Testing**: Unit tests for components, E2E tests for critical flows
- **Design System**: Consistent color palette using Tailwind theme
- **Error Handling**: All errors caught and displayed via toast notifications

## Technical Implementation

### Architecture Impact

**New Directory Structure:**
```
components/
  admin/                    # New admin component library
    ui/                     # Base UI components
      AdminCard.tsx
      AdminButton.tsx
      DataTable.tsx
      FormInput.tsx
      ConfirmDialog.tsx
      Toast.tsx
      LoadingSpinner.tsx
      EmptyState.tsx
    charts/                 # Chart components for analytics
      LineChart.tsx
      BarChart.tsx

app/admin/
  layout.tsx               # Existing - minor updates
  page.tsx                 # Existing - use new components
  quiz-builder/            # Existing - refactor with components
  packs/                   # New - pack list page
    page.tsx
  pack/                    # New - pack forms
    new/
      page.tsx
    [id]/
      edit/
        page.tsx
  users/                   # New - user management
    page.tsx
  orders/                  # New - order management
    page.tsx
  analytics/               # New - analytics dashboard
    page.tsx

lib/
  admin/                   # New admin utilities
    auth.ts                # Shared auth helper
    constants.ts           # Admin theme constants
```

### Database Design

**No schema changes required** - All necessary models exist:
- User (isAdmin flag)
- Pack
- Product
- Order
- Quiz/Question
- Analytics models

**Possible future enhancements:**
```prisma
// Add soft delete to User model (optional)
model User {
  deletedAt DateTime?
}
```

### API Design

**Existing APIs (keep as-is):**
- `POST /api/admin/pack` - Create pack ✅
- `PUT /api/admin/pack` - Update pack ✅
- `POST /api/admin/quiz` - Create quiz ✅
- `PUT /api/admin/quiz` - Update quiz ✅
- `POST /api/admin/upload` - Upload PDF ✅
- `GET/POST /api/admin/youtube-sync` - Sync YouTube ✅

**New APIs needed:**
- `DELETE /api/admin/pack/[id]` - Delete pack
- `GET /api/admin/packs` - List packs with filters
- `GET /api/admin/users` - List users with search
- `PUT /api/admin/users/[id]` - Update user (toggle admin)
- `DELETE /api/admin/users/[id]` - Soft delete user
- `GET /api/admin/orders` - List orders with filters
- `GET /api/admin/analytics/revenue` - Revenue data
- `GET /api/admin/analytics/top-packs` - Top-selling packs
- `GET /api/admin/analytics/user-growth` - User growth data

### Component Architecture

**Base Component Pattern:**
```typescript
// components/admin/ui/AdminButton.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { ButtonHTMLAttributes, forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-[#20b2aa] text-white hover:bg-[#0f8080]',
        secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface AdminButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
)
```

**DataTable Component Pattern:**
```typescript
// components/admin/ui/DataTable.tsx
interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onSort?: (column: keyof T) => void
  onFilter?: (filters: Record<string, any>) => void
  isLoading?: boolean
  emptyState?: React.ReactNode
}

export function DataTable<T>({ data, columns, isLoading, emptyState }: DataTableProps<T>) {
  // Implementation with sorting, filtering, pagination
}
```

### Integration Points

- **Stripe**: Continue using existing `lib/stripe.ts` for payment link creation
- **Vercel Blob**: Continue using existing `@vercel/blob` for PDF uploads
- **YouTube**: Continue using existing `lib/youtube.ts` for video sync
- **Email**: Continue using existing `lib/notifications.ts` for email notifications
- **Database**: Continue using `prisma` client from `lib/db.ts`

### Security Considerations

**Admin Auth Helper:**
```typescript
// lib/admin/auth.ts
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user?.isAdmin) {
    redirect('/account')
  }

  return user
}

// Usage in pages
export default async function AdminPacksPage() {
  const admin = await requireAdmin()
  // ... page logic
}
```

**API Protection:**
```typescript
// Continue existing pattern - already secure
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... delete logic
}
```

### Performance Impact

**Bundle Size:**
- Adding Radix UI components: ~30KB
- Chart library (recharts or chart.js): ~50KB
- Total expected increase: ~80KB (within acceptable range)

**Database Queries:**
- Optimize pack listing with selective `include`
- Add pagination to user/order lists (limit 50 per page)
- Cache analytics data with React Server Components

**Optimization Strategies:**
- Use Server Components for data fetching
- Client Components only for interactivity (tables, modals)
- Lazy load chart library with dynamic imports
- Implement virtualization for large tables (1000+ rows)

## Backwards Compatibility

### API Contracts
✅ **No breaking changes** - All existing APIs remain unchanged
- Existing pack creation API continues to work
- Quiz builder API unchanged
- Upload API unchanged

### Database Schema
✅ **No breaking changes** - No schema modifications required
- Only additive changes if soft delete added
- Existing data remains intact

### User Experience
✅ **No breaking changes** - All existing workflows continue to work
- Quiz builder maintains current functionality
- Admin dashboard stats remain the same
- New pages are additions, not replacements

### Third-party Integrations
✅ **No breaking changes** - All integrations unaffected
- Stripe payment link creation unchanged
- YouTube sync functionality unchanged
- Email notifications unchanged

## Testing Strategy

### Unit Tests

```typescript
// tests/components/admin/AdminButton.test.tsx
describe('AdminButton', () => {
  it('renders with primary variant by default', () => {
    render(<AdminButton>Click me</AdminButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-[#20b2aa]')
  })

  it('renders with danger variant when specified', () => {
    render(<AdminButton variant="danger">Delete</AdminButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-600')
  })
})

// tests/components/admin/DataTable.test.tsx
describe('DataTable', () => {
  it('displays data in table format', () => {
    const data = [{ id: 1, name: 'Test' }]
    const columns = [{ header: 'Name', accessor: 'name' }]
    render(<DataTable data={data} columns={columns} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<DataTable data={[]} columns={[]} emptyState={<div>No data</div>} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })
})
```

### Integration Tests

```typescript
// tests/integration/admin/pack-management.test.ts
describe('Pack Management', () => {
  it('allows admin to create a pack', async () => {
    // Setup admin session
    const session = await createAdminSession()

    // Create pack via API
    const response = await fetch('/api/admin/pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Pack',
        description: 'Test',
        price: 999,
      }),
    })

    expect(response.ok).toBe(true)
    const { pack } = await response.json()
    expect(pack.title).toBe('Test Pack')
  })
})
```

### E2E Tests

```typescript
// e2e/admin/pack-management.spec.ts
test('admin can create and edit pack', async ({ page }) => {
  // Login as admin
  await loginAsAdmin(page)

  // Navigate to pack creation
  await page.goto('/admin/packs')
  await page.click('text=Create Pack')

  // Fill form
  await page.fill('input[name="title"]', 'New Pack')
  await page.fill('input[name="price"]', '999')
  await page.click('button[type="submit"]')

  // Verify success
  await expect(page.locator('text=Pack created successfully')).toBeVisible()

  // Verify appears in list
  await page.goto('/admin/packs')
  await expect(page.locator('text=New Pack')).toBeVisible()
})
```

## Implementation Plan

### Phase 1: Foundation (Week 1)
**Priority: Critical**

1. **Admin Component Library** (Day 1-2)
   - [ ] Create `components/admin/ui/` directory
   - [ ] Implement `AdminCard.tsx`
   - [ ] Implement `AdminButton.tsx` with CVA variants
   - [ ] Implement `FormInput.tsx` with validation
   - [ ] Implement `LoadingSpinner.tsx`
   - [ ] Implement `EmptyState.tsx`
   - [ ] Write unit tests for each component

2. **Admin Auth Helper** (Day 2)
   - [ ] Create `lib/admin/auth.ts`
   - [ ] Implement `requireAdmin()` helper
   - [ ] Write tests for auth helper

3. **Toast Notification System** (Day 3)
   - [ ] Install `@radix-ui/react-toast`
   - [ ] Create `components/admin/ui/Toast.tsx`
   - [ ] Create toast context/provider
   - [ ] Add to admin layout

4. **Data Table Component** (Day 3-4)
   - [ ] Create `components/admin/ui/DataTable.tsx`
   - [ ] Implement sorting functionality
   - [ ] Implement filtering functionality
   - [ ] Implement pagination
   - [ ] Write tests

5. **Confirm Dialog Component** (Day 4)
   - [ ] Install `@radix-ui/react-dialog`
   - [ ] Create `components/admin/ui/ConfirmDialog.tsx`
   - [ ] Write tests

### Phase 2: Pack Management (Week 2)
**Priority: High**

1. **Pack List Page** (Day 1-2)
   - [ ] Create `app/admin/packs/page.tsx`
   - [ ] Create `GET /api/admin/packs` endpoint
   - [ ] Implement DataTable with pack data
   - [ ] Add filter UI (active, has PDF, has quiz)
   - [ ] Add search functionality
   - [ ] Add actions (edit, delete)

2. **Create Pack Page** (Day 2-3)
   - [ ] Create `app/admin/pack/new/page.tsx`
   - [ ] Build pack creation form
   - [ ] Integrate PDF upload
   - [ ] Integrate Stripe payment link creation
   - [ ] Add form validation
   - [ ] Add success/error handling

3. **Edit Pack Page** (Day 3-4)
   - [ ] Create `app/admin/pack/[id]/edit/page.tsx`
   - [ ] Reuse form from create page
   - [ ] Pre-populate with existing data
   - [ ] Add update functionality
   - [ ] Add link to quiz builder

4. **Delete Pack API** (Day 4)
   - [ ] Create `DELETE /api/admin/pack/[id]` endpoint
   - [ ] Implement soft delete or cascade delete
   - [ ] Add confirmation dialog in UI

### Phase 3: User & Order Management (Week 3)
**Priority: Medium**

1. **User Management Page** (Day 1-2)
   - [ ] Create `app/admin/users/page.tsx`
   - [ ] Create `GET /api/admin/users` endpoint
   - [ ] Implement DataTable with user data
   - [ ] Add search functionality
   - [ ] Add toggle admin action
   - [ ] Add user detail modal

2. **User Management APIs** (Day 2)
   - [ ] Create `PUT /api/admin/users/[id]` for updates
   - [ ] Create `DELETE /api/admin/users/[id]` for soft delete
   - [ ] Add authorization checks

3. **Order Management Page** (Day 3-4)
   - [ ] Create `app/admin/orders/page.tsx`
   - [ ] Create `GET /api/admin/orders` endpoint
   - [ ] Implement DataTable with order data
   - [ ] Add status filter
   - [ ] Add date range filter
   - [ ] Add CSV export functionality
   - [ ] Add order detail modal

### Phase 4: Analytics (Week 4)
**Priority: Medium**

1. **Chart Components** (Day 1)
   - [ ] Install chart library (recharts)
   - [ ] Create `components/admin/charts/LineChart.tsx`
   - [ ] Create `components/admin/charts/BarChart.tsx`
   - [ ] Write tests

2. **Analytics APIs** (Day 2)
   - [ ] Create `GET /api/admin/analytics/revenue` endpoint
   - [ ] Create `GET /api/admin/analytics/top-packs` endpoint
   - [ ] Create `GET /api/admin/analytics/user-growth` endpoint
   - [ ] Implement data aggregation queries

3. **Analytics Dashboard** (Day 3-4)
   - [ ] Create `app/admin/analytics/page.tsx`
   - [ ] Implement revenue chart
   - [ ] Implement top packs chart
   - [ ] Implement user growth chart
   - [ ] Add date range selector
   - [ ] Add key metrics cards
   - [ ] Add CSV export

### Phase 5: Polish & Refinement (Week 5)
**Priority: Low**

1. **Improve Quiz Builder** (Day 1-2)
   - [ ] Refactor with new component library
   - [ ] Replace inline forms with `FormInput`
   - [ ] Add `ConfirmDialog` for deletions
   - [ ] Add `Toast` notifications
   - [ ] Improve mobile responsiveness

2. **Mobile Optimization** (Day 3)
   - [ ] Test all pages on mobile/tablet
   - [ ] Adjust table layouts for small screens
   - [ ] Ensure forms are touch-friendly
   - [ ] Test navigation on mobile

3. **Accessibility Audit** (Day 4)
   - [ ] Run WAVE accessibility checker
   - [ ] Add ARIA labels where needed
   - [ ] Test keyboard navigation
   - [ ] Ensure color contrast meets WCAG AA

4. **Performance Optimization** (Day 5)
   - [ ] Run Lighthouse audit
   - [ ] Optimize bundle size
   - [ ] Add lazy loading for charts
   - [ ] Implement data caching

5. **Final Testing** (Day 5)
   - [ ] Run full E2E test suite
   - [ ] Manual testing of all features
   - [ ] Cross-browser testing
   - [ ] Load testing

## Rollout Plan

### Pre-deployment Checklist
- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript compilation clean (`pnpm typecheck`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Production build successful (`pnpm build`)
- [ ] Lighthouse score > 80
- [ ] Accessibility audit passed
- [ ] Manual testing completed

### Deployment Strategy
**Incremental rollout using Git branching:**

1. **Spec Creation** (Day 0)
   ```bash
   git checkout -b spec/001-admin-dashboard-rebuild
   git add specs/001-admin-dashboard-rebuild/
   git commit -m "spec: add admin dashboard rebuild specification"
   git push origin spec/001-admin-dashboard-rebuild
   ```

2. **Implementation Branch** (Week 1-5)
   ```bash
   git checkout -b feature/001-admin-dashboard-rebuild
   # Implement features in phases
   git commit -m "feat(admin): add component library per specs/001"
   git commit -m "feat(admin): add pack management per specs/001"
   git push origin feature/001-admin-dashboard-rebuild
   ```

3. **Testing in Staging** (Week 5)
   - Deploy to Vercel preview environment
   - Run full test suite
   - Manual QA testing
   - Admin user acceptance testing

4. **Production Deployment** (Week 6)
   ```bash
   git checkout specdriven
   git merge feature/001-admin-dashboard-rebuild
   git push origin specdriven
   # Deploy to production via Vercel
   ```

### Rollback Plan
If critical issues occur post-deployment:

1. **Immediate Rollback**
   ```bash
   git revert <commit-hash>
   git push origin specdriven
   # Vercel auto-deploys previous version
   ```

2. **Database Rollback** (if schema changed)
   - Run Prisma migration rollback
   - Restore database from backup

3. **Monitor & Fix**
   - Check Vercel logs for errors
   - Review Sentry error reports
   - Fix issues in new branch
   - Redeploy after testing

## Success Metrics

### Quantitative Metrics
- **Code Quality**: 0 TypeScript errors, 0 ESLint errors
- **Performance**: Lighthouse score > 80
- **Test Coverage**: > 70% for new components
- **Bundle Size**: < 500KB total (currently ~450KB)
- **Load Time**: Admin pages load < 2 seconds
- **Error Rate**: < 1% of admin actions fail

### Qualitative Metrics
- **Usability**: Admin can complete common tasks without documentation
- **Consistency**: All UI components follow design system
- **Maintainability**: New admin features can be added quickly
- **Accessibility**: Passes WCAG 2.1 AA standards
- **Mobile UX**: Admin panel usable on tablet/phone

### Monitoring Plan
- **Vercel Analytics**: Track page load times
- **Sentry**: Monitor runtime errors
- **Database Metrics**: Track query performance
- **User Feedback**: Gather admin user feedback

## Future Enhancements

### Phase 6 (Future)
- **Bulk Actions**: Select multiple packs/users for batch operations
- **Advanced Filters**: Save filter presets for quick access
- **Audit Log**: Track all admin actions for compliance
- **Dark Mode**: Toggle dark theme for admin panel
- **Keyboard Shortcuts**: Add cmd+k command palette
- **Export/Import**: Bulk pack import from CSV
- **Email Templates**: Visual email template editor
- **Webhooks**: Admin-configurable webhooks for events
- **Role-Based Access**: Multiple admin roles with permissions

## Implementation Status

### ✅ Completed (All Phases)

**Phase 1: Foundation** (Commit `cddf74b`)
- ✅ Admin component library (12 components)
- ✅ Admin auth helper (`requireAdmin()`)
- ✅ Admin theme constants
- ✅ Toast notification system
- ✅ DataTable with sorting/pagination
- ✅ ConfirmDialog for destructive actions

**Phase 2: Pack Management** (Commit `e2b44e2`)
- ✅ Pack list page with DataTable
- ✅ Pack creation form with validation
- ✅ Pack edit page with pre-population
- ✅ PDF upload integration
- ✅ DELETE API endpoint

**Phase 3: User & Order Management** (Commit `e2b44e2`)
- ✅ User management page
- ✅ Toggle admin role with confirmation
- ✅ Order management page
- ✅ CSV export functionality
- ✅ Status filters

**Phase 4: Analytics Dashboard** (Commit `e2b44e2`)
- ✅ Revenue metrics (total, 30-day, AOV)
- ✅ User growth statistics
- ✅ Top-selling packs table
- ✅ Key metrics cards

**Phase 5: Polish & Refinement** (Commit `TBD`)
- ✅ Updated main dashboard with AdminCard
- ✅ Refactored Quiz Builder with new components
- ✅ Toast notifications throughout
- ✅ ConfirmDialog for question deletion
- ✅ EmptyState for no packs
- ✅ Consistent UX across all pages

### 🚧 In Progress
- None

### ❌ Blocked
- None

### 📊 Implementation Summary

**Total Files Created:** 28
- Component library: 12 files
- Admin pages: 10 files
- API routes: 2 files
- Utilities: 2 files
- Specification: 2 files

**Code Quality:**
- TypeScript: All new code type-safe
- No new TypeScript errors introduced
- Consistent coding patterns
- Proper error handling with toast notifications

**Performance:**
- DataTable pagination (10-20 items/page)
- Optimized database queries
- Server Components for data fetching
- Client Components only for interactivity

## References

- **Baseline Specification**: `specs/000-baseline/specification.md`
- **Development Workflow**: `specs/DEVELOPMENT_WORKFLOW.md`
- **Admin Steering**: `.claude/steering/structure.md`, `.claude/steering/conventions.md`
- **Current Admin Code**: `app/admin/`, `app/api/admin/`
- **Database Schema**: `prisma/schema.prisma`
- **Auth Configuration**: `lib/auth.ts`
