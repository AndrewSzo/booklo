'use client'

interface LoadingGridProps {
  count?: number
  className?: string
  'data-testid'?: string
}

export default function LoadingGrid({ count = 12, className = '', 'data-testid': testId }: LoadingGridProps) {
  return (
    <div className={`
      grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6
      gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 auto-rows-max
      ${className}
    `} data-testid={testId}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 animate-pulse" data-testid={`loading-card-${i}`}>
          {/* Cover placeholder */}
          <div className="aspect-[3/4] bg-muted rounded-md" data-testid={`loading-cover-${i}`} />
          
          {/* Content placeholders */}
          <div className="space-y-2 px-1">
            {/* Title */}
            <div className="h-4 bg-muted rounded w-full" data-testid={`loading-title-${i}`} />
            <div className="h-4 bg-muted rounded w-3/4" />
            
            {/* Author */}
            <div className="h-3 bg-muted rounded w-2/3" data-testid={`loading-author-${i}`} />
            
            {/* Rating stars */}
            <div className="flex gap-1" data-testid={`loading-rating-${i}`}>
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <div key={starIndex} className="h-3 w-3 bg-muted rounded" />
              ))}
            </div>
            
            {/* Date */}
            <div className="h-3 bg-muted rounded w-1/2" data-testid={`loading-date-${i}`} />
          </div>
        </div>
      ))}
    </div>
  )
} 