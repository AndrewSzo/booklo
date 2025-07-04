import type { SupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/database.types'

export interface TagResult {
  id: string
  name: string
  isNew: boolean
}

export interface TagLinkResult {
  book_id: string
  tag_names: string[]
}

/**
 * Service class for handling tag-related operations
 */
export class TagService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Find existing tags by names (case-insensitive)
   */
  async findExistingTags(tagNames: string[]): Promise<Map<string, string>> {
    try {
      if (tagNames.length === 0) return new Map()

      const normalizedNames = tagNames.map(name => name.toLowerCase().trim())

      const { data, error } = await this.supabase
        .from('tags')
        .select('id, name')
        .in('name', normalizedNames)

      if (error) {
        console.error('Error finding existing tags:', error)
        throw new Error('Failed to find existing tags')
      }

      // Create map: normalized_name -> tag_id
      const tagMap = new Map<string, string>()
      data?.forEach(tag => {
        tagMap.set(tag.name.toLowerCase(), tag.id)
      })

      return tagMap
    } catch (error) {
      console.error('Unexpected error finding tags:', error)
      throw error
    }
  }

  /**
   * Create new tags for names that don't exist yet
   */
  async createNewTags(tagNames: string[]): Promise<TagResult[]> {
    try {
      if (tagNames.length === 0) return []

      const tagInserts: Database['public']['Tables']['tags']['Insert'][] = tagNames.map(name => ({
        name: name.toLowerCase().trim()
      }))

      const { data, error } = await this.supabase
        .from('tags')
        .insert(tagInserts)
        .select('id, name')

      if (error) {
        console.error('Error creating new tags:', error)
        throw new Error('Failed to create new tags')
      }

      return data.map(tag => ({
        id: tag.id,
        name: tag.name,
        isNew: true
      }))
    } catch (error) {
      console.error('Unexpected error creating tags:', error)
      throw error
    }
  }

  /**
   * Link tags to a book in the book_tags junction table
   */
  async linkTagsToBook(bookId: string, tagIds: string[]): Promise<void> {
    try {
      if (tagIds.length === 0) return

      const bookTagInserts: Database['public']['Tables']['book_tags']['Insert'][] = tagIds.map(tagId => ({
        book_id: bookId,
        tag_id: tagId
      }))

      const { error } = await this.supabase
        .from('book_tags')
        .insert(bookTagInserts)

      if (error) {
        console.error('Error linking tags to book:', error)
        throw new Error('Failed to link tags to book')
      }
    } catch (error) {
      console.error('Unexpected error linking tags:', error)
      throw error
    }
  }

  /**
   * Main method to handle tag creation and linking for a book
   */
  async processTagsForBook(bookId: string, tagNames: string[]): Promise<TagLinkResult> {
    try {
      if (tagNames.length === 0) {
        return { book_id: bookId, tag_names: [] }
      }

      // Normalize and deduplicate tag names
      const normalizedTagNames = [...new Set(
        tagNames.map(name => name.toLowerCase().trim()).filter(name => name.length > 0)
      )]

      if (normalizedTagNames.length === 0) {
        return { book_id: bookId, tag_names: [] }
      }

      // Find existing tags
      const existingTagsMap = await this.findExistingTags(normalizedTagNames)
      
      // Determine which tags need to be created
      const tagsToCreate = normalizedTagNames.filter(name => !existingTagsMap.has(name))
      
      // Create new tags
      let newTags: TagResult[] = []
      if (tagsToCreate.length > 0) {
        newTags = await this.createNewTags(tagsToCreate)
      }

      // Collect all tag IDs (existing + new)
      const allTagIds: string[] = []
      
      // Add existing tag IDs
      normalizedTagNames.forEach(name => {
        const existingId = existingTagsMap.get(name)
        if (existingId) {
          allTagIds.push(existingId)
        }
      })
      
      // Add new tag IDs
      newTags.forEach(tag => {
        allTagIds.push(tag.id)
      })

      // Link all tags to the book
      await this.linkTagsToBook(bookId, allTagIds)

      return {
        book_id: bookId,
        tag_names: normalizedTagNames
      }
    } catch (error) {
      console.error('Error in processTagsForBook:', error)
      throw error
    }
  }
} 