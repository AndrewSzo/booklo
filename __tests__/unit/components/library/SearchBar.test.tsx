import { render, screen, waitFor, act } from '@testing-library/react'
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
      
      const searchInput = screen.getByTestId('search-input')
      expect(searchInput).toBeDefined()
      expect(searchInput.getAttribute('placeholder')).toBe('Search books...')
    })

    it('renders search icon', () => {
      render(<SearchBar {...defaultProps} />)
      
      const searchIcon = screen.getByTestId('search-icon')
      expect(searchIcon).toBeDefined()
    })

    it('displays initial value when provided', () => {
      render(<SearchBar {...defaultProps} value="existing search" />)
      
      const searchInput = screen.getByTestId('search-input') as HTMLInputElement
      expect(searchInput.value).toBe('existing search')
    })

    it('shows clear button when input has value', () => {
      render(<SearchBar {...defaultProps} value="test query" />)
      
      const clearButton = screen.getByTestId('search-clear-button')
      expect(clearButton).toBeDefined()
    })

    it('hides clear button when input is empty', () => {
      render(<SearchBar {...defaultProps} value="" />)
      
      const clearButton = screen.queryByTestId('search-clear-button')
      expect(clearButton).toBeNull()
    })
  })

  describe('User Interactions', () => {
    it('updates input value when user types', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByTestId('search-input') as HTMLInputElement
      
      await user.type(searchInput, 'Harry Potter')
      expect(searchInput.value).toBe('Harry Potter')
    })

    it('calls onSearch with debounced input after 300ms', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByTestId('search-input')
      
      await user.type(searchInput, 'test')
      
      // Should not call immediately
      expect(mockOnSearch).not.toHaveBeenCalled()
      
      // Fast-forward time by 300ms
      jest.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test')
      })
    })

    it('clears input when clear button is clicked', () => {
      render(<SearchBar {...defaultProps} value="test query" />)
      
      const clearButton = screen.getByTestId('search-clear-button')
      const searchInput = screen.getByTestId('search-input') as HTMLInputElement
      
      act(() => {
        clearButton.click()
      })
      
      expect(searchInput.value).toBe('')
      expect(mockOnSearch).toHaveBeenCalledWith('')
    })
  })

  describe('Loading State', () => {
    it('disables input when loading', () => {
      render(<SearchBar {...defaultProps} isLoading={true} />)
      
      const searchInput = screen.getByTestId('search-input') as HTMLInputElement
      expect(searchInput.disabled).toBe(true)
    })

    it('allows interaction when not loading', () => {
      render(<SearchBar {...defaultProps} isLoading={false} />)
      
      const searchInput = screen.getByTestId('search-input') as HTMLInputElement
      expect(searchInput.disabled).toBe(false)
    })
  })

  describe('Character Limit', () => {
    it('enforces maxLength of 100 characters', () => {
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByTestId('search-input')
      expect(searchInput.getAttribute('maxLength')).toBe('100')
    })
  })

  describe('Value Synchronization', () => {
    it('syncs with external value changes', () => {
      const { rerender } = render(<SearchBar {...defaultProps} value="initial" />)
      
      const searchInput = screen.getByTestId('search-input') as HTMLInputElement
      expect(searchInput.value).toBe('initial')
      
      rerender(<SearchBar {...defaultProps} value="updated" />)
      expect(searchInput.value).toBe('updated')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty search query', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} value="test" />)
      
      const searchInput = screen.getByTestId('search-input')
      
      await user.clear(searchInput)
      
      jest.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('')
      })
    })

    it('handles special characters in search', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<SearchBar {...defaultProps} />)
      
      const searchInput = screen.getByTestId('search-input')
      const specialQuery = 'test@#$%^&*()'
      
      await user.type(searchInput, specialQuery)
      
      jest.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(specialQuery)
      })
    })

  })

  describe('Custom Props', () => {
    it('uses custom placeholder', () => {
      render(<SearchBar {...defaultProps} placeholder="Find your books..." />)
      
      const searchInput = screen.getByTestId('search-input')
      expect(searchInput.getAttribute('placeholder')).toBe('Find your books...')
    })
  })
}) 