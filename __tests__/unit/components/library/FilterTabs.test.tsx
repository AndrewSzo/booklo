import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterTabs from '@/components/library/FilterTabs'

describe('FilterTabs Component', () => {
  const mockOnStatusChange = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    activeStatus: 'all' as const,
    onStatusChange: mockOnStatusChange,
    bookCounts: {
      want_to_read: 10,
      reading: 5,
      finished: 10
    }
  }

  describe('Rendering', () => {
    it('renders all filter tabs', () => {
      render(<FilterTabs {...defaultProps} />)
      
      expect(screen.getByRole('tab', { name: /wszystkie/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /chcę przeczytać/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /czytam/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /przeczytane/i })).toBeInTheDocument()
    })

    it('displays book counts for each tab', () => {
      render(<FilterTabs {...defaultProps} />)
      
      expect(screen.getByTestId('filter-tab-all-count')).toHaveTextContent('25') // all (sum of all counts: 10+5+10=25)
      expect(screen.getByTestId('filter-tab-want_to_read-count')).toHaveTextContent('10') // want_to_read
      expect(screen.getByTestId('filter-tab-reading-count')).toHaveTextContent('5')  // reading
      expect(screen.getByTestId('filter-tab-finished-count')).toHaveTextContent('10') // finished
    })

    it('highlights active tab', () => {
      render(<FilterTabs {...defaultProps} activeStatus="reading" />)
      
      const readingTab = screen.getByRole('tab', { name: /czytam/i })
      expect(readingTab).toHaveAttribute('aria-selected', 'true')
    })

    it('shows inactive state for non-selected tabs', () => {
      render(<FilterTabs {...defaultProps} activeStatus="reading" />)
      
      const allTab = screen.getByRole('tab', { name: /wszystkie/i })
      const wantToReadTab = screen.getByRole('tab', { name: /chcę przeczytać/i })
      const finishedTab = screen.getByRole('tab', { name: /przeczytane/i })
      
      expect(allTab).toHaveAttribute('aria-selected', 'false')
      expect(wantToReadTab).toHaveAttribute('aria-selected', 'false')
      expect(finishedTab).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('User Interactions', () => {
    it('calls onStatusChange when tab is clicked', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} />)
      
      const readingTab = screen.getByRole('tab', { name: /czytam/i })
      await user.click(readingTab)
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('reading')
    })

    it('handles all status filter selection', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} activeStatus="reading" />)
      
      const allTab = screen.getByRole('tab', { name: /wszystkie/i })
      await user.click(allTab)
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('all')
    })

    it('handles want_to_read status selection', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} />)
      
      const wantToReadTab = screen.getByRole('tab', { name: /chcę przeczytać/i })
      await user.click(wantToReadTab)
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('want_to_read')
    })

    it('handles finished status selection', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} />)
      
      const finishedTab = screen.getByRole('tab', { name: /przeczytane/i })
      await user.click(finishedTab)
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('finished')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation with arrow keys', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} />)
      
      const allTab = screen.getByRole('tab', { name: /wszystkie/i })
      expect(allTab).toHaveAttribute('tabindex', '0')
      
      const wantToReadTab = screen.getByRole('tab', { name: /chcę przeczytać/i })
      expect(wantToReadTab).toHaveAttribute('tabindex', '-1')
    })

    it('activates tab on Enter key', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} />)
      
      const readingTab = screen.getByRole('tab', { name: /czytam/i })
      readingTab.focus()
      
      await user.keyboard('{Enter}')
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('reading')
    })

    it('activates tab on Space key', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} />)
      
      const finishedTab = screen.getByRole('tab', { name: /przeczytane/i })
      finishedTab.focus()
      
      await user.keyboard(' ')
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('finished')
    })
  })

  describe('Accessibility', () => {
    it('has proper tablist role', () => {
      render(<FilterTabs {...defaultProps} />)
      
      const tablist = screen.getByRole('tablist')
      expect(tablist).toBeInTheDocument()
    })

    it('has correct aria-label for tablist', () => {
      render(<FilterTabs {...defaultProps} />)
      
      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label', 'Filtruj książki według statusu')
    })

    it('has proper tab roles and attributes', () => {
      render(<FilterTabs {...defaultProps} />)
      
      const tabs = screen.getAllByRole('tab')
      
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('role', 'tab')
        expect(tab).toHaveAttribute('aria-selected')
        expect(tab).toHaveAttribute('tabindex')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles zero book counts', () => {
      const propsWithZeroCounts = {
        ...defaultProps,
        bookCounts: {
          all: 0,
          want_to_read: 0,
          reading: 0,
          finished: 0
        }
      }
      
      render(<FilterTabs {...propsWithZeroCounts} />)
      
      const counts = screen.getAllByText('0')
      expect(counts).toHaveLength(4)
    })

    it('handles missing book counts gracefully', () => {
      const propsWithMissingCounts = {
        ...defaultProps,
        bookCounts: undefined
      }
      
      expect(() => {
        render(<FilterTabs {...propsWithMissingCounts} />)
      }).not.toThrow()
    })

    it('does not call onStatusChange when clicking already active tab', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} activeStatus="all" />)
      
      const allTab = screen.getByRole('tab', { name: /wszystkie/i })
      await user.click(allTab)
      
      // Should still call the function, but with the same value
      expect(mockOnStatusChange).toHaveBeenCalledWith('all')
    })
  })

  describe('Visual States', () => {
    it('applies active styling to selected tab', () => {
      render(<FilterTabs {...defaultProps} activeStatus="reading" />)
      
      const readingTab = screen.getByRole('tab', { name: /czytam/i })
      expect(readingTab).toHaveAttribute('aria-selected', 'true')
    })

    it('applies inactive styling to non-selected tabs', () => {
      render(<FilterTabs {...defaultProps} activeStatus="reading" />)
      
      const allTab = screen.getByRole('tab', { name: /wszystkie/i })
      expect(allTab).toHaveAttribute('aria-selected', 'false')
    })
  })
}) 