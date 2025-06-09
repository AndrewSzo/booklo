'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
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
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900">
            Coś poszło nie tak!
          </h1>
          <p className="text-gray-600">
            Napotkaliśmy nieoczekiwany błąd. Przepraszamy za niedogodności.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Spróbuj ponownie
          </Button>
          
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Strona główna
            </Link>
          </Button>
        </div>
        
        {error.digest && (
          <div className="text-xs text-muted-foreground mt-4">
            Identyfikator błędu: {error.digest}
          </div>
        )}
      </div>
    </div>
  )
} 