import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
import { createClientForEdge } from '@/lib/supabase/server'
import type { 
  CreateRatingDTO,
  CreateRatingResponseDTO,
  RatingResponseDTO
} from '@/lib/types'

// Walidacja UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Walidacja oceny (1-5)
function validateRating(rating: number): number {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5')
  }
  return rating
}

// POST /api/books/[id]/rating - Utworzenie/aktualizacja oceny książki
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id: bookId } = await params

    // Walidacja UUID
    if (!isValidUUID(bookId)) {
      return NextResponse.json(
        { error: { message: 'Invalid book ID format', code: 'INVALID_UUID' } },
        { status: 400 }
      )
    }

    // Parsowanie request body
    let body: CreateRatingDTO
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: { message: 'Invalid JSON in request body', code: 'INVALID_JSON' } },
        { status: 400 }
      )
    }

    // Walidacja oceny
    let validatedRating: number
    try {
      validatedRating = validateRating(body.rating)
    } catch (error) {
      return NextResponse.json(
        { 
          error: { 
            message: 'Validation failed', 
            code: 'VALIDATION_ERROR',
            details: {
              field_errors: {
                rating: [error instanceof Error ? error.message : 'Invalid rating']
              }
            }
          } 
        },
        { status: 400 }
      )
    }

    // Uwierzytelnianie
    const tempResponse = NextResponse.json({ data: null }, { status: 200 })
    const supabase = createClientForEdge(request, tempResponse)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      )
    }

    // Sprawdzenie czy książka istnieje
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('id', bookId)
      .single()

    if (bookError || !book) {
      return NextResponse.json(
        { error: { message: 'Book not found', code: 'BOOK_NOT_FOUND', details: { book_id: bookId } } },
        { status: 404 }
      )
    }

    // Aktualizacja lub wstawienie oceny
    const { data: rating, error: upsertError } = await supabase
      .from('ratings')
      .upsert({
        book_id: bookId,
        user_id: user.id,
        rating: validatedRating,
        updated_at: new Date().toISOString()
      })
      .select('id, book_id, user_id, rating, created_at, updated_at')
      .single()

    if (upsertError) {
      console.error('Error updating rating:', upsertError)
      return NextResponse.json(
        { error: { message: 'Failed to update rating', code: 'DATABASE_ERROR' } },
        { status: 500 }
      )
    }

    // Przygotowanie odpowiedzi
    const response: CreateRatingResponseDTO = {
      data: rating as RatingResponseDTO
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in POST /api/books/[id]/rating:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
} 