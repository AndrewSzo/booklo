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
    <div className={`flex justify-center pt-6 ${className}`} data-testid={testId}>
      <Button
        onClick={onLoadMore}
        disabled={isLoading || !hasNextPage}
        variant="outline"
        size="lg"
        className="gap-2"
        data-testid="load-more-button"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" data-testid="load-more-spinner" />
            Ładowanie więcej książek...
          </>
        ) : (
          'Załaduj Więcej Książek'
        )}
      </Button>
    </div>
  )
} 