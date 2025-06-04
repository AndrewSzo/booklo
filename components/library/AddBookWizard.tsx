'use client'

import { useEffect } from 'react'
import { CreateBookDTO, BookResponseDTO } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { WizardStep } from './types'
import { useAddBookForm } from '@/hooks/useAddBookForm'
import { useBookCreation } from '@/hooks/useBookCreation'
import StepIndicator from './StepIndicator'
import BookBasicInfoStep from './BookBasicInfoStep'
import BookCategorizationStep from './BookCategorizationStep'
import BookReviewStep from './BookReviewStep'

interface AddBookWizardProps {
  onComplete: (book: BookResponseDTO) => void
  onCancel: () => void
  onDirtyChange: (isDirty: boolean) => void
}

export default function AddBookWizard({ onComplete, onCancel, onDirtyChange }: AddBookWizardProps) {
  const {
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
    loadDraft,
    clearDraft
  } = useAddBookForm()

  const { 
    isLoading: isSubmitting, 
    error: apiError, 
    createBook, 
    clearError 
  } = useBookCreation()

  // Notify parent about dirty state changes
  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  // Load draft on mount
  useEffect(() => {
    const draftLoaded = loadDraft()
    if (draftLoaded) {
      console.log('Szkic załadowany z localStorage')
    }
  }, [loadDraft])

  const handleNext = () => {
    const validation = validateStep(currentStep)
    setValidationErrors(validation.errors)

    if (!validation.isValid) {
      return
    }

    if (currentStep < WizardStep.REVIEW) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > WizardStep.BASIC_INFO) {
      setCurrentStep(currentStep - 1)
      setValidationErrors({})
      clearError()
    }
  }

  const handleSubmit = async () => {
    // Validate all steps
    const step1Validation = validateStep(WizardStep.BASIC_INFO)
    const step2Validation = validateStep(WizardStep.CATEGORIZATION)
    const step3Validation = validateStep(WizardStep.REVIEW)

    const allErrors = {
      ...step1Validation.errors,
      ...step2Validation.errors,
      ...step3Validation.errors
    }

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors)
      // Go back to first step with errors
      if (Object.keys(step1Validation.errors).length > 0) {
        setCurrentStep(WizardStep.BASIC_INFO)
      } else if (Object.keys(step2Validation.errors).length > 0) {
        setCurrentStep(WizardStep.CATEGORIZATION)
      }
      return
    }

    try {
      // Map form data to CreateBookDTO
      const createBookData: CreateBookDTO = {
        title: formData.basicInfo.title.trim(),
        author: formData.basicInfo.author.trim(),
        isbn: formData.basicInfo.isbn?.trim() || undefined,
        cover_url: formData.basicInfo.cover_url?.trim() || undefined,
        description: formData.basicInfo.description?.trim() || undefined,
        status: formData.categorization.status,
        rating: formData.review.rating,
        tags: formData.categorization.tags
      }

      const result = await createBook(createBookData)
      if (result) {
        clearDraft()
        onComplete(result)
      }
    } catch (error) {
      // Handle API errors
      console.error('Błąd podczas tworzenia książki:', error)
      
      // Map API validation errors to form fields
      if (apiError?.error.code === 'VALIDATION_ERROR' && 'details' in apiError.error) {
        const fieldErrors = apiError.error.details?.field_errors as Record<string, string[]>
        if (fieldErrors) {
          setValidationErrors(fieldErrors)
          
          // Navigate to the step with errors
          const hasBasicInfoError = ['title', 'author', 'isbn', 'description'].some(field => fieldErrors[field])
          const hasCategorizationError = ['status', 'tags'].some(field => fieldErrors[field])
          
          if (hasBasicInfoError) {
            setCurrentStep(WizardStep.BASIC_INFO)
          } else if (hasCategorizationError) {
            setCurrentStep(WizardStep.CATEGORIZATION)
          }
        }
      } else if (apiError?.error.code === 'BOOK_ALREADY_EXISTS') {
        // Handle duplicate book error
        setValidationErrors({
          title: ['Książka o tym tytule i autorze już istnieje w Twojej bibliotece'],
          author: ['Książka o tym tytule i autorze już istnieje w Twojej bibliotece']
        })
        setCurrentStep(WizardStep.BASIC_INFO)
      } else {
        // Generic error handling
        setValidationErrors({ 
          submit: [apiError?.error.message || 'Nie udało się utworzyć książki. Spróbuj ponownie.']
        })
      }
    }
  }

  const handleCancel = () => {
    resetForm()
    onCancel()
  }

  const canGoNext = () => {
    const validation = validateStep(currentStep)
    return validation.isValid
  }

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case WizardStep.BASIC_INFO:
        return (
          <BookBasicInfoStep
            data={formData.basicInfo}
            onChange={updateBasicInfo}
            errors={validationErrors}
          />
        )
      case WizardStep.CATEGORIZATION:
        return (
          <BookCategorizationStep
            data={formData.categorization}
            onChange={updateCategorization}
            errors={validationErrors}
          />
        )
      case WizardStep.REVIEW:
        return (
          <BookReviewStep
            data={formData.review}
            onChange={updateReview}
            errors={validationErrors}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Step Indicator */}
      <div className="px-6 py-4 border-b">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {getCurrentStepComponent()}
        
        {/* API Error Display */}
        {(validationErrors.submit || apiError) && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              {validationErrors.submit?.[0] || apiError?.error.message}
            </p>
            {apiError?.error.code === 'BOOK_ALREADY_EXISTS' && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Add "Go to existing book" functionality
                    console.log('Przejdź do istniejącej książki')
                  }}
                  className="text-xs"
                >
                  Zobacz istniejącą książkę
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Network/Auth Error Display */}
        {apiError && ['NETWORK_ERROR', 'UNAUTHORIZED'].includes(apiError.error.code || '') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              {apiError.error.message}
            </p>
            {apiError.error.code === 'NETWORK_ERROR' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="mt-2 text-xs"
              >
                Spróbuj Ponownie
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer with navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
        <Button
          variant="outline"
          onClick={currentStep === WizardStep.BASIC_INFO ? handleCancel : handleBack}
          disabled={isSubmitting}
        >
          {currentStep === WizardStep.BASIC_INFO ? 'Anuluj' : 'Wstecz'}
        </Button>

        <div className="flex gap-2">
          {currentStep < WizardStep.REVIEW ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext() || isSubmitting}
            >
              Dalej
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canGoNext() || isSubmitting}
            >
              {isSubmitting ? 'Dodawanie książki...' : 'Dodaj Książkę'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 