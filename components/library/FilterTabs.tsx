'use client'

import { ReadingStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { BookOpen, Eye, CheckCircle, Library } from 'lucide-react'

interface FilterTabsProps {
  activeStatus: ReadingStatus | 'all'
  onStatusChange: (status: ReadingStatus | 'all') => void
  bookCounts?: Record<ReadingStatus, number>
  'data-testid'?: string
}

interface FilterTab {
  status: ReadingStatus | 'all'
  label: string
  icon: typeof BookOpen
  count?: number
  color: string
}

export default function FilterTabs({
  activeStatus,
  onStatusChange,
  bookCounts,
  'data-testid': testId
}: FilterTabsProps) {
  const tabs: FilterTab[] = [
    {
      status: 'all',
      label: 'Wszystkie książki',
      icon: Library,
      count: bookCounts ? Object.values(bookCounts).reduce((sum, count) => sum + count, 0) : undefined,
      color: 'emerald'
    },
    {
      status: 'want_to_read',
      label: 'Chcę przeczytać',
      icon: BookOpen,
      count: bookCounts?.want_to_read,
      color: 'blue'
    },
    {
      status: 'reading',
      label: 'Czytam',
      icon: Eye,
      count: bookCounts?.reading,
      color: 'amber'
    },
    {
      status: 'finished',
      label: 'Przeczytane',
      icon: CheckCircle,
      count: bookCounts?.finished,
      color: 'green'
    }
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    if (isActive) {
      return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg border-emerald-500'
    }
    
    const colorMap = {
      emerald: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300',
      blue: 'border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300',
      amber: 'border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300',
      green: 'border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300'
    }
    
    return `${colorMap[color as keyof typeof colorMap]} bg-white`
  }

  return (
    <div className="flex flex-wrap gap-3" data-testid={testId}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeStatus === tab.status
        
        return (
          <Button
            key={tab.status}
            variant="outline"
            onClick={() => onStatusChange(tab.status)}
            className={`
              gap-3 h-12 px-4 rounded-xl transition-all duration-200 border-2
              ${getColorClasses(tab.color, isActive)}
              ${isActive ? 'transform scale-105' : 'hover:scale-105'}
            `}
            data-testid={`filter-tab-${tab.status}`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`
                px-2 py-1 rounded-full text-xs font-semibold min-w-[24px] text-center
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 text-gray-600'
                }
              `} data-testid={`filter-tab-${tab.status}-count`}>
                {tab.count}
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
} 