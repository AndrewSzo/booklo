'use client'

import { useTransition } from 'react'
import { User, Settings, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/providers/AuthProvider'

export default function UserProfileSection() {
  const { user } = useAuth()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
        })

        if (response.ok) {
          window.location.href = '/'
        } else {
          console.error('Failed to logout')
        }
      } catch (error) {
        console.error('Błąd podczas wylogowywania:', error)
      }
    })
  }

  const handleProfile = () => {
    window.location.href = '/profile'
  }

  const handleSettings = () => {
    window.location.href = '/settings'
  }

  return (
    <div className="p-6 space-y-4">
      {/* User info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-md">
          <User className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user?.email?.split('@')[0] || 'Użytkownik'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.email || 'email@example.com'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 h-10 rounded-lg text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          onClick={handleProfile}
        >
          <User className="h-4 w-4" />
          <span className="text-sm font-medium">Profil</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 h-10 rounded-lg text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          onClick={handleSettings}
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Ustawienia</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 h-10 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          onClick={handleLogout}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isPending ? 'Wylogowywanie...' : 'Wyloguj'}
          </span>
        </Button>
      </div>
    </div>
  )
} 