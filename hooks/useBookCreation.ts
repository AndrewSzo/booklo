import { useState, useCallback } from 'react'
import { CreateBookDTO, BookResponseDTO, ErrorResponseDTO, ValidationErrorResponseDTO } from '@/lib/types'

interface UseBookCreationReturn {
  isLoading: boolean
  error: ErrorResponseDTO | ValidationErrorResponseDTO | null
  createBook: (data: CreateBookDTO) => Promise<BookResponseDTO | null>
  clearError: () => void
}

export function useBookCreation(): UseBookCreationReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorResponseDTO | ValidationErrorResponseDTO | null>(null)

  const createBook = useCallback(async (data: CreateBookDTO): Promise<BookResponseDTO | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        
        if (response.status === 400 && errorData?.error?.code === 'VALIDATION_ERROR') {
          // Validation error from server
          const validationError: ValidationErrorResponseDTO = errorData
          setError(validationError)
          throw new ApiError('Validation failed', { cause: validationError })
        } else if (response.status === 409) {
          // Conflict - book already exists
          const conflictError: ErrorResponseDTO = {
            error: {
              message: 'A book with this title and author already exists in your library',
              code: 'BOOK_ALREADY_EXISTS',
              details: { title: data.title, author: data.author }
            }
          }
          setError(conflictError)
          throw new ApiError('Book already exists', { cause: conflictError })
        } else if (response.status === 401) {
          // Unauthorized
          const authError: ErrorResponseDTO = {
            error: {
              message: 'You need to be logged in to add books',
              code: 'UNAUTHORIZED'
            }
          }
          setError(authError)
          throw new ApiError('Unauthorized', { cause: authError })
        } else if (response.status >= 500) {
          // Server error
          const serverError: ErrorResponseDTO = {
            error: {
              message: 'Something went wrong on our end. Please try again later.',
              code: 'SERVER_ERROR'
            }
          }
          setError(serverError)
          throw new ApiError('Server error', { cause: serverError })
        } else {
          // Other errors
          const genericError: ErrorResponseDTO = {
            error: {
              message: errorData?.error?.message || 'Failed to create book',
              code: errorData?.error?.code || 'UNKNOWN_ERROR'
            }
          }
          setError(genericError)
          throw new ApiError('Unknown error', { cause: genericError })
        }
      }

      const result = await response.json()
      return result.data as BookResponseDTO
    } catch (err) {
      if (err instanceof ApiError) {
        // API error already handled above
        throw err
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        // Network error
        const networkError: ErrorResponseDTO = {
          error: {
            message: 'Network error. Please check your connection and try again.',
            code: 'NETWORK_ERROR'
          }
        }
        setError(networkError)
        throw new ApiError('Network error', { cause: networkError })
      } else {
        // Unexpected error
        const unexpectedError: ErrorResponseDTO = {
          error: {
            message: 'An unexpected error occurred. Please try again.',
            code: 'UNEXPECTED_ERROR'
          }
        }
        setError(unexpectedError)
        throw new ApiError('Unexpected error', { cause: unexpectedError })
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    createBook,
    clearError
  }
}

class ApiError extends Error {
  status?: number
  code?: string
  details?: Record<string, unknown>

  constructor(message: string, options?: { 
    cause?: ErrorResponseDTO | ValidationErrorResponseDTO; 
    status?: number; 
    code?: string; 
    details?: Record<string, unknown> 
  }) {
    super(message, { cause: options?.cause })
    this.name = 'ApiError'
    this.status = options?.status
    this.code = options?.code
    this.details = options?.details
  }
} 