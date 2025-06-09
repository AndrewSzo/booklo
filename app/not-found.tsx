'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
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
        
        {/* 404 Content */}
        <div className="space-y-4">
          <div className="text-6xl font-bold text-emerald-600">404</div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Strona nie została znaleziona
          </h1>
          <p className="text-gray-600">
            Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Strona główna
            </Link>
          </Button>
          
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Wróć
          </Button>
        </div>
      </div>
    </div>
  )
} 