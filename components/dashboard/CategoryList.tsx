'use client'

import { BookOpen, Eye, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDashboardData } from '@/hooks/useDashboardData'

interface CategoryItem {
  id: string
  label: string
  icon: typeof BookOpen
  status: string
  count?: number
  color: string
}

export default function CategoryList() {
  const { dashboardData } = useDashboardData()

  const categories: CategoryItem[] = [
    {
      id: 'want-to-read',
      label: 'Chcę przeczytać',
      icon: BookOpen,
      status: 'want_to_read',
      count: dashboardData.stats?.want_to_read_count,
      color: 'blue'
    },
    {
      id: 'reading',
      label: 'Czytam',
      icon: Eye,
      status: 'reading',
      count: dashboardData.stats?.reading_count,
      color: 'amber'
    },
    {
      id: 'finished',
      label: 'Przeczytane',
      icon: CheckCircle,
      status: 'finished',
      count: dashboardData.stats?.finished_count,
      color: 'green'
    }
  ]

  const handleCategoryClick = (status: string) => {
    window.location.href = `/library?status=${status}`
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
      amber: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
      green: 'text-green-600 hover:text-green-700 hover:bg-green-50'
    }
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const Icon = category.icon
        
        return (
          <Button
            key={category.id}
            variant="ghost"
            className={`w-full justify-between h-10 rounded-lg transition-all duration-200 ${getColorClasses(category.color)}`}
            onClick={() => handleCategoryClick(category.status)}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </div>
            {category.count !== undefined && (
              <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-1 font-semibold min-w-[24px] text-center">
                {category.count}
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
} 