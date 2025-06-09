'use client'

import { useState } from 'react'
import { ReadingStatus, BookResponseDTO } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Plus, Menu, BookOpen } from 'lucide-react'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import FilterTabs from './FilterTabs'
import SearchBar from './SearchBar'
import AddBookModal from './AddBookModal'

interface LibraryHeaderProps {
  currentStatus: ReadingStatus | 'all'
  searchQuery: string
  onStatusChange: (status: ReadingStatus | 'all') => void
  onSearchChange: (query: string) => void
  bookCounts?: Record<ReadingStatus, number>
  onBookAdded?: (book: BookResponseDTO) => void
}

export default function LibraryHeader({
  currentStatus,
  searchQuery,
  onStatusChange,
  onSearchChange,
  bookCounts,
  onBookAdded
}: LibraryHeaderProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { layoutState, toggleLeftSidebar } = useResponsiveLayout()

  const handleBookAdded = (book: BookResponseDTO) => {
    onBookAdded?.(book)
    // Show success message or toast here
    console.log('Książka została dodana pomyślnie:', book.title)
  }

  return (
    <div className="space-y-8" data-testid="library-header">
      {/* Title and Add Button */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Menu button for mobile/when sidebar is closed */}
          {(!layoutState.leftSidebarOpen || layoutState.screenSize === 'mobile') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLeftSidebar}
              className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              data-testid="sidebar-menu-button"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-4" data-testid="library-title-section">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent" data-testid="library-title">
                Moja Biblioteka
              </h1>
              <p className="text-gray-600 mt-1" data-testid="library-subtitle">
                Zarządzaj i odkrywaj swoją kolekcję książek
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          data-testid="add-book-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj Książkę
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="space-y-6" data-testid="library-controls">
        <FilterTabs
          activeStatus={currentStatus}
          onStatusChange={onStatusChange}
          bookCounts={bookCounts}
          data-testid="filter-tabs"
        />
        
        <SearchBar
          value={searchQuery}
          placeholder="Szukaj książek po tytule, autorze lub opisie..."
          onSearch={onSearchChange}
          data-testid="search-bar"
        />
      </div>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleBookAdded}
        data-testid="add-book-modal"
      />
    </div>
  )
} 