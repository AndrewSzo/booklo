import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateUpdateBook } from '@/lib/validations/book.schema'
import { requireAuthentication } from '@/lib/utils/auth'
import { BookService } from '@/lib/services/book.service'
import type { 
  UpdateBookResponseDTO, 
  ErrorResponseDTO, 
  ValidationErrorResponseDTO,
  BookDetailResponseDTO
} from '@/lib/types'

interface TypedError {
  message: string
  status?: number
  code?: string
  details?: Record<string, unknown>
}

// Helper function to add security headers to any response
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  return response
}

// Validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Step 1: Validate UUID format
    const resolvedParams = await params
    const bookId = resolvedParams.id
    if (!isValidUUID(bookId)) {
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: 'Invalid book ID format',
          code: 'INVALID_UUID'
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 400 }))
    }

    // Step 2: Parse and validate request body
    let requestBody: unknown
    try {
      requestBody = await request.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 400 }))
    }

    // Check if request body is empty or has no valid fields
    if (!requestBody || typeof requestBody !== 'object' || Object.keys(requestBody).length === 0) {
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: 'Request body must contain at least one field to update',
          code: 'EMPTY_UPDATE_DATA'
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 400 }))
    }

    // Step 3: Validate input data
    const validationResult = validateUpdateBook(requestBody)
    if (!validationResult.success) {
      const errorResponse: ValidationErrorResponseDTO = {
        error: {
          message: validationResult.error.message,
          code: 'VALIDATION_ERROR' as const,
          details: validationResult.error.details
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 400 }))
    }

    // Step 4: Check authentication
    let userId: string
    try {
      userId = await requireAuthentication()
    } catch (authError: unknown) {
      console.error('Authentication failed:', authError)
      const error = authError as TypedError
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: error.message || 'Authentication required',
          code: error.code || 'UNAUTHORIZED',
          details: error.details
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: error.status || 401 }))
    }

    // Step 5: Initialize services and update book
    const supabase = await createClient()
    const bookService = new BookService(supabase)

    try {
      const updatedBook = await bookService.updateBook(bookId, userId, validationResult.data)
      
      const response: UpdateBookResponseDTO = {
        data: updatedBook
      }

      return addSecurityHeaders(NextResponse.json(response, { status: 200 }))
    } catch (serviceError: unknown) {
      console.error('Book service error:', serviceError)
      const error = serviceError as TypedError
      
      // Handle specific business logic errors
      if (error.status === 404) {
        const errorResponse: ErrorResponseDTO = {
          error: {
            message: 'Book not found',
            code: 'BOOK_NOT_FOUND'
          }
        }
        return addSecurityHeaders(NextResponse.json(errorResponse, { status: 404 }))
      }
      
      if (error.status === 403) {
        const errorResponse: ErrorResponseDTO = {
          error: {
            message: 'You do not have permission to edit this book',
            code: 'FORBIDDEN'
          }
        }
        return addSecurityHeaders(NextResponse.json(errorResponse, { status: 403 }))
      }

      if (error.status === 409) {
        const errorResponse: ErrorResponseDTO = {
          error: {
            message: error.message,
            code: error.code || 'DUPLICATE_BOOK',
            details: error.details
          }
        }
        return addSecurityHeaders(NextResponse.json(errorResponse, { status: 409 }))
      }
      
      // Handle database/service errors
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: 'Failed to update book',
          code: 'BOOK_UPDATE_FAILED',
          details: { 
            original_error: error.message 
          }
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
    }

  } catch (error) {
    console.error('Unexpected error in PUT /api/books/[id]:', error)
    
    const errorResponse: ErrorResponseDTO = {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }
    
    return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
  }
}

// GET method to fetch book details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Step 1: Validate UUID format
    const resolvedParams = await params
    const bookId = resolvedParams.id
    if (!isValidUUID(bookId)) {
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: 'Invalid book ID format',
          code: 'INVALID_UUID'
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 400 }))
    }

    // Step 2: Check authentication
    let userId: string
    try {
      userId = await requireAuthentication()
    } catch (authError: unknown) {
      console.error('Authentication failed:', authError)
      const error = authError as TypedError
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: error.message || 'Authentication required',
          code: error.code || 'UNAUTHORIZED',
          details: error.details
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: error.status || 401 }))
    }

    // Step 3: Initialize services and get book details
    const supabase = await createClient()
    const bookService = new BookService(supabase)

    try {
      const bookDetail = await bookService.getBookDetail(bookId, userId)
      
      const response: BookDetailResponseDTO = {
        data: bookDetail
      }

      return addSecurityHeaders(NextResponse.json(response, { status: 200 }))
    } catch (serviceError: unknown) {
      console.error('Book service error:', serviceError)
      const error = serviceError as TypedError
      
      // Handle specific business logic errors
      if (error.status === 404) {
        const errorResponse: ErrorResponseDTO = {
          error: {
            message: 'Book not found',
            code: 'BOOK_NOT_FOUND'
          }
        }
        return addSecurityHeaders(NextResponse.json(errorResponse, { status: 404 }))
      }
      
      // Handle database/service errors
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: 'Failed to fetch book details',
          code: 'BOOK_FETCH_FAILED',
          details: { 
            original_error: error.message 
          }
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
    }

  } catch (error) {
    console.error('Unexpected error in GET /api/books/[id]:', error)
    
    const errorResponse: ErrorResponseDTO = {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }
    
    return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
  }
}

// DELETE method to remove a book and all associated data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Step 1: Validate UUID format
    const resolvedParams = await params
    const bookId = resolvedParams.id
    if (!isValidUUID(bookId)) {
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: 'Invalid book ID format',
          code: 'INVALID_UUID'
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 400 }))
    }

    // Step 2: Check authentication
    let userId: string
    try {
      userId = await requireAuthentication()
    } catch (authError: unknown) {
      console.error('Authentication failed:', authError)
      const error = authError as TypedError
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: error.message || 'Authentication required',
          code: error.code || 'UNAUTHORIZED',
          details: error.details
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: error.status || 401 }))
    }

    // Step 3: Initialize services and delete book
    const supabase = await createClient()
    const bookService = new BookService(supabase)

    try {
      await bookService.deleteBook(bookId, userId)
      
      // Return 204 No Content for successful deletion
      return addSecurityHeaders(new NextResponse(null, { status: 204 }))
    } catch (serviceError: unknown) {
      console.error('Book service error:', serviceError)
      const error = serviceError as TypedError
      
      // Handle specific business logic errors
      if (error.status === 404) {
        const errorResponse: ErrorResponseDTO = {
          error: {
            message: 'Book not found',
            code: 'BOOK_NOT_FOUND'
          }
        }
        return addSecurityHeaders(NextResponse.json(errorResponse, { status: 404 }))
      }
      
      if (error.status === 403) {
        const errorResponse: ErrorResponseDTO = {
          error: {
            message: 'Forbidden: You can only delete books you created',
            code: 'INSUFFICIENT_PERMISSIONS',
            details: {
              book_id: bookId,
              requested_by: userId
            }
          }
        }
        return addSecurityHeaders(NextResponse.json(errorResponse, { status: 403 }))
      }
      
      // Handle database/service errors
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: 'Failed to delete book',
          code: 'BOOK_DELETE_FAILED',
          details: { 
            original_error: error.message 
          }
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
    }

  } catch (error) {
    console.error('Unexpected error in DELETE /api/books/[id]:', error)
    
    const errorResponse: ErrorResponseDTO = {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }
    
    return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
  }
} 