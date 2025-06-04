# API Endpoint Implementation Plan: PUT /api/notes/{id}

## 1. Przegląd punktu końcowego

Endpoint PUT /api/notes/{id} służy do aktualizacji contentu istniejącej notatki użytkownika. Ten endpoint umożliwia użytkownikom edycję własnych notatek i refleksji związanych z książkami, z zachowaniem bezpieczeństwa i izolacji danych między użytkownikami.

**Główne funkcjonalności:**
- Aktualizacja contentu istniejącej notatki użytkownika
- Walidacja właściciela notatki (tylko autor może edytować)
- Walidacja i sanityzacja nowego contentu
- RLS security zapewniające izolację notatek między użytkownikami
- Automatyczne ustawienie updated_at timestamp
- Content versioning dla audit trail (opcjonalnie)
- Cache invalidation dla related data

## 2. Szczegóły żądania

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/notes/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (string): UUID notatki w ścieżce URL
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
interface NoteParams {
  id: string // UUID
}

// Request body validation
interface UpdateNoteDTO {
  content: string // min 1 char, max 10,000 chars, trimmed
}

// Response DTOs
interface UpdateNoteResponseDTO {
  data: {
    id: string
    content: string
    updated_at: string
  }
}

// Service types
interface UpdateNoteData {
  noteId: string
  userId: string
  content: string
}

interface UpdatedNote {
  id: string
  book_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

interface NoteOwnershipCheck {
  noteId: string
  userId: string
  exists: boolean
  isOwner: boolean
  bookId?: string
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

interface AuthorizationErrorResponseDTO {
  error: {
    message: string
    code: 'FORBIDDEN'
    details: {
      note_id: string
      reason: string
    }
  }
}
```

## 4. Szczegóły odpowiedzi

**Struktura odpowiedzi sukcesu (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Zaktualizowana notatka z nowymi przemyśleniami o tej książce...",
    "updated_at": "2024-01-02T15:30:00Z"
  }
}
```

**Kody statusu:**
- `200 OK`: Pomyślne zaktualizowanie notatki
- `400 Bad Request`: Nieprawidłowy format UUID, pusty content lub zbyt długi content
- `401 Unauthorized`: Brak autoryzacji lub nieprawidłowy token
- `403 Forbidden`: Użytkownik nie jest właścicielem notatki
- `404 Not Found`: Notatka o podanym ID nie istnieje
- `500 Internal Server Error`: Błąd serwera podczas aktualizacji

## 5. Przepływ danych

1. **Walidacja parametrów wejściowych**
   - Sprawdzenie czy parametr `id` jest prawidłowym UUID
   - Walidacja request body (Content-Type: application/json)
   - Walidacja content: required, min 1 char, max 10,000 chars
   - Trimming content i wstępna sanityzacja

2. **Uwierzytelnianie użytkownika**
   - Weryfikacja JWT tokena przez Supabase Auth
   - Pobranie user_id z kontekstu uwierzytelniania
   - Sprawdzenie czy token nie wygasł

3. **Sprawdzenie istnienia i właściciela notatki**
   - Zapytanie do tabeli `notes` sprawdzające istnienie notatki
   - Weryfikacja czy notatka należy do aktualnego użytkownika
   - Zwrócenie 404 jeśli notatka nie istnieje
   - Zwrócenie 403 jeśli użytkownik nie jest właścicielem

4. **Sanityzacja i walidacja contentu**
   - HTML tag stripping dla security (prevent XSS)
   - Normalizacja białych znaków (trim, collapse multiple spaces)
   - Final length validation po sanityzacji
   - Content profanity check (optional business rule)

5. **Aktualizacja notatki w bazie danych**
   - UPDATE tabeli `notes` SET content, updated_at WHERE id AND user_id
   - RLS automatycznie filtruje podle user_id
   - Zwrócenie zaktualizowanego obiektu notatki
   - Optionally: save previous version dla audit trail

6. **Cache invalidation**
   - Invalidation cache dla book notes jeśli cached
   - Invalidation cache dla user's recent notes
   - Update search indexes if full-text search implemented

7. **Formatowanie odpowiedzi**
   - Mapowanie wyników do UpdateNoteResponseDTO
   - Zwrócenie tylko id, content, updated_at (security przez obscurity)
   - Include success metadata

## 6. Względy bezpieczeństwa

**Uwierzytelnianie:**
- JWT token weryfikowany przez Supabase Auth
- Token przekazywany w nagłówku Authorization
- Automatyczne pobranie user_id z kontekstu sesji

**Autoryzacja:**
- Row Level Security (RLS) policy: `notes_update USING (auth.uid() = user_id)`
- Explicit ownership check before update operation
- Prevention edit innych użytkowników notatek
- Double verification: database query + RLS policy

**Walidacja i sanityzacja danych:**
- Walidacja UUID format dla parametru id
- HTML tag stripping w content dla prevent XSS
- Content length validation (max 10,000 chars)
- Trimming i normalizacja whitespace characters
- SQL injection prevention poprzez prepared statements

**Rate Limiting:**
- 60 update operations na godzinę per user
- 1000 general requests na godzinę per user
- Implementacja sliding window algorithm

**Content Security:**
- HTML sanitization dla prevent stored XSS
- Content validation dla malicious patterns
- Maximum content length enforcement
- Character encoding validation (UTF-8)

**Audit Trail:**
- Logging wszystkich update operations z before/after content
- User ID, timestamp, IP address logging
- Optional: versioning sistema dla content history

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

**403 Forbidden:**
- Użytkownik nie jest właścicielem notatki
- Próba edycji notatki innego użytkownika
- RLS policy blocked the operation

**404 Not Found:**
- Notatka o podanym ID nie istnieje w bazie danych
- Notatka została usunięta
- Note ID does not exist in user's scope

**500 Internal Server Error:**
- Błędy połączenia z bazą danych
- Błędy podczas UPDATE operation
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

**Struktura odpowiedzi 403 Forbidden:**
```json
{
  "error": {
    "message": "Access denied",
    "code": "FORBIDDEN",
    "details": {
      "note_id": "550e8400-e29b-41d4-a716-446655440000",
      "reason": "You can only edit your own notes"
    }
  }
}
```

**Struktura odpowiedzi 404:**
```json
{
  "error": {
    "message": "Note not found",
    "code": "NOTE_NOT_FOUND",
    "details": {
      "note_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

## 8. Rozważania dotyczące wydajności

**Optymalizacje bazy danych:**
- Primary key lookup na `notes.id` dla note existence and ownership check
- Index na `notes(user_id, id)` dla efficient ownership verification
- Optimized UPDATE query z minimal column set
- Consider RETURNING clause dla single-query update and response

**Cache considerations:**
- Cache note existence and ownership dla frequent editors
- Invalidate related caches (book notes count, user's recent notes)
- Consider caching user's note IDs dla ownership checks
- TTL-based cache dla ownership verification

**Content processing:**
- Efficient HTML sanitization libraries
- Content diff calculation dla audit logging
- Asynchronous content analysis dla spam/abuse detection
- Content compression dla storage optimization

**Scalability:**
- Database connection pooling dla concurrent updates
- Optimistic locking dla concurrent edit prevention
- Consider eventual consistency dla non-critical cache updates
- Async processing dla audit logging and analytics

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Tworzenie pliku route handler w `app/api/notes/[id]/route.ts`
- Konfiguracja połączenia z Supabase Client
- Import wymaganych typów z `lib/types.ts`

### Krok 2: Implementacja walidacji
- Stworzenie schematu walidacji `updateNoteSchema` w `lib/validations/notes.schema.ts`
- Funkcja `validateUpdateNote()` z content validation rules
- Walidacja UUID format dla parametru id
- Reuse HTML sanitization utilities z create note endpoint

### Krok 3: Rozszerzenie NotesService
- Implementacja metody `updateNote(updateNoteData)` w `lib/services/notes.service.ts`
- Metoda `checkNoteOwnership(noteId, userId)` dla authorization
- Content sanitization i normalization logic
- Error handling dla ownership and database constraints

### Krok 4: Note ownership validation
- Implementacja ownership check w NotesService
- Efficient database query dla note existence + ownership
- Cache layer dla frequent ownership checks
- RLS policy verification

### Krok 5: Implementacja route handler
- Funkcja `PUT` w route.ts z request body parsing
- Content-Type validation (application/json)
- Uwierzytelnianie użytkownika i ownership validation
- Proper HTTP status codes (200 OK, 403 Forbidden)

### Krok 6: Content sanitization i security
- Reuse HTML tag stripping implementation
- XSS prevention measures w content processing
- Content length validation after sanitization
- Character encoding validation (UTF-8)

### Krok 7: Database integration
- UPDATE operation z proper error handling
- Auto-update updated_at timestamp
- RLS policy verification dla user isolation
- Transaction handling dla data consistency

### Krok 8: Cache invalidation
- Cache invalidation logic dla affected note and related data
- Integration z existing cache infrastructure
- Performance monitoring dla cache hit/miss ratios

### Krok 9: Audit logging implementation
- Logging system dla note updates z before/after content
- User identification, timestamps, IP addresses
- Optional: content versioning system
- Structured logs dla security monitoring

### Krok 10: Rate limiting implementation
- Rate limiting middleware dla update operations
- Sliding window algorithm implementation
- Proper 429 responses z retry headers
- Different limits dla different operation types

### Krok 11: Obsługa błędów i authorization
- Comprehensive error handling dla wszystkich failure scenarios
- Proper 403 Forbidden responses dla authorization failures
- Structured logging dla debugging i monitoring
- User-friendly error messages

### Krok 12: Testy jednostkowe
- Testy walidacji updateNoteSchema z edge cases
- Testy NotesService.updateNote() z różnymi scenarios
- Testy ownership check functions
- Testy route handler z authentication i authorization

### Krok 13: Testy integracyjne
- Testy z rzeczywistą bazą danych testową
- End-to-end scenariusze z uwierzytelnianiem i authorization
- Testy RLS policies (user isolation verification)
- Performance tests dla concurrent updates

### Krok 14: Security testing
- Authorization bypass testing
- XSS prevention verification z malicious content
- SQL injection testing z crafted inputs
- Rate limiting verification z load testing

### Krok 15: Dokumentacja i deployment
- Aktualizacja dokumentacji API z request/response examples
- Dokumentacja authorization rules i content policies
- Security guidelines dla note editing
- Deploy na środowisko produkcyjne z monitoringiem

### Krok 16: Production monitoring
- Implementacja metrics dla note update volume i patterns
- Monitoring authorization failures i security events
- Analytics dla user engagement z note editing feature
- Alerting dla unusual update patterns lub security violations 