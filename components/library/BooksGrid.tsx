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

  // Calculate grid columns based on both sidebars
  const getGridClasses = () => {
    // If right sidebar is open, use standard layout with fewer columns
    if (sidebarOpen) {
      return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2'
    }
    
    // If right sidebar is closed, use more columns for better space utilization
    if (!leftSidebarOpen) {
      // When both sidebars closed, maximize columns for full width
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    }
    
    // If left sidebar is open but right is closed, balanced layout
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  // Books grid with intelligent layout
  return (
    <div className={`
      grid gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 auto-rows-max
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