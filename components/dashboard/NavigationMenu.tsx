'use client'

import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavigationItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: number
}

interface NavigationMenuProps {
  items: NavigationItem[]
  currentPath: string
}

export default function NavigationMenu({ items, currentPath }: NavigationMenuProps) {
  const handleNavigation = (href: string) => {
    window.location.href = href
  }

  return (
    <nav className="px-6 py-6 space-y-2">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = currentPath === item.href
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            className={`
              w-full justify-start gap-3 h-11 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg hover:from-emerald-600 hover:to-green-600' 
                : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
              }
            `}
            onClick={() => handleNavigation(item.href)}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className={`
                ml-auto text-xs rounded-full px-2 py-1 font-semibold
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-emerald-100 text-emerald-700'
                }
              `}>
                {item.badge}
              </span>
            )}
          </Button>
        )
      })}
    </nav>
  )
} 