'use client'

import { useDashboardData } from '@/hooks/useDashboardData'
import WelcomeHeader from './WelcomeHeader'
import StatsCardsGrid from './StatsCardsGrid'
import CurrentlyReadingSection from './CurrentlyReadingSection'

export default function DashboardContent() {
  const { dashboardData } = useDashboardData()

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
      <WelcomeHeader />
      
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
    </div>
  )
} 