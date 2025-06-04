'use client'

interface LoadingGridProps {
  count?: number
  className?: string
}

export default function LoadingGrid({ count = 12, className = '' }: LoadingGridProps) {
  return (
    <div className={`
      grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
      gap-6 auto-rows-max
      ${className}
    `}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 animate-pulse">
          {/* Cover placeholder */}
          <div className="aspect-[3/4] bg-muted rounded-md" />
          
          {/* Content placeholders */}
          <div className="space-y-2">
            {/* Title */}
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            
            {/* Author */}
            <div className="h-3 bg-muted rounded w-2/3" />
            
            {/* Rating stars */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <div key={starIndex} className="h-3 w-3 bg-muted rounded" />
              ))}
            </div>
            
            {/* Date */}
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
} 