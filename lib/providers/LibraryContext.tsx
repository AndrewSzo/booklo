'use client'

import React, { createContext, useContext, useCallback } from 'react'

interface LibraryContextType {
  refetchLibrary: () => Promise<void>
  setRefetchFunction: (refetchFn: () => Promise<void>) => void
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function useLibraryContext() {
  const context = useContext(LibraryContext)
  if (context === undefined) {
    throw new Error('useLibraryContext must be used within a LibraryProvider')
  }
  return context
}

interface LibraryProviderProps {
  children: React.ReactNode
}

export function LibraryProvider({ children }: LibraryProviderProps) {
  let refetchFunction: (() => Promise<void>) | null = null

  const setRefetchFunction = useCallback((refetchFn: () => Promise<void>) => {
    refetchFunction = refetchFn
  }, [])

  const refetchLibrary = useCallback(async () => {
    if (refetchFunction) {
      await refetchFunction()
      console.log('Library data refreshed')
    } else {
      console.warn('Library refetch function not set')
    }
  }, [])

  const value: LibraryContextType = {
    refetchLibrary,
    setRefetchFunction,
  }

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  )
} 