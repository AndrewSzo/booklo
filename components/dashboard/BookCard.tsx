'use client'

import { BookListItemDTO } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Calendar, User } from 'lucide-react'
import { useBookDetailsContext } from '@/lib/providers/BookDetailsContext'

interface BookCardProps {
  book: BookListItemDTO
  onClick?: (book: BookListItemDTO) => void
  variant?: 'compact' | 'full'
  'data-testid'?: string
}

export default function BookCard({ book, onClick, variant = 'compact', 'data-testid': testId }: BookCardProps) {
  const { openSidebar } = useBookDetailsContext()

  const handleClick = () => {
    if (onClick) {
      onClick(book)
    } else {
      // Domyślnie otwórz sidebar z notatatkami
      openSidebar(book.id, 'notes')
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center gap-1" data-testid="book-rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground'
            }`}
            data-testid={`star-${i}`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1" data-testid="rating-value">{rating}</span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (variant === 'compact') {
    return (
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 w-full"
        onClick={handleClick}
        data-testid={testId || "book-card"}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Cover on the left */}
            <div className="w-40 h-56 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden" data-testid="book-cover">
              {book.cover_url ? (
                <img 
                  src={book.cover_url} 
                  alt={book.title}
                  className="w-full h-full object-contain rounded-md bg-white"
                  data-testid="book-cover-image"
                />
              ) : (
                <div className="text-2xl" data-testid="book-cover-placeholder">📖</div>
              )}
            </div>

            {/* Book info on the right */}
            <div className="flex-1 space-y-2 min-w-0">
              <h4 className="font-medium text-lg text-foreground line-clamp-2 leading-tight" data-testid="book-title">
                {book.title}
              </h4>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="book-author">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{book.author}</span>
              </div>

              {book.user_rating && renderStars(book.user_rating)}

              <div className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="book-date">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{formatDate(book.created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Full variant (for larger displays)
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md"
      onClick={handleClick}
      data-testid={testId || "book-card"}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Cover */}
          <div className="w-40 h-56 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden" data-testid="book-cover">
            {book.cover_url ? (
              <img 
                src={book.cover_url} 
                alt={book.title}
                className="w-full h-full object-contain rounded bg-white"
                data-testid="book-cover-image"
              />
            ) : (
              <div className="text-2xl" data-testid="book-cover-placeholder">📖</div>
            )}
          </div>

          {/* Book details */}
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-medium text-foreground line-clamp-2" data-testid="book-title">{book.title}</h4>
              <p className="text-sm text-muted-foreground" data-testid="book-author">{book.author}</p>
            </div>

            {book.user_rating && renderStars(book.user_rating)}

            <div className="flex items-center justify-between text-xs text-muted-foreground" data-testid="book-metadata">
              <span data-testid="book-date">{formatDate(book.created_at)}</span>
              {book.notes_count > 0 && (
                <span data-testid="book-notes-count">{book.notes_count} notes</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 