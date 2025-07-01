import { render, screen } from '@testing-library/react'
import LoginForm from '@/components/auth/LoginForm'

// Mock the login action
jest.mock('@/lib/actions/auth', () => ({
  loginAction: jest.fn()
}))

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn(fn => fn),
    formState: { errors: {}, isSubmitting: false },
    reset: jest.fn(),
  }),
}))

describe('LoginForm Component', () => {
  describe('Rendering', () => {
    it('renders login form', () => {
      render(<LoginForm />)
      
      const form = screen.getByTestId('login-form')
      expect(form).toBeDefined()
    })

    it('renders email field', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByTestId('email-input')
      expect(emailInput).toBeDefined()
    })

    it('renders password field', () => {
      render(<LoginForm />)
      
      const passwordInput = screen.getByTestId('password-input')
      expect(passwordInput).toBeDefined()
    })

    it('renders submit button', () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByTestId('login-submit-button')
      expect(submitButton).toBeDefined()
    })
  })
}) 