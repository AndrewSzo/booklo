import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/components/auth/LoginForm'

// Mock the login action
const mockLoginAction = jest.fn()

jest.mock('@/lib/actions/auth', () => ({
  loginAction: mockLoginAction
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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders email and password fields', () => {
      render(<LoginForm />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument()
    })

    it('renders login button', () => {
      render(<LoginForm />)
      
      const loginButton = screen.getByRole('button', { name: /zaloguj/i })
      expect(loginButton).toBeInTheDocument()
    })

    it('renders forgot password link', () => {
      render(<LoginForm />)
      
      const forgotPasswordLink = screen.getByRole('link', { name: /zapomniałeś hasła/i })
      expect(forgotPasswordLink).toBeInTheDocument()
    })

    it('renders registration link', () => {
      render(<LoginForm />)
      
      const registerLink = screen.getByRole('link', { name: /zarejestruj się/i })
      expect(registerLink).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('validates required email field', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email jest wymagany/i)).toBeInTheDocument()
      })
    })

    it('validates required password field', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/hasło jest wymagane/i)).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/nieprawidłowy format emaila/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('calls login action with valid credentials', async () => {
      const user = userEvent.setup()
      mockLoginAction.mockResolvedValue({ success: true })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/hasło/i)
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockLoginAction).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })

    it('displays error message on failed login', async () => {
      const user = userEvent.setup()
      mockLoginAction.mockResolvedValue({
        success: false,
        error: 'Nieprawidłowe dane logowania'
      })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/hasło/i)
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/nieprawidłowe dane logowania/i)).toBeInTheDocument()
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      mockLoginAction.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true }), 1000)
      ))
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/hasło/i)
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/logowanie/i)).toBeInTheDocument()
    })

    it('disables form during submission', async () => {
      const user = userEvent.setup()
      mockLoginAction.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ success: true }), 1000)
      ))
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/hasło/i)
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('User Interactions', () => {
    it('allows typing in email field', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')
      
      expect(emailInput).toHaveValue('user@example.com')
    })

    it('allows typing in password field', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const passwordInput = screen.getByLabelText(/hasło/i)
      await user.type(passwordInput, 'secretpassword')
      
      expect(passwordInput).toHaveValue('secretpassword')
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const passwordInput = screen.getByLabelText(/hasło/i)
      const toggleButton = screen.getByRole('button', { name: /pokaż hasło/i })
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('submits form on Enter key', async () => {
      const user = userEvent.setup()
      mockLoginAction.mockResolvedValue({ success: true })
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/hasło/i)
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(mockLoginAction).toHaveBeenCalled()
      })
    })
  })

  describe('Navigation Links', () => {
    it('has correct forgot password link href', () => {
      render(<LoginForm />)
      
      const forgotPasswordLink = screen.getByRole('link', { name: /zapomniałeś hasła/i })
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
    })

    it('has correct registration link href', () => {
      render(<LoginForm />)
      
      const registerLink = screen.getByRole('link', { name: /zarejestruj się/i })
      expect(registerLink).toHaveAttribute('href', '/auth/register')
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<LoginForm />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument()
    })

    it('associates error messages with form fields', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i)
        const errorId = emailInput.getAttribute('aria-describedby')
        if (errorId) {
          expect(screen.getByText(/email jest wymagany/i)).toHaveAttribute('id', errorId)
        }
      })
    })

    it('has accessible submit button', () => {
      render(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const user = userEvent.setup()
      mockLoginAction.mockRejectedValue(new Error('Network error'))
      
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/hasło/i)
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/błąd połączenia/i)).toBeInTheDocument()
      })
    })

    it('clears errors when user starts typing', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /zaloguj/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email jest wymagany/i)).toBeInTheDocument()
      })
      
      // Start typing in email field
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 't')
      
      await waitFor(() => {
        expect(screen.queryByText(/email jest wymagany/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Security Features', () => {
    it('does not expose password in DOM when hidden', () => {
      render(<LoginForm />)
      
      const passwordInput = screen.getByLabelText(/hasło/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
    })

    it('has proper autoComplete attributes', () => {
      render(<LoginForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/hasło/i)
      
      expect(emailInput).toHaveAttribute('autoComplete', 'email')
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password')
    })
  })
}) 