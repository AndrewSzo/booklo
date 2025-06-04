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
  leftSidebarOpen = true
}: BooksGridProps) {
  // Loading state
  if (isLoading) {
    return <LoadingGrid count={12} />
  }

  // Empty state
  if (isEmpty) {
    return (
      <EmptyState 
        currentStatus={currentStatus}
        searchQuery={searchQuery}
        onClearFilters={onClearFilters}
      />
    )
  }

  // Calculate grid columns based on both sidebars
  const getGridClasses = () => {
    // If right sidebar is open, use standard 2-column layout
    if (sidebarOpen) {
      return 'grid-cols-1 sm:grid-cols-2'
    }
    
    // If right sidebar is closed, use fewer columns to make cards 30% wider
    // This reduces column count to make each card take more space
    if (!leftSidebarOpen) {
      // When both sidebars closed, moderate number of columns for wider cards
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }
    
    // If left sidebar is open but right is closed, use fewer columns for wider cards
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
  }

  // Books grid with intelligent layout
  return (
    <div className={`
      grid gap-6 auto-rows-max
      ${getGridClasses()}
      ${className}
    `}>
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={onBookSelect}
          variant="compact"
        />
      ))}
    </div>
  )
} 