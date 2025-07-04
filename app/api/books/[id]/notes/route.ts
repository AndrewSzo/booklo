import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
import { createClientForEdge } from '@/lib/supabase/server'
import type { 
  NotesListResponseDTO, 
  CreateNoteDTO, 
  CreateNoteResponseDTO,
  NoteItemDTO,
  PaginationDTO 
} from '@/lib/types'

// Walidacja UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Sanityzacja contentu
function sanitizeContent(content: string): string {
  return content
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
}

// Walidacja parametrów query dla GET
function validateQueryParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  if (page < 1) {
    throw new Error('Page must be >= 1')
  }
  if (limit < 1 || limit > 50) {
    throw new Error('Limit must be between 1 and 50')
  }

  return { page, limit }
}

// Walidacja contentu notatki
function validateNoteContent(content: string): string {
  if (!content || typeof content !== 'string') {
    throw new Error('Content is required')
  }

  const sanitized = sanitizeContent(content)
  
  if (sanitized.length < 1) {
    throw new Error('Content cannot be empty')
  }
  if (sanitized.length > 10000) {
    throw new Error('Content cannot exceed 10,000 characters')
  }

  return sanitized
}

// GET /api/books/[id]/notes - Pobieranie notatek dla książki
export async function GET(
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

    // Walidacja parametrów query
    const { searchParams } = new URL(request.url)
    let page: number, limit: number
    
    try {
      ({ page, limit } = validateQueryParams(searchParams))
    } catch (err) {
      return NextResponse.json(
        { error: { message: err instanceof Error ? err.message : 'Invalid query parameters', code: 'VALIDATION_ERROR' } },
        { status: 400 }
      )
    }

    // Uwierzytelnianie
    const tempResponse = NextResponse.json({ data: [], pagination: {} }, { status: 200 })
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

    // Obliczenie offset dla paginacji
    const offset = (page - 1) * limit

    // Pobranie notatek z paginacją
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, book_id, content, created_at, updated_at')
      .eq('book_id', bookId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (notesError) {
      console.error('Error fetching notes:', notesError)
      return NextResponse.json(
        { error: { message: 'Failed to fetch notes', code: 'DATABASE_ERROR' } },
        { status: 500 }
      )
    }

    // Pobranie całkowitej liczby notatek dla metadanych paginacji
    const { count: totalCount, error: countError } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId)
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting notes:', countError)
      return NextResponse.json(
        { error: { message: 'Failed to count notes', code: 'DATABASE_ERROR' } },
        { status: 500 }
      )
    }

    // Przygotowanie odpowiedzi
    const total = totalCount || 0
    const totalPages = Math.ceil(total / limit)

    const pagination: PaginationDTO = {
      page,
      limit,
      total,
      total_pages: totalPages
    }

    const response: NotesListResponseDTO = {
      data: notes as NoteItemDTO[],
      pagination
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in GET /api/books/[id]/notes:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
}

// POST /api/books/[id]/notes - Tworzenie nowej notatki
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
    let body: CreateNoteDTO
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: { message: 'Invalid JSON in request body', code: 'INVALID_JSON' } },
        { status: 400 }
      )
    }

    // Walidacja contentu
    let sanitizedContent: string
    try {
      sanitizedContent = validateNoteContent(body.content)
    } catch (validationError) {
      return NextResponse.json(
        { 
          error: { 
            message: 'Validation failed', 
            code: 'VALIDATION_ERROR',
            details: {
              field_errors: {
                content: [validationError instanceof Error ? validationError.message : 'Invalid content']
              }
            }
          } 
        },
        { status: 400 }
      )
    }

    // Uwierzytelnianie
    const tempResponse2 = NextResponse.json({ data: null }, { status: 201 })
    const supabase = createClientForEdge(request, tempResponse2)
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

    // Tworzenie notatki
    const { data: note, error: createError } = await supabase
      .from('notes')
      .insert({
        book_id: bookId,
        user_id: user.id,
        content: sanitizedContent
      })
      .select('id, book_id, content, created_at, updated_at')
      .single()

    if (createError) {
      console.error('Error creating note:', createError)
      return NextResponse.json(
        { error: { message: 'Failed to create note', code: 'DATABASE_ERROR' } },
        { status: 500 }
      )
    }

    // Przygotowanie odpowiedzi
    const response: CreateNoteResponseDTO = {
      data: note as NoteItemDTO
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in POST /api/books/[id]/notes:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
} 