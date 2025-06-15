import { useQuery } from '@tanstack/react-query'
import { UserStatsDTO, BookListItemDTO, BookListResponseDTO } from '@/lib/types'

interface DashboardViewModel {
  stats: UserStatsDTO | null
  recentBooks: BookListItemDTO[]
  currentlyReading: BookListItemDTO[]
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

// API call to fetch user statistics - calculate from book counts
const fetchUserStats = async (): Promise<UserStatsDTO> => {
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
      want_to_read_count: wantToReadData.pagination?.total || 0,
      reading_count: readingData.pagination?.total || 0,
      finished_count: finishedData.pagination?.total || 0,
      average_rating: null, // TODO: Calculate from ratings
      total_notes: 0, // TODO: Calculate from notes
      reading_streak_days: 0 // TODO: Calculate from reading history
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      want_to_read_count: 0,
      reading_count: 0,
      finished_count: 0,
      average_rating: null,
      total_notes: 0,
      reading_streak_days: 0
    }
  }
}

// API call to fetch recent books (last 5 books added/updated)
const fetchRecentBooks = async (): Promise<BookListItemDTO[]> => {
  const response = await fetch('/api/books?limit=5&sort=updated_at&order=desc')
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Failed to fetch recent books' } }))
    throw new Error(errorData.error?.message || `HTTP ${response.status}`)
  }

  const data: BookListResponseDTO = await response.json()
  return data.data
}

// API call to fetch currently reading books
const fetchCurrentlyReading = async (): Promise<BookListItemDTO[]> => {
  const response = await fetch('/api/books?status=reading&limit=10&sort=updated_at&order=desc')
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Failed to fetch currently reading books' } }))
    throw new Error(errorData.error?.message || `HTTP ${response.status}`)
  }

  const data: BookListResponseDTO = await response.json()
  console.log('Dashboard: Currently reading books fetched:', data.data.length, data.data)
  return data.data
}

export function useDashboardData() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchUserStats,
  })

  const {
    data: recentBooks = [],
    isLoading: recentBooksLoading,
    error: recentBooksError,
    refetch: refetchRecentBooks
  } = useQuery({
    queryKey: ['recent-books'],
    queryFn: fetchRecentBooks,
  })

  const {
    data: currentlyReading = [],
    isLoading: currentlyReadingLoading,
    error: currentlyReadingError,
    refetch: refetchCurrentlyReading
  } = useQuery({
    queryKey: ['currently-reading'],
    queryFn: fetchCurrentlyReading,
  })

  const isLoading = statsLoading || recentBooksLoading || currentlyReadingLoading
  const error = statsError || recentBooksError || currentlyReadingError

  const refreshData = async () => {
    await Promise.all([
      refetchStats(),
      refetchRecentBooks(),
      refetchCurrentlyReading()
    ])
  }

  const dashboardData: DashboardViewModel = {
    stats: stats || null,
    recentBooks,
    currentlyReading,
    isLoading,
    error: error ? 'Wystąpił błąd podczas ładowania danych' : null,
    refreshData
  }

  return { dashboardData }
} 