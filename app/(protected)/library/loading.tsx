export default function LibraryLoading() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        
        {/* Filter tabs skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        
        {/* Search bar skeleton */}
        <div className="h-10 w-full max-w-md bg-muted rounded animate-pulse" />
      </div>
      
      {/* Books grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="aspect-[3/4] bg-muted rounded-md" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 