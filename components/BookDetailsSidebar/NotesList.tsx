'use client'

import React from 'react'
import { Loader2, FileText } from 'lucide-react'
import type { NotesListProps } from './types'
import { NoteItem } from './NoteItem'

export function NotesList({ 
  notes, 
  isLoading, 
  onEdit, 
  onDelete, 
  onToggleEdit,
  editingNoteId 
}: NotesListProps) {

  // Loading state
  if (isLoading && notes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading notes...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!isLoading && notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-3 mb-4">
          <FileText className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No notes yet</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Start taking notes about this book. Your thoughts, quotes, and insights will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Notes list */}
      <ul className="space-y-1" role="list">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            isEditing={editingNoteId === note.id}
            onEdit={(content: string) => onEdit(note.id, content)}
            onDelete={() => onDelete(note.id)}
            onToggleEdit={() => onToggleEdit(note.id)}
          />
        ))}
      </ul>

      {/* Loading more indicator */}
      {isLoading && notes.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading more notes...
          </div>
        </div>
      )}
    </div>
  )
} 