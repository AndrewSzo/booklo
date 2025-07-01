'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut, ChevronDown, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/providers/AuthProvider'

export default function AuthButton() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
        })

        if (response.ok) {
          setIsOpen(false)
          window.location.href = '/'
        } else {
          console.error('Failed to logout')
        }
      } catch (error) {
        console.error('Error logging out:', error)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild size="sm">
          <Link href="/auth/login">
            Zaloguj się
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/register">
            Zarejestruj się
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-primary-foreground" />
          </div>
          <div className="hidden sm:flex flex-col items-start text-sm">
            <span className="font-medium">
              {user?.email?.split('@')[0] || 'Użytkownik'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {user?.email?.split('@')[0] || 'Użytkownik'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isPending}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span>{isPending ? 'Wylogowywanie...' : 'Wyloguj się'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 