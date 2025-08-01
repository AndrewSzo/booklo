'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface RightSidebarProps {
  isOpen: boolean
  onToggle: () => void
  content?: ReactNode
}

export default function RightSidebar({ isOpen, onToggle, content }: RightSidebarProps) {
  if (!isOpen) {
    return (
      <div className="hidden md:flex md:w-12 border-l border-border bg-card items-start p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <aside className="h-full bg-card border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Details</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {content || (
          <div className="p-6 text-center text-muted-foreground">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-90">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                  <path d="M8 7h8"/>
                  <path d="M8 11h8"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-2">No item selected</h3>
                <p className="text-sm">Select a book to view details</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
} 