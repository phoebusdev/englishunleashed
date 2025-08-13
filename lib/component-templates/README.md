# Component Templates and Patterns

This directory contains reusable component templates and patterns for AI-friendly development. Each template is thoroughly documented with examples and best practices.

## Available Templates

### 1. Page Component Template
Location: `page-template.tsx`
- Standard page component structure
- Data fetching patterns
- Error boundaries
- Loading states
- SEO metadata

### 2. Form Component Template
Location: `form-template.tsx`
- Form validation with Zod
- Error handling
- Loading states
- Success feedback
- Accessibility features

### 3. API Route Template
Location: `api-route-template.ts`
- Request validation
- Error handling
- Authentication checks
- Response formatting
- Rate limiting

### 4. Modal Component Template
Location: `modal-template.tsx`
- Accessible modal implementation
- Focus management
- Keyboard navigation
- Animation patterns
- Portal rendering

### 5. List Component Template
Location: `list-template.tsx`
- Pagination
- Sorting
- Filtering
- Empty states
- Loading skeletons

## Usage Guidelines

### When to Use Templates

1. **Creating New Components**: Start with a template instead of blank file
2. **Refactoring Existing Code**: Use templates as reference for patterns
3. **Code Reviews**: Compare against templates for consistency
4. **AI Development**: Templates provide clear patterns for AI to follow

### How to Use Templates

1. Copy the appropriate template file
2. Rename according to your component
3. Replace placeholder values
4. Customize business logic
5. Keep documentation structure intact

### Template Structure

Each template follows this structure:

```typescript
/**
 * Component Name
 * 
 * Purpose: [What this component does]
 * Used in: [Where this component is used]
 * 
 * Features:
 * - [Feature 1]
 * - [Feature 2]
 * 
 * Props: [Documented with JSDoc]
 * State: [State management approach]
 * Side Effects: [API calls, subscriptions]
 * 
 * @module components/[component-name]
 */
```

## Best Practices

### Documentation
- Every component must have a header comment
- All props must be documented with JSDoc
- Complex logic needs inline comments
- Include usage examples

### Error Handling
- Use error boundaries for component trees
- Handle loading and error states explicitly
- Provide user-friendly error messages
- Log errors for debugging

### Performance
- Use React.memo for expensive components
- Implement proper key props for lists
- Lazy load heavy components
- Optimize re-renders with useMemo/useCallback

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Follow WCAG guidelines

### Testing
- Write unit tests for logic
- Include integration tests for interactions
- Test error scenarios
- Document test cases

## Pattern Reference

### Data Fetching Patterns

#### Server Components (Preferred)
```typescript
async function getData() {
  // Fetch data on server
  const data = await prisma.model.findMany()
  return data
}

export default async function Page() {
  const data = await getData()
  return <Component data={data} />
}
```

#### Client Components (When Needed)
```typescript
'use client'

function Component() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <Loading />
  if (error) return <Error error={error} />
  return <Content data={data} />
}
```

### Form Patterns

#### With Zod Validation
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

function Form() {
  const handleSubmit = (data: z.infer<typeof schema>) => {
    // Handle validated data
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### State Management Patterns

#### Local State
```typescript
const [state, setState] = useState(initialState)
```

#### Context for Shared State
```typescript
const Context = createContext()

export function Provider({ children }) {
  const value = useProviderValue()
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useContext() {
  const context = useContext(Context)
  if (!context) throw new Error('useContext must be used within Provider')
  return context
}
```

## Contributing

When adding new templates:

1. Follow the existing structure
2. Include comprehensive documentation
3. Add usage examples
4. Update this README
5. Test the template thoroughly
6. Get code review approval

## Questions?

If you need help with templates or patterns, check:
1. This README
2. Individual template files
3. The AI Development Guide
4. Ask in code reviews