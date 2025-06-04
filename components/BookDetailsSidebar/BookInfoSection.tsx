'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Star, Calendar, Tag, Edit2, Check, X, Trash2, BookOpen, BookMarked, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { BookInfoSectionProps } from './types'
import type { ReadingStatus, UpdateBookDTO } from '@/lib/types'

const statusOptions: { value: ReadingStatus; label: string; color: string; bgColor: string; icon: React.ReactNode }[] = [
  { 
    value: 'want_to_read', 
    label: 'Chcę przeczytać', 
    color: 'text-slate-700', 
    bgColor: 'bg-slate-100 border-slate-200 hover:bg-slate-200',
    icon: <BookMarked className="h-4 w-4" />
  },
  { 
    value: 'reading', 
    label: 'Obecnie czytam', 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100 border-blue-200 hover:bg-blue-200',
    icon: <BookOpen className="h-4 w-4" />
  },
  { 
    value: 'finished', 
    label: 'Przeczytane', 
    color: 'text-green-700', 
    bgColor: 'bg-green-100 border-green-200 hover:bg-green-200',
    icon: <CheckCircle className="h-4 w-4" />
  },
]

interface EditableField {
  field: string
  value: string
  editing: boolean
  multiline?: boolean
}

export function BookInfoSection({ book, onStatusChange, onRatingChange, onBookUpdate, onBookDelete }: BookInfoSectionProps) {
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [tempRating, setTempRating] = useState(book.user_rating || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Zarządzanie edycją pól
  const [editingFields, setEditingFields] = useState<Record<string, EditableField>>({
    title: { field: 'title', value: book.title, editing: false },
    author: { field: 'author', value: book.author, editing: false },
    isbn: { field: 'isbn', value: book.isbn || '', editing: false },
    cover_url: { field: 'cover_url', value: book.cover_url || '', editing: false },
    description: { field: 'description', value: book.description || '', editing: false, multiline: true },
  })

  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})

  const currentStatus = book.user_status?.status
  const currentRating = book.user_rating || 0

  // API functions
  const updateBookAPI = async (bookId: string, updateData: UpdateBookDTO) => {
    const response = await fetch(`/api/books/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Failed to update book' } }))
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }
    
    return response.json()
  }

  const deleteBookAPI = async (bookId: string) => {
    const response = await fetch(`/api/books/${bookId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Failed to delete book' } }))
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }
  }

  // Rozpoczęcie edycji pola
  const startEditing = (fieldName: string) => {
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], editing: true }
    }))
  }

  // Focus na pole po rozpoczęciu edycji
  useEffect(() => {
    Object.entries(editingFields).forEach(([fieldName, field]) => {
      if (field.editing && inputRefs.current[fieldName]) {
        inputRefs.current[fieldName]?.focus()
      }
    })
  }, [editingFields])

  // Zapisanie edycji pola
  const saveField = async (fieldName: string) => {
    const field = editingFields[fieldName]
    if (!field || field.value.trim() === '') return

    setIsLoading(true)
    try {
      const updateData: UpdateBookDTO = {
        [fieldName]: field.value.trim()
      }
      
      await updateBookAPI(book.id, updateData)
      
      setEditingFields(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], editing: false }
      }))

      // Refresh book data
      if (onBookUpdate) {
        onBookUpdate({ ...book, [fieldName]: field.value.trim() })
      }
    } catch (error) {
      console.error('Failed to update field:', error)
      // Revert to original value
      const bookField = fieldName as keyof typeof book
      setEditingFields(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], value: String(book[bookField] || ''), editing: false }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Anulowanie edycji
  const cancelEdit = (fieldName: string) => {
    const bookField = fieldName as keyof typeof book
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: { 
        ...prev[fieldName], 
        value: String(book[bookField] || ''), 
        editing: false 
      }
    }))
  }

  // Aktualizacja wartości podczas edycji
  const updateFieldValue = (fieldName: string, value: string) => {
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value }
    }))
  }

  // Obsługa klawiatury
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter' && !e.shiftKey && !editingFields[fieldName].multiline) {
      e.preventDefault()
      saveField(fieldName)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit(fieldName)
    }
  }

  const handleStatusChange = (status: ReadingStatus) => {
    onStatusChange(status)
  }

  const handleRatingSubmit = () => {
    onRatingChange(tempRating)
    setIsEditingRating(false)
  }

  const handleRatingCancel = () => {
    setTempRating(currentRating)
    setIsEditingRating(false)
  }

  const handleDeleteBook = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsLoading(true)
    try {
      await deleteBookAPI(book.id)
      if (onBookDelete) {
        onBookDelete(book.id)
      }
    } catch (error) {
      console.error('Failed to delete book:', error)
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  // Komponent do edycji pojedynczego pola
  const EditableField = ({ fieldName, label, required = false }: { fieldName: string, label: string, required?: boolean }) => {
    const field = editingFields[fieldName]
    const isEditing = field?.editing || false
    const value = field?.value || ''

    if (isEditing) {
      return (
        <div className="space-y-2">
          <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
          <div className="flex items-center space-x-2">
            {field.multiline ? (
              <Textarea
                ref={(el) => { inputRefs.current[fieldName] = el }}
                value={value}
                onChange={(e) => updateFieldValue(fieldName, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, fieldName)}
                className="flex-1"
                rows={3}
                disabled={isLoading}
              />
            ) : (
              <Input
                ref={(el) => { inputRefs.current[fieldName] = el }}
                value={value}
                onChange={(e) => updateFieldValue(fieldName, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, fieldName)}
                className="flex-1"
                disabled={isLoading}
              />
            )}
            <Button
              size="sm"
              onClick={() => saveField(fieldName)}
              disabled={isLoading || !value.trim()}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => cancelEdit(fieldName)}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
        <div className="flex items-center justify-between group">
          <div className="flex-1">
            {fieldName === 'description' ? (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {value || <span className="text-gray-400 italic">No description</span>}
              </p>
            ) : (
              <span className="text-sm">
                {value || <span className="text-gray-400 italic">Not set</span>}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => startEditing(fieldName)}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="h-full overflow-y-auto" 
      id="info-panel" 
      role="tabpanel"
    >
      <div className="p-6 space-y-6">
        {/* Book Cover */}
        <div className="flex justify-center">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={`Cover of ${book.title}`}
              className="h-96 w-64 rounded-lg object-cover shadow-md"
            />
          ) : (
            <div className="flex h-96 w-64 items-center justify-center rounded-lg bg-gray-200 text-gray-400">
              <span className="text-xs text-center px-2">No Cover</span>
            </div>
          )}
        </div>

        {/* Book Metadata */}
        <div className="space-y-6">
          {/* Title */}
          <EditableField fieldName="title" label="Title" required />

          {/* Author */}
          <EditableField fieldName="author" label="Author" required />

          {/* ISBN */}
          <EditableField fieldName="isbn" label="ISBN" />

          {/* Cover URL */}
          <EditableField fieldName="cover_url" label="Cover URL" />

          {/* Description */}
          <EditableField fieldName="description" label="Description" />

          {/* Reading Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Reading Status
            </Label>
            
            {/* Status Options */}
            <div className="grid gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center space-x-3 w-full p-3 rounded-lg border-2 transition-all duration-200',
                    'text-left hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
                    currentStatus === option.value 
                      ? `${option.bgColor} border-current shadow-sm` 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    option.color
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0 transition-colors duration-200',
                    currentStatus === option.value ? option.color : 'text-gray-400'
                  )}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className={cn(
                      'font-medium transition-colors duration-200',
                      currentStatus === option.value ? option.color : 'text-gray-700'
                    )}>
                      {option.label}
                    </div>
                  </div>
                  {currentStatus === option.value && (
                    <Check className="h-4 w-4 text-current flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Current Status Badge */}
            {currentStatus && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Aktualny status:</span>
                  <div className={cn(
                    'inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border',
                    statusOptions.find(s => s.value === currentStatus)?.bgColor,
                    statusOptions.find(s => s.value === currentStatus)?.color
                  )}>
                    {statusOptions.find(s => s.value === currentStatus)?.icon}
                    <span>{statusOptions.find(s => s.value === currentStatus)?.label}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Twoja Ocena
            </label>
            
            {!isEditingRating ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-5 w-5',
                        star <= currentRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setIsEditingRating(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {currentRating > 0 ? 'Zmień' : 'Dodaj ocenę'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setTempRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          'h-6 w-6 transition-colors',
                          star <= tempRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-200'
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRatingSubmit}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Zapisz
                  </button>
                  <button
                    onClick={handleRatingCancel}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Average Rating */}
          {book.average_rating && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Średnia Ocena
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">
                    {book.average_rating.toFixed(1)} ({book.total_ratings} {book.total_ratings === 1 ? 'ocena' : book.total_ratings < 5 ? 'oceny' : 'ocen'})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagi
              </label>
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reading Dates */}
          {(book.user_status?.started_at || book.user_status?.finished_at) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daty Czytania
              </label>
              <div className="space-y-1 text-sm text-gray-600">
                {book.user_status?.started_at && (
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Rozpoczęto: {formatDate(book.user_status.started_at)}
                  </p>
                )}
                {book.user_status?.finished_at && (
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ukończono: {formatDate(book.user_status.finished_at)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notatki
            </label>
            <p className="text-sm text-gray-600">
              {book.notes_count} {book.notes_count === 1 ? 'notatka' : book.notes_count < 5 ? 'notatki' : 'notatek'}
            </p>
          </div>

          {/* Delete Book */}
          <div className="pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strefa Niebezpieczna
            </label>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń Książkę
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-600">
                  Czy na pewno chcesz usunąć tę książkę? Ta akcja nie może zostać cofnięta.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteBook}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Usuwanie...' : 'Tak, Usuń'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 