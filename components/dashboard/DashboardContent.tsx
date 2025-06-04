'use client'

import { useDashboardData } from '@/hooks/useDashboardData'
import WelcomeHeader from './WelcomeHeader'
import StatsCardsGrid from './StatsCardsGrid'
import QuickActionsPanel from './QuickActionsPanel'
import RecentBooksSection from './RecentBooksSection'
import ReadingProgressSection from './ReadingProgressSection'
import { AiChatDialog } from '@/components/ai-chat/AiChatDialog'

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
      
      <QuickActionsPanel 
        actions={[
          { id: 'add-book', label: 'Dodaj książkę', icon: 'Plus', variant: 'primary' },
          { id: 'search', label: 'Szukaj', icon: 'Search', variant: 'secondary' },
        ]}
        onActionClick={(actionId) => {
          if (actionId === 'add-book') {
            // Otwórz modal dodawania książki
            console.log('Opening add book modal')
          } else if (actionId === 'search') {
            // Przejdź do search
            window.location.href = '/search'
          }
        }}
      />

      {/* AI Chat Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
        <AiChatDialog 
          context={`User has ${(dashboardData.stats?.want_to_read_count || 0) + (dashboardData.stats?.reading_count || 0) + (dashboardData.stats?.finished_count || 0)} books in library. Currently reading: ${dashboardData.stats?.reading_count || 0} books.`}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBooksSection 
          books={dashboardData.recentBooks}
          isLoading={dashboardData.isLoading}
          onBookClick={(book) => {
            // Otwórz szczegóły w prawym sidebarze
            console.log('Opening book details', book)
          }}
        />
        
        <ReadingProgressSection 
          books={dashboardData.currentlyReading}
          isLoading={dashboardData.isLoading}
        />
      </div>
    </div>
  )
} 