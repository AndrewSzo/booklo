import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export type TypedSupabaseClient = SupabaseClient<Database>

// You can add more custom types here as needed
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Type aliases for database entities (only used ones)
type DBBook = Database['public']['Tables']['books']['Row']
type DBBookUpdate = Database['public']['Tables']['books']['Update']

type DBBookStatus = Database['public']['Tables']['book_statuses']['Row']

type DBRating = Database['public']['Tables']['ratings']['Row']

type DBNote = Database['public']['Tables']['notes']['Row']

type DBTag = Database['public']['Tables']['tags']['Row']

// Common types
export type ReadingStatus = 'want_to_read' | 'reading' | 'finished'

export type SortField = 'title' | 'author' | 'created_at' | 'updated_at' | 'rating'
export type SortOrder = 'asc' | 'desc'

// Pagination DTO
export interface PaginationDTO {
  page: number
  limit: number
  total: number
  total_pages: number
}

// Query Parameters DTOs
export interface BookQueryParams {
  status?: ReadingStatus
  search?: string
  tags?: string
  page?: number
  limit?: number
  sort?: SortField
  order?: SortOrder
}

export interface TagQueryParams {
  search?: string
  limit?: number
}

export interface NotesQueryParams {
  page?: number
  limit?: number
}

// User Status and Rating embedded in Book responses
export interface UserBookStatusDTO {
  status: ReadingStatus
  started_at: string | null
  finished_at: string | null
}

// Books DTOs
export interface BookListItemDTO extends Pick<DBBook, 'id' | 'title' | 'author' | 'isbn' | 'cover_url' | 'description' | 'created_at' | 'updated_at'> {
  category: string | null
  user_status: UserBookStatusDTO | null
  user_rating: number | null
  tags: string[]
  average_rating: number | null
  notes_count: number
}

export interface BookListResponseDTO {
  data: BookListItemDTO[]
  pagination: PaginationDTO
}

export interface CreateBookDTO {
  title: string
  author: string
  isbn?: string
  cover_url?: string
  description?: string
  status?: ReadingStatus
  category?: string
  rating?: number
  tags?: string[]
}

// Simple alias for basic book response
export type BookResponseDTO = Pick<DBBook, 'id' | 'title' | 'author' | 'isbn' | 'cover_url' | 'description' | 'created_at' | 'updated_at'>

export interface CreateBookResponseDTO {
  data: BookResponseDTO
}

export interface BookDetailDTO extends Pick<DBBook, 'id' | 'title' | 'author' | 'isbn' | 'cover_url' | 'description' | 'created_at' | 'updated_at'> {
  category: string | null
  user_status: UserBookStatusDTO | null
  user_rating: number | null
  tags: string[]
  average_rating: number | null
  total_ratings: number
  notes_count: number
}

export interface BookDetailResponseDTO {
  data: BookDetailDTO
}

// Partial type for book updates
export type UpdateBookDTO = Pick<DBBookUpdate, 'title' | 'author' | 'isbn' | 'cover_url' | 'description'> & {
  category?: string | null
}

export interface UpdateBookResponseDTO {
  data: Pick<DBBook, 'id' | 'title' | 'author' | 'isbn' | 'cover_url' | 'description' | 'updated_at'> & {
    category: string | null
  }
}

// Book Status DTOs
export interface UpdateBookStatusDTO {
  status: ReadingStatus
  started_at?: string
  finished_at?: string
}

// Simple alias for book status response
export type BookStatusResponseDTO = Pick<DBBookStatus, 'book_id' | 'user_id' | 'status' | 'started_at' | 'finished_at' | 'updated_at'>

export interface UpdateBookStatusResponseDTO {
  data: BookStatusResponseDTO
}

// Ratings DTOs
export interface CreateRatingDTO {
  rating: number
}

// Simple alias for rating response
export type RatingResponseDTO = Pick<DBRating, 'id' | 'book_id' | 'user_id' | 'rating' | 'created_at' | 'updated_at'>

export interface CreateRatingResponseDTO {
  data: RatingResponseDTO
}

// Notes DTOs
export type NoteItemDTO = Pick<DBNote, 'id' | 'book_id' | 'content' | 'created_at' | 'updated_at'>

export interface NotesListResponseDTO {
  data: NoteItemDTO[]
  pagination: PaginationDTO
}

export interface CreateNoteDTO {
  content: string
}

export type NoteResponseDTO = Pick<DBNote, 'id' | 'book_id' | 'content' | 'created_at' | 'updated_at'>

export interface CreateNoteResponseDTO {
  data: NoteResponseDTO
}

export interface UpdateNoteDTO {
  content: string
}

export interface UpdateNoteResponseDTO {
  data: Pick<DBNote, 'id' | 'content' | 'updated_at'>
}

// Tags DTOs
export interface TagItemDTO extends Pick<DBTag, 'id' | 'name' | 'created_at'> {
  aliases: string[]
  book_count: number
}

export interface TagsListResponseDTO {
  data: TagItemDTO[]
}

export interface CreateTagDTO {
  name: string
  aliases?: string[]
}

export interface TagResponseDTO extends Pick<DBTag, 'id' | 'name' | 'created_at'> {
  aliases: string[]
}

export interface CreateTagResponseDTO {
  data: TagResponseDTO
}

export interface AddTagsToBookDTO {
  tag_names: string[]
}

export interface BookTagsResponseDTO {
  data: {
    book_id: string
    tags: string[]
  }
}

// User Statistics DTOs
export interface UserStatsDTO {
  want_to_read_count: number
  reading_count: number
  finished_count: number
  average_rating: number | null
  total_notes: number
  reading_streak_days: number
}

export interface UserStatsResponseDTO {
  data: UserStatsDTO
}

// User Profile DTOs (not in database schema, but defined in API plan)
export interface UserProfileDTO {
  id: string
  email: string
  full_name: string
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface UserProfileResponseDTO {
  data: UserProfileDTO
}

export interface UpdateUserProfileDTO {
  full_name?: string
  preferences?: Record<string, unknown>
}

export interface UpdateUserProfileResponseDTO {
  data: Pick<UserProfileDTO, 'id' | 'full_name' | 'preferences' | 'updated_at'>
}

// Error Response DTOs
export interface ErrorResponseDTO {
  error: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
}

export interface ValidationErrorResponseDTO {
  error: {
    message: string
    code: 'VALIDATION_ERROR'
    details: {
      field_errors: Record<string, string[]>
    }
  }
}

// API Response wrapper for consistency
export interface ApiResponse<T> {
  data: T
  pagination?: PaginationDTO
}

// Rate limiting headers (for client-side tracking)
export interface RateLimitHeaders {
  'x-ratelimit-limit': string
  'x-ratelimit-remaining': string
  'x-ratelimit-reset': string
}

// Book deletion types (used by DELETE endpoint)
export interface DeleteBookResult {
  success: boolean
  bookId: string
  deletedRelatedData: {
    book_statuses: number
    ratings: number
    notes: number
    book_tags: number
  }
}

export interface BookDeletionAuditLog {
  book_id: string
  book_title: string
  book_author: string
  deleted_by: string
  deleted_at: string
  related_data_count: {
    book_statuses: number
    ratings: number
    notes: number
    book_tags: number
  }
} 