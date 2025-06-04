# Books API Endpoint - GET /api/books

## Overview
Endpoint to retrieve a list of user's books with filtering, searching, and pagination capabilities.

## Authentication
- **Required**: Yes
- **Method**: JWT token via Supabase Auth
- **Header**: `Authorization: Bearer {jwt_token}`

## Request

### HTTP Method
`GET`

### URL
`/api/books`

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | - | Filter by reading status: `want_to_read`, `reading`, `finished` |
| `search` | string | No | - | Search in book title and author (max 255 chars) |
| `tags` | string | No | - | Comma-separated tag names to filter by |
| `page` | number | No | 1 | Page number for pagination (min: 1) |
| `limit` | number | No | 20 | Items per page (min: 1, max: 100) |
| `sort` | string | No | `created_at` | Sort field: `title`, `author`, `created_at`, `rating` |
| `order` | string | No | `desc` | Sort order: `asc`, `desc` |

### Example Requests

```bash
# Get all books
GET /api/books

# Get books currently being read, page 2
GET /api/books?status=reading&page=2

# Search for books with "javascript" in title/author
GET /api/books?search=javascript

# Get books tagged with "fiction" or "sci-fi", sorted by title
GET /api/books?tags=fiction,sci-fi&sort=title&order=asc

# Combined filters with pagination
GET /api/books?status=finished&search=tolkien&limit=10&page=1
```

## Response

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "The Lord of the Rings",
      "author": "J.R.R. Tolkien",
      "isbn": "978-0544003415",
      "cover_url": "https://example.com/cover.jpg",
      "description": "Epic fantasy novel...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user_status": {
        "status": "finished",
        "started_at": "2024-01-01T00:00:00Z",
        "finished_at": "2024-01-15T00:00:00Z"
      },
      "user_rating": 5,
      "tags": ["fantasy", "adventure"],
      "average_rating": 4.8,
      "notes_count": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "error": {
    "message": "Invalid query parameters",
    "code": "VALIDATION_ERROR",
    "details": {
      "field_errors": {
        "limit": ["Must be between 1 and 100"],
        "status": ["Must be one of: want_to_read, reading, finished"]
      }
    }
  }
}
```

#### 401 Unauthorized
```json
{
  "error": {
    "message": "Authentication failed",
    "code": "AUTH_ERROR",
    "details": {
      "auth_error": "Auth session missing!"
    }
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": {
    "message": "Failed to fetch books",
    "code": "BOOKS_FETCH_FAILED",
    "details": {
      "original_error": "Database connection failed"
    }
  }
}
```

## Response Fields

### Book Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique book identifier |
| `title` | string | Book title |
| `author` | string | Book author |
| `isbn` | string\|null | ISBN number |
| `cover_url` | string\|null | URL to book cover image |
| `description` | string\|null | Book description |
| `created_at` | string | ISO timestamp when book was added |
| `updated_at` | string | ISO timestamp when book was last updated |
| `user_status` | object\|null | User's reading status for this book |
| `user_rating` | number\|null | User's rating (1-5) |
| `tags` | string[] | Array of tag names |
| `average_rating` | number\|null | Average rating from all users |
| `notes_count` | number | Number of notes user has for this book |

### User Status Object
| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Reading status: `want_to_read`, `reading`, `finished` |
| `started_at` | string\|null | ISO timestamp when reading started |
| `finished_at` | string\|null | ISO timestamp when reading finished |

### Pagination Object
| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `total` | number | Total number of items |
| `total_pages` | number | Total number of pages |

## Security Features

- Row Level Security (RLS) policies ensure users only see their own book data
- Query parameter sanitization prevents SQL injection
- Rate limiting: 1000 requests per hour per user
- Security headers included in response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`

## Performance Notes

- Uses database indexes for efficient filtering and searching
- Pagination limits maximum 100 items per page
- Separate queries optimize for different data relationships
- Utilizes materialized views for aggregated statistics

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Books retrieved successfully |
| 400 | Bad Request - Invalid query parameters |
| 401 | Unauthorized - Authentication required or failed |
| 500 | Internal Server Error - Server or database error | 