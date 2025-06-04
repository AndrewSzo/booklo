import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RatingInput } from '@/components/library/RatingInput'

describe('RatingInput Component', () => {
  const mockOnChange = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    currentRating: null,
    onChange: mockOnChange,
    isLoading: false,
    size: 'md' as const,
  }

  describe('Rendering', () => {
    it('renders five star buttons', () => {
      render(<RatingInput {...defaultProps} />)
      
      const starButtons = screen.getAllByRole('radio')
      expect(starButtons).toHaveLength(5)
    })

    it('displays current rating correctly', () => {
      render(<RatingInput {...defaultProps} currentRating={3} />)
      
      const stars = screen.getAllByRole('radio')
      
      // First 3 stars should be filled (active)
      for (let i = 0; i < 3; i++) {
        expect(stars[i]).toHaveClass('text-yellow-400')
      }
      
      // Last 2 stars should not be filled
      for (let i = 3; i < 5; i++) {
        expect(stars[i]).toHaveClass('text-gray-300')
      }
    })

    it('shows remove button when rating exists', () => {
      render(<RatingInput {...defaultProps} currentRating={4} />)
      
      const removeButton = screen.getByRole('button', { name: /usuń/i })
      expect(removeButton).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onChange when star is clicked', async () => {
      const user = userEvent.setup()
      render(<RatingInput {...defaultProps} />)
      
      const thirdStar = screen.getAllByRole('radio')[2]
      await user.click(thirdStar)
      
      expect(mockOnChange).toHaveBeenCalledWith(3)
    })

    it('clears rating when clicking same rating', async () => {
      const user = userEvent.setup()
      render(<RatingInput {...defaultProps} currentRating={3} />)
      
      const thirdStar = screen.getAllByRole('radio')[2]
      await user.click(thirdStar)
      
      expect(mockOnChange).toHaveBeenCalledWith(null)
    })

    it('shows hover effect on star hover', async () => {
      const user = userEvent.setup()
      render(<RatingInput {...defaultProps} />)
      
      const fourthStar = screen.getAllByRole('radio')[3]
      
      await user.hover(fourthStar)
      
      // When hovering 4th star, first 4 stars should be highlighted
      const stars = screen.getAllByRole('radio')
      for (let i = 0; i < 4; i++) {
        expect(stars[i]).toHaveClass('text-yellow-400')
      }
    })
  })

  describe('Keyboard Navigation', () => {
    it('sets rating on Enter key', async () => {
      const user = userEvent.setup()
      render(<RatingInput {...defaultProps} />)
      
      const secondStar = screen.getAllByRole('radio')[1]
      secondStar.focus()
      
      await user.keyboard('{Enter}')
      
      expect(mockOnChange).toHaveBeenCalledWith(2)
    })

    it('clears rating on Backspace key', async () => {
      const user = userEvent.setup()
      render(<RatingInput {...defaultProps} currentRating={3} />)
      
      const firstStar = screen.getAllByRole('radio')[0]
      firstStar.focus()
      
      await user.keyboard('{Backspace}')
      
      expect(mockOnChange).toHaveBeenCalledWith(null)
    })
  })

  describe('Loading State', () => {
    it('disables interactions when loading', () => {
      render(<RatingInput {...defaultProps} isLoading={true} />)
      
      const stars = screen.getAllByRole('radio')
      stars.forEach(star => {
        expect(star).toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has radiogroup role', () => {
      render(<RatingInput {...defaultProps} />)
      
      const radioGroup = screen.getByRole('radiogroup')
      expect(radioGroup).toBeInTheDocument()
      expect(radioGroup).toHaveAttribute('aria-label', 'Ocena książki')
    })

    it('has correct aria labels for stars', () => {
      render(<RatingInput {...defaultProps} />)
      
      const stars = screen.getAllByRole('radio')
      
      expect(stars[0]).toHaveAttribute('aria-label', 'Oceń 1 gwiazdką')
      expect(stars[1]).toHaveAttribute('aria-label', 'Oceń 2 gwiazdkami')
    })
  })
}) 