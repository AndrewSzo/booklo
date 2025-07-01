import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
import { createClient } from '@/lib/supabase/server'
import type { 
  UpdateNoteDTO, 
  UpdateNoteResponseDTO,
  TypedSupabaseClient
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

// Sprawdzenie czy notatka istnieje i należy do użytkownika
async function checkNoteOwnership(supabase: TypedSupabaseClient, noteId: string, userId: string) {
  const { data: note, error } = await supabase
    .from('notes')
    .select('id, book_id, user_id, content')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return { exists: false, isOwner: false, note: null }
    }
    throw error
  }

  return { exists: true, isOwner: true, note }
}

// PUT /api/notes/[id] - Aktualizacja notatki
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id: noteId } = await params

    // Walidacja UUID
    if (!isValidUUID(noteId)) {
      return NextResponse.json(
        { error: { message: 'Invalid note ID format', code: 'INVALID_UUID' } },
        { status: 400 }
      )
    }

    // Parsowanie request body
    let body: UpdateNoteDTO
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
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      )
    }

    // Sprawdzenie właściciela notatki
    const { exists, isOwner } = await checkNoteOwnership(supabase, noteId, user.id)

    if (!exists) {
      return NextResponse.json(
        { error: { message: 'Note not found', code: 'NOTE_NOT_FOUND', details: { note_id: noteId } } },
        { status: 404 }
      )
    }

    if (!isOwner) {
      return NextResponse.json(
        { 
          error: { 
            message: 'Access denied', 
            code: 'FORBIDDEN',
            details: {
              note_id: noteId,
              reason: 'You can only edit your own notes'
            }
          } 
        },
        { status: 403 }
      )
    }

    // Aktualizacja notatki
    const { data: updatedNote, error: updateError } = await supabase
      .from('notes')
      .update({
        content: sanitizedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('user_id', user.id) // Double security check
      .select('id, content, updated_at')
      .single()

    if (updateError) {
      console.error('Error updating note:', updateError)
      return NextResponse.json(
        { error: { message: 'Failed to update note', code: 'DATABASE_ERROR' } },
        { status: 500 }
      )
    }

    // Przygotowanie odpowiedzi
    const response: UpdateNoteResponseDTO = {
      data: {
        id: updatedNote.id,
        content: updatedNote.content,
        updated_at: updatedNote.updated_at
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in PUT /api/notes/[id]:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[id] - Usuwanie notatki
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id: noteId } = await params

    // Walidacja UUID
    if (!isValidUUID(noteId)) {
      return NextResponse.json(
        { error: { message: 'Invalid note ID format', code: 'INVALID_UUID' } },
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

    // Sprawdzenie właściciela notatki i pobranie danych dla audit log
    const { exists, isOwner, note } = await checkNoteOwnership(supabase, noteId, user.id)

    if (!exists) {
      return NextResponse.json(
        { error: { message: 'Note not found', code: 'NOTE_NOT_FOUND', details: { note_id: noteId } } },
        { status: 404 }
      )
    }

    if (!isOwner) {
      return NextResponse.json(
        { 
          error: { 
            message: 'Access denied', 
            code: 'FORBIDDEN',
            details: {
              note_id: noteId,
              reason: 'You can only delete your own notes'
            }
          } 
        },
        { status: 403 }
      )
    }

    // Audit logging przed usunięciem
    console.log('Note deletion audit:', {
      noteId,
      userId: user.id,
      bookId: note!.book_id,
      contentLength: note!.content.length,
      deletedAt: new Date().toISOString()
    })

    // Usuwanie notatki
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', user.id) // Double security check

    if (deleteError) {
      console.error('Error deleting note:', deleteError)
      return NextResponse.json(
        { error: { message: 'Failed to delete note', code: 'DATABASE_ERROR' } },
        { status: 500 }
      )
    }

    // Zwrócenie 204 No Content dla pomyślnego usunięcia
    return new NextResponse(null, { status: 204 })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/notes/[id]:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    )
  }
} 