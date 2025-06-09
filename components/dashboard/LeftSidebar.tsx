'use client'

import { Home, BookOpen, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NavigationMenu from './NavigationMenu'
import CategoryList from './CategoryList'
import UserProfileSection from './UserProfileSection'

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
  { id: 'search', label: 'Szukaj', icon: Search, href: '/search' },
  { id: 'settings', label: 'Ustawienia', icon: Settings, href: '/settings' },
]

export default function LeftSidebar({ isOpen, onToggle, currentPath }: SidebarProps) {
  if (!isOpen) {
    return null
  }

  return (
    <aside className="h-full bg-white/95 backdrop-blur-sm border-r border-emerald-100 flex flex-col overflow-hidden shadow-sm" data-testid="left-sidebar">
      {/* Header with logo */}
      <div className="p-6 border-b border-emerald-100" data-testid="sidebar-header">
        <div className="flex items-center space-x-3" data-testid="sidebar-logo">
          <BookOpen className="w-8 h-8 text-emerald-700" data-testid="sidebar-logo-icon" />
          <span className="text-lg font-bold text-gray-900" data-testid="sidebar-logo-text">Booklo</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto" data-testid="sidebar-content">
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
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider" data-testid="categories-title">Biblioteka</h3>
          <CategoryList />
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-emerald-100" data-testid="sidebar-footer">
        <UserProfileSection />
      </div>
    </aside>
  )
} 