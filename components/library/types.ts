import type { ReadingStatus } from '@/lib/types'

// Wizard step enum
export enum WizardStep {
  BASIC_INFO = 1,
  CATEGORIZATION = 2,
  REVIEW = 3
}

// Form data interfaces
export interface BasicBookInfo {
  title: string
  author: string
  isbn?: string
  cover_url?: string
  description?: string
}

export interface BookCategorization {
  status: 'want_to_read' | 'reading' | 'finished'
  category?: string
  tags: string[]
}

export interface BookReview {
  rating?: number // 1-5
  notes?: string
}

export interface AddBookFormData {
  basicInfo: BasicBookInfo
  categorization: BookCategorization
  review: BookReview
}

export interface ValidationErrors {
  [fieldName: string]: string[]
}

export interface StepValidationResult {
  isValid: boolean
  errors: ValidationErrors
}

export type StepStatus = 'pending' | 'current' | 'completed' | 'error'

// Component Props Types
export interface RatingInputProps {
  currentRating: number | null
  onChange: (rating: number | null) => void
  isLoading: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface StatusSelectorProps {
  currentStatus: ReadingStatus | null
  onChange: (status: ReadingStatus) => void
  isLoading: boolean
  className?: string
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  isSubmitting: boolean
  isValidating: boolean
}

// Filter types
export interface LibraryFilters {
  status: ReadingStatus | 'all'
  searchQuery: string
  tags: string[]
}

// Pagination types
export interface PaginationState {
  page: number
  limit: number
  total: number
  hasNextPage: boolean
  isLoadingMore: boolean
} 