'use client'

import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { useBookDetailsContext } from '@/lib/providers/BookDetailsContext'
import { useLibraryContext } from '@/lib/providers/LibraryContext'
import type { BookDetailsSidebarProps } from './types'
import type { BookDetailDTO, ReadingStatus } from '@/lib/types'
import { SidebarHeader } from './SidebarHeader'
import { BookInfoSection } from './BookInfoSection'
import { NotesSection } from './NotesSection'
import { AIChatSection } from './AIChatSection'

// API function for fetching book details
async function fetchBookDetails(bookId: string): Promise<{ data: BookDetailDTO }> {
  const response = await fetch(`/api/books/${bookId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch book details')
  }
  return response.json()
}

export function BookDetailsSidebar({ 
  bookId, 
  isOpen, 
  onClose, 
  className 
}: BookDetailsSidebarProps) {
  const { activeTab, setActiveTab, closeSidebar } = useBookDetailsContext()
  const { refetchLibrary } = useLibraryContext()
  const queryClient = useQueryClient()

  // Fetch book details when bookId changes
  const {
    data: bookResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['books', bookId],
    queryFn: () => fetchBookDetails(bookId!),
    enabled: !!bookId && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const book = bookResponse?.data

  // Handle book update - refresh the cache
  const handleBookUpdate = (updatedBook: Partial<BookDetailDTO>) => {
    if (!bookId) return
    
    queryClient.setQueryData(['books', bookId], (oldData: { data: BookDetailDTO } | undefined) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        data: { ...oldData.data, ...updatedBook }
      }
    })
    
    // Refresh library using LibraryContext
    refetchLibrary()
  }

  // Handle book delete - close sidebar and refresh library
  const handleBookDelete = async (deletedBookId: string) => {
    // Close sidebar
    closeSidebar()
    
    // Remove from cache
    queryClient.removeQueries({ queryKey: ['books', deletedBookId] })
    
    // Refresh library using LibraryContext instead of React Query invalidation
    await refetchLibrary()
  }

  // Handle status change
  const handleStatusChange = async (status: ReadingStatus) => {
    if (!bookId) return
    
    try {
      console.log('Updating book status:', { bookId, status })
      
      const requestBody = { 
        status,
        ...(status === 'reading' && { started_at: new Date().toISOString() }),
        ...(status === 'finished' && { finished_at: new Date().toISOString() })
      }
      
      console.log('Request body:', requestBody)
      
      const response = await fetch(`/api/books/${bookId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        console.error('API Error:', errorData)
        throw new Error(`Failed to update status: ${errorData.error?.message || response.statusText}`)
      }
      
      const responseData = await response.json()
      console.log('Success response:', responseData)
      
      // Refresh book data
      queryClient.invalidateQueries({ queryKey: ['books', bookId] })
      queryClient.invalidateQueries({ queryKey: ['library'] })
    } catch (error) {
      console.error('Failed to update status:', error)
      // Show user-friendly error message
      alert(`Failed to update reading status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle rating change
  const handleRatingChange = async (rating: number) => {
    if (!bookId) return
    
    try {
      const response = await fetch(`/api/books/${bookId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })
      
      if (!response.ok) throw new Error('Failed to update rating')
      
      // Refresh book data
      queryClient.invalidateQueries({ queryKey: ['books', bookId] })
      queryClient.invalidateQueries({ queryKey: ['library'] })
    } catch (error) {
      console.error('Failed to update rating:', error)
    }
  }

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    // Removed body overflow modification as it may interfere with sidebar scrolling
    // if (isOpen) {
    //   document.body.style.overflow = 'hidden'
    //   return () => {
    //     document.body.style.overflow = 'unset'
    //   }
    // }
  }, [isOpen])

  // Don't render if not open or no book selected
  if (!isOpen || !bookId) {
    return null
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 lg:hidden',
          isOpen ? 'block' : 'hidden'
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-[4rem] z-50 h-[calc(100vh-4rem)] w-full max-w-4xl transform bg-white shadow-xl transition-transform duration-300 ease-in-out',
          'lg:relative lg:z-auto lg:w-[576px] lg:shadow-none lg:transform-none lg:top-0 lg:h-full',
          'border-l border-border',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
          className
        )}
        role="complementary"
        aria-label="Book details sidebar"
      >
        <div className="flex h-full flex-col bg-card">
          {/* Header with tabs and close button */}
          <SidebarHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onClose={onClose}
          />

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}

            {error && (
              <div className="p-6 text-center">
                <p className="text-red-600 mb-4">Failed to load book details</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            )}

            {book && (
              <>
                {activeTab === 'info' && (
                  <BookInfoSection
                    book={book}
                    onStatusChange={handleStatusChange}
                    onRatingChange={handleRatingChange}
                    onBookUpdate={handleBookUpdate}
                    onBookDelete={handleBookDelete}
                  />
                )}

                {activeTab === 'notes' && (
                  <NotesSection bookId={bookId} />
                )}

                {activeTab === 'ai-chat' && (
                  <AIChatSection
                    bookId={bookId}
                    messages={[]}
                    isLoading={false}
                    onSendMessage={(content: string) => {
                      console.log('Send message:', content)
                    }}
                    book={book ? {
                      title: book.title,
                      author: book.author,
                      description: book.description || undefined
                    } : undefined}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  )
} 