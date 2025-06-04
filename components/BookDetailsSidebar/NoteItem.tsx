'use client'

import React, { useState } from 'react'
import { Edit2, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoteItemProps } from './types'
import { InlineNoteEditor } from './InlineNoteEditor'

export function NoteItem({ 
  note, 
  isEditing, 
  onEdit, 
  onDelete, 
  onToggleEdit 
}: NoteItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsDeleting(true)
      try {
        await onDelete()
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleEdit = async (content: string) => {
    await onEdit(content)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <li
      className={cn(
        'group relative p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors',
        isEditing && 'ring-2 ring-blue-500 border-blue-500'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {isEditing ? (
        <InlineNoteEditor
          initialContent={note.content}
          onSave={handleEdit}
          onCancel={onToggleEdit}
          autoSave={true}
        />
      ) : (
        <>
          {/* Note content */}
          <div 
            className="mb-2 text-sm text-gray-900 leading-relaxed cursor-pointer"
            onClick={onToggleEdit}
          >
            {note.content}
          </div>

          {/* Note metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <time dateTime={note.created_at} title={new Date(note.created_at).toLocaleString()}>
                {formatDate(note.created_at)}
              </time>
              {note.updated_at !== note.created_at && (
                <span className="ml-2 text-gray-400">(edited)</span>
              )}
            </div>

            {/* Actions */}
            <div className={cn(
              'flex items-center space-x-1 transition-opacity',
              showActions || isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleEdit()
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                title="Edit note"
                disabled={isDeleting}
              >
                <Edit2 className="h-3 w-3" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
                title="Delete note"
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </li>
  )
} 