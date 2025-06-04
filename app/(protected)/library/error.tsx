'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function LibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Library page error:', error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Something went wrong!
          </h2>
          <p className="text-muted-foreground">
            We encountered an error while loading your library. Please try again.
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        </div>
        
        {error.digest && (
          <div className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </div>
        )}
      </div>
    </div>
  )
} 