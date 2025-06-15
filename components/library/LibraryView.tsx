'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useLibrary } from '@/hooks/useLibrary'
import { useBookDetailsContext } from '@/lib/providers/BookDetailsContext'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { BookListItemDTO, ReadingStatus, BookResponseDTO } from '@/lib/types'
import LibraryHeader from './LibraryHeader'
import BooksGrid from './BooksGrid'
import LoadMoreButton from './LoadMoreButton'

export default function LibraryView() {
  const { state, actions } = useLibrary()
  const { openSidebar, sidebarOpen } = useBookDetailsContext()
  const { layoutState } = useResponsiveLayout()
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleBookSelect = (book: BookListItemDTO) => {
    // Otwórz sidebar z informacjami o książce (zakładka Info)
    openSidebar(book.id, 'info')
  }

  const handleStatusChange = (status: ReadingStatus | 'all') => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    params.delete('page') // Reset to first page
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.push(newUrl, { scroll: false })
  }

  const handleSearchChange = (query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.push(newUrl, { scroll: false })
  }

  const handleClearFilters = () => {
    router.push(window.location.pathname, { scroll: false })
  }

  const handleBookAdded = (book: BookResponseDTO) => {
    // Refresh library to show new book
    actions.refetch()
    console.log('Książka została dodana:', book.title)
  }

  return (
    <div className="flex flex-col h-full" data-testid="library-view">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 space-y-6 md:space-y-8 pb-8 md:pb-12 lg:pb-16">
          <LibraryHeader
            currentStatus={state.filters.status}
            searchQuery={state.filters.searchQuery}
            onStatusChange={handleStatusChange}
            onSearchChange={handleSearchChange}
            bookCounts={state.bookCounts}
            onBookAdded={handleBookAdded}
          />
          
          {state.error ? (
            <div className="flex items-center justify-center py-16 md:py-20 lg:py-24" data-testid="library-error">
              <div className="text-center space-y-4">
                <div className="text-destructive text-lg font-medium" data-testid="error-title">
                  Błąd podczas ładowania książek
                </div>
                <p className="text-muted-foreground" data-testid="error-message">{state.error}</p>
                <button 
                  onClick={actions.refetch}
                  className="text-primary hover:underline"
                  data-testid="retry-button"
                >
                  Spróbuj ponownie
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 md:space-y-10 lg:space-y-12">
              <BooksGrid
                books={state.books}
                isLoading={state.isLoading}
                isEmpty={state.books.length === 0 && !state.isLoading}
                onBookSelect={handleBookSelect}
                currentStatus={state.filters.status}
                searchQuery={state.filters.searchQuery}
                onClearFilters={handleClearFilters}
                sidebarOpen={sidebarOpen}
                leftSidebarOpen={layoutState.leftSidebarOpen}
                data-testid="library-books-grid"
              />
              
              {state.hasNextPage && (
                <LoadMoreButton
                  hasNextPage={state.hasNextPage}
                  isLoading={state.isLoadingMore}
                  onLoadMore={actions.loadMore}
                  data-testid="load-more-button"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 