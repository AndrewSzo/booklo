'use client'

import { BookListItemDTO, ReadingStatus } from '@/lib/types'
import BookCard from '@/components/dashboard/BookCard'
import EmptyState from './EmptyState'
import LoadingGrid from './LoadingGrid'

interface BooksGridProps {
  books: BookListItemDTO[]
  isLoading: boolean
  isEmpty: boolean
  onBookSelect: (book: BookListItemDTO) => void
  currentStatus?: ReadingStatus | 'all'
  searchQuery?: string
  onClearFilters?: () => void
  className?: string
  sidebarOpen?: boolean
  leftSidebarOpen?: boolean
  'data-testid'?: string
}

export default function BooksGrid({
  books,
  isLoading,
  isEmpty,
  onBookSelect,
  currentStatus = 'all',
  searchQuery = '',
  onClearFilters,
  className = '',
  sidebarOpen = false,
  leftSidebarOpen = true,
  'data-testid': testId
}: BooksGridProps) {
  // Loading state
  if (isLoading) {
    return <LoadingGrid count={12} data-testid="books-loading-grid" />
  }

  // Empty state
  if (isEmpty) {
    return (
      <EmptyState 
        currentStatus={currentStatus}
        searchQuery={searchQuery}
        onClearFilters={onClearFilters}
        data-testid="books-empty-state"
      />
    )
  }

  // Calculate grid columns based on both sidebars - fewer columns for better content fit
  const getGridClasses = () => {
    // If right sidebar is open, use very few columns to ensure content fits
    if (sidebarOpen) {
      return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2'
    }
    
    // If right sidebar is closed, use moderate columns for better space utilization
    if (!leftSidebarOpen) {
      // When both sidebars closed, use fewer columns to ensure content fits well
      return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
    }
    
    // If left sidebar is open but right is closed, balanced layout
    return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
  }

  // Books grid with intelligent layout
  return (
    <div className={`
      grid gap-6 sm:gap-7 md:gap-8 lg:gap-9 xl:gap-10 auto-rows-max
      ${getGridClasses()}
      ${className}
    `} data-testid={testId || "books-grid"}>
      {books.map((book, index) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={onBookSelect}
          variant="compact"
          data-testid={`book-card-${index}`}
        />
      ))}
    </div>
  )
} 