import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@/components/library/SearchBar'

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  const defaultProps = {
    value: '',
    onSearch: mockOnSearch,
    placeholder: 'Search books...',
    isLoading: false,
  }

  describe('Rendering', () => {
    it('renders search input with correct placeholder', () => {
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveValue('')
    })

    it('renders search icon', () => {
      render(<SearchBar {...defaultProps} />)
      
      // Search icon should be present
      const searchIcon = screen.getByTestId('search-icon')
      expect(searchIcon).toBeInTheDocument()
    })

    it('displays initial value when provided', () => {
      render(<SearchBar {...defaultProps} value="existing search" />)
      
      const searchInput = screen.getByDisplayValue('existing search')
      expect(searchInput).toBeInTheDocument()
    })

    it('shows clear button when input has value', () => {
      render(<SearchBar {...defaultProps} value="test query" />)
      
      const clearButton = screen.getByLabelText('Clear search')
      expect(clearButton).toBeInTheDocument()
    })

    it('hides clear button when input is empty', () => {
      render(<SearchBar {...defaultProps} value="" />)
      
      const clearButton = screen.queryByLabelText('Clear search')
      expect(clearButton).not.toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('updates input value when user types', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      
      await user.type(searchInput, 'Harry Potter')
      expect(searchInput).toHaveValue('Harry Potter')
    })

    it('calls onSearch with debounced input after 300ms', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      
      await user.type(searchInput, 'test')
      
      // Should not call immediately
      expect(mockOnSearch).not.toHaveBeenCalled()
      
      // Fast-forward time by 300ms
      jest.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test')
      })
    })

    it('debounces multiple rapid inputs', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      
      await user.type(searchInput, 'a')
      jest.advanceTimersByTime(100)
      
      await user.type(searchInput, 'b')
      jest.advanceTimersByTime(100)
      
      await user.type(searchInput, 'c')
      
      // Should not have called onSearch yet
      expect(mockOnSearch).not.toHaveBeenCalled()
      
      // Complete the debounce timeout
      jest.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledTimes(1)
        expect(mockOnSearch).toHaveBeenCalledWith('abc')
      })
    })

    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} value="test query" />)
      
      const clearButton = screen.getByLabelText('Clear search')
      
      await user.click(clearButton)
      
      expect(mockOnSearch).toHaveBeenCalledWith('')
    })

    it('submits form on Enter key', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      
      await user.type(searchInput, 'submit test')
      await user.keyboard('{Enter}')
      
      expect(mockOnSearch).toHaveBeenCalledWith('submit test')
    })
  })

  describe('Loading State', () => {
    it('disables input when loading', () => {
      render(<SearchBar {...defaultProps} isLoading={true} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      expect(searchInput).toBeDisabled()
    })

    it('allows interaction when not loading', () => {
      render(<SearchBar {...defaultProps} isLoading={false} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      expect(searchInput).not.toBeDisabled()
    })
  })

  describe('Character Limit', () => {
    it('enforces maxLength of 100 characters', () => {
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      expect(searchInput).toHaveAttribute('maxLength', '100')
    })
  })

  describe('Value Synchronization', () => {
    it('syncs with external value changes', () => {
      const { rerender } = render(<SearchBar {...defaultProps} value="initial" />)
      
      const searchInput = screen.getByDisplayValue('initial')
      expect(searchInput).toHaveValue('initial')
      
      rerender(<SearchBar {...defaultProps} value="updated" />)
      expect(searchInput).toHaveValue('updated')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty search query', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} value="test" />)
      
      const searchInput = screen.getByDisplayValue('test')
      
      await user.clear(searchInput)
      
      jest.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('')
      })
    })

    it('handles special characters in search', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      const specialQuery = '!@#$%^&*()'
      
      await user.type(searchInput, specialQuery)
      
      jest.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(specialQuery)
      })
    })

    it('prevents form submission when disabled', () => {
      render(<SearchBar {...defaultProps} isLoading={true} />)
      
      const searchInput = screen.getByPlaceholderText('Search books...')
      expect(searchInput).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<SearchBar {...defaultProps} />)
      
      const form = screen.getByRole('search')
      const searchInput = screen.getByRole('textbox')
      
      expect(form).toBeInTheDocument()
      expect(searchInput).toBeInTheDocument()
      expect(form).toHaveAttribute('aria-label', 'Search form')
    })

    it('clear button has accessible label', () => {
      render(<SearchBar {...defaultProps} value="test" />)
      
      const clearButton = screen.getByLabelText('Clear search')
      expect(clearButton).toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(<SearchBar {...defaultProps} className="custom-search-bar" />)
      
      const form = screen.getByRole('search')
      expect(form).toHaveClass('custom-search-bar')
    })

    it('uses custom placeholder', () => {
      render(<SearchBar {...defaultProps} placeholder="Custom placeholder" />)
      
      const searchInput = screen.getByPlaceholderText('Custom placeholder')
      expect(searchInput).toBeInTheDocument()
    })
  })
}) 