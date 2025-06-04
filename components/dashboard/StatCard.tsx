'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  count: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple'
  description?: string
  isLoading?: boolean
  onClick: () => void
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    hover: 'hover:bg-green-100 dark:hover:bg-green-900'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-900'
  }
}

export default function StatCard({ 
  title, 
  count, 
  icon: Icon, 
  color, 
  description, 
  isLoading = false, 
  onClick 
}: StatCardProps) {
  const variant = colorVariants[color]

  if (isLoading) {
    return (
      <Card className="cursor-pointer transition-all duration-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-5 w-5 bg-muted rounded"></div>
            </div>
            <div className="h-8 bg-muted rounded w-16"></div>
            <div className="h-3 bg-muted rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatCount = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 transform hover:scale-105 
        ${variant.bg} ${variant.border} ${variant.hover}
        active:scale-95
      `}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <Icon className={`h-5 w-5 ${variant.icon}`} />
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold text-foreground">
            {formatCount(count)}
          </p>
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        {/* Hover indicator */}
        <div className="mt-4 flex items-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Kliknij, aby wyświetlić →</span>
        </div>
      </CardContent>
    </Card>
  )
} 