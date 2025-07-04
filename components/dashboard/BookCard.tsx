'use client'

import { BookListItemDTO } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Calendar, User, Tag } from 'lucide-react'
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



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (variant === 'compact') {
    return (
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 w-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] lg:min-h-[220px] xl:min-h-[240px]"
        onClick={handleClick}
        data-testid={testId || "book-card"}
      >
        <CardContent className="p-3 sm:p-4 h-full">
          <div className="flex gap-3 md:gap-4 h-full">
            {/* Cover on the left */}
            <div className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 lg:w-32 lg:h-40 xl:w-36 xl:h-48 2xl:w-40 2xl:h-56 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden" data-testid="book-cover">
              {book.cover_url ? (
                <img 
                  src={book.cover_url} 
                  alt={book.title}
                  className="w-full h-full object-contain rounded-md bg-white"
                  data-testid="book-cover-image"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded-md flex flex-col items-center justify-center text-white shadow-inner" data-testid="book-cover-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 mb-1 sm:mb-2 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                    <path d="M8 7h8"/>
                    <path d="M8 11h8"/>
                  </svg>
                  <span className="text-xs font-medium opacity-75 text-center px-1 sm:px-2 hidden sm:block">Brak okładki</span>
                </div>
              )}
            </div>

            {/* Book info on the right */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="space-y-2 md:space-y-3">
                <div>
                  <h4 className="font-semibold text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-foreground leading-tight mb-1" data-testid="book-title">
                    {book.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm md:text-sm text-muted-foreground" data-testid="book-author">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{book.author}</span>
                  </div>
                </div>

                {/* Category and Rating in a flexible layout */}
                <div className="space-y-2">
                  {book.category && (
                    <div className="flex items-center gap-1.5" data-testid="book-category">
                      <Tag className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium truncate max-w-[120px] sm:max-w-[140px] md:max-w-[160px]">
                        {book.category}
                      </span>
                    </div>
                  )}

                  {book.user_rating && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < book.user_rating! 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-muted-foreground'
                          }`}
                          data-testid={`star-${i}`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1" data-testid="rating-value">{book.user_rating}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm md:text-sm text-muted-foreground mt-2 md:mt-3" data-testid="book-date">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
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
      className="cursor-pointer transition-all duration-200 hover:shadow-md min-h-[160px] sm:min-h-[180px] md:min-h-[200px] lg:min-h-[220px] xl:min-h-[240px]"
      onClick={handleClick}
      data-testid={testId || "book-card"}
    >
      <CardContent className="p-3 sm:p-4 h-full">
        <div className="flex gap-3 md:gap-4 h-full">
          {/* Cover */}
          <div className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 lg:w-32 lg:h-40 xl:w-36 xl:h-48 2xl:w-40 2xl:h-56 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden" data-testid="book-cover">
            {book.cover_url ? (
              <img 
                src={book.cover_url} 
                alt={book.title}
                className="w-full h-full object-contain rounded bg-white"
                data-testid="book-cover-image"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded flex flex-col items-center justify-center text-white shadow-inner" data-testid="book-cover-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10 mb-1 sm:mb-2 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                  <path d="M8 7h8"/>
                  <path d="M8 11h8"/>
                </svg>
                <span className="text-xs font-medium opacity-75 text-center px-1 sm:px-2 hidden sm:block">Brak okładki</span>
              </div>
            )}
          </div>

          {/* Book details */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-2 md:space-y-3">
              <div>
                <h4 className="font-semibold text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl text-foreground leading-tight mb-1" data-testid="book-title">{book.title}</h4>
                <p className="text-xs sm:text-sm md:text-sm text-muted-foreground" data-testid="book-author">{book.author}</p>
              </div>

              {/* Category and Rating in a flexible layout */}
              <div className="space-y-2">
                {book.category && (
                  <div className="flex items-center gap-1.5" data-testid="book-category">
                    <Tag className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium truncate max-w-[120px] sm:max-w-[140px] md:max-w-[160px]">
                      {book.category}
                    </span>
                  </div>
                )}

                {book.user_rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < book.user_rating! 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-muted-foreground'
                        }`}
                        data-testid={`star-${i}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1" data-testid="rating-value">{book.user_rating}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 md:mt-3" data-testid="book-metadata">
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