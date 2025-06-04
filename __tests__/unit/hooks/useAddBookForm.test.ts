import { renderHook, act } from '@testing-library/react'
import { useAddBookForm } from '@/hooks/useAddBookForm'
import { WizardStep } from '@/components/library/types'

// Mock the book service
jest.mock('@/lib/services/book.service', () => ({
  createBook: jest.fn(),
}))

describe('useAddBookForm Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      expect(result.current.currentStep).toBe(WizardStep.BASIC_INFO)
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.formData.basicInfo.title).toBe('')
      expect(result.current.formData.basicInfo.author).toBe('')
      expect(result.current.formData.categorization.status).toBe('want_to_read')
      expect(result.current.formData.categorization.tags).toEqual([])
    })

    it('initializes with empty validation errors', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      expect(result.current.validationErrors).toEqual({})
    })
  })

  describe('Form Data Updates', () => {
    it('updates basic info correctly', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author',
          isbn: '9780123456789'
        })
      })
      
      expect(result.current.formData.basicInfo.title).toBe('Test Book')
      expect(result.current.formData.basicInfo.author).toBe('Test Author')
      expect(result.current.formData.basicInfo.isbn).toBe('9780123456789')
    })

    it('updates categorization correctly', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      act(() => {
        result.current.updateCategorization({
          status: 'reading',
          tags: ['fiction', 'fantasy']
        })
      })
      
      expect(result.current.formData.categorization.status).toBe('reading')
      expect(result.current.formData.categorization.tags).toEqual(['fiction', 'fantasy'])
    })

    it('updates review correctly', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      act(() => {
        result.current.updateReview({
          rating: 4,
          notes: 'Great book!'
        })
      })
      
      expect(result.current.formData.review.rating).toBe(4)
      expect(result.current.formData.review.notes).toBe('Great book!')
    })
  })

  describe('Step Navigation', () => {
    it('advances to next step when current step is valid', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      // Fill required fields for basic info
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author'
        })
      })
      
      act(() => {
        result.current.nextStep()
      })
      
      expect(result.current.currentStep).toBe(WizardStep.CATEGORIZATION)
    })

    it('does not advance when current step is invalid', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      // Don't fill required fields
      act(() => {
        result.current.nextStep()
      })
      
      expect(result.current.currentStep).toBe(WizardStep.BASIC_INFO)
      expect(Object.keys(result.current.validationErrors)).toHaveLength(2) // title and author required
    })

    it('goes back to previous step', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      // Move to step 2
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author'
        })
        result.current.nextStep()
      })
      
      expect(result.current.currentStep).toBe(WizardStep.CATEGORIZATION)
      
      // Go back
      act(() => {
        result.current.previousStep()
      })
      
      expect(result.current.currentStep).toBe(WizardStep.BASIC_INFO)
    })

    it('does not go back from first step', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      act(() => {
        result.current.previousStep()
      })
      
      expect(result.current.currentStep).toBe(WizardStep.BASIC_INFO)
    })

    it('goes to specific step', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      act(() => {
        result.current.goToStep(WizardStep.REVIEW)
      })
      
      expect(result.current.currentStep).toBe(WizardStep.REVIEW)
    })
  })

  describe('Form Validation', () => {
    it('validates basic info step correctly', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      // Test empty fields
      let validation = result.current.validateStep(WizardStep.BASIC_INFO)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.title).toBeDefined()
      expect(validation.errors.author).toBeDefined()
      
      // Fill required fields
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author'
        })
      })
      
      validation = result.current.validateStep(WizardStep.BASIC_INFO)
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toEqual({})
    })

    it('validates ISBN format', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author',
          isbn: 'invalid-isbn'
        })
      })
      
      const validation = result.current.validateStep(WizardStep.BASIC_INFO)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.isbn).toBeDefined()
    })

    it('validates tag limits', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      act(() => {
        result.current.updateCategorization({
          status: 'reading',
          tags: ['tag1', 'tag2', 'tag3', 'tag4'] // More than 3 tags
        })
      })
      
      const validation = result.current.validateStep(WizardStep.CATEGORIZATION)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.tags).toBeDefined()
    })

    it('validates rating range', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      act(() => {
        result.current.updateReview({
          rating: 6 // Invalid rating (should be 1-5)
        })
      })
      
      const validation = result.current.validateStep(WizardStep.REVIEW)
      expect(validation.isValid).toBe(false)
      expect(validation.errors.rating).toBeDefined()
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const mockCreateBook = require('@/lib/services/book.service').createBook
      mockCreateBook.mockResolvedValue({ success: true, data: { id: '123' } })
      
      const { result } = renderHook(() => useAddBookForm())
      
      // Fill all required data
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author'
        })
        result.current.updateCategorization({
          status: 'reading',
          tags: ['fiction']
        })
      })
      
      await act(async () => {
        await result.current.submitForm()
      })
      
      expect(mockCreateBook).toHaveBeenCalledWith({
        title: 'Test Book',
        author: 'Test Author',
        status: 'reading',
        tags: ['fiction']
      })
    })

    it('handles submission errors', async () => {
      const mockCreateBook = require('@/lib/services/book.service').createBook
      mockCreateBook.mockRejectedValue(new Error('Network error'))
      
      const { result } = renderHook(() => useAddBookForm())
      
      // Fill required data
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author'
        })
      })
      
      await act(async () => {
        const success = await result.current.submitForm()
        expect(success).toBe(false)
      })
      
      expect(result.current.isSubmitting).toBe(false)
    })

    it('sets submitting state during submission', async () => {
      const mockCreateBook = require('@/lib/services/book.service').createBook
      mockCreateBook.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      )
      
      const { result } = renderHook(() => useAddBookForm())
      
      // Fill required data
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author'
        })
      })
      
      act(() => {
        result.current.submitForm()
      })
      
      expect(result.current.isSubmitting).toBe(true)
      
      // Wait for submission to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })
      
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe('Form Reset', () => {
    it('resets form to initial state', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      // Modify form data
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author'
        })
        result.current.nextStep()
      })
      
      expect(result.current.currentStep).toBe(WizardStep.CATEGORIZATION)
      expect(result.current.formData.basicInfo.title).toBe('Test Book')
      
      // Reset form
      act(() => {
        result.current.resetForm()
      })
      
      expect(result.current.currentStep).toBe(WizardStep.BASIC_INFO)
      expect(result.current.formData.basicInfo.title).toBe('')
      expect(result.current.formData.basicInfo.author).toBe('')
      expect(result.current.validationErrors).toEqual({})
    })
  })

  describe('Step Status', () => {
    it('returns correct step status', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      // Initial state - first step is current
      expect(result.current.getStepStatus(WizardStep.BASIC_INFO)).toBe('current')
      expect(result.current.getStepStatus(WizardStep.CATEGORIZATION)).toBe('pending')
      expect(result.current.getStepStatus(WizardStep.REVIEW)).toBe('pending')
      
      // Complete first step and move to second
      act(() => {
        result.current.updateBasicInfo({
          title: 'Test Book',
          author: 'Test Author'
        })
        result.current.nextStep()
      })
      
      expect(result.current.getStepStatus(WizardStep.BASIC_INFO)).toBe('completed')
      expect(result.current.getStepStatus(WizardStep.CATEGORIZATION)).toBe('current')
      expect(result.current.getStepStatus(WizardStep.REVIEW)).toBe('pending')
    })

    it('shows error status for invalid steps', () => {
      const { result } = renderHook(() => useAddBookForm())
      
      // Try to advance without filling required fields
      act(() => {
        result.current.nextStep()
      })
      
      expect(result.current.getStepStatus(WizardStep.BASIC_INFO)).toBe('error')
    })
  })
}) 