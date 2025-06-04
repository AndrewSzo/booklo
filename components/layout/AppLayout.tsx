'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { BookDetailsSidebar } from '@/components/BookDetailsSidebar'
import { useBookDetailsContext } from '@/lib/providers/BookDetailsContext'
import LeftSidebar from '@/components/dashboard/LeftSidebar'

interface AppLayoutProps {
  children: React.ReactNode
  leftSidebarOpen?: boolean
  rightSidebarOpen?: boolean
}

export function AppLayout({ 
  children, 
  leftSidebarOpen, 
  rightSidebarOpen 
}: AppLayoutProps) {
  const pathname = usePathname()
  const { selectedBookId, sidebarOpen, closeSidebar } = useBookDetailsContext()
  const { layoutState, toggleLeftSidebar } = useResponsiveLayout({
    leftSidebarOpen,
    rightSidebarOpen
  })

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Left Sidebar - Navigation */}
      <div 
        className={`
          ${layoutState.screenSize === 'mobile' ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${layoutState.leftSidebarOpen ? 'w-[280px]' : 'w-0'}
          transition-all duration-300 ease-in-out
          bg-white/80 backdrop-blur-sm
          ${layoutState.leftSidebarOpen ? 'border-r border-emerald-100 shadow-lg' : ''}
          overflow-hidden
        `}
      >
        <LeftSidebar 
          isOpen={layoutState.leftSidebarOpen}
          onToggle={toggleLeftSidebar}
          currentPath={pathname}
        />
      </div>

      {/* Mobile overlay for left sidebar */}
      {layoutState.screenSize === 'mobile' && layoutState.leftSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={toggleLeftSidebar}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 h-full">
        {/* Main Content */}
        <main className="flex-1 min-w-0 h-full overflow-hidden bg-white/50 backdrop-blur-sm">
          {children}
        </main>

        {/* Right Sidebar - Book Details */}
        <BookDetailsSidebar
          bookId={selectedBookId}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
      </div>
    </div>
  )
} 