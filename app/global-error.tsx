'use client'

import { useEffect } from 'react'
import { BookOpen, AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="text-center space-y-8 max-w-md relative z-10">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3">
              <BookOpen className="w-12 h-12 text-emerald-700" />
              <span className="text-3xl font-bold text-emerald-700">Booklo</span>
            </div>
            
            {/* Error Content */}
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-semibold text-gray-900">
                Wystąpił krytyczny błąd!
              </h1>
              <p className="text-gray-600">
                Aplikacja napotkała nieoczekiwany błąd. Prosimy o odświeżenie strony.
              </p>
            </div>
            
            {/* Action Button */}
            <div className="flex justify-center">
              <button 
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Odśwież stronę
              </button>
            </div>
            
            {error.digest && (
              <div className="text-xs text-gray-500 mt-4">
                Identyfikator błędu: {error.digest}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
} 