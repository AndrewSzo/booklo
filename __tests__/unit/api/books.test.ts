import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/books/route'

// Mock the book service
jest.mock('@/lib/services/book.service', () => ({
  getUserBooks: jest.fn(),
  createBook: jest.fn(),
}))

// Mock authentication
jest.mock('@/lib/auth/server', () => ({
  getUser: jest.fn(),
}))

describe('/api/books API Endpoints', () => {
  const mockGetUserBooks = require('@/lib/services/book.service').getUserBooks
  const mockCreateBook = require('@/lib/services/book.service').createBook
  const mockGetUser = require('@/lib/auth/server').getUser

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/books', () => {
    it('returns books for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockBooks = [
        { id: '1', title: 'Book 1', author: 'Author 1', status: 'reading' },
        { id: '2', title: 'Book 2', author: 'Author 2', status: 'finished' }
      ]

      mockGetUser.mockResolvedValue(mockUser)
      mockGetUserBooks.mockResolvedValue({ success: true, data: mockBooks })

      const request = new NextRequest('http://localhost:3000/api/books')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockBooks)
      expect(mockGetUserBooks).toHaveBeenCalledWith(mockUser.id, {})
    })

    it('returns 401 for unauthenticated user', async () => {
      mockGetUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/books')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('handles query parameters for filtering', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetUser.mockResolvedValue(mockUser)
      mockGetUserBooks.mockResolvedValue({ success: true, data: [] })

      const request = new NextRequest('http://localhost:3000/api/books?status=reading&search=test')
      await GET(request)

      expect(mockGetUserBooks).toHaveBeenCalledWith(mockUser.id, {
        status: 'reading',
        search: 'test'
      })
    })

    it('handles service errors gracefully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetUser.mockResolvedValue(mockUser)
      mockGetUserBooks.mockResolvedValue({ 
        success: false, 
        error: 'Database connection failed' 
      })

      const request = new NextRequest('http://localhost:3000/api/books')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database connection failed')
    })
  })

  describe('POST /api/books', () => {
    it('creates book with valid data', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        status: 'want_to_read',
        tags: ['fiction']
      }
      const createdBook = { id: 'book-123', ...bookData }

      mockGetUser.mockResolvedValue(mockUser)
      mockCreateBook.mockResolvedValue({ success: true, data: createdBook })

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: JSON.stringify(bookData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(createdBook)
      expect(mockCreateBook).toHaveBeenCalledWith(mockUser.id, bookData)
    })

    it('returns 401 for unauthenticated user', async () => {
      mockGetUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test', author: 'Test' }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Unauthorized')
    })

    it('validates required fields', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetUser.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: JSON.stringify({ title: '' }), // Missing author
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('validation')
    })

    it('validates tag limits', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetUser.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Book',
          author: 'Test Author',
          tags: ['tag1', 'tag2', 'tag3', 'tag4'] // Too many tags
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('tags')
    })

    it('handles invalid JSON', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetUser.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('handles service creation errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const bookData = {
        title: 'New Book',
        author: 'New Author'
      }

      mockGetUser.mockResolvedValue(mockUser)
      mockCreateBook.mockResolvedValue({ 
        success: false, 
        error: 'Book already exists' 
      })

      const request = new NextRequest('http://localhost:3000/api/books', {
        method: 'POST',
        body: JSON.stringify(bookData),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Book already exists')
    })
  })

  describe('Error Handling', () => {
    it('handles unexpected errors gracefully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetUser.mockResolvedValue(mockUser)
      mockGetUserBooks.mockRejectedValue(new Error('Unexpected error'))

      const request = new NextRequest('http://localhost:3000/api/books')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })

    it('handles authentication errors', async () => {
      mockGetUser.mockRejectedValue(new Error('Auth service unavailable'))

      const request = new NextRequest('http://localhost:3000/api/books')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('Rate Limiting', () => {
    it('handles rate limiting', async () => {
      // This would test rate limiting if implemented
      // For now, just ensure the endpoint doesn't crash with many requests
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetUser.mockResolvedValue(mockUser)
      mockGetUserBooks.mockResolvedValue({ success: true, data: [] })

      const requests = Array.from({ length: 10 }, () => 
        GET(new NextRequest('http://localhost:3000/api/books'))
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status) // 200 OK or 429 Too Many Requests
      })
    })
  })
}) 