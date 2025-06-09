'use client'

import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Search, Filter } from 'lucide-react'
import { ReadingStatus } from '@/lib/types'

interface EmptyStateProps {
  currentStatus?: ReadingStatus | 'all'
  searchQuery?: string
  onAddBook?: () => void
  onClearFilters?: () => void
  className?: string
  'data-testid'?: string
}

export default function EmptyState({ 
  currentStatus = 'all',
  searchQuery = '',
  onAddBook,
  onClearFilters,
  className = '',
  'data-testid': testId
}: EmptyStateProps) {
  
  const handleAddBook = () => {
    if (onAddBook) {
      onAddBook()
    } else {
      // TODO: Open add book modal or navigate to add book page
      console.log('Otwieranie modala dodawania książki')
    }
  }

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    }
  }

  // Determine the empty state message based on current filters
  const getEmptyStateContent = () => {
    if (searchQuery) {
      return {
        icon: Search,
        title: 'Nie znaleziono książek',
        description: `Żadne książki nie pasują do wyszukiwania "${searchQuery}". Spróbuj innych słów kluczowych lub wyczyść wyszukiwanie.`,
        primaryAction: {
          label: 'Wyczyść Wyszukiwanie',
          action: handleClearFilters,
          variant: 'default' as const
        },
        secondaryAction: {
          label: 'Dodaj Nową Książkę',
          action: handleAddBook,
          variant: 'outline' as const
        }
      }
    }

    if (currentStatus === 'want_to_read') {
      return {
        icon: BookOpen,
        title: 'Brak książek w "Chcę przeczytać"',
        description: 'Zacznij budować swoją listę życzeń dodając książki które chcesz przeczytać.',
        primaryAction: {
          label: 'Dodaj pierwszą książkę',
          action: handleAddBook,
          variant: 'default' as const
        },
        secondaryAction: {
          label: 'Przeglądaj wszystkie książki',
          action: () => window.location.href = '/search',
          variant: 'outline' as const
        }
      }
    }

    if (currentStatus === 'reading') {
      return {
        icon: BookOpen,
        title: 'Nie czytasz obecnie żadnych książek',
        description: 'Wybierz książkę z listy "Chcę przeczytać" i rozpocznij swoją czytelniczą podróż!',
        primaryAction: {
          label: 'Zobacz "Chcę przeczytać"',
          action: () => onClearFilters && onClearFilters(),
          variant: 'default' as const
        },
        secondaryAction: {
          label: 'Dodaj nową książkę',
          action: handleAddBook,
          variant: 'outline' as const
        }
      }
    }

    if (currentStatus === 'finished') {
      return {
        icon: BookOpen,
        title: 'Nie masz jeszcze przeczytanych książek',
        description: 'Ukończ swoją pierwszą książkę i śledź swoje osiągnięcia czytelnicze!',
        primaryAction: {
          label: 'Zobacz aktualnie czytane',
          action: () => onClearFilters && onClearFilters(),
          variant: 'default' as const
        },
        secondaryAction: {
          label: 'Dodaj nową książkę',
          action: handleAddBook,
          variant: 'outline' as const
        }
      }
    }

    // Default state (all books)
    return {
      icon: BookOpen,
      title: 'Twoja biblioteka jest pusta',
      description: 'Zacznij budować swoją osobistą bibliotekę dodając pierwszą książkę!',
      primaryAction: {
        label: 'Dodaj pierwszą książkę',
        action: handleAddBook,
        variant: 'default' as const
      },
      secondaryAction: {
        label: 'Przeglądaj książki',
        action: () => window.location.href = '/search',
        variant: 'outline' as const
      }
    }
  }

  const content = getEmptyStateContent()
  const Icon = content.icon

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 ${className}`} data-testid={testId}>
      <div className="w-24 h-24 mb-6 bg-muted rounded-full flex items-center justify-center" data-testid="empty-state-icon">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-xl font-semibold text-foreground" data-testid="empty-state-title">{content.title}</h3>
        <p className="text-muted-foreground" data-testid="empty-state-description">
          {content.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center" data-testid="empty-state-actions">
          <Button 
            onClick={content.primaryAction.action} 
            variant={content.primaryAction.variant}
            className="gap-2"
            data-testid="empty-state-primary-action"
          >
            {content.primaryAction.label.includes('Dodaj') && <Plus className="h-4 w-4" />}
            {content.primaryAction.label.includes('Wyczyść') && <Filter className="h-4 w-4" />}
            {content.primaryAction.label}
          </Button>
          
          <Button 
            onClick={content.secondaryAction.action}
            variant={content.secondaryAction.variant}
            data-testid="empty-state-secondary-action"
          >
            {content.secondaryAction.label}
          </Button>
        </div>
      </div>
    </div>
  )
}