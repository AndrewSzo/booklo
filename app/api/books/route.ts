import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
import { createClientForEdge } from '@/lib/supabase/server'
import { validateCreateBook, validateBookQuery } from '@/lib/validations/book.schema'
import { requireAuthenticationForEdge } from '@/lib/utils/auth'
import { BookService } from '@/lib/services/book.service'
import type { 
  ErrorResponseDTO, 
  ValidationErrorResponseDTO
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

export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse request body
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

    // Step 2: Validate input data
    const validationResult = validateCreateBook(requestBody)
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

    // Create response first for edge runtime compatibility
    const response = NextResponse.json({ data: null }, { status: 201 })

    // Step 3: Check authentication with edge runtime support
    let userId: string
    try {
      userId = await requireAuthenticationForEdge(request, response)
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

    // Step 4: Initialize services with edge runtime support
    const supabase = createClientForEdge(request, response)
    const bookService = new BookService(supabase)

    // Step 5: Create book with related data
    try {
      const result = await bookService.createBookWithRelatedData(validationResult.data, userId)
      
      // Update response with actual data
      return addSecurityHeaders(NextResponse.json({
        data: result.book
      }, { status: 201 }))
    } catch (serviceError: unknown) {
      console.error('Book service error:', serviceError)
      const error = serviceError as TypedError
      
      // Handle specific business logic errors
      if (error.status === 409) {
        const errorResponse: ErrorResponseDTO = {
          error: {
            message: error.message,
            code: error.code,
            details: error.details
          }
        }
        return addSecurityHeaders(NextResponse.json(errorResponse, { status: 409 }))
      }
      
      // Handle database/service errors
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: 'Failed to create book',
          code: 'BOOK_CREATION_FAILED',
          details: { 
            original_error: error.message 
          }
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
    }

  } catch (error) {
    console.error('Unexpected error in POST /api/books:', error)
    
    const errorResponse: ErrorResponseDTO = {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }
    
    return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create response first for edge runtime compatibility
    const response = NextResponse.json({ data: [], pagination: {} }, { status: 200 })

    // Step 1: Check authentication with edge runtime support
    let userId: string
    try {
      userId = await requireAuthenticationForEdge(request, response)
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

    // Step 2: Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    
    const queryParamsObject: Record<string, string | null> = {
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      tags: searchParams.get('tags'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort'),
      order: searchParams.get('order')
    }

    const validationResult = validateBookQuery(queryParamsObject)
    if (!validationResult.success) {
      const errorResponse: ValidationErrorResponseDTO = {
        error: {
          message: validationResult.error!.message,
          code: 'VALIDATION_ERROR' as const,
          details: validationResult.error!.details
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 400 }))
    }

    // Step 3: Initialize services with edge runtime support
    const supabase = createClientForEdge(request, response)
    const bookService = new BookService(supabase)
    
    try {
      const result = await bookService.getBooks(validationResult.data, userId)
      
      // Return updated response with actual data
      return addSecurityHeaders(NextResponse.json({
        data: result.data,
        pagination: result.pagination
      }, { status: 200 }))
    } catch (serviceError: unknown) {
      console.error('Book service error:', serviceError)
      const error = serviceError as TypedError
      
      // Handle specific service errors
      const errorResponse: ErrorResponseDTO = {
        error: {
          message: error.message || 'Failed to fetch books',
          code: 'BOOKS_FETCH_FAILED',
          details: { 
            original_error: error.message 
          }
        }
      }
      return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
    }

  } catch (error) {
    console.error('Unexpected error in GET /api/books:', error)
    
    const errorResponse: ErrorResponseDTO = {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    }
    
    return addSecurityHeaders(NextResponse.json(errorResponse, { status: 500 }))
  }
} 