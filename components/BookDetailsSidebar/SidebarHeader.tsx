'use client'

import React from 'react'
import { X, Info, FileText, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SidebarHeaderProps, TabType } from './types'

const tabsConfig: Array<{
  id: TabType
  label: string
  icon: React.ReactNode
}> = [
  {
    id: 'info',
    label: 'Info',
    icon: <Info className="h-4 w-4" />
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: <FileText className="h-4 w-4" />
  },
  {
    id: 'ai-chat',
    label: 'AI Chat',
    icon: <MessageCircle className="h-4 w-4" />
  }
]

export function SidebarHeader({ activeTab, onTabChange, onClose }: SidebarHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold text-foreground">Book Details</h2>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Tab Navigation */}
      <nav className="px-4 pb-4" role="tablist">
        <div className="flex space-x-1 rounded-lg bg-muted p-1">
          {tabsConfig.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
} 