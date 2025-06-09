'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useLibraryContext } from '@/lib/providers/LibraryContext'
import { 
  BookListItemDTO, 
  ReadingStatus, 
  PaginationDTO,
  SortField,
  SortOrder,
  BookQueryParams,
  BookListResponseDTO
} from '@/lib/types'

// Types for the hook
interface LibraryFilters {
  status: ReadingStatus | 'all'
  searchQuery: string
  tags: string[]
  sort: SortField
  order: SortOrder
}

interface LibraryViewState {
  books: BookListItemDTO[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  filters: LibraryFilters
  pagination: PaginationDTO
  hasNextPage: boolean
  selectedBookId: string | null
  bookCounts?: Record<ReadingStatus, number>
}

interface UseLibraryReturn {
  state: LibraryViewState
  actions: {
    setFilters: (filters: Partial<LibraryFilters>) => void
    loadMore: () => Promise<void>
    selectBook: (bookId: string | null) => void
    refetch: () => Promise<void>
  }
}

const defaultPagination: PaginationDTO = {
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 0
}

// API function to fetch books
const fetchBooksAPI = async (params: BookQueryParams): Promise<BookListResponseDTO> => {
  const searchParams = new URLSearchParams()
  
  if (params.status) {
    searchParams.set('status', params.status)
  }
  if (params.search) {
    searchParams.set('search', params.search)
  }
  if (params.tags) {
    searchParams.set('tags', params.tags)
  }
  if (params.page) {
    searchParams.set('page', params.page.toString())
  }
  if (params.limit) {
    searchParams.set('limit', params.limit.toString())
  }
  if (params.sort) {
    searchParams.set('sort', params.sort)
  }
  if (params.order) {
    searchParams.set('order', params.order)
  }

  const url = `/api/books?${searchParams.toString()}`
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Failed to fetch books' } }))
    throw new Error(errorData.error?.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// API function to fetch book counts for each status
const fetchBookCounts = async (): Promise<Record<ReadingStatus, number>> => {
  try {
    // Fetch counts for each status in parallel
    const [wantToReadResponse, readingResponse, finishedResponse] = await Promise.all([
      fetch('/api/books?status=want_to_read&limit=1'),
      fetch('/api/books?status=reading&limit=1'),
      fetch('/api/books?status=finished&limit=1')
    ])

    const [wantToReadData, readingData, finishedData] = await Promise.all([
      wantToReadResponse.json(),
      readingResponse.json(),
      finishedResponse.json()
    ])

    return {
      want_to_read: wantToReadData.pagination?.total || 0,
      reading: readingData.pagination?.total || 0,
      finished: finishedData.pagination?.total || 0
    }
  } catch (error) {
    console.error('Error fetching book counts:', error)
    return {
      want_to_read: 0,
      reading: 0,
      finished: 0
    }
  }
}

export function useLibrary(): UseLibraryReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { setRefetchFunction } = useLibraryContext()
  
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [books, setBooks] = useState<BookListItemDTO[]>([])
  const [pagination, setPagination] = useState<PaginationDTO>(defaultPagination)
  const [bookCounts, setBookCounts] = useState<Record<ReadingStatus, number>>()

  // Initialize filters from URL params
  const [filters, setFiltersState] = useState<LibraryFilters>(() => {
    const status = searchParams.get('status') as ReadingStatus | null
    const search = searchParams.get('search') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const sort = (searchParams.get('sort') as SortField) || 'created_at'
    const order = (searchParams.get('order') as SortOrder) || 'desc'

    return {
      status: status && ['want_to_read', 'reading', 'finished'].includes(status) ? status : 'all',
      searchQuery: search,
      tags,
      sort,
      order
    }
  })

  // Fetch books from API
  const fetchBooks = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      const apiParams: BookQueryParams = {
        page,
        limit: 20,
        sort: filters.sort,
        order: filters.order
      }

      // Add filters to API params
      if (filters.status !== 'all') {
        apiParams.status = filters.status
      }
      if (filters.searchQuery) {
        apiParams.search = filters.searchQuery
      }
      if (filters.tags.length > 0) {
        apiParams.tags = filters.tags.join(',')
      }

      const response = await fetchBooksAPI(apiParams)

      if (append && page > 1) {
        setBooks(prev => [...prev, ...response.data])
      } else {
        setBooks(response.data)
      }
      
      setPagination(response.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching books'
      setError(errorMessage)
      console.error('Error fetching books:', err)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [filters])

  // Fetch book counts for filter tabs
  const loadBookCounts = async () => {
    try {
      const counts = await fetchBookCounts()
      setBookCounts(counts)
    } catch (error) {
      console.error('Error loading book counts:', error)
      // Don't set error state for counts as it's not critical
    }
  }

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.status !== 'all') {
      params.set('status', filters.status)
    }
    if (filters.searchQuery) {
      params.set('search', filters.searchQuery)
    }
    if (filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','))
    }
    if (filters.sort !== 'created_at') {
      params.set('sort', filters.sort)
    }
    if (filters.order !== 'desc') {
      params.set('order', filters.order)
    }

    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newURL, { scroll: false })
  }, [filters, pathname, router])

  // Load initial data when filters change
  useEffect(() => {
    fetchBooks(1, false)
  }, [fetchBooks])

  // Load book counts on mount and when filters change
  useEffect(() => {
    loadBookCounts()
  }, [])

  // Refresh book counts when books are updated
  useEffect(() => {
    if (books.length > 0) {
      loadBookCounts()
    }
  }, [books.length])

  // Actions
  const setFilters = (newFilters: Partial<LibraryFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }

  const loadMore = async () => {
    if (pagination.page < pagination.total_pages && !isLoadingMore && !isLoading) {
      await fetchBooks(pagination.page + 1, true)
    }
  }

  const selectBook = (bookId: string | null) => {
    setSelectedBookId(bookId)
  }

  const refetch = async () => {
    await fetchBooks(1, false)
    await loadBookCounts()
  }

  // Register refetch function in context
  useEffect(() => {
    setRefetchFunction(refetch)
  }, [setRefetchFunction, refetch])

  const state: LibraryViewState = {
    books,
    isLoading,
    isLoadingMore,
    error,
    filters,
    pagination,
    hasNextPage: pagination.page < pagination.total_pages,
    selectedBookId,
    bookCounts
  }

  const actions = {
    setFilters,
    loadMore,
    selectBook,
    refetch
  }

  return { state, actions }
} 