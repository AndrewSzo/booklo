'use client'

import { useState } from 'react'
import { BookReview, ValidationErrors } from './types'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'

interface BookReviewStepProps {
  data: BookReview
  onChange: (data: BookReview) => void
  errors: ValidationErrors
}

export default function BookReviewStep({ data, onChange, errors }: BookReviewStepProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  const handleRatingChange = (rating: number) => {
    onChange({
      ...data,
      rating: rating === data.rating ? undefined : rating
    })
  }

  const handleNotesChange = (notes: string) => {
    onChange({
      ...data,
      notes
    })
  }

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0]
  }

  const displayRating = hoveredRating ?? data.rating ?? 0

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground">Recenzja i Notatki</h3>
          <p className="text-sm text-muted-foreground">
            Dodaj opcjonalną ocenę i osobiste notatki o książce
          </p>
        </div>

        {/* Rating Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Ocena (Opcjonalne)
          </Label>
          
          <div className="space-y-3">
            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = starValue <= displayRating
                const isClickable = true
                
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => handleRatingChange(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className={`
                      transition-all duration-150 p-1 rounded-sm
                      ${isClickable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <Star
                      className={`
                        h-8 w-8 transition-colors duration-150
                        ${isFilled 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-muted-foreground hover:text-yellow-400'
                        }
                      `}
                    />
                  </button>
                )
              })}
              
              {data.rating && (
                <button
                  type="button"
                  onClick={() => handleRatingChange(0)}
                  className="ml-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Wyczyść ocenę
                </button>
              )}
            </div>

            {/* Rating Label */}
            <div className="text-sm text-muted-foreground">
              {displayRating > 0 ? (
                <span>
                  {displayRating} {displayRating === 1 ? 'gwiazdka' : displayRating < 5 ? 'gwiazdki' : 'gwiazdek'} - {getRatingLabel(displayRating)}
                </span>
              ) : (
                <span>Kliknij, aby ocenić tę książkę</span>
              )}
            </div>

            {getFieldError('rating') && (
              <p className="text-sm text-destructive">{getFieldError('rating')}</p>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-3">
          <Label htmlFor="notes" className="text-sm font-medium">
            Osobiste Notatki (Opcjonalne)
          </Label>
          
          <div className="space-y-2">
            <textarea
              id="notes"
              placeholder="Podziel się swoimi przemyśleniami o tej książce... Co Ci się podobało? Czego się nauczyłeś? Czy poleciłbyś ją innym?"
              value={data.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={6}
              className={`
                flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-50 resize-none
                ${getFieldError('notes') ? 'border-destructive focus:border-destructive' : ''}
              `}
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Dodaj swoje osobiste przemyślenia, wrażenia lub kluczowe wnioski
              </span>
              <span>
                {(data.notes?.length || 0)}/10000 znaków
              </span>
            </div>

            {getFieldError('notes') && (
              <p className="text-sm text-destructive">{getFieldError('notes')}</p>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="p-4 bg-muted/30 rounded-lg border border-muted">
          <h4 className="text-sm font-medium text-foreground mb-3">Podsumowanie</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium capitalize">
                {getStatusLabel()}
              </span>
            </div>
            
            {data.rating && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ocena:</span>
                <div className="flex items-center gap-1">
                  {[...Array(data.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  ))}
                  <span className="ml-1 text-xs">({data.rating}/5)</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notatki:</span>
              <span className="font-medium">
                {data.notes?.trim() ? 'Dodane' : 'Brak'}
              </span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">
          <p className="font-medium mb-1">💡 Wskazówka:</p>
          <p>
            Zarówno ocena, jak i notatki są opcjonalne i można je dodać lub zmienić później. 
            Twoja ocena pomoże Ci zapamiętać, jak bardzo podobała Ci się książka, a notatki 
            pomogą uchwycić kluczowe spostrzeżenia lub osobiste reakcje.
          </p>
        </div>
      </div>
    </div>
  )
}

function getRatingLabel(rating: number): string {
  switch (rating) {
    case 1: return 'Słaba'
    case 2: return 'Przeciętna'
    case 3: return 'Dobra'
    case 4: return 'Bardzo dobra'
    case 5: return 'Doskonała'
    default: return ''
  }
}

function getStatusLabel(): string {
  // This should be passed from parent, but for demo purposes
  return 'Do ustawienia'
} 