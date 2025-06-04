'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseInlineEditProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
  onCancel: () => void
  autoSave?: boolean
  debounceMs?: number
}

interface UseInlineEditReturn {
  content: string
  setContent: (content: string) => void
  isSaving: boolean
  isAutosaving: boolean
  error: string | null
  hasUnsavedChanges: boolean
  lastSaved: Date | null
  handleSave: (contentToSave?: string, isAutosave?: boolean) => Promise<void>
  handleCancel: () => void
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export function useInlineEdit({
  initialContent,
  onSave,
  onCancel,
  autoSave = true,
  debounceMs = 2000,
}: UseInlineEditProps): UseInlineEditReturn {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [isAutosaving, setIsAutosaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const originalContentRef = useRef(initialContent)

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
      setError('Content cannot be empty')
      return
    }

    const setSaving = isAutosave ? setIsAutosaving : setIsSaving

    try {
      setSaving(true)
      setError(null)
      
      await onSave(finalContent)
      
      originalContentRef.current = finalContent
      setHasUnsavedChanges(false)
      setLastSaved(new Date())

      if (!isAutosave) {
        onCancel() // Close editor on manual save
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }, [content, onSave, onCancel])

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
        onCancel()
      }
    } else {
      onCancel()
    }
  }, [hasUnsavedChanges, onCancel])

  // Handle content change with debounced autosave
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    setError(null)

    const hasChanges = newContent.trim() !== originalContentRef.current.trim()
    setHasUnsavedChanges(hasChanges)

    // Debounced autosave
    if (autoSave && hasChanges) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        handleSave(newContent, true)
      }, debounceMs)
    }
  }, [autoSave, debounceMs, handleSave])

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

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

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

  return {
    content,
    setContent,
    isSaving,
    isAutosaving,
    error,
    hasUnsavedChanges,
    lastSaved,
    handleSave,
    handleCancel,
    handleContentChange,
    textareaRef,
  }
} 