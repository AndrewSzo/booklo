'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/providers/AuthProvider'

export default function Logo() {
  const { isAuthenticated } = useAuth()
  
  const href = isAuthenticated ? '/dashboard' : '/'
  
  return (
    <Link 
      href={href}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <h1 className="text-xl font-bold text-foreground">
        📚 Booklo
      </h1>
    </Link>
  )
} 