'use client'

import { 
  Brain, 
  Rocket, 
  Sword, 
  Users, 
  Heart, 
  Zap, 
  BookOpen,
  Briefcase,
  Globe,
  Clock,
  Lightbulb,
  Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookCategory {
  id: string
  label: string
  icon: typeof Brain
  slug: string
  color: string
  description: string
}

interface BookCategoriesProps {
  onCategoryClick?: (categorySlug: string) => void
}

export default function BookCategories({ onCategoryClick }: BookCategoriesProps) {
  const categories: BookCategory[] = [
    {
      id: 'personal-development',
      label: 'Rozwój osobisty',
      icon: Brain,
      slug: 'rozwoj-osobisty',
      color: 'emerald',
      description: 'Samodoskonalenie i rozwój'
    },
    {
      id: 'sci-fi',
      label: 'Science Fiction',
      icon: Rocket,
      slug: 'sci-fi',
      color: 'blue',
      description: 'Fantastyka naukowa'
    },
    {
      id: 'fantasy',
      label: 'Fantasy',
      icon: Sword,
      slug: 'fantasy',
      color: 'purple',
      description: 'Literatura fantastyczna'
    },
    {
      id: 'crime',
      label: 'Kryminał',
      icon: Zap,
      slug: 'kryminal',
      color: 'red',
      description: 'Powieści kryminalne'
    },
    {
      id: 'romance',
      label: 'Romans',
      icon: Heart,
      slug: 'romans',
      color: 'pink',
      description: 'Literatura romantyczna'
    },
    {
      id: 'biography',
      label: 'Biografie',
      icon: Users,
      slug: 'biografie',
      color: 'amber',
      description: 'Życiorysy i wspomnienia'
    },
    {
      id: 'business',
      label: 'Biznes',
      icon: Briefcase,
      slug: 'biznes',
      color: 'gray',
      description: 'Ekonomia i zarządzanie'
    },
    {
      id: 'history',
      label: 'Historia',
      icon: Globe,
      slug: 'historia',
      color: 'orange',
      description: 'Książki historyczne'
    },
    {
      id: 'classics',
      label: 'Klasyka',
      icon: BookOpen,
      slug: 'klasyka',
      color: 'indigo',
      description: 'Literatura klasyczna'
    },
    {
      id: 'thriller',
      label: 'Thriller',
      icon: Clock,
      slug: 'thriller',
      color: 'slate',
      description: 'Sensacyjne i napięte'
    },
    {
      id: 'psychology',
      label: 'Psychologia',
      icon: Lightbulb,
      slug: 'psychologia',
      color: 'teal',
      description: 'Psychologia i umysł'
    },
    {
      id: 'sports',
      label: 'Sport',
      icon: Trophy,
      slug: 'sport',
      color: 'green',
      description: 'Literatura sportowa'
    }
  ]

  const handleCategoryClick = (categorySlug: string) => {
    if (onCategoryClick) {
      onCategoryClick(categorySlug)
    } else {
      // Domyślnie nawiguj do biblioteki z filtrem kategorii
      window.location.href = `/library?category=${categorySlug}`
    }
  }

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      emerald: 'text-emerald-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      red: 'text-red-600',
      pink: 'text-pink-600',
      amber: 'text-amber-600',
      gray: 'text-gray-600',
      orange: 'text-orange-600',
      indigo: 'text-indigo-600',
      slate: 'text-slate-600',
      teal: 'text-teal-600',
      green: 'text-green-600'
    }
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600'
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const Icon = category.icon
        
        return (
          <Button
            key={category.id}
            variant="ghost"
            className="w-full justify-start h-9 rounded-lg transition-all duration-200 group text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            onClick={() => handleCategoryClick(category.slug)}
            title={category.description}
          >
            <div className="flex items-center gap-3 w-full">
              <Icon className={`h-4 w-4 flex-shrink-0 ${getIconColorClasses(category.color)}`} />
              <span className="text-sm font-medium truncate">{category.label}</span>
            </div>
          </Button>
        )
      })}
    </div>
  )
} 