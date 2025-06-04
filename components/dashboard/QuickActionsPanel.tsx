'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Bookmark, TrendingUp } from 'lucide-react'

interface QuickActionProps {
  id: string
  label: string
  icon: string
  variant: 'primary' | 'secondary'
  disabled?: boolean
}

interface QuickActionsPanelProps {
  actions: QuickActionProps[]
  onActionClick: (actionId: string) => void
}

const iconMap: Record<string, ReactNode> = {
  'Plus': <Plus className="h-4 w-4" />,
  'Search': <Search className="h-4 w-4" />,
  'Bookmark': <Bookmark className="h-4 w-4" />,
  'TrendingUp': <TrendingUp className="h-4 w-4" />
}

export default function QuickActionsPanel({ actions, onActionClick }: QuickActionsPanelProps) {
  const handleClick = (actionId: string) => {
    onActionClick(actionId)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant === 'primary' ? 'default' : 'outline'}
            className="h-auto p-4 flex flex-col items-center gap-2 text-center"
            onClick={() => handleClick(action.id)}
            disabled={action.disabled}
          >
            <div className="text-lg">
              {iconMap[action.icon] || iconMap['Plus']}
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
        
        {/* Additional quick actions */}
        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2 text-center"
          onClick={() => handleClick('shortlist')}
        >
          <Bookmark className="h-4 w-4" />
          <span className="text-sm font-medium">Shortlist</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2 text-center"
          onClick={() => handleClick('stats')}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">Stats</span>
        </Button>
      </div>
      
      {/* Pro tip */}
      <div className="bg-muted/50 rounded-lg p-4 border border-muted">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Pro tip:</strong> Use keyboard shortcuts: 
          <kbd className="mx-1 px-2 py-1 bg-background rounded text-xs">Ctrl+N</kbd> to add a book, 
          <kbd className="mx-1 px-2 py-1 bg-background rounded text-xs">Ctrl+K</kbd> to search
        </p>
      </div>
    </div>
  )
} 