'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { TabType } from '@/components/BookDetailsSidebar/types'

interface BookDetailsContextType {
  selectedBookId: string | null
  sidebarOpen: boolean
  activeTab: TabType
  setSelectedBook: (bookId: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: TabType) => void
  openSidebar: (bookId: string, tab?: TabType) => void
  closeSidebar: () => void
}

const BookDetailsContext = createContext<BookDetailsContextType | undefined>(undefined)

export function useBookDetailsContext() {
  const context = useContext(BookDetailsContext)
  if (context === undefined) {
    throw new Error('useBookDetailsContext must be used within a BookDetailsProvider')
  }
  return context
}

interface BookDetailsProviderProps {
  children: React.ReactNode
}

export function BookDetailsProvider({ children }: BookDetailsProviderProps) {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('info')

  const setSelectedBook = useCallback((bookId: string | null) => {
    setSelectedBookId(bookId)
    if (bookId === null) {
      setSidebarOpen(false)
    }
  }, [])

  const openSidebar = useCallback((bookId: string, tab: TabType = 'info') => {
    setSelectedBookId(bookId)
    setActiveTab(tab)
    setSidebarOpen(true)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
    // Zachowujemy selectedBookId na wypadek ponownego otwarcia
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  const value: BookDetailsContextType = {
    selectedBookId,
    sidebarOpen,
    activeTab,
    setSelectedBook,
    setSidebarOpen,
    setActiveTab,
    openSidebar,
    closeSidebar,
  }

  return (
    <BookDetailsContext.Provider value={value}>
      {children}
    </BookDetailsContext.Provider>
  )
} 