'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { NoteItemDTO, PaginationDTO, CreateNoteDTO, UpdateNoteDTO, NotesListResponseDTO, CreateNoteResponseDTO, UpdateNoteResponseDTO } from '@/lib/types'

interface UseBookNotesProps {
  bookId: string
  initialPage?: number
  limit?: number
}

interface UseBookNotesReturn {
  notes: NoteItemDTO[]
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  pagination: PaginationDTO | null
  editingNoteId: string | null
  createNote: (content: string) => Promise<void>
  updateNote: (id: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  loadMore: () => void
  setEditingNoteId: (id: string | null) => void
  hasNextPage: boolean
}

// API functions (będą przzeniesione do services)
async function fetchBookNotes(bookId: string, page: number = 1, limit: number = 20): Promise<NotesListResponseDTO> {
  const response = await fetch(`/api/books/${bookId}/notes?page=${page}&limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch notes')
  }
  return response.json()
}

async function createBookNote(bookId: string, data: CreateNoteDTO): Promise<CreateNoteResponseDTO> {
  const response = await fetch(`/api/books/${bookId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create note')
  }
  return response.json()
}

async function updateBookNote(noteId: string, data: UpdateNoteDTO): Promise<UpdateNoteResponseDTO> {
  const response = await fetch(`/api/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update note')
  }
  return response.json()
}

async function deleteBookNote(noteId: string): Promise<void> {
  const response = await fetch(`/api/notes/${noteId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete note')
  }
}

export function useBookNotes({ bookId, initialPage = 1, limit = 20 }: UseBookNotesProps): UseBookNotesReturn {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Query key factory
  const notesQueryKey = (page: number) => ['books', bookId, 'notes', page]

  // Fetch notes query
  const {
    data: notesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: notesQueryKey(currentPage),
    queryFn: () => fetchBookNotes(bookId, currentPage, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!bookId,
  })

  // Aggregate all pages
  const notes: NoteItemDTO[] = []
  const pagination = notesResponse?.pagination || null

  // Get all cached pages
  for (let page = 1; page <= currentPage; page++) {
    const pageData = queryClient.getQueryData<NotesListResponseDTO>(notesQueryKey(page))
    if (pageData?.data) {
      notes.push(...pageData.data)
    }
  }

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: (content: string) => createBookNote(bookId, { content }),
    onMutate: async (content) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['books', bookId, 'notes'] })

      // Optimistically add note
      const tempNote: NoteItemDTO = {
        id: `temp-${Date.now()}`,
        book_id: bookId,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Update the first page
      const previousData = queryClient.getQueryData<NotesListResponseDTO>(notesQueryKey(1))
      if (previousData?.data) {
        queryClient.setQueryData(notesQueryKey(1), {
          ...previousData,
          data: [tempNote, ...previousData.data],
        })
      }

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(notesQueryKey(1), context.previousData)
      }
    },
    onSuccess: () => {
      // Invalidate all notes queries for this book
      queryClient.invalidateQueries({ queryKey: ['books', bookId, 'notes'] })
    },
  })

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => 
      updateBookNote(id, { content }),
    onMutate: async ({ id, content }) => {
      await queryClient.cancelQueries({ queryKey: ['books', bookId, 'notes'] })

      // Optimistically update note across all pages
      for (let page = 1; page <= currentPage; page++) {
        const queryKey = notesQueryKey(page)
        const previousData = queryClient.getQueryData<NotesListResponseDTO>(queryKey)
        
        if (previousData?.data) {
          const updatedData = {
            ...previousData,
            data: previousData.data.map((note: NoteItemDTO) =>
              note.id === id
                ? { ...note, content, updated_at: new Date().toISOString() }
                : note
            ),
          }
          queryClient.setQueryData(queryKey, updatedData)
        }
      }

      return { id, content }
    },
    onError: () => {
      // Invalidate to refetch correct data
      queryClient.invalidateQueries({ queryKey: ['books', bookId, 'notes'] })
    },
    onSuccess: () => {
      setEditingNoteId(null)
    },
  })

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: deleteBookNote,
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ['books', bookId, 'notes'] })

      // Optimistically remove note from all pages
      for (let page = 1; page <= currentPage; page++) {
        const queryKey = notesQueryKey(page)
        const previousData = queryClient.getQueryData<NotesListResponseDTO>(queryKey)
        
        if (previousData?.data) {
          const updatedData = {
            ...previousData,
            data: previousData.data.filter((note: NoteItemDTO) => note.id !== noteId),
          }
          queryClient.setQueryData(queryKey, updatedData)
        }
      }

      return { noteId }
    },
    onError: () => {
      // Invalidate to refetch correct data
      queryClient.invalidateQueries({ queryKey: ['books', bookId, 'notes'] })
    },
  })

  // Actions
  const createNote = useCallback(async (content: string) => {
    await createMutation.mutateAsync(content)
  }, [createMutation])

  const updateNote = useCallback(async (id: string, content: string) => {
    await updateMutation.mutateAsync({ id, content })
  }, [updateMutation])

  const deleteNote = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }, [deleteMutation])

  const loadMore = useCallback(() => {
    if (pagination && currentPage < pagination.total_pages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [pagination, currentPage])

  const hasNextPage = pagination ? currentPage < pagination.total_pages : false

  return {
    notes,
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    error: error?.message || createMutation.error?.message || updateMutation.error?.message || deleteMutation.error?.message || null,
    pagination,
    editingNoteId,
    createNote,
    updateNote,
    deleteNote,
    loadMore,
    setEditingNoteId,
    hasNextPage,
  }
} 