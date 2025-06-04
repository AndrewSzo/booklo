# REST API Plan

## 1. Resources

| Resource | Database Table | Description |
|----------|---------------|-------------|
| Books | `books` | Core book information and metadata |
| Book Statuses | `book_statuses` | User reading status for books |
| Ratings | `ratings` | User ratings for books (1-5 stars) |
| Notes | `notes` | User notes and reviews for books |
| Tags | `tags` | Book categorization tags |
| Tag Aliases | `tag_aliases` | Alternative names for tags |
| Users | `users` | User profile information |

## 2. Endpoints

### Books Resource

#### GET /api/books
Get list of books with filtering and search capabilities.

**Query Parameters:**
- `status` (optional): Filter by reading status (`want_to_read`, `reading`, `finished`)
- `search` (optional): Search by title or author
- `tags` (optional): Filter by tag names (comma-separated)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort field (`title`, `author`, `created_at`, `rating`) 
- `order` (optional): Sort order (`asc`, `desc`, default: `asc`)

**Response Structure:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "author": "string", 
      "isbn": "string",
      "cover_url": "string",
      "description": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "user_status": {
        "status": "want_to_read|reading|finished",
        "started_at": "timestamp",
        "finished_at": "timestamp"
      },
      "user_rating": 1-5,
      "tags": ["tag1", "tag2"],
      "average_rating": 3.5,
      "notes_count": 2
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

**Success Codes:** 200 OK  
**Error Codes:** 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

#### POST /api/books
Create a new book.

**Request Body:**
```json
{
  "title": "string (required)",
  "author": "string (required)",
  "isbn": "string (optional)",
  "cover_url": "string (optional)",
  "description": "string (optional)",
  "status": "want_to_read|reading|finished (optional, default: want_to_read)",
  "rating": 1-5 (optional),
  "tags": ["tag1", "tag2"] (optional, max 3)
}
```

**Response Structure:**
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "author": "string",
    "isbn": "string",
    "cover_url": "string", 
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Codes:** 201 Created  
**Error Codes:** 400 Bad Request, 401 Unauthorized, 409 Conflict (duplicate book), 500 Internal Server Error

#### GET /api/books/{id}
Get detailed information about a specific book.

**Response Structure:**
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "author": "string",
    "isbn": "string", 
    "cover_url": "string",
    "description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "user_status": {
      "status": "want_to_read|reading|finished",
      "started_at": "timestamp",
      "finished_at": "timestamp"
    },
    "user_rating": 1-5,
    "tags": ["tag1", "tag2"],
    "average_rating": 3.5,
    "total_ratings": 15,
    "notes_count": 2
  }
}
```

**Success Codes:** 200 OK  
**Error Codes:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error

#### PUT /api/books/{id}
Update book information.

**Request Body:**
```json
{
  "title": "string (optional)",
  "author": "string (optional)", 
  "isbn": "string (optional)",
  "cover_url": "string (optional)",
  "description": "string (optional)"
}
```

**Response Structure:**
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "author": "string",
    "isbn": "string",
    "cover_url": "string",
    "description": "string", 
    "updated_at": "timestamp"
  }
}
```

**Success Codes:** 200 OK  
**Error Codes:** 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

#### DELETE /api/books/{id}
Delete a book (only allowed for book creator).

**Success Codes:** 204 No Content  
**Error Codes:** 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

### Book Status Resource

#### PUT /api/books/{id}/status
Update reading status for a book.

**Request Body:**
```json
{
  "status": "want_to_read|reading|finished (required)",
  "started_at": "timestamp (optional, auto-set when status changes to 'reading')",
  "finished_at": "timestamp (optional, auto-set when status changes to 'finished')"
}
```

**Response Structure:**
```json
{
  "data": {
    "book_id": "uuid",
    "user_id": "uuid", 
    "status": "reading",
    "started_at": "timestamp",
    "finished_at": null,
    "updated_at": "timestamp"
  }
}
```

**Success Codes:** 200 OK  
**Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

### Ratings Resource

#### POST /api/books/{id}/rating
Create or update a rating for a book.

**Request Body:**
```json
{
  "rating": 1-5 (required)
}
```

**Response Structure:**
```json
{
  "data": {
    "id": "uuid",
    "book_id": "uuid",
    "user_id": "uuid",
    "rating": 5,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Codes:** 201 Created (new rating) or 200 OK (updated rating)  
**Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

#### DELETE /api/books/{id}/rating
Remove user's rating for a book.

**Success Codes:** 204 No Content  
**Error Codes:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error

### Notes Resource

#### GET /api/books/{id}/notes
Get all notes for a specific book by the current user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

**Response Structure:**
```json
{
  "data": [
    {
      "id": "uuid",
      "book_id": "uuid",
      "content": "string",
      "created_at": "timestamp", 
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  }
}
```

**Success Codes:** 200 OK  
**Error Codes:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error

#### POST /api/books/{id}/notes
Create a new note for a book.

**Request Body:**
```json
{
  "content": "string (required, min 1 char)"
}
```

**Response Structure:**
```json
{
  "data": {
    "id": "uuid",
    "book_id": "uuid",
    "content": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Codes:** 201 Created  
**Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

#### PUT /api/notes/{id}
Update a note.

**Request Body:**
```json
{
  "content": "string (required, min 1 char)"
}
```

**Response Structure:**
```json
{
  "data": {
    "id": "uuid",
    "content": "string",
    "updated_at": "timestamp"
  }
}
```

**Success Codes:** 200 OK  
**Error Codes:** 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

#### DELETE /api/notes/{id}
Delete a note.

**Success Codes:** 204 No Content  
**Error Codes:** 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

### Tags Resource

#### GET /api/tags
Get list of available tags with search capability.

**Query Parameters:**
- `search` (optional): Search tag names and aliases
- `limit` (optional): Max results (default: 50, max: 100)

**Response Structure:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "aliases": ["alias1", "alias2"],
      "book_count": 15,
      "created_at": "timestamp"
    }
  ]
}
```

**Success Codes:** 200 OK  
**Error Codes:** 401 Unauthorized, 500 Internal Server Error

#### POST /api/tags
Create a new tag.

**Request Body:**
```json
{
  "name": "string (required, unique)",
  "aliases": ["string"] (optional)
}
```

**Response Structure:**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "aliases": ["string"],
    "created_at": "timestamp"
  }
}
```

**Success Codes:** 201 Created  
**Error Codes:** 400 Bad Request, 401 Unauthorized, 409 Conflict, 500 Internal Server Error

#### POST /api/books/{id}/tags
Add tags to a book (max 3 tags per book).

**Request Body:**
```json
{
  "tag_names": ["tag1", "tag2"] (required, max 3 total tags per book)
}
```

**Response Structure:**
```json
{
  "data": {
    "book_id": "uuid",
    "tags": ["tag1", "tag2", "tag3"]
  }
}
```

**Success Codes:** 200 OK  
**Error Codes:** 400 Bad Request (too many tags), 401 Unauthorized, 404 Not Found, 500 Internal Server Error

#### DELETE /api/books/{id}/tags/{tag_name}
Remove a tag from a book.

**Success Codes:** 204 No Content  
**Error Codes:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error

### User Statistics

#### GET /api/user/stats
Get reading statistics for the current user.

**Response Structure:**
```json
{
  "data": {
    "want_to_read_count": 25,
    "reading_count": 3,
    "finished_count": 42,
    "average_rating": 4.2,
    "total_notes": 35,
    "reading_streak_days": 15
  }
}
```

**Success Codes:** 200 OK  
**Error Codes:** 401 Unauthorized, 500 Internal Server Error

### User Profile

#### GET /api/user/profile
Get current user profile.

**Response Structure:**
```json
{
  "data": {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "preferences": {},
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Success Codes:** 200 OK  
**Error Codes:** 401 Unauthorized, 500 Internal Server Error

#### PUT /api/user/profile
Update user profile.

**Request Body:**
```json
{
  "full_name": "string (optional)",
  "preferences": {} (optional)
}
```

**Response Structure:**
```json
{
  "data": {
    "id": "uuid",
    "full_name": "string", 
    "preferences": {},
    "updated_at": "timestamp"
  }
}
```

**Success Codes:** 200 OK  
**Error Codes:** 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

## 3. Authentication and Authorization

### Authentication Mechanism
- **JWT Token-based Authentication** using Supabase Auth
- Tokens are included in the `Authorization` header: `Bearer {jwt_token}`
- Tokens expire after configurable period (recommended: 1 hour)
- Refresh tokens are used for seamless re-authentication

### Authorization Rules
- **Row Level Security (RLS)** enforced at database level
- Users can only access their own data for:
  - Book statuses
  - Ratings 
  - Notes
- Users can create books but only modify/delete books they created
- Tags are globally accessible but only book creators can assign tags to their books
- Public read access for book information and ratings (for statistics)

### Security Headers
- All API responses include security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`

## 4. Validation and Business Logic

### Request Validation Rules

#### Books
- `title`: Required, 1-500 characters, trimmed
- `author`: Required, 1-200 characters, trimmed
- `isbn`: Optional, valid ISBN-10 or ISBN-13 format
- `cover_url`: Optional, valid URL format
- `description`: Optional, max 2000 characters
- Unique constraint on `(title, author)` combination

#### Book Statuses
- `status`: Required, must be one of: `want_to_read`, `reading`, `finished`
- `started_at`: Auto-set when status changes to `reading`, cannot be in future
- `finished_at`: Auto-set when status changes to `finished`, must be after `started_at`

#### Ratings
- `rating`: Required integer between 1 and 5 (inclusive)
- One rating per user per book (upsert behavior)

#### Notes
- `content`: Required, min 1 character, max 10,000 characters, trimmed
- HTML tags are stripped for security

#### Tags
- `name`: Required, 1-50 characters, lowercase, alphanumeric + hyphens
- Maximum 3 tags per book (enforced by database trigger)
- Tag names are unique (case-insensitive)

### Business Logic Implementation

#### Reading Status Workflow
1. When status changes to `reading`: automatically set `started_at` to current timestamp
2. When status changes to `finished`: automatically set `finished_at` to current timestamp  
3. When status changes from `finished` to other states: clear `finished_at`
4. Users can override automatic timestamps if needed

#### Rating System
- Ratings are used to calculate book popularity statistics
- Average ratings are computed using materialized views for performance
- Rating changes trigger materialized view refresh

#### Tag Management
- Tags are auto-created when referenced if they don't exist
- Tag aliases are searched when filtering by tag names
- Popular tags are surfaced based on usage frequency

#### Search Functionality
- Full-text search using PostgreSQL GIN indexes
- Search covers book titles, authors, and tag names
- Results ranked by relevance score

### Error Handling
- All validation errors return `400 Bad Request` with detailed field-level errors
- Business rule violations return `422 Unprocessable Entity`
- Authentication failures return `401 Unauthorized`
- Authorization failures return `403 Forbidden`
- Resource not found returns `404 Not Found`
- Rate limiting returns `429 Too Many Requests`
- Server errors return `500 Internal Server Error` with correlation ID for debugging

### Rate Limiting
- **General API**: 1000 requests per hour per user
- **Search endpoints**: 100 requests per hour per user  
- **Create operations**: 60 requests per hour per user
- Rate limiting is enforced using a sliding window algorithm
- Rate limit headers included in all responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining` 
  - `X-RateLimit-Reset` 