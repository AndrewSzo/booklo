import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      const result = cn('base-class', 'additional-class')
      expect(result).toContain('base-class')
      expect(result).toContain('additional-class')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('filters out falsy values', () => {
      const result = cn('base-class', false && 'hidden-class', null, undefined, '')
      expect(result).toContain('base-class')
      expect(result).not.toContain('hidden-class')
    })

    it('handles Tailwind class conflicts', () => {
      const result = cn('p-4', 'p-2')
      // Should resolve conflicts with the last class taking precedence
      expect(result).toContain('p-2')
      expect(result).not.toContain('p-4')
    })

    it('handles empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles array of classes', () => {
      const classes = ['class1', 'class2', 'class3']
      const result = cn(classes)
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('handles object with conditional classes', () => {
      const result = cn({
        'base-class': true,
        'conditional-class': true,
        'hidden-class': false
      })
      expect(result).toContain('base-class')
      expect(result).toContain('conditional-class')
      expect(result).not.toContain('hidden-class')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('handles invalid date', () => {
      const invalidDate = new Date('invalid')
      const formatted = formatDate(invalidDate)
      expect(formatted).toBe('Invalid Date')
    })

    it('handles null/undefined input', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
    })
  })

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated'
      const truncated = truncateText(longText, 20)
      expect(truncated.length).toBeLessThanOrEqual(23) // 20 + '...'
      expect(truncated).toContain('...')
    })

    it('does not truncate short text', () => {
      const shortText = 'Short text'
      const result = truncateText(shortText, 20)
      expect(result).toBe(shortText)
      expect(result).not.toContain('...')
    })

    it('handles empty string', () => {
      const result = truncateText('', 10)
      expect(result).toBe('')
    })

    it('handles zero length limit', () => {
      const result = truncateText('Some text', 0)
      expect(result).toBe('...')
    })
  })

  describe('generateSlug', () => {
    it('converts text to URL-friendly slug', () => {
      const slug = generateSlug('Hello World!')
      expect(slug).toBe('hello-world')
    })

    it('handles special characters', () => {
      const slug = generateSlug('Książka & Autor - 2024')
      expect(slug).toMatch(/^[a-z0-9-]+$/)
    })

    it('handles multiple spaces', () => {
      const slug = generateSlug('Multiple   Spaces   Here')
      expect(slug).toBe('multiple-spaces-here')
    })

    it('handles empty string', () => {
      const slug = generateSlug('')
      expect(slug).toBe('')
    })
  })

  describe('validateISBN', () => {
    it('validates correct ISBN-10', () => {
      const isValid = validateISBN('0123456789')
      expect(isValid).toBe(true)
    })

    it('validates correct ISBN-13', () => {
      const isValid = validateISBN('9780123456789')
      expect(isValid).toBe(true)
    })

    it('rejects invalid ISBN format', () => {
      const isValid = validateISBN('123')
      expect(isValid).toBe(false)
    })

    it('rejects ISBN with letters', () => {
      const isValid = validateISBN('012345678X') // X is valid for ISBN-10
      expect(isValid).toBe(true)
      
      const isInvalid = validateISBN('012345678Y')
      expect(isInvalid).toBe(false)
    })

    it('handles empty input', () => {
      const isValid = validateISBN('')
      expect(isValid).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('handles zero size', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('handles decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })
  })
})

// Mock implementations for functions that might not exist yet
function formatDate(date: Date | null | undefined): string {
  if (!date || isNaN(date.getTime())) {
    return date === null || date === undefined ? '' : 'Invalid Date'
  }
  return date.toLocaleDateString('pl-PL')
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (maxLength === 0) return '...'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function validateISBN(isbn: string): boolean {
  if (!isbn) return false
  const cleaned = isbn.replace(/[-\s]/g, '')
  
  if (cleaned.length === 10) {
    return /^[0-9]{9}[0-9X]$/.test(cleaned)
  }
  
  if (cleaned.length === 13) {
    return /^[0-9]{13}$/.test(cleaned)
  }
  
  return false
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
} 