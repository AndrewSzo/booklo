# API Endpoint Implementation Plan: POST /api/books/{id}/notes

## 1. Przegląd punktu końcowego

Endpoint POST /api/books/{id}/notes służy do tworzenia nowych notatek użytkownika dla konkretnej książki. Ten endpoint umożliwia użytkownikom dodawanie prywatnych notatek, refleksji i komentarzy związanych z czytaniem konkretnej książki, z automatycznym przypisaniem do zalogowanego użytkownika.

**Główne funkcjonalności:**
- Tworzenie nowej notatki dla konkretnej książki
- Automatyczne przypisanie notatki do zalogowanego użytkownika
- Walidacja istnienia książki przed utworzeniem notatki
- RLS security zapewniające izolację notatek między użytkownikami
- Walidacja i sanityzacja contentu notatki
- Automatyczne ustawienie timestamps (created_at, updated_at)
- Cache invalidation dla book notes count

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/books/{id}/notes`
- **Parametry:**
  - **Wymagane:**
    - `id` (string): UUID książki w ścieżce URL
- **Request Body:**
  ```json
  {
    "content": "string (required, min 1 char, max 10,000 characters)"
  }
  ```
- **Headers:** 
  - `Authorization: Bearer {jwt_token}` (wymagany)
  - `Content-Type: application/json` (wymagany)

## 3. Wykorzystywane typy

```typescript
// Path parameter validation
interface BookNotesParams {
  id: string // UUID
}

// Request body validation
interface CreateNoteDTO {
  content: string // min 1 char, max 10,000 chars, trimmed
}

// Response DTOs
interface NoteResponseDTO {
  id: string
  book_id: string
  content: string
  created_at: string
  updated_at: string
}

interface CreateNoteResponseDTO {
  data: NoteResponseDTO
}

// Service types
interface CreateNoteData {
  bookId: string
  userId: string
  content: string
}

interface CreatedNote {
  id: string
  book_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

// Error response types
interface ErrorResponseDTO {
  error: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
}

interface ValidationErrorResponseDTO {
  error: {
    message: string
    code: 'VALIDATION_ERROR'
    details: {
      field_errors: Record<string, string[]>
    }
  }
}
```

## 4. Szczegóły odpowiedzi

**Struktura odpowiedzi sukcesu (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "book_id": "123e4567-e89b-12d3-a456-426614174000",
    "content": "Świetna książka! Szczególnie podobał mi się rozdział o zarządzaniu czasem...",
    "created_at": "2024-01-02T10:30:00Z",
    "updated_at": "2024-01-02T10:30:00Z"
  }
}
```

**Kody statusu:**
- `201 Created`: Pomyślne utworzenie nowej notatki
- `400 Bad Request`: Nieprawidłowy format UUID, pusty content lub zbyt długi content
- `401 Unauthorized`: Brak autoryzacji lub nieprawidłowy token
- `404 Not Found`: Książka o podanym ID nie istnieje
- `500 Internal Server Error`: Błąd serwera podczas tworzenia notatki

## 5. Przepływ danych

1. **Walidacja parametrów wejściowych**
   - Sprawdzenie czy parametr `id` jest prawidłowym UUID
   - Walidacja request body (Content-Type: application/json)
   - Walidacja content: required, min 1 char, max 10,000 chars
   - Trimming content i usunięcie HTML tags dla security

2. **Uwierzytelnianie użytkownika**
   - Weryfikacja JWT tokena przez Supabase Auth
   - Pobranie user_id z kontekstu uwierzytelniania
   - Sprawdzenie czy token nie wygasł

3. **Sprawdzenie istnienia książki**
   - Zapytanie do tabeli `books` sprawdzające czy książka istnieje
   - Zwrócenie 404 jeśli książka nie została znaleziona
   - Cache book existence check dla performance

4. **Sanityzacja i walidacja contentu**
   - HTML tag stripping dla security (prevent XSS)
   - Normalizacja białych znaków (trim, collapse multiple spaces)
   - Final length validation po sanityzacji
   - Content profanity check (optional business rule)

5. **Tworzenie notatki w bazie danych**
   - INSERT do tabeli `notes` z auto-generated UUID
   - Automatyczne ustawienie created_at i updated_at
   - RLS automatycznie ustawi user_id based on auth context
   - Zwrócenie pełnego obiektu notatki z generated fields

6. **Cache invalidation**
   - Invalidation cache dla notes count dla tej książki
   - Invalidation cache dla book detail stats
   - Update materialized views if used for statistics

7. **Formatowanie odpowiedzi**
   - Mapowanie wyników do NoteResponseDTO
   - Zwrócenie 201 Created z Location header
   - Include created note data w response body

## 6. Względy bezpieczeństwa

**Uwierzytelnianie:**
- JWT token weryfikowany przez Supabase Auth
- Token przekazywany w nagłówku Authorization
- Automatyczne pobranie user_id z kontekstu sesji

**Autoryzacja:**
- Row Level Security (RLS) policy: `notes_insert USING (auth.uid() = user_id)`
- Automatyczne przypisanie user_id based on auth context
- Brak możliwości tworzenia notatek dla innych użytkowników
- Użytkownik może tworzyć notatki tylko dla dostępnych książek

**Walidacja i sanityzacja danych:**
- Walidacja UUID format dla parametru id
- HTML tag stripping w content dla prevent XSS
- Content length validation (max 10,000 chars)
- Trimming i normalizacja whitespace characters
- SQL injection prevention poprzez prepared statements

**Rate Limiting:**
- 60 create operations na godzinę per user
- 1000 general requests na godzinę per user
- Implementacja sliding window algorithm

**Content Security:**
- HTML sanitization dla prevent stored XSS
- Content validation dla malicious patterns
- Maximum content length enforcement
- Character encoding validation (UTF-8)

## 7. Obsługa błędów

**400 Bad Request:**
- Nieprawidłowy format UUID w parametrze id
- Pusty content lub content składający się tylko z whitespace
- Content przekraczający maksymalną długość (10,000 chars)
- Nieprawidłowy Content-Type header (nie application/json)
- Malformed JSON w request body

**401 Unauthorized:**
- Brak nagłówka Authorization
- Nieprawidłowy lub wygasły JWT token
- Token nie przeszedł weryfikacji Supabase Auth

**404 Not Found:**
- Książka o podanym ID nie istnieje w bazie danych
- Książka została usunięta

**429 Too Many Requests:**
- Przekroczenie rate limiting dla create operations
- Zbyt wiele żądań w sliding window

**500 Internal Server Error:**
- Błędy połączenia z bazą danych
- Błędy podczas INSERT operation
- Błędy podczas cache invalidation

**Struktura odpowiedzi błędu walidacji:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "field_errors": {
        "content": ["Content is required", "Content must be between 1 and 10,000 characters"]
      }
    }
  }
}
```

**Struktura odpowiedzi 404:**
```json
{
  "error": {
    "message": "Book not found",
    "code": "BOOK_NOT_FOUND",
    "details": {
      "book_id": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

## 8. Rozważania dotyczące wydajności

**Optymalizacje bazy danych:**
- Primary key lookup na `books.id` dla book existence check
- Auto-generated UUID dla notes.id zamiast sequential IDs
- Index na `notes(user_id, book_id)` dla RLS i user queries
- Index na `notes(book_id, created_at)` dla chronological sorting

**Cache considerations:**
- Invalidate notes count cache dla affected book
- Invalidate book detail cache if includes notes statistics
- Cache book existence checks dla frequently referenced books
- Consider write-through cache dla recent notes

**Content processing:**
- Asynchronous content analysis dla spam/abuse detection
- Batch processing dla content indexing if full-text search needed
- Efficient HTML sanitization libraries
- Content compression dla large notes storage

**Scalability:**
- Database sharding considerations dla high-volume note creation
- Async processing dla non-critical operations (analytics, search indexing)
- Connection pooling dla database efficiency
- Consider NoSQL dla very high-frequency note creation scenarios

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Tworzenie pliku route handler w `app/api/books/[id]/notes/route.ts`
- Konfiguracja połączenia z Supabase Client
- Import wymaganych typów z `lib/types.ts`

### Krok 2: Implementacja walidacji
- Stworzenie schematu walidacji `createNoteSchema` w `lib/validations/notes.schema.ts`
- Funkcja `validateCreateNote()` z content validation rules
- Walidacja UUID format dla parametru id
- HTML sanitization utilities w `lib/utils/sanitize.ts`

### Krok 3: Tworzenie NotesService
- Implementacja metody `createNote(createNoteData)` w `lib/services/notes.service.ts`
- Integration z existing BooksService dla book existence validation
- Content sanitization i normalization logic
- Error handling dla database constraints

### Krok 4: Book existence validation
- Rozszerzenie BooksService o `bookExists(bookId)` method
- Cache layer dla frequent book lookups
- Integration validation w NotesService workflow

### Krok 5: Implementacja route handler
- Funkcja `POST` w route.ts z request body parsing
- Content-Type validation (application/json)
- Uwierzytelnianie użytkownika i wywołanie NotesService
- Proper HTTP status codes (201 Created)

### Krok 6: Content sanitization i security
- HTML tag stripping implementation
- XSS prevention measures w content processing
- Content length validation after sanitization
- Character encoding validation (UTF-8)

### Krok 7: Database integration
- INSERT operation z proper error handling
- Auto-generated UUID i timestamps handling
- RLS policy verification dla user isolation
- Transaction handling dla data consistency

### Krok 8: Cache invalidation
- Cache invalidation logic dla affected book statistics
- Integration z existing cache infrastructure
- Performance monitoring dla cache hit/miss ratios

### Krok 9: Rate limiting implementation
- Rate limiting middleware dla create operations
- Sliding window algorithm implementation
- Proper 429 responses z retry headers
- Rate limit bypass dla admin users (if needed)

### Krok 10: Obsługa błędów i logging
- Comprehensive error handling dla wszystkich failure scenarios
- Structured logging dla debugging i monitoring
- Error correlation IDs dla tracking
- User-friendly error messages

### Krok 11: Testy jednostkowe
- Testy walidacji createNoteSchema z edge cases
- Testy NotesService.createNote() z różnymi scenarios
- Testy content sanitization functions
- Testy route handler z authentication i validation

### Krok 12: Testy integracyjne
- Testy z rzeczywistą bazą danych testową
- End-to-end scenariusze z uwierzytelnianiem
- Testy RLS policies (user isolation verification)
- Performance tests dla content processing

### Krok 13: Security testing
- XSS prevention verification z malicious content
- SQL injection testing z crafted inputs
- Rate limiting verification z load testing
- Content sanitization effectiveness testing

### Krok 14: Dokumentacja i deployment
- Aktualizacja dokumentacji API z request/response examples
- Dokumentacja content policies i validation rules
- Security guidelines dla content handling
- Deploy na środowisko produkcyjne z monitoringiem

### Krok 15: Production monitoring
- Implementacja metrics dla note creation volume
- Monitoring content processing performance
- Analytics dla user engagement z notes feature
- Alerting dla unusual creation patterns lub security events 