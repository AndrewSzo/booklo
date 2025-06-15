'use client'

import { Home, BookOpen, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NavigationMenu from './NavigationMenu'
import BookCategories from './BookCategories'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentPath: string
}

interface NavigationItem {
  id: string
  label: string
  icon: typeof Home
  href: string
  badge?: number
}

const navigationItems: NavigationItem[] = [
  { id: 'home', label: 'Strona Główna', icon: Home, href: '/dashboard' },
  { id: 'library', label: 'Biblioteka', icon: BookOpen, href: '/library' },
  { id: 'settings', label: 'Ustawienia', icon: Settings, href: '/settings' },
]

export default function LeftSidebar({ isOpen, onToggle, currentPath }: SidebarProps) {
  if (!isOpen) {
    return null
  }

  return (
    <aside className="h-full bg-white/95 backdrop-blur-sm border-r border-emerald-100 overflow-y-auto shadow-sm" data-testid="left-sidebar">
      {/* Navigation Menu */}
      <div data-testid="sidebar-content">
        {/* Mobile close button */}
        <div className="p-4 flex justify-end md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
            data-testid="sidebar-close-button"
          >
            ✕
          </Button>
        </div>
        
        <NavigationMenu 
          items={navigationItems}
          currentPath={currentPath}
        />
        
        <div className="px-6 py-4" data-testid="sidebar-categories">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider" data-testid="categories-title">Kategorie</h3>
          <BookCategories />
        </div>
      </div>
    </aside>
  )
} 