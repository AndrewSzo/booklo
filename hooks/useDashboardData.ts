import { useQuery } from '@tanstack/react-query'
import { UserStatsDTO, BookListItemDTO } from '@/lib/types'

interface DashboardViewModel {
  stats: UserStatsDTO | null
  recentBooks: BookListItemDTO[]
  currentlyReading: BookListItemDTO[]
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

// Mock API calls - te będą zastąpione prawdziwymi implementacjami
const fetchUserStats = async (): Promise<UserStatsDTO> => {
  // Temporary mock data
  return {
    want_to_read_count: 25,
    reading_count: 3,
    finished_count: 42,
    average_rating: 4.2,
    total_notes: 35,
    reading_streak_days: 15
  }
}

const fetchRecentBooks = async (): Promise<BookListItemDTO[]> => {
  // Temporary mock data
  return []
}

const fetchCurrentlyReading = async (): Promise<BookListItemDTO[]> => {
  // Temporary mock data
  return []
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