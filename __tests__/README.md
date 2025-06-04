# 🧪 Test Suite - Booklo Application

This directory contains comprehensive unit tests for the Booklo application, following the test plan specifications.

## 📁 Test Structure

```
__tests__/
├── unit/                    # Unit tests
│   ├── components/         # React component tests
│   │   ├── auth/          # Authentication components
│   │   ├── library/       # Library management components
│   │   ├── ui/            # UI components
│   │   └── layout/        # Layout components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and services
│   └── api/               # API endpoint tests
├── integration/           # Integration tests (future)
├── e2e/                   # End-to-end tests (future)
└── utils/                 # Test utilities and helpers
```

## 🛠️ Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom Jest matchers for DOM

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### UI Components Only
```bash
npm run test:ui
```

## 📋 Test Categories

### 🔐 Authentication Tests (`components/auth/`)
- **LoginForm.test.tsx**: Login form validation, submission, error handling
- **RegisterForm.test.tsx**: Registration form validation and security
- **ResetPasswordForm.test.tsx**: Password reset functionality

**Coverage Target**: 100% (Critical security component)

### 📚 Library Components (`components/library/`)
- **SearchBar.test.tsx**: Search functionality, debouncing, accessibility
- **RatingInput.test.tsx**: Star rating system, keyboard navigation
- **FilterTabs.test.tsx**: Status filtering, tab navigation
- **AddBookModal.test.tsx**: Book creation wizard
- **BooksGrid.test.tsx**: Book display and interaction

**Coverage Target**: 80% line coverage

### 🎨 UI Components (`components/ui/`)
- **Button.test.tsx**: Button variants and states
- **Input.test.tsx**: Form input validation
- **Dialog.test.tsx**: Modal functionality
- **Select.test.tsx**: Dropdown selection

**Coverage Target**: 70% line coverage

### 🔧 Hooks (`hooks/`)
- **useAddBookForm.test.ts**: Form state management and validation
- **useBooks.test.ts**: Book data fetching and caching
- **useAuth.test.ts**: Authentication state management

**Coverage Target**: 80% line coverage

### 🛠️ Utilities (`lib/`)
- **utils.test.ts**: Helper functions (cn, formatDate, etc.)
- **validations.test.ts**: Form validation schemas
- **services.test.ts**: API service functions

**Coverage Target**: 80% line coverage

### 🌐 API Tests (`api/`)
- **books.test.ts**: CRUD operations for books
- **auth.test.ts**: Authentication endpoints
- **ai-chat.test.ts**: AI chat functionality

**Coverage Target**: 90% line coverage

## 🎯 Test Patterns

### Component Testing Pattern
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Component from '@/components/Component'

describe('Component', () => {
  const defaultProps = {
    // Define default props
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders correctly', () => {
      render(<Component {...defaultProps} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup()
      const mockHandler = jest.fn()
      
      render(<Component {...defaultProps} onClick={mockHandler} />)
      
      await user.click(screen.getByRole('button'))
      expect(mockHandler).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Component {...defaultProps} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label')
    })
  })
})
```

### Hook Testing Pattern
```typescript
import { renderHook, act } from '@testing-library/react'
import { useCustomHook } from '@/hooks/useCustomHook'

describe('useCustomHook', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useCustomHook())
    
    expect(result.current.value).toBe(initialValue)
  })

  it('updates state correctly', () => {
    const { result } = renderHook(() => useCustomHook())
    
    act(() => {
      result.current.setValue(newValue)
    })
    
    expect(result.current.value).toBe(newValue)
  })
})
```

### API Testing Pattern
```typescript
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/endpoint/route'

// Mock dependencies
jest.mock('@/lib/services/service', () => ({
  serviceMethod: jest.fn(),
}))

describe('/api/endpoint', () => {
  const mockService = require('@/lib/services/service').serviceMethod

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles successful requests', async () => {
    mockService.mockResolvedValue({ success: true, data: {} })
    
    const request = new NextRequest('http://localhost:3000/api/endpoint')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

## 🔍 Test Coverage Goals

| Component Type | Coverage Target | Priority |
|----------------|----------------|----------|
| Authentication | 100% | Critical |
| API Endpoints | 90% | High |
| Core Components | 80% | High |
| UI Components | 70% | Medium |
| Utilities | 80% | Medium |

## 🚨 Critical Test Areas

### Security Tests
- Authentication flows
- Input validation
- XSS prevention
- CSRF protection

### Data Integrity Tests
- Book CRUD operations
- User data validation
- Database constraints

### User Experience Tests
- Form validation
- Loading states
- Error handling
- Accessibility

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- Next.js integration
- TypeScript support
- Module path mapping
- Coverage thresholds
- Test environment setup

### Setup Files (`jest.setup.js`)
- Testing Library DOM matchers
- Global mocks (Next.js, Supabase, React Query)
- Browser API mocks

## 📊 Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Data**: `coverage/lcov.info`
- **JSON Summary**: `coverage/coverage-summary.json`

## 🐛 Debugging Tests

### Common Issues
1. **Mock not working**: Ensure mocks are defined before imports
2. **Async test failures**: Use `await` with user events and API calls
3. **DOM queries failing**: Check component rendering and accessibility

### Debug Commands
```bash
# Run specific test file
npm test SearchBar.test.tsx

# Run tests in debug mode
npm test -- --verbose

# Run tests with coverage for specific file
npm test -- --coverage --collectCoverageFrom="components/library/SearchBar.tsx"
```

## 📝 Writing New Tests

### Checklist for New Component Tests
- [ ] Rendering tests
- [ ] User interaction tests
- [ ] Props validation tests
- [ ] Error state tests
- [ ] Loading state tests
- [ ] Accessibility tests
- [ ] Edge case tests

### Checklist for New API Tests
- [ ] Success response tests
- [ ] Error response tests
- [ ] Authentication tests
- [ ] Validation tests
- [ ] Rate limiting tests
- [ ] Security tests

## 🔄 Continuous Integration

Tests are automatically run on:
- Pull request creation
- Push to main branch
- Scheduled nightly runs

### CI Requirements
- All tests must pass
- Coverage thresholds must be met
- No linting errors
- No TypeScript errors

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://testing-library.com/docs/guide-which-query/)

---

*Last Updated: $(date)*
*Test Plan Version: 1.0* 