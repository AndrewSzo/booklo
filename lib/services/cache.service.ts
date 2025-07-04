import type { SupabaseClient } from '@/lib/supabase/server'

export interface CacheInvalidationResult {
  success: boolean
  invalidated_keys: string[]
  materialized_views_refreshed: string[]
  errors?: string[]
}

export interface CacheServiceError extends Error {
  status: number
  code: string
  details?: Record<string, unknown>
}

/**
 * Service for managing cache invalidation and materialized view refreshing
 * Critical for maintaining data consistency after modifications
 */
export class CacheService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Invalidate all cache related to a specific book
   * Called after book creation, update, or deletion
   */
  async invalidateBook(bookId: string, userId: string): Promise<CacheInvalidationResult> {
    try {
      const invalidatedKeys: string[] = []
      const refreshedViews: string[] = []
      const errors: string[] = []

      // 1. Invalidate book-specific cache keys
      const bookCacheKeys = [
        `book:${bookId}`,
        `book:detail:${bookId}`,
        `book:${bookId}:user:${userId}`,
        `book:${bookId}:notes`,
        `book:${bookId}:ratings`,
        `book:${bookId}:tags`
      ]

      await this.invalidateCacheKeys(bookCacheKeys)
      invalidatedKeys.push(...bookCacheKeys)

      // 2. Invalidate user-specific cache (book lists, statistics)
      const userCacheKeys = [
        `user:${userId}:books`,
        `user:${userId}:books:*`, // All paginated book lists
        `user:${userId}:stats`,
        `user:${userId}:reading-progress`,
        `user:${userId}:recent-books`,
        `user:${userId}:book-tags`
      ]

      await this.invalidateCacheKeys(userCacheKeys)
      invalidatedKeys.push(...userCacheKeys)

      // 3. Invalidate search cache that might contain this book
      const searchCacheKeys = [
        'search:books:*',
        'search:recent:*',
        'search:popular:*'
      ]

      await this.invalidateCacheKeys(searchCacheKeys)
      invalidatedKeys.push(...searchCacheKeys)

      // 4. Refresh materialized views asynchronously
      try {
        await this.refreshMaterializedViews(['user_reading_stats', 'book_popularity_stats'])
        refreshedViews.push('user_reading_stats', 'book_popularity_stats')
      } catch (error) {
        console.error('Error refreshing materialized views:', error)
        errors.push(`Materialized view refresh failed: ${error}`)
      }

      return {
        success: errors.length === 0,
        invalidated_keys: invalidatedKeys,
        materialized_views_refreshed: refreshedViews,
        errors: errors.length > 0 ? errors : undefined
      }

    } catch (error) {
      console.error('Error in cache invalidation:', error)
      const cacheError = new Error('Cache invalidation failed') as CacheServiceError
      cacheError.status = 500
      cacheError.code = 'CACHE_INVALIDATION_FAILED'
      cacheError.details = { original_error: error }
      throw cacheError
    }
  }

  /**
   * Bulk invalidate user's entire cache (useful after major changes)
   */
  async invalidateUserCache(userId: string): Promise<CacheInvalidationResult> {
    try {
      const userCacheKeys = [
        `user:${userId}:*`,
        'search:books:*' // Search results might contain user's books
      ]

      await this.invalidateCacheKeys(userCacheKeys)

      return {
        success: true,
        invalidated_keys: userCacheKeys,
        materialized_views_refreshed: []
      }

    } catch (error) {
      console.error('Error invalidating user cache:', error)
      throw error
    }
  }

  /**
   * Invalidate specific cache keys
   * In production, this would integrate with Redis/Memcached
   */
  private async invalidateCacheKeys(keys: string[]): Promise<void> {
    try {
      // TODO: Implement actual cache invalidation
      // For Redis: await redis.del(...keys)
      // For Memcached: await memcached.flush(keys)
      // For CDN: await cloudflare.purgeCache(keys)

      console.info('CACHE_INVALIDATION: Invalidating keys:', keys)

      // Simulate cache invalidation delay
      await new Promise(resolve => setTimeout(resolve, 10))

    } catch (error) {
      console.error('Failed to invalidate cache keys:', error)
      throw error
    }
  }

  /**
   * Refresh materialized views for updated statistics
   * Called after operations that affect aggregated data
   */
  private async refreshMaterializedViews(viewNames: string[]): Promise<void> {
    try {
      // TODO: Implement actual materialized view refresh
      // This would typically be:
      // for (const viewName of viewNames) {
      //   await this.supabase.rpc('refresh_materialized_view', { view_name: viewName })
      // }

      console.info('MATERIALIZED_VIEWS: Refreshing views:', viewNames)

      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 50))

    } catch (error) {
      console.error('Failed to refresh materialized views:', error)
      throw error
    }
  }

  /**
   * Intelligent cache warming after invalidation
   * Pre-loads frequently accessed data to improve performance
   */
  async warmCache(userId: string, bookId?: string): Promise<void> {
    try {
      console.info('CACHE_WARMING: Starting cache warm-up', { userId, bookId })

      // TODO: Implement cache warming strategy
      // 1. Pre-load user's recent books
      // 2. Pre-load user statistics
      // 3. Pre-load popular books in user's genres
      // 4. If bookId provided, pre-load related books

      // This would involve calling the actual data fetching methods
      // and storing results in cache for future requests

    } catch (error) {
      console.error('Cache warming failed:', error)
      // Cache warming failures should not block the main operation
    }
  }

  /**
   * Get cache invalidation statistics for monitoring
   */
  async getCacheStats(): Promise<Record<string, unknown>> {
    try {
      // TODO: Implement cache statistics collection
      return {
        total_invalidations_today: 0,
        average_invalidation_time_ms: 0,
        materialized_view_refresh_count: 0,
        cache_hit_rate: 0,
        last_full_refresh: null
      }

    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return {}
    }
  }
} 