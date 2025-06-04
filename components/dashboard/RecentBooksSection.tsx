'use client'

import { BookListItemDTO } from '@/lib/types'
import BookCard from './BookCard'
import { Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RecentBooksSectionProps {
  books: BookListItemDTO[]
  isLoading: boolean
  onBookClick: (book: BookListItemDTO) => void
}

export default function RecentBooksSection({ books, isLoading, onBookClick }: RecentBooksSectionProps) {
  const handleAddBook = () => {
    console.log('Opening add book modal')
    // TODO: Open add book modal
  }

  const handleViewAll = () => {
    window.location.href = '/library'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Books</h2>
          <div className="h-4 bg-muted rounded w-16"></div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="min-w-[250px] space-y-3 animate-pulse">
              <div className="flex gap-3 p-4 border rounded-lg">
                <div className="w-12 h-16 bg-muted rounded-md flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
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
          <h2 className="text-lg font-semibold text-foreground">Recent Books</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <div className="w-16 h-16 mb-4 bg-muted rounded-full flex items-center justify-center">
            <div className="text-2xl">📚</div>
          </div>
          
          <h3 className="text-lg font-medium text-foreground mb-2">No books yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Start building your reading collection by adding your first book!
          </p>
          
          <Button onClick={handleAddBook} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Book
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Books</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleViewAll}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        {books.map((book) => (
          <div key={book.id} className="min-w-[250px] flex-shrink-0">
            <BookCard
              book={book}
              onClick={onBookClick}
              variant="compact"
            />
          </div>
        ))}
        
        {/* Add book card */}
        <div className="min-w-[250px] flex-shrink-0">
          <div 
            className="
              h-full border-2 border-dashed border-muted-foreground/25 rounded-lg 
              flex flex-col items-center justify-center p-6 cursor-pointer
              hover:border-primary/50 hover:bg-muted/50 transition-colors
            "
            onClick={handleAddBook}
          >
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground text-center">
              Add New Book
            </span>
          </div>
        </div>
      </div>
      
      {/* Scroll hint for mobile */}
      <div className="md:hidden text-xs text-muted-foreground text-center">
        Scroll horizontally to see more books
      </div>
    </div>
  )
} 