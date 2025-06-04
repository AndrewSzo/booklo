import { useState, useCallback, useEffect } from 'react'
import {
  WizardStep,
  AddBookFormData,
  BasicBookInfo,
  BookCategorization,
  BookReview,
  ValidationErrors,
  StepValidationResult
} from '@/components/library/types'

const STORAGE_KEY = 'add-book-draft'

interface UseAddBookFormReturn {
  formData: AddBookFormData
  currentStep: WizardStep
  validationErrors: ValidationErrors
  isDirty: boolean
  updateBasicInfo: (data: BasicBookInfo) => void
  updateCategorization: (data: BookCategorization) => void
  updateReview: (data: BookReview) => void
  setCurrentStep: (step: WizardStep) => void
  validateStep: (step: WizardStep) => StepValidationResult
  setValidationErrors: (errors: ValidationErrors) => void
  resetForm: () => void
  saveDraft: () => void
  loadDraft: () => boolean
  clearDraft: () => void
}

const getInitialFormData = (): AddBookFormData => ({
  basicInfo: {
    title: '',
    author: '',
    isbn: '',
    cover_url: '',
    description: ''
  },
  categorization: {
    status: 'want_to_read',
    tags: []
  },
  review: {
    rating: undefined,
    notes: ''
  }
})

export function useAddBookForm(): UseAddBookFormReturn {
  const [formData, setFormData] = useState<AddBookFormData>(getInitialFormData)
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.BASIC_INFO)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isDirty, setIsDirty] = useState(false)

  // Auto-save draft every 30 seconds when dirty
  useEffect(() => {
    if (!isDirty) return

    const interval = setInterval(() => {
      saveDraft()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isDirty])

  const updateBasicInfo = useCallback((data: BasicBookInfo) => {
    setFormData(prev => ({ ...prev, basicInfo: data }))
    setIsDirty(true)
  }, [])

  const updateCategorization = useCallback((data: BookCategorization) => {
    setFormData(prev => ({ ...prev, categorization: data }))
    setIsDirty(true)
  }, [])

  const updateReview = useCallback((data: BookReview) => {
    setFormData(prev => ({ ...prev, review: data }))
    setIsDirty(true)
  }, [])

  const isValidISBN = (isbn: string): boolean => {
    // Basic ISBN validation - remove hyphens and spaces
    const cleaned = isbn.replace(/[-\s]/g, '')
    
    // Check if it's 10 or 13 digits
    if (!/^\d{10}$/.test(cleaned) && !/^\d{13}$/.test(cleaned)) {
      return false
    }
    
    // More sophisticated validation could be added here
    return true
  }

  const validateStep = useCallback((step: WizardStep): StepValidationResult => {
    const errors: ValidationErrors = {}

    switch (step) {
      case WizardStep.BASIC_INFO:
        if (!formData.basicInfo.title.trim()) {
          errors.title = ['Title is required']
        } else if (formData.basicInfo.title.length > 500) {
          errors.title = ['Title must be less than 500 characters']
        }

        if (!formData.basicInfo.author.trim()) {
          errors.author = ['Author is required']
        } else if (formData.basicInfo.author.length > 200) {
          errors.author = ['Author must be less than 200 characters']
        }

        if (formData.basicInfo.isbn && !isValidISBN(formData.basicInfo.isbn)) {
          errors.isbn = ['Please enter a valid ISBN-10 or ISBN-13']
        }

        if (formData.basicInfo.description && formData.basicInfo.description.length > 2000) {
          errors.description = ['Description must be less than 2000 characters']
        }
        break

      case WizardStep.CATEGORIZATION:
        if (formData.categorization.tags.length > 3) {
          errors.tags = ['Maximum 3 tags allowed']
        }
        break

      case WizardStep.REVIEW:
        if (formData.review.rating && (formData.review.rating < 1 || formData.review.rating > 5)) {
          errors.rating = ['Rating must be between 1 and 5']
        }

        if (formData.review.notes && formData.review.notes.length > 10000) {
          errors.notes = ['Notes must be less than 10000 characters']
        }
        break
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData())
    setCurrentStep(WizardStep.BASIC_INFO)
    setValidationErrors({})
    setIsDirty(false)
    clearDraft()
  }, [])

  const saveDraft = useCallback(() => {
    try {
      const draft = {
        formData,
        currentStep,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
      console.log('Draft saved')
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }, [formData, currentStep])

  const loadDraft = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return false

      const draft = JSON.parse(stored)
      
      // Check if draft is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      if (Date.now() - draft.timestamp > maxAge) {
        clearDraft()
        return false
      }

      if (draft.formData && draft.currentStep) {
        setFormData(draft.formData)
        setCurrentStep(draft.currentStep)
        setIsDirty(true)
        return true
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
      clearDraft()
    }
    return false
  }, [])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear draft:', error)
    }
  }, [])

  return {
    formData,
    currentStep,
    validationErrors,
    isDirty,
    updateBasicInfo,
    updateCategorization,
    updateReview,
    setCurrentStep,
    validateStep,
    setValidationErrors,
    resetForm,
    saveDraft,
    loadDraft,
    clearDraft
  }
} 