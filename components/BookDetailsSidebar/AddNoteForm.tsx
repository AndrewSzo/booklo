'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AddNoteFormProps, FormErrors } from './types'

const MAX_CONTENT_LENGTH = 10000
const MIN_CONTENT_LENGTH = 1

export function AddNoteForm({ 
  onSubmit, 
  isSubmitting, 
  maxLength = MAX_CONTENT_LENGTH 
}: AddNoteFormProps) {
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [content])

  // Validate content
  const validateContent = (value: string): string[] => {
    const errors: string[] = []
    const trimmedValue = value.trim()

    if (trimmedValue.length === 0) {
      errors.push('Note content is required')
    } else if (trimmedValue.length < MIN_CONTENT_LENGTH) {
      errors.push(`Note must be at least ${MIN_CONTENT_LENGTH} character long`)
    }

    if (value.length > maxLength) {
      errors.push(`Note cannot exceed ${maxLength} characters`)
    }

    return errors
  }

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    // Clear content errors on change
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const contentErrors = validateContent(content)
    if (contentErrors.length > 0) {
      setErrors({ content: contentErrors })
      return
    }

    try {
      setErrors({})
      await onSubmit(content.trim())
      setContent('') // Clear form on success
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Failed to create note'
      })
    }
  }

  // Character count and color coding
  const charCount = content.length
  const charCountColor = charCount > maxLength * 0.9 
    ? 'text-red-600' 
    : charCount > maxLength * 0.75 
      ? 'text-yellow-600' 
      : 'text-gray-500'

  const isValid = content.trim().length >= MIN_CONTENT_LENGTH && content.length <= maxLength

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* General error */}
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      {/* Textarea */}
      <div>
        <label htmlFor="note-content" className="sr-only">
          Note content
        </label>
        <textarea
          ref={textareaRef}
          id="note-content"
          value={content}
          onChange={handleContentChange}
          placeholder="Add a note about this book..."
          className={cn(
            'w-full min-h-[80px] max-h-[200px] px-3 py-2 border border-gray-300 rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'resize-none overflow-y-auto',
            'placeholder:text-gray-400',
            errors.content ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
          )}
          disabled={isSubmitting}
          rows={3}
        />

        {/* Character counter */}
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs space-y-1">
            {errors.content && (
              <div className="text-red-600">
                {errors.content.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          
          <span className={cn('text-xs', charCountColor)}>
            {charCount}/{maxLength}
          </span>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={cn(
            'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            'transition-colors',
            isValid && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </>
          )}
        </button>
      </div>
    </form>
  )
} 