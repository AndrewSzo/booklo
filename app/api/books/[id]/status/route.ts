import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { 
  UpdateBookStatusDTO,
  BookStatusResponseDTO,
  ReadingStatus 
} from '@/lib/types'

// Walidacja UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Walidacja statusu czytania
function validateReadingStatus(status: string): ReadingStatus {
  const validStatuses: ReadingStatus[] = ['want_to_read', 'reading', 'finished']
  
  if (!validStatuses.includes(status as ReadingStatus)) {
    throw new Error(`Invalid reading status. Must be one of: ${validStatuses.join(', ')}`)
  }
  
  return status as ReadingStatus
}

// PUT /api/books/[id]/status - Aktualizacja statusu czytania książki
export async function PUT(
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
    let body: UpdateBookStatusDTO
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: { message: 'Invalid JSON in request body', code: 'INVALID_JSON' } },
        { status: 400 }
      )
    }

    // Walidacja statusu
    let validatedStatus: ReadingStatus
    try {
      validatedStatus = validateReadingStatus(body.status)
    } catch (error) {
      return NextResponse.json(
        { 
          error: { 
            message: 'Validation failed', 
            code: 'VALIDATION_ERROR',
            details: {
              field_errors: {
                status: [error instanceof Error ? error.message : 'Invalid status']
              }
            }
          } 
        },
        { status: 400 }
      )
    }

    // Uwierzytelnianie
    const supabase = await createClient()
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

    // Przygotowanie danych do aktualizacji
    const updateData: {
      status: ReadingStatus
      updated_at: string
      started_at?: string
      finished_at?: string
    } = {
      status: validatedStatus,
      updated_at: new Date().toISOString()
    }

    // Automatyczne ustawianie dat na podstawie statusu
    if (validatedStatus === 'reading' && !body.started_at) {
      updateData.started_at = new Date().toISOString()
    } else if (body.started_at) {
      updateData.started_at = body.started_at
    }

    if (validatedStatus === 'finished' && !body.finished_at) {
      updateData.finished_at = new Date().toISOString()
    } else if (body.finished_at) {
      updateData.finished_at = body.finished_at
    }

    // Sprawdź czy status już istnieje
    const { data: existingStatus, error: findError } = await supabase
      .from('book_statuses')
      .select('id')
      .eq('book_id', bookId)
      .eq('user_id', user.id)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error checking existing status:', findError)
      return NextResponse.json(
        { error: { message: 'Database error checking status', code: 'DATABASE_ERROR' } },
        { status: 500 }
      )
    }

    let bookStatus
    let operationError

    if (existingStatus) {
      // Update existing status
      console.log('Updating existing status with ID:', existingStatus.id)
      const { data, error } = await supabase
        .from('book_statuses')
        .update(updateData)
        .eq('id', existingStatus.id)
        .select('book_id, user_id, status, started_at, finished_at, updated_at')
        .single()
      
      bookStatus = data
      operationError = error
    } else {
      // Insert new status
      console.log('Creating new status record')
      const { data, error } = await supabase
        .from('book_statuses')
        .insert({
          book_id: bookId,
          user_id: user.id,
          ...updateData
        })
        .select('book_id, user_id, status, started_at, finished_at, updated_at')
        .single()
      
      bookStatus = data
      operationError = error
    }

    if (operationError) {
      console.error('Error updating/creating book status:', operationError)
      console.error('Operation error details:', JSON.stringify(operationError, null, 2))
      return NextResponse.json(
        { error: { message: `Failed to update book status: ${operationError.message}`, code: 'DATABASE_ERROR', details: operationError } },
        { status: 500 }
      )
    }

    // Przygotowanie odpowiedzi
    const response: { data: BookStatusResponseDTO } = {
      data: bookStatus as BookStatusResponseDTO
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in PUT /api/books/[id]/status:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
} 