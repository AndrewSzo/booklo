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
    it('renders all filter buttons', () => {
      render(<FilterTabs {...defaultProps} />)
      
      expect(screen.getByTestId('filter-tab-all')).toBeInTheDocument()
      expect(screen.getByTestId('filter-tab-want_to_read')).toBeInTheDocument()
      expect(screen.getByTestId('filter-tab-reading')).toBeInTheDocument()
      expect(screen.getByTestId('filter-tab-finished')).toBeInTheDocument()
    })

    it('displays book counts for each tab', () => {
      render(<FilterTabs {...defaultProps} />)
      
      expect(screen.getByTestId('filter-tab-want_to_read-count')).toHaveTextContent('10')
      expect(screen.getByTestId('filter-tab-reading-count')).toHaveTextContent('5')
      expect(screen.getByTestId('filter-tab-finished-count')).toHaveTextContent('10')
    })

    it('highlights active tab', () => {
      render(<FilterTabs {...defaultProps} activeStatus="reading" />)
      
      const readingTab = screen.getByTestId('filter-tab-reading')
      expect(readingTab).toHaveClass('scale-105')
    })
  })

  describe('User Interactions', () => {
    it('calls onStatusChange when tab is clicked', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} />)
      
      const readingTab = screen.getByTestId('filter-tab-reading')
      await user.click(readingTab)
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('reading')
    })

    it('handles all status filter selection', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} activeStatus="reading" />)
      
      const allTab = screen.getByTestId('filter-tab-all')
      await user.click(allTab)
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('all')
    })

    it('handles want_to_read status selection', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} />)
      
      const wantToReadTab = screen.getByTestId('filter-tab-want_to_read')
      await user.click(wantToReadTab)
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('want_to_read')
    })

    it('handles finished status selection', async () => {
      const user = userEvent.setup()
      render(<FilterTabs {...defaultProps} />)
      
      const finishedTab = screen.getByTestId('filter-tab-finished')
      await user.click(finishedTab)
      
      expect(mockOnStatusChange).toHaveBeenCalledWith('finished')
    })
  })

  describe('Edge Cases', () => {
    it('handles zero book counts', () => {
      const propsWithZeroCounts = {
        ...defaultProps,
        bookCounts: {
          want_to_read: 0,
          reading: 0,
          finished: 0
        }
      }
      
      render(<FilterTabs {...propsWithZeroCounts} />)
      
      expect(screen.getByTestId('filter-tab-want_to_read-count')).toHaveTextContent('0')
      expect(screen.getByTestId('filter-tab-reading-count')).toHaveTextContent('0')
      expect(screen.getByTestId('filter-tab-finished-count')).toHaveTextContent('0')
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
  })
}) 