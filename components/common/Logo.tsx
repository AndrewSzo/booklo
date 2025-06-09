'use client'

import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { useAuth } from '@/lib/providers/AuthProvider'

export default function Logo() {
  const { isAuthenticated } = useAuth()
  
  const href = isAuthenticated ? '/dashboard' : '/'
  
  return (
    <Link 
      href={href}
      className="flex items-center space-x-2 text-emerald-700 hover:text-emerald-800 transition-colors"
    >
      <BookOpen className="w-8 h-8" />
      <span className="text-xl font-bold">Booklo</span>
    </Link>
  )
} 