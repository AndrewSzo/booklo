'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface LoadMoreButtonProps {
  hasNextPage: boolean
  isLoading: boolean
  onLoadMore: () => void
  className?: string
}

export default function LoadMoreButton({
  hasNextPage,
  isLoading,
  onLoadMore,
  className = ''
}: LoadMoreButtonProps) {
  if (!hasNextPage && !isLoading) {
    return null
  }

  return (
    <div className={`flex justify-center pt-6 ${className}`}>
      <Button
        onClick={onLoadMore}
        disabled={isLoading || !hasNextPage}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Ładowanie więcej książek...
          </>
        ) : (
          'Załaduj Więcej Książek'
        )}
      </Button>
    </div>
  )
} 