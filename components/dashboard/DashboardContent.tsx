'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { BookResponseDTO } from '@/lib/types'
import { useDashboardData } from '@/hooks/useDashboardData'
import AddBookModal from '@/components/library/AddBookModal'
import WelcomeHeader from './WelcomeHeader'
import StatsCardsGrid from './StatsCardsGrid'
import CurrentlyReadingSection from './CurrentlyReadingSection'

export default function DashboardContent() {
  const { dashboardData } = useDashboardData()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleBookAdded = (book: BookResponseDTO) => {
    // Refresh dashboard data to show new book
    dashboardData.refreshData()
    console.log('Książka została dodana pomyślnie:', book.title)
  }

  if (dashboardData.isLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Wystąpił błąd podczas ładowania danych</p>
          <button 
            onClick={dashboardData.refreshData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Dashboard Header with Add Book Button */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <WelcomeHeader />
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
      
      <StatsCardsGrid 
        stats={dashboardData.stats}
        isLoading={dashboardData.isLoading}
        onCategoryClick={(status) => {
          // Nawigacja do /library?status={status}
          window.location.href = `/library?status=${status}`
        }}
      />
      
      <CurrentlyReadingSection 
        books={dashboardData.currentlyReading}
        isLoading={dashboardData.isLoading}
        onBookClick={(book) => {
          // Otwórz szczegóły w prawym sidebarze
          console.log('Opening book details', book)
        }}
      />

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