import { z } from 'zod'
import type { ReadingStatus, BookQueryParams, SortField, SortOrder, UpdateBookDTO } from '@/lib/types'

// Reading status enum schema
const readingStatusSchema = z.enum(['want_to_read', 'reading', 'finished'] as const)

// Create book schema based on CreateBookDTO requirements
export const createBookSchema = z.object({
  // Required fields
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  
  author: z.string()
    .min(1, 'Author is required')
    .max(255, 'Author must be less than 255 characters')
    .trim(),
  
  // Optional fields
  isbn: z.string()
    .max(20, 'ISBN must be less than 20 characters')
    .optional(),
  
  cover_url: z.string()
    .url('Cover URL must be a valid URL')
    .max(500, 'Cover URL must be less than 500 characters')
    .optional(),
  
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  status: readingStatusSchema
    .default('want_to_read' as ReadingStatus),
  
  rating: z.number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  
  tags: z.array(z.string().min(1, 'Tag name cannot be empty').max(50, 'Tag name must be less than 50 characters'))
    .max(3, 'Maximum 3 tags allowed')
    .optional()
    .default([])
})

// Type inference from schema
export type CreateBookInput = z.infer<typeof createBookSchema>

// Validation function with detailed error handling
export function validateCreateBook(data: unknown) {
  const result = createBookSchema.safeParse(data)
  
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    
    result.error.errors.forEach((error: z.ZodIssue) => {
      const field = error.path.join('.')
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(error.message)
    })
    
    return {
      success: false as const,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { field_errors: fieldErrors }
      }
    }
  }
  
  return {
    success: true as const,
    data: result.data
  }
}

/**
 * Validation schema for book query parameters
 */
export interface BookQueryValidationResult {
  success: boolean
  data: BookQueryParams
  error?: {
    message: string
    details: {
      field_errors: Record<string, string[]>
    }
  }
}

export function validateBookQuery(params: Record<string, string | null>): BookQueryValidationResult {
  const errors: Record<string, string[]> = {}

  // Validate status
  const validStatuses: ReadingStatus[] = ['want_to_read', 'reading', 'finished']
  let status: ReadingStatus | undefined
  if (params.status) {
    if (!validStatuses.includes(params.status as ReadingStatus)) {
      errors.status = [`Must be one of: ${validStatuses.join(', ')}`]
    } else {
      status = params.status as ReadingStatus
    }
  }

  // Validate page
  let page = 1
  if (params.page) {
    const pageNum = parseInt(params.page)
    if (isNaN(pageNum) || pageNum < 1) {
      errors.page = ['Must be a positive integer']
    } else {
      page = pageNum
    }
  }

  // Validate limit
  let limit = 20
  if (params.limit) {
    const limitNum = parseInt(params.limit)
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.limit = ['Must be between 1 and 100']
    } else {
      limit = limitNum
    }
  }

  // Validate sort field
  const validSortFields: SortField[] = ['title', 'author', 'created_at', 'rating']
  let sort: SortField = 'created_at'
  if (params.sort) {
    if (!validSortFields.includes(params.sort as SortField)) {
      errors.sort = [`Must be one of: ${validSortFields.join(', ')}`]
    } else {
      sort = params.sort as SortField
    }
  }

  // Validate sort order
  const validSortOrders: SortOrder[] = ['asc', 'desc']
  let order: SortOrder = 'desc'
  if (params.order) {
    if (!validSortOrders.includes(params.order as SortOrder)) {
      errors.order = [`Must be one of: ${validSortOrders.join(', ')}`]
    } else {
      order = params.order as SortOrder
    }
  }

  // Validate search (basic sanitization)
  let search: string | undefined
  if (params.search) {
    const searchTerm = params.search.trim()
    if (searchTerm.length > 255) {
      errors.search = ['Search term must be less than 255 characters']
    } else if (searchTerm.length > 0) {
      search = searchTerm
    }
  }

  // Validate tags (basic format check)
  let tags: string | undefined
  if (params.tags) {
    const tagString = params.tags.trim()
    if (tagString.length > 0) {
      // Check for valid tag format (comma-separated, alphanumeric with spaces and hyphens)
      const tagPattern = /^[a-zA-Z0-9\s\-,]+$/
      if (!tagPattern.test(tagString)) {
        errors.tags = ['Tags must contain only letters, numbers, spaces, hyphens, and commas']
      } else {
        tags = tagString
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      data: {} as BookQueryParams,
      error: {
        message: 'Invalid query parameters',
        details: {
          field_errors: errors
        }
      }
    }
  }

  return {
    success: true,
    data: {
      status,
      search,
      tags,
      page,
      limit,
      sort,
      order
    }
  }
}

/**
 * Schema for updating book - all fields are optional but at least one must be present
 */
export const updateBookSchema = z.object({
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title must be less than 255 characters')
    .trim()
    .optional(),
  
  author: z.string()
    .min(1, 'Author cannot be empty')
    .max(255, 'Author must be less than 255 characters')
    .trim()
    .optional(),
  
  isbn: z.string()
    .max(20, 'ISBN must be less than 20 characters')
    .trim()
    .nullable()
    .optional(),
  
  cover_url: z.string()
    .url('Cover URL must be a valid URL')
    .max(500, 'Cover URL must be less than 500 characters')
    .trim()
    .nullable()
    .optional(),
  
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .trim()
    .nullable()
    .optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update'
  }
)

// Type inference from schema
export type UpdateBookInput = z.infer<typeof updateBookSchema>

/**
 * Validation function for book updates with detailed error handling
 */
export function validateUpdateBook(data: unknown) {
  const result = updateBookSchema.safeParse(data)
  
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    
    result.error.errors.forEach((error: z.ZodIssue) => {
      const field = error.path.length > 0 ? error.path.join('.') : 'root'
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(error.message)
    })
    
    return {
      success: false as const,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { field_errors: fieldErrors }
      }
    }
  }
  
  // Transform the data to match UpdateBookDTO structure
  const transformedData: UpdateBookDTO = {}
  
  if (result.data.title !== undefined) {
    transformedData.title = result.data.title
  }
  
  if (result.data.author !== undefined) {
    transformedData.author = result.data.author
  }
  
  if (result.data.isbn !== undefined) {
    transformedData.isbn = result.data.isbn
  }
  
  if (result.data.cover_url !== undefined) {
    transformedData.cover_url = result.data.cover_url
  }
  
  if (result.data.description !== undefined) {
    transformedData.description = result.data.description
  }
  
  return {
    success: true as const,
    data: transformedData
  }
} 