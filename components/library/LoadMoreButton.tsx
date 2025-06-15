'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface LoadMoreButtonProps {
  hasNextPage: boolean
  isLoading: boolean
  onLoadMore: () => void
  className?: string
  'data-testid'?: string
}

export default function LoadMoreButton({
  hasNextPage,
  isLoading,
  onLoadMore,
  className = '',
  'data-testid': testId
}: LoadMoreButtonProps) {
  if (!hasNextPage && !isLoading) {
    return null
  }

  return (
    <div className={`flex justify-center pt-4 md:pt-6 lg:pt-8 pb-4 md:pb-6 lg:pb-8 ${className}`} data-testid={testId}>
      <Button
        onClick={onLoadMore}
        disabled={isLoading || !hasNextPage}
        variant="outline"
        size="lg"
        className="gap-2 px-6 py-3 md:px-8 md:py-4"
        data-testid="load-more-button"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" data-testid="load-more-spinner" />
            <span className="hidden sm:inline">Ładowanie więcej książek...</span>
            <span className="sm:hidden">Ładowanie...</span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline">Załaduj Więcej Książek</span>
            <span className="sm:hidden">Więcej</span>
          </>
        )}
      </Button>
    </div>
  )
} 