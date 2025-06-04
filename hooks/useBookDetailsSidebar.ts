'use client'

import { useEffect } from 'react'
import { useBookDetailsContext } from '@/lib/providers/BookDetailsContext'
import type { TabType } from '@/components/BookDetailsSidebar/types'

interface UseBookDetailsSidebarReturn {
  selectedBookId: string | null
  isOpen: boolean
  activeTab: TabType
  openSidebar: (bookId: string, tab?: TabType) => void
  closeSidebar: () => void
  setActiveTab: (tab: TabType) => void
}

export function useBookDetailsSidebar(): UseBookDetailsSidebarReturn {
  const {
    selectedBookId,
    sidebarOpen,
    activeTab,
    openSidebar,
    closeSidebar,
    setActiveTab,
  } = useBookDetailsContext()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!sidebarOpen) return

      switch (event.key) {
        case 'Escape':
          closeSidebar()
          break
        case '1':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setActiveTab('info')
          }
          break
        case '2':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setActiveTab('notes')
          }
          break
        case '3':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setActiveTab('ai-chat')
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar, setActiveTab])

  // Responsive behavior - close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      // Auto-close on mobile when orientation changes
      if (window.innerWidth < 1024 && sidebarOpen) {
        // Don't auto-close, let user decide
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen])

  return {
    selectedBookId,
    isOpen: sidebarOpen,
    activeTab,
    openSidebar,
    closeSidebar,
    setActiveTab,
  }
} 