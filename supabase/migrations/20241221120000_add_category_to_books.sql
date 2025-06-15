-- ============================================================================
-- Migration: Add category column to books table
-- Created: 2024-12-21 12:00:00 UTC
-- Purpose: Add category field to books for better organization
-- ============================================================================

-- Add category column to books table
ALTER TABLE books ADD COLUMN category text;

-- Create index for category filtering
CREATE INDEX idx_books_category ON books(category);

-- Add comment for documentation
COMMENT ON COLUMN books.category IS 'Book category/genre (e.g., sci-fi, fantasy, romance, etc.)'; 