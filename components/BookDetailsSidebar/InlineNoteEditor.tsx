'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Save, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InlineNoteEditorProps, AutosaveState } from './types'

const MAX_CONTENT_LENGTH = 10000
const DEFAULT_DEBOUNCE_MS = 2000

export function InlineNoteEditor({ 
  initialContent, 
  onSave, 
  onCancel, 
  autoSave = true,
  debounceMs = DEFAULT_DEBOUNCE_MS
}: InlineNoteEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [autosaveState, setAutosaveState] = useState<AutosaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const originalContentRef = useRef(initialContent)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [content])

  // Focus on mount
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.focus()
      // Place cursor at end
      textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    }
  }, [])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Handle content change with debounced autosave
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setError(null)

    const hasChanges = newContent.trim() !== originalContentRef.current.trim()
    setAutosaveState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }))

    // Debounced autosave
    if (autoSave && hasChanges) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        handleSave(newContent, true)
      }, debounceMs)
    }
  }, [autoSave, debounceMs, onSave])

  // Handle save
  const handleSave = useCallback(async (contentToSave?: string, isAutosave = false) => {
    const finalContent = (contentToSave || content).trim()
    
    if (finalContent === originalContentRef.current.trim()) {
      if (!isAutosave) {
        onCancel()
      }
      return
    }

    if (finalContent.length === 0) {
      setError('Note content cannot be empty')
      return
    }

    if (finalContent.length > MAX_CONTENT_LENGTH) {
      setError(`Note cannot exceed ${MAX_CONTENT_LENGTH} characters`)
      return
    }

    const setSaving = isAutosave ? 
      (saving: boolean) => setAutosaveState(prev => ({ ...prev, isSaving: saving })) :
      setIsSaving

    try {
      setSaving(true)
      setError(null)
      
      await onSave(finalContent)
      
      originalContentRef.current = finalContent
      setAutosaveState(prev => ({ 
        ...prev, 
        hasUnsavedChanges: false,
        lastSaved: new Date()
      }))

      if (!isAutosave) {
        onCancel() // Close editor on manual save
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }, [content, onSave, onCancel])

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (autosaveState.hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
        onCancel()
      }
    } else {
      onCancel()
    }
  }, [autosaveState.hasUnsavedChanges, onCancel])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleCancel, handleSave])

  const charCount = content.length
  const charCountColor = charCount > MAX_CONTENT_LENGTH * 0.9 
    ? 'text-red-600' 
    : charCount > MAX_CONTENT_LENGTH * 0.75 
      ? 'text-yellow-600' 
      : 'text-gray-500'

  const isValid = content.trim().length > 0 && content.length <= MAX_CONTENT_LENGTH
  const hasChanges = content.trim() !== originalContentRef.current.trim()

  return (
    <div className="space-y-3">
      {/* Error message */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Textarea */}
      <div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          className={cn(
            'w-full min-h-[80px] max-h-[200px] px-3 py-2 border border-gray-300 rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'resize-none overflow-y-auto text-sm',
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
          )}
          disabled={isSaving}
          rows={3}
        />

        {/* Character counter and status */}
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center space-x-2 text-xs">
            {autosaveState.isSaving && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Saving...
              </div>
            )}
            {autosaveState.lastSaved && !autosaveState.hasUnsavedChanges && (
              <div className="text-green-600">
                Saved at {autosaveState.lastSaved.toLocaleTimeString()}
              </div>
            )}
            {autosaveState.hasUnsavedChanges && !autosaveState.isSaving && (
              <div className="text-gray-500">
                Unsaved changes
              </div>
            )}
          </div>
          
          <span className={cn('text-xs', charCountColor)}>
            {charCount}/{MAX_CONTENT_LENGTH}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={handleCancel}
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSaving}
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </button>
        
        <button
          onClick={() => handleSave()}
          disabled={!isValid || !hasChanges || isSaving}
          className={cn(
            'inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            'transition-colors',
            isValid && hasChanges && !isSaving
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-3 w-3 mr-1" />
              Save
            </>
          )}
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-gray-400 text-center">
        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to cancel or{' '}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+S</kbd> to save
      </div>
    </div>
  )
} 