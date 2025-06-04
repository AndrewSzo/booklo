import { createClient } from '@/lib/supabase/server'
import type { 
  BookResponseDTO,
  BookStatusResponseDTO,
  RatingResponseDTO,
  ReadingStatus,
  BookQueryParams,
  BookListItemDTO,
  BookListResponseDTO,
  PaginationDTO,
  UpdateBookDTO,
  BookDetailDTO,
  DeleteBookResult,
  BookDeletionAuditLog
} from '@/lib/types'
import type { Database } from '@/lib/database.types'
import type { CreateBookInput } from '@/lib/validations/book.schema'
import { TagService } from './tag.service'
import { AuditService } from './audit.service'
import { CacheService } from './cache.service'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export interface BookCreationResult {
  book: BookResponseDTO
  status?: BookStatusResponseDTO
  rating?: RatingResponseDTO
  tags?: string[]
}

export interface DuplicateCheckResult {
  exists: boolean
  bookId?: string
}

export interface BookServiceError extends Error {
  status: number
  code: string
  details?: Record<string, unknown>
}

/**
 * Service class for handling book-related operations
 */
export class BookService {
  private supabase: SupabaseClient
  private tagService: TagService
  private auditService: AuditService
  private cacheService: CacheService

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.tagService = new TagService(supabase)
    this.auditService = new AuditService(supabase)
    this.cacheService = new CacheService(supabase)
  }

  /**
   * Check if a book with the same title and author already exists
   */
  async checkForDuplicate(title: string, author: string, userId: string): Promise<DuplicateCheckResult> {
    try {
      const { data, error } = await this.supabase
        .from('books')
        .select('id')
        .eq('title', title.trim())
        .eq('author', author.trim())
        .eq('created_by', userId)
        .maybeSingle()

      if (error) {
        console.error('Error checking for duplicate book:', error)
        throw new Error('Failed to check for duplicate book')
      }

      return {
        exists: !!data,
        bookId: data?.id
      }
    } catch (error) {
      console.error('Unexpected error in duplicate check:', error)
      throw error
    }
  }

  /**
   * Create a new book in the database
   */
  async createBook(bookData: CreateBookInput, userId: string): Promise<BookResponseDTO> {
    try {
      const bookInsert: Database['public']['Tables']['books']['Insert'] = {
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        isbn: bookData.isbn?.trim() || null,
        cover_url: bookData.cover_url?.trim() || null,
        description: bookData.description?.trim() || null,
        created_by: userId
      }

      const { data, error } = await this.supabase
        .from('books')
        .insert(bookInsert)
        .select('id, title, author, isbn, cover_url, description, created_at, updated_at')
        .single()

      if (error) {
        console.error('Error creating book:', error)
        throw new Error('Failed to create book')
      }

      return data
    } catch (error) {
      console.error('Unexpected error creating book:', error)
      throw error
    }
  }

  /**
   * Create a book status for the user
   */
  async createBookStatus(
    bookId: string, 
    userId: string, 
    status: ReadingStatus
  ): Promise<BookStatusResponseDTO> {
    try {
      const now = new Date().toISOString()
      
      const statusInsert: Database['public']['Tables']['book_statuses']['Insert'] = {
        book_id: bookId,
        user_id: userId,
        status,
        started_at: status === 'reading' ? now : null,
        finished_at: status === 'finished' ? now : null
      }

      const { data, error } = await this.supabase
        .from('book_statuses')
        .insert(statusInsert)
        .select('book_id, user_id, status, started_at, finished_at, updated_at')
        .single()

      if (error) {
        console.error('Error creating book status:', error)
        throw new Error('Failed to create book status')
      }

      return data
    } catch (error) {
      console.error('Unexpected error creating book status:', error)
      throw error
    }
  }

  /**
   * Create a rating for the book
   */
  async createRating(
    bookId: string, 
    userId: string, 
    rating: number
  ): Promise<RatingResponseDTO> {
    try {
      const ratingInsert: Database['public']['Tables']['ratings']['Insert'] = {
        book_id: bookId,
        user_id: userId,
        rating
      }

      const { data, error } = await this.supabase
        .from('ratings')
        .insert(ratingInsert)
        .select('id, book_id, user_id, rating, created_at, updated_at')
        .single()

      if (error) {
        console.error('Error creating rating:', error)
        throw new Error('Failed to create rating')
      }

      return data
    } catch (error) {
      console.error('Unexpected error creating rating:', error)
      throw error
    }
  }

  /**
   * Main method to create a book with all related data in a transaction
   */
  async createBookWithRelatedData(
    bookData: CreateBookInput, 
    userId: string
  ): Promise<BookCreationResult> {
    try {
      // Start transaction by checking for duplicates first
      const duplicateCheck = await this.checkForDuplicate(bookData.title, bookData.author, userId)
      
      if (duplicateCheck.exists) {
        const error = new Error('Book with this title and author already exists') as BookServiceError
        error.status = 409
        error.code = 'DUPLICATE_BOOK'
        error.details = { book_id: duplicateCheck.bookId }
        throw error
      }

      // Create the book
      const book = await this.createBook(bookData, userId)

      const result: BookCreationResult = { book }

      // Create book status if provided
      if (bookData.status) {
        result.status = await this.createBookStatus(book.id, userId, bookData.status)
      }

      // Create rating if provided
      if (bookData.rating !== undefined) {
        result.rating = await this.createRating(book.id, userId, bookData.rating)
      }

      // Handle tags if provided
      if (bookData.tags && bookData.tags.length > 0) {
        const tagResult = await this.tagService.processTagsForBook(book.id, bookData.tags)
        result.tags = tagResult.tag_names
      } else {
        result.tags = []
      }

      return result
    } catch (error) {
      console.error('Error in createBookWithRelatedData:', error)
      throw error
    }
  }

  /**
   * Get books for a user with filtering, sorting, and pagination
   */
  async getBooks(params: BookQueryParams, userId: string): Promise<BookListResponseDTO> {
    try {
      // Set default values for required parameters
      const page = params.page || 1
      const limit = params.limit || 20
      const sort = params.sort || 'created_at'
      const order = params.order || 'desc'

      // Build base query for books with user's reading status
      let baseQuery = this.supabase
        .from('books')
        .select(`
          id,
          title,
          author,
          isbn,
          cover_url,
          description,
          created_at,
          updated_at
        `)

      // Join with book_statuses to filter by user's books
      let statusQuery = this.supabase
        .from('book_statuses')
        .select('book_id')
        .eq('user_id', userId)

      // Apply status filter to the status query
      if (params.status) {
        statusQuery = statusQuery.eq('status', params.status)
      }

      const { data: userBookIds, error: statusError } = await statusQuery

      if (statusError) {
        console.error('Error fetching user book statuses:', statusError)
        throw new Error('Failed to fetch user book statuses')
      }

      if (!userBookIds || userBookIds.length === 0) {
        // User has no books with the given criteria
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            total_pages: 0
          }
        }
      }

      const bookIds = userBookIds.map(item => item.book_id)
      baseQuery = baseQuery.in('id', bookIds)

      // Apply search filter
      if (params.search) {
        baseQuery = baseQuery.or(`title.ilike.%${params.search}%,author.ilike.%${params.search}%`)
      }

      // Apply tags filter
      if (params.tags) {
        const tagNames = params.tags.split(',').map(tag => tag.trim())
        
        // Get books that have any of the specified tags
        const { data: taggedBooks, error: tagError } = await this.supabase
          .from('book_tags')
          .select(`
            book_id,
            tags!inner (
              name
            )
          `)
          .in('tags.name', tagNames)

        if (tagError) {
          console.error('Error fetching tagged books:', tagError)
          throw new Error('Failed to fetch tagged books')
        }

        if (!taggedBooks || taggedBooks.length === 0) {
          // No books with specified tags
          return {
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              total_pages: 0
            }
          }
        }

        const taggedBookIds = taggedBooks.map(item => item.book_id)
        // Filter to books that are both in user's list and have the tags
        const filteredBookIds = bookIds.filter(id => taggedBookIds.includes(id))
        
        if (filteredBookIds.length === 0) {
          return {
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              total_pages: 0
            }
          }
        }

        baseQuery = baseQuery.in('id', filteredBookIds)
      }

      // Get total count for pagination before applying limit/offset
      const countQuery = this.supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .in('id', bookIds)

      // Apply same filters to count query
      if (params.search) {
        countQuery.or(`title.ilike.%${params.search}%,author.ilike.%${params.search}%`)
      }

      if (params.tags) {
        const tagNames = params.tags.split(',').map(tag => tag.trim())
        const { data: taggedBooks } = await this.supabase
          .from('book_tags')
          .select(`book_id, tags!inner (name)`)
          .in('tags.name', tagNames)
        
        if (taggedBooks && taggedBooks.length > 0) {
          const taggedBookIds = taggedBooks.map(item => item.book_id)
          const filteredBookIds = bookIds.filter(id => taggedBookIds.includes(id))
          countQuery.in('id', filteredBookIds)
        }
      }

      const { count } = await countQuery

      // Apply sorting
      if (sort === 'rating') {
        // For rating sort, we need to join with ratings and sort by user's rating
        baseQuery = baseQuery.order('created_at', { ascending: order === 'asc' })
      } else {
        baseQuery = baseQuery.order(sort, { ascending: order === 'asc' })
      }

      // Apply pagination
      const offset = (page - 1) * limit
      baseQuery = baseQuery.range(offset, offset + limit - 1)

      const { data: books, error: booksError } = await baseQuery

      if (booksError) {
        console.error('Error fetching books:', booksError)
        throw new Error('Failed to fetch books')
      }

      if (!books || books.length === 0) {
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit)
          }
        }
      }

      // Fetch additional data for each book
      const bookResults = await Promise.all(
        books.map(async (book) => {
          // Get user's status for this book
          const { data: userStatus } = await this.supabase
            .from('book_statuses')
            .select('status, started_at, finished_at')
            .eq('book_id', book.id)
            .eq('user_id', userId)
            .maybeSingle()

          // Get user's rating for this book
          const { data: userRating } = await this.supabase
            .from('ratings')
            .select('rating')
            .eq('book_id', book.id)
            .eq('user_id', userId)
            .maybeSingle()

          // Get average rating from book_popularity_stats view
          const { data: popularityStats } = await this.supabase
            .from('book_popularity_stats')
            .select('average_rating, notes_count')
            .eq('book_id', book.id)
            .maybeSingle()

          // Get tags for this book
          const { data: bookTagsData } = await this.supabase
            .from('book_tags')
            .select('tag_id')
            .eq('book_id', book.id)

          // Get tag names separately 
          let tags: string[] = []
          if (bookTagsData && bookTagsData.length > 0) {
            const tagIds = bookTagsData.map(bt => bt.tag_id)
            const { data: tagsData } = await this.supabase
              .from('tags')
              .select('name')
              .in('id', tagIds)
            
            tags = tagsData?.map(tag => tag.name) || []
          }

          return {
            id: book.id,
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            cover_url: book.cover_url,
            description: book.description,
            created_at: book.created_at,
            updated_at: book.updated_at,
            user_status: userStatus ? {
              status: userStatus.status as ReadingStatus,
              started_at: userStatus.started_at,
              finished_at: userStatus.finished_at
            } : null,
            user_rating: userRating?.rating || null,
            tags: tags,
            average_rating: popularityStats?.average_rating || null,
            notes_count: popularityStats?.notes_count || 0
          } as BookListItemDTO
        })
      )

      // Apply rating sort if needed (after fetching user ratings)
      const finalResults = sort === 'rating' 
        ? bookResults.sort((a, b) => {
            const ratingA = a.user_rating || 0
            const ratingB = b.user_rating || 0
            return order === 'asc' ? ratingA - ratingB : ratingB - ratingA
          })
        : bookResults

      const pagination: PaginationDTO = {
        page: page,
        limit: limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }

      return {
        data: finalResults,
        pagination
      }

    } catch (error) {
      console.error('Error in getBooks:', error)
      throw error
    }
  }

  /**
   * Get detailed information about a specific book
   * Includes user status, user rating, tags, average rating, total ratings count, and notes count
   */
  async getBookDetail(bookId: string, userId: string): Promise<BookDetailDTO> {
    try {
      // Step 1: Get basic book information
      const { data: book, error: bookError } = await this.supabase
        .from('books')
        .select('id, title, author, isbn, cover_url, description, created_at, updated_at')
        .eq('id', bookId)
        .maybeSingle()

      if (bookError) {
        console.error('Error fetching book:', bookError)
        throw new Error('Failed to fetch book')
      }

      if (!book) {
        const error = new Error('Book not found') as BookServiceError
        error.status = 404
        error.code = 'BOOK_NOT_FOUND'
        throw error
      }

      // Step 2: Get user's status for this book
      const { data: userStatus } = await this.supabase
        .from('book_statuses')
        .select('status, started_at, finished_at')
        .eq('book_id', bookId)
        .eq('user_id', userId)
        .maybeSingle()

      // Step 3: Get user's rating for this book
      const { data: userRating } = await this.supabase
        .from('ratings')
        .select('rating')
        .eq('book_id', bookId)
        .eq('user_id', userId)
        .maybeSingle()

      // Step 4: Get average rating and total ratings count
      const { data: ratingStats } = await this.supabase
        .from('ratings')
        .select('rating')
        .eq('book_id', bookId)

      const totalRatings = ratingStats?.length || 0
      const averageRating = totalRatings > 0 
        ? ratingStats!.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : null

      // Step 5: Get user's notes count for this book
      const { count: notesCount } = await this.supabase
        .from('notes')
        .select('id', { count: 'exact' })
        .eq('book_id', bookId)
        .eq('user_id', userId)

      // Step 6: Get tags for this book using JOIN
      const { data: bookTagsData } = await this.supabase
        .from('book_tags')
        .select('tag_id')
        .eq('book_id', bookId)

      // Get tag names separately 
      let tags: string[] = []
      if (bookTagsData && bookTagsData.length > 0) {
        const tagIds = bookTagsData.map(bt => bt.tag_id)
        const { data: tagsData } = await this.supabase
          .from('tags')
          .select('name')
          .in('id', tagIds)
        
        tags = tagsData?.map(tag => tag.name) || []
      }

      // Step 7: Build and return the response
      const bookDetail: BookDetailDTO = {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        cover_url: book.cover_url,
        description: book.description,
        created_at: book.created_at,
        updated_at: book.updated_at,
        user_status: userStatus ? {
          status: userStatus.status as ReadingStatus,
          started_at: userStatus.started_at,
          finished_at: userStatus.finished_at
        } : null,
        user_rating: userRating?.rating || null,
        tags: tags,
        average_rating: averageRating,
        total_ratings: totalRatings,
        notes_count: notesCount || 0
      }

      return bookDetail

    } catch (error) {
      console.error('Error in getBookDetail:', error)
      throw error
    }
  }

  /**
   * Update a book's basic information
   * Only the book creator can update the book
   */
  async updateBook(
    bookId: string,
    userId: string,
    updateData: UpdateBookDTO
  ): Promise<{ id: string; title: string; author: string; isbn: string | null; cover_url: string | null; description: string | null; updated_at: string }> {
    try {
      // Step 1: Check if book exists and user has permission to edit
      const { data: existingBook, error: checkError } = await this.supabase
        .from('books')
        .select('id, title, author, created_by')
        .eq('id', bookId)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking book existence:', checkError)
        throw new Error('Failed to verify book existence')
      }

      if (!existingBook) {
        const error = new Error('Book not found') as BookServiceError
        error.status = 404
        error.code = 'BOOK_NOT_FOUND'
        throw error
      }

      if (existingBook.created_by !== userId) {
        const error = new Error('You do not have permission to edit this book') as BookServiceError
        error.status = 403
        error.code = 'FORBIDDEN'
        throw error
      }

      // Step 2: Check for duplicate if title or author is being updated
      if (updateData.title || updateData.author) {
        const newTitle = updateData.title || existingBook.title
        const newAuthor = updateData.author || existingBook.author
        
        // Only check for duplicates if title or author is actually changing
        if (newTitle !== existingBook.title || newAuthor !== existingBook.author) {
          const duplicateCheck = await this.checkForDuplicate(newTitle, newAuthor, userId)
          if (duplicateCheck.exists && duplicateCheck.bookId !== bookId) {
            const error = new Error('Book with this title and author already exists') as BookServiceError
            error.status = 409
            error.code = 'DUPLICATE_BOOK'
            error.details = { book_id: duplicateCheck.bookId }
            throw error
          }
        }
      }

      // Step 3: Prepare update data - trim strings and handle nulls
      const bookUpdate: Database['public']['Tables']['books']['Update'] = {}
      
      if (updateData.title !== undefined) {
        bookUpdate.title = updateData.title.trim()
      }
      
      if (updateData.author !== undefined) {
        bookUpdate.author = updateData.author.trim()
      }
      
      if (updateData.isbn !== undefined) {
        bookUpdate.isbn = updateData.isbn ? updateData.isbn.trim() : null
      }
      
      if (updateData.cover_url !== undefined) {
        bookUpdate.cover_url = updateData.cover_url ? updateData.cover_url.trim() : null
      }
      
      if (updateData.description !== undefined) {
        bookUpdate.description = updateData.description ? updateData.description.trim() : null
      }

      // Step 4: Update the book
      const { data: updatedBook, error: updateError } = await this.supabase
        .from('books')
        .update(bookUpdate)
        .eq('id', bookId)
        .eq('created_by', userId) // Additional security check
        .select('id, title, author, isbn, cover_url, description, updated_at')
        .single()

      if (updateError) {
        console.error('Error updating book:', updateError)
        
        // Handle specific database errors
        if (updateError.code === '23505') {
          const error = new Error('Book with this title and author already exists') as BookServiceError
          error.status = 409
          error.code = 'DUPLICATE_BOOK'
          throw error
        }
        
        throw new Error('Failed to update book')
      }

      if (!updatedBook) {
        const error = new Error('Book not found or permission denied') as BookServiceError
        error.status = 404
        error.code = 'BOOK_NOT_FOUND'
        throw error
      }

      return updatedBook

    } catch (error) {
      console.error('Error in updateBook:', error)
      throw error
    }
  }

  /**
   * Delete a book and all associated data
   * Only the book creator can delete the book
   */
  async deleteBook(bookId: string, userId: string): Promise<DeleteBookResult> {
    try {
      // Step 1: Check if book exists and user has permission to delete
      const { data: existingBook, error: checkError } = await this.supabase
        .from('books')
        .select('id, title, author, created_by')
        .eq('id', bookId)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking book existence:', checkError)
        throw new Error('Failed to verify book existence')
      }

      if (!existingBook) {
        const error = new Error('Book not found') as BookServiceError
        error.status = 404
        error.code = 'BOOK_NOT_FOUND'
        throw error
      }

      if (existingBook.created_by !== userId) {
        // Log unauthorized deletion attempt for security monitoring
        await this.auditService.logSecurityEvent(
          'PERMISSION_DENIED',
          'BOOK',
          bookId,
          userId,
          {
            attempted_operation: 'DELETE',
            book_title: existingBook.title,
            book_owner: existingBook.created_by,
            reason: 'User attempted to delete book they do not own'
          }
        )

        const error = new Error('Forbidden: You can only delete books you created') as BookServiceError
        error.status = 403
        error.code = 'INSUFFICIENT_PERMISSIONS'
        error.details = {
          book_id: bookId,
          created_by: existingBook.created_by,
          requested_by: userId
        }
        throw error
      }

      // Step 2: Count related data before deletion for audit logging
      const [bookStatusesCount, ratingsCount, notesCount, bookTagsCount] = await Promise.all([
        this.supabase
          .from('book_statuses')
          .select('id', { count: 'exact' })
          .eq('book_id', bookId)
          .then(({ count }) => count || 0),
        
        this.supabase
          .from('ratings')
          .select('id', { count: 'exact' })
          .eq('book_id', bookId)
          .then(({ count }) => count || 0),
          
        this.supabase
          .from('notes')
          .select('id', { count: 'exact' })
          .eq('book_id', bookId)
          .then(({ count }) => count || 0),
          
        this.supabase
          .from('book_tags')
          .select('book_id', { count: 'exact' })
          .eq('book_id', bookId)
          .then(({ count }) => count || 0)
      ])

      // Step 3: Create audit log entry before deletion
      const auditLog: BookDeletionAuditLog = {
        book_id: bookId,
        book_title: existingBook.title,
        book_author: existingBook.author,
        deleted_by: userId,
        deleted_at: new Date().toISOString(),
        related_data_count: {
          book_statuses: bookStatusesCount,
          ratings: ratingsCount,
          notes: notesCount,
          book_tags: bookTagsCount
        }
      }

      // Step 4: Perform cascading deletion in transaction
      // Note: The database foreign key constraints with ON DELETE CASCADE 
      // will automatically handle deletion of related records
      const { error: deleteError } = await this.supabase
        .from('books')
        .delete()
        .eq('id', bookId)
        .eq('created_by', userId) // Additional security check

      if (deleteError) {
        console.error('Error deleting book:', deleteError)
        throw new Error('Failed to delete book')
      }

      // Step 5: Log successful deletion to audit service
      await this.auditService.logBookDeletion(auditLog)

      // Step 6: Invalidate cache and refresh materialized views
      try {
        const cacheResult = await this.cacheService.invalidateBook(bookId, userId)
        console.info('Cache invalidation completed:', cacheResult)
        
        // Optional: Warm cache for user's remaining books
        await this.cacheService.warmCache(userId)
      } catch (cacheError) {
        console.error('Cache invalidation failed, but deletion was successful:', cacheError)
        // Cache invalidation failures should not fail the main operation
      }

      // Step 7: Return result with audit information
      const result: DeleteBookResult = {
        success: true,
        bookId: bookId,
        deletedRelatedData: {
          book_statuses: bookStatusesCount,
          ratings: ratingsCount,
          notes: notesCount,
          book_tags: bookTagsCount
        }
      }

      return result

    } catch (error) {
      console.error('Error in deleteBook:', error)
      throw error
    }
  }
} 