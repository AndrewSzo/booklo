'use client'

import { UserStatsDTO, ReadingStatus } from '@/lib/types'
import StatCard from './StatCard'
import { BookOpen, Eye, CheckCircle } from 'lucide-react'

interface StatsCardsProps {
  stats: UserStatsDTO | null
  isLoading: boolean
  onCategoryClick: (status: ReadingStatus) => void
}

export default function StatsCardsGrid({ stats, isLoading, onCategoryClick }: StatsCardsProps) {
  const statsData = [
    {
      title: 'Chcę przeczytać',
      count: stats?.want_to_read_count || 0,
      icon: BookOpen,
      color: 'blue' as const,
      status: 'want_to_read' as ReadingStatus,
      description: 'Książki na liście życzeń'
    },
    {
      title: 'Czytam',
      count: stats?.reading_count || 0,
      icon: Eye,
      color: 'green' as const,
      status: 'reading' as ReadingStatus,
      description: 'Obecnie czytane'
    },
    {
      title: 'Przeczytane',
      count: stats?.finished_count || 0,
      icon: CheckCircle,
      color: 'purple' as const,
      status: 'finished' as ReadingStatus,
      description: 'Ukończone książki'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statsData.map((stat) => (
        <StatCard
          key={stat.status}
          title={stat.title}
          count={stat.count}
          icon={stat.icon}
          color={stat.color}
          description={stat.description}
          isLoading={isLoading}
          onClick={() => onCategoryClick(stat.status)}
        />
      ))}
    </div>
  )
} 