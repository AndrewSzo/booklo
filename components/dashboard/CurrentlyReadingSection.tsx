'use client'

import { BookListItemDTO } from '@/lib/types'
import BookCard from './BookCard'
import { BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CurrentlyReadingSectionProps {
  books: BookListItemDTO[]
  isLoading: boolean
  onBookClick: (book: BookListItemDTO) => void
}

export default function CurrentlyReadingSection({ books, isLoading, onBookClick }: CurrentlyReadingSectionProps) {
  const handleViewAll = () => {
    window.location.href = '/library?status=reading'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Czytam</h2>
          </div>
          <div className="h-4 bg-muted rounded w-16"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-[3/4] bg-muted rounded-md"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Czytam</h2>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <div className="w-16 h-16 mb-4 bg-muted rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <h3 className="text-lg font-medium text-foreground mb-2">Brak książek w trakcie czytania</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Rozpocznij czytanie książki z listy &quot;Chcę przeczytać&quot;!
          </p>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/library?status=want_to_read'}
          >
            Przeglądaj książki
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Czytam ({books.length})</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleViewAll}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          Zobacz wszystkie
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={onBookClick}
            variant="compact"
          />
        ))}
      </div>
    </div>
  )
} 