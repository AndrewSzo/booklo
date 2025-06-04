'use client'

import { useState, useEffect } from 'react'
import { BookCategorization, ValidationErrors } from './types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, BookOpen, Clock, CheckCircle2 } from 'lucide-react'

interface BookCategorizationStepProps {
  data: BookCategorization
  onChange: (data: BookCategorization) => void
  errors: ValidationErrors
}

interface TagSuggestion {
  id: string
  name: string
  book_count: number
}

export default function BookCategorizationStep({ data, onChange, errors }: BookCategorizationStepProps) {
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const statusOptions = [
    {
      value: 'want_to_read' as const,
      label: 'Chcę przeczytać',
      description: 'Książki które planujesz przeczytać',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      value: 'reading' as const,
      label: 'Obecnie czytam',
      description: 'Książki które czytasz teraz',
      icon: BookOpen,
      color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      value: 'finished' as const,
      label: 'Przeczytane',
      description: 'Książki które ukończyłeś',
      icon: CheckCircle2,
      color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ]

  // Fetch tag suggestions when input changes
  useEffect(() => {
    const fetchTagSuggestions = async () => {
      if (tagInput.length < 2) {
        setTagSuggestions([])
        return
      }

      setIsLoadingSuggestions(true)
      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/tags?search=${encodeURIComponent(tagInput)}&limit=5`)
        if (response.ok) {
          const result = await response.json()
          setTagSuggestions(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching tag suggestions:', error)
        setTagSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    const timeoutId = setTimeout(fetchTagSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [tagInput])

  const handleStatusChange = (status: BookCategorization['status']) => {
    onChange({
      ...data,
      status
    })
  }

  const handleAddTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase()
    
    if (!trimmedTag) return
    if (data.tags.includes(trimmedTag)) return
    if (data.tags.length >= 3) return

    onChange({
      ...data,
      tags: [...data.tags, trimmedTag]
    })

    setTagInput('')
    setTagSuggestions([])
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({
      ...data,
      tags: data.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && data.tags.length > 0) {
      // Remove last tag when backspace is pressed and input is empty
      handleRemoveTag(data.tags[data.tags.length - 1])
    }
  }

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0]
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground">Kategoryzacja</h3>
          <p className="text-sm text-muted-foreground">
            Wybierz status czytania i dodaj odpowiednie tagi
          </p>
        </div>

        {/* Reading Status Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Status Czytania <span className="text-destructive">*</span>
          </Label>
          
          <div className="grid grid-cols-1 gap-3">
            {statusOptions.map((option) => {
              const Icon = option.icon
              const isSelected = data.status === option.value
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusChange(option.value)}
                  className={`
                    relative flex items-center p-4 rounded-lg border-2 transition-all duration-200 text-left
                    ${isSelected 
                      ? `${option.color} border-current` 
                      : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`
                      p-2 rounded-md
                      ${isSelected ? 'bg-white/50' : 'bg-muted'}
                    `}>
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-current' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isSelected ? 'text-current' : 'text-foreground'}`}>
                        {option.label}
                      </div>
                      <div className={`text-sm ${isSelected ? 'text-current/70' : 'text-muted-foreground'}`}>
                        {option.description}
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="ml-2">
                      <CheckCircle2 className="h-5 w-5 text-current" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Tagi (Opcjonalne)
            </Label>
            <span className="text-xs text-muted-foreground">
              {data.tags.length}/3 tagów
            </span>
          </div>

          {/* Current Tags */}
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md border border-primary/20"
                >
                  <span className="capitalize">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tag Input */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder={data.tags.length >= 3 ? "Maksymalnie 3 tagi zostały dodane" : "Wpisz, aby wyszukać lub dodać tagi..."}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  disabled={data.tags.length >= 3}
                  className={getFieldError('tags') ? 'border-destructive focus:border-destructive' : ''}
                />
                
                {/* Tag Suggestions Dropdown */}
                {tagSuggestions.length > 0 && tagInput.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {tagSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => handleAddTag(suggestion.name)}
                        className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-center justify-between"
                        disabled={data.tags.includes(suggestion.name)}
                      >
                        <span className="capitalize">{suggestion.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.book_count} książek
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim() || data.tags.length >= 3 || data.tags.includes(tagInput.trim().toLowerCase())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {isLoadingSuggestions && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {getFieldError('tags') && (
            <p className="text-sm text-destructive">{getFieldError('tags')}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Dodaj maksymalnie 3 tagi, aby pomóc w organizacji książek. Naciśnij Enter, aby dodać tag lub wybierz z propozycji.
          </p>
        </div>
      </div>
    </div>
  )
} 