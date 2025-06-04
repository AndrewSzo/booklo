'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

interface DashboardLayoutProps {
  children: ReactNode
  leftSidebarOpen?: boolean
  rightSidebarOpen?: boolean
}

export default function DashboardLayout({ 
  children, 
  leftSidebarOpen, 
  rightSidebarOpen 
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const { layoutState, toggleLeftSidebar, toggleRightSidebar } = useResponsiveLayout({
    leftSidebarOpen,
    rightSidebarOpen
  })

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div 
        className={`
          ${layoutState.screenSize === 'mobile' ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${layoutState.leftSidebarOpen ? 'w-[300px]' : 'w-0'}
          transition-all duration-300 ease-in-out
          border-r border-border bg-card
        `}
      >
        <LeftSidebar 
          isOpen={layoutState.leftSidebarOpen}
          onToggle={toggleLeftSidebar}
          currentPath={pathname}
        />
      </div>

      {/* Mobile overlay */}
      {layoutState.screenSize === 'mobile' && layoutState.leftSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleLeftSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>

      {/* Right Sidebar */}
      <div 
        className={`
          ${layoutState.screenSize === 'mobile' ? 'hidden' : 'relative'}
          ${layoutState.rightSidebarOpen ? 'w-[700px]' : 'w-0'}
          transition-all duration-300 ease-in-out
          border-l border-border bg-card
        `}
      >
        <RightSidebar 
          isOpen={layoutState.rightSidebarOpen}
          onToggle={toggleRightSidebar}
        />
      </div>
    </div>
  )
} 