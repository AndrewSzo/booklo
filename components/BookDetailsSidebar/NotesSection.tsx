'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { NoteItemDTO, CreateNoteDTO, NotesListResponseDTO } from '@/lib/types'

interface NotesSectionProps {
  bookId: string
}

// API functions
async function fetchNotes(bookId: string, page = 1): Promise<NotesListResponseDTO> {
  const response = await fetch(`/api/books/${bookId}/notes?page=${page}&limit=20`)
  if (!response.ok) {
    throw new Error('Failed to fetch notes')
  }
  return response.json()
}

async function createNote(bookId: string, data: CreateNoteDTO): Promise<void> {
  const response = await fetch(`/api/books/${bookId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create note')
  }
}

async function updateNote(noteId: string, content: string): Promise<void> {
  const response = await fetch(`/api/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!response.ok) {
    throw new Error('Failed to update note')
  }
}

async function deleteNote(noteId: string): Promise<void> {
  const response = await fetch(`/api/notes/${noteId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete note')
  }
}

export function NotesSection({ bookId }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const queryClient = useQueryClient()

  // Fetch notes
  const {
    data: notesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['books', bookId, 'notes'],
    queryFn: () => fetchNotes(bookId),
    enabled: !!bookId,
  })

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateNoteDTO) => createNote(bookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', bookId, 'notes'] })
      setNewNote('')
    },
  })

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      updateNote(noteId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', bookId, 'notes'] })
      setEditingNote(null)
      setEditContent('')
    },
  })

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', bookId, 'notes'] })
    },
  })

  const notes = notesResponse?.data || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newNote.trim()) {
      createMutation.mutate({ content: newNote.trim() })
    }
  }

  const handleEdit = (note: NoteItemDTO) => {
    setEditingNote(note.id)
    setEditContent(note.content)
  }

  const handleSaveEdit = (noteId: string) => {
    if (editContent.trim()) {
      updateMutation.mutate({ noteId, content: editContent.trim() })
    }
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    setEditContent('')
  }

  const handleDelete = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(noteId)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div 
      className="h-full overflow-y-auto" 
      id="notes-panel" 
      role="tabpanel" 
    >
      <div className="p-6 space-y-6">
        {/* Add Note Form */}
        <div className="">
          <Label htmlFor="new-note" className="text-sm font-medium text-gray-700 mb-2 block">
            Add New Note
          </Label>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              id="new-note"
              placeholder="Write your note about this book..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={createMutation.isPending}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {newNote.length}/10,000 characters
              </span>
              <Button
                type="submit"
                disabled={!newNote.trim() || createMutation.isPending}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{createMutation.isPending ? 'Adding...' : 'Add Note'}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700">
              Your Notes ({notes.length})
            </h3>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600">Failed to load notes</span>
            </div>
          )}

          {!isLoading && !error && notes.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No notes yet</p>
              <p className="text-gray-400 text-xs">Add your first note above</p>
            </div>
          )}

          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3"
            >
              {editingNote === note.id ? (
                // Edit mode
                <div className="space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={updateMutation.isPending}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {editContent.length}/10,000 characters
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(note.id)}
                        disabled={!editContent.trim() || updateMutation.isPending}
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Display mode
                <>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      {note.updated_at !== note.created_at ? 'Updated' : 'Created'}{' '}
                      {formatDate(note.updated_at || note.created_at)}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(note)}
                        disabled={deleteMutation.isPending}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(note.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 