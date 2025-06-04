# API Endpoint Implementation Plan: DELETE /api/notes/{id}

## 1. Przegląd punktu końcowego

Endpoint DELETE /api/notes/{id} służy do trwałego usuwania notatki użytkownika. Ten endpoint umożliwia użytkownikom usuwanie własnych notatek z systemu, z zachowaniem najwyższych standardów bezpieczeństwa i audit trail dla compliance.

**Główne funkcjonalności:**
- Trwałe usuwanie notatki użytkownika z bazy danych
- Walidacja właściciela notatki (tylko autor może usunąć)
- RLS security zapewniające izolację między użytkownikami
- Comprehensive audit logging przed usunięciem
- Cache invalidation dla related data
- Optional soft delete dla compliance requirements
- Prevention accidental deletion poprzez confirmation mechanisms

## 2. Szczegóły żądania

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/notes/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (string): UUID notatki w ścieżce URL
- **Request Body:** Brak (DELETE request)
- **Headers:** 
  - `Authorization: Bearer {jwt_token}` (wymagany)

## 3. Wykorzystywane typy

```typescript
// Path parameter validation
interface NoteParams {
  id: string // UUID
}

// Service types
interface DeleteNoteData {
  noteId: string
  userId: string
}

interface NoteForDeletion {
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
  content?: string // dla audit logging
}

interface DeletionAuditLog {
  noteId: string
  userId: string
  bookId: string
  deletedContent: string
  deletedAt: string
  ipAddress?: string
  userAgent?: string
}

// Error response types
interface ErrorResponseDTO {
  error: {
    message: string
    code?: string
    details?: Record<string, unknown>
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

**Struktura odpowiedzi sukcesu (204 No Content):**
- Brak response body
- Status code: 204 No Content
- Headers: standard security headers

**Kody statusu:**
- `204 No Content`: Pomyślne usunięcie notatki
- `400 Bad Request`: Nieprawidłowy format UUID
- `401 Unauthorized`: Brak autoryzacji lub nieprawidłowy token
- `403 Forbidden`: Użytkownik nie jest właścicielem notatki
- `404 Not Found`: Notatka o podanym ID nie istnieje
- `500 Internal Server Error`: Błąd serwera podczas usuwania

## 5. Przepływ danych

1. **Walidacja parametrów wejściowych**
   - Sprawdzenie czy parametr `id` jest prawidłowym UUID
   - Validation że to jest DELETE request bez body
   - Security headers validation

2. **Uwierzytelnianie użytkownika**
   - Weryfikacja JWT tokena przez Supabase Auth
   - Pobranie user_id z kontekstu uwierzytelniania
   - Sprawdzenie czy token nie wygasł

3. **Sprawdzenie istnienia i właściciela notatki**
   - Zapytanie do tabeli `notes` sprawdzające istnienie i ownership
   - Pobranie pełnych danych notatki dla audit logging
   - Zwrócenie 404 jeśli notatka nie istnieje
   - Zwrócenie 403 jeśli użytkownik nie jest właścicielem

4. **Pre-deletion audit logging**
   - Zapisanie pełnych danych notatki przed usunięciem
   - Logging user ID, timestamp, IP address, user agent
   - Content backup dla potential recovery
   - Related book information dla context

5. **Usuwanie notatki z bazy danych**
   - DELETE FROM `notes` WHERE id = ? AND user_id = ?
   - RLS automatycznie filtruje podle user_id dla additional security
   - Verification że exactly jedna rekord została usunięta
   - Alternative: soft delete z deleted_at timestamp

6. **Cache invalidation**
   - Invalidation cache dla book notes count
   - Invalidation cache dla user's recent notes
   - Update materialized views if used dla statistics

7. **Post-deletion cleanup**
   - Update search indexes if full-text search implemented
   - Cleanup related temporary data
   - Trigger analytics events dla user engagement tracking

8. **Response formatting**
   - Return 204 No Content z empty body
   - Include standard security headers
   - Log successful deletion dla monitoring

## 6. Względy bezpieczeństwa

**Uwierzytelnianie:**
- JWT token weryfikowany przez Supabase Auth
- Token przekazywany w nagłówku Authorization
- Automatyczne pobranie user_id z kontekstu sesji

**Autoryzacja:**
- Row Level Security (RLS) policy: `notes_delete USING (auth.uid() = user_id)`
- Explicit ownership check before delete operation
- Prevention usuwania notatek innych użytkowników
- Double verification: database query + RLS policy

**Audit Trail:**
- Comprehensive logging wszystkich delete operations
- Full note content backup przed usunięciem
- User identification, timestamps, IP addresses
- Immutable audit logs dla compliance

**Rate Limiting:**
- 30 delete operations na godzinę per user (lower than other operations)
- 1000 general requests na godzinę per user
- Implementacja sliding window algorithm

**Deletion Safety:**
- Optional confirmation mechanism (frontend responsibility)
- Pre-deletion data backup w audit logs
- Consider soft delete dla sensitive applications
- Irreversible operation warnings w documentation

**Security Monitoring:**
- Alert na unusual deletion patterns
- Monitor bulk deletion attempts
- Track deletion frequency per user
- Anomaly detection dla suspicious behavior

## 7. Obsługa błędów

**400 Bad Request:**
- Nieprawidłowy format UUID w parametrze id
- Request body present w DELETE request (should be empty)
- Invalid request headers

**401 Unauthorized:**
- Brak nagłówka Authorization
- Nieprawidłowy lub wygasły JWT token
- Token nie przeszedł weryfikacji Supabase Auth

**403 Forbidden:**
- Użytkownik nie jest właścicielem notatki
- Próba usunięcia notatki innego użytkownika
- RLS policy blocked the operation

**404 Not Found:**
- Notatka o podanym ID nie istnieje w bazie danych
- Notatka została już usunięta
- Note ID does not exist in user's scope

**500 Internal Server Error:**
- Błędy połączenia z bazą danych
- Błędy podczas DELETE operation
- Błędy podczas audit logging
- Cache invalidation failures

**Struktura odpowiedzi 403 Forbidden:**
```json
{
  "error": {
    "message": "Access denied",
    "code": "FORBIDDEN",
    "details": {
      "note_id": "550e8400-e29b-41d4-a716-446655440000",
      "reason": "You can only delete your own notes"
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
- Single DELETE query z proper WHERE clause
- Consider bulk deletion optimization dla future bulk operations

**Cache considerations:**
- Invalidate related caches efficiently
- Update book notes count immediately
- Consider cache warming dla frequently accessed data
- TTL-based cache dla ownership verification

**Audit logging optimization:**
- Asynchronous audit logging dla performance
- Batch audit log writes dla high-volume deletions
- Efficient serialization of note data dla logging
- Compressed storage dla audit logs

**Scalability:**
- Database connection pooling dla concurrent deletions
- Consider soft delete dla high-volume applications
- Async processing dla non-critical post-deletion tasks
- Monitoring deletion patterns dla capacity planning

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Tworzenie pliku route handler w `app/api/notes/[id]/route.ts`
- Konfiguracja połączenia z Supabase Client
- Import wymaganych typów z `lib/types.ts`

### Krok 2: Implementacja walidacji
- Walidacja UUID format dla parametru id
- Verification że request nie ma body
- Security headers validation

### Krok 3: Rozszerzenie NotesService
- Implementacja metody `deleteNote(deleteNoteData)` w `lib/services/notes.service.ts`
- Metoda `getNoteForDeletion(noteId, userId)` dla audit purposes
- Error handling dla ownership and database constraints

### Krok 4: Note ownership validation
- Reuse ownership check z update endpoint
- Enhanced version z content retrieval dla audit
- Efficient database query dla note existence + ownership + content

### Krok 5: Audit logging system
- Implementacja audit logging service w `lib/services/audit.service.ts`
- Pre-deletion data capture i storage
- Structured logging dla compliance requirements
- Integration z existing logging infrastructure

### Krok 6: Implementacja route handler
- Funkcja `DELETE` w route.ts bez request body parsing
- Uwierzytelnianie użytkownika i ownership validation
- Proper HTTP status codes (204 No Content, 403 Forbidden)

### Krok 7: Database integration
- DELETE operation z proper error handling
- RLS policy verification dla user isolation
- Transaction handling dla data consistency
- Verification deletion success (affected rows count)

### Krok 8: Cache invalidation
- Cache invalidation logic dla affected data
- Update book statistics (notes count)
- Integration z existing cache infrastructure
- Performance monitoring dla cache operations

### Krok 9: Security enhancements
- Rate limiting implementation dla delete operations
- Security monitoring i alerting setup
- Anomaly detection dla unusual deletion patterns
- Enhanced logging dla security events

### Krok 10: Soft delete option (optional)
- Alternative implementation z soft delete
- Deleted_at timestamp management
- Cleanup job dla permanent deletion after retention period
- Recovery mechanisms dla accidentally deleted notes

### Krok 11: Rate limiting implementation
- Stricter rate limiting dla delete operations (30/hour)
- Different sliding windows dla different operation types
- Proper 429 responses z retry headers
- Bypass mechanisms dla administrative operations

### Krok 12: Obsługa błędów i monitoring
- Comprehensive error handling dla wszystkich scenarios
- Enhanced monitoring dla deletion patterns
- Alerting dla suspicious deletion activity
- User-friendly error messages

### Krok 13: Testy jednostkowe
- Testy NotesService.deleteNote() z różnymi scenarios
- Testy ownership check i authorization
- Testy audit logging functionality
- Testy route handler z authentication i authorization

### Krok 14: Testy integracyjne
- Testy z rzeczywistą bazą danych testową
- End-to-end scenariusze z uwierzytelnianiem
- Testy RLS policies (user isolation verification)
- Performance tests dla deletion operations

### Krok 15: Security testing
- Authorization bypass testing
- Bulk deletion attack testing
- Rate limiting verification
- Audit logging verification

### Krok 16: Compliance testing
- Audit trail verification
- Data retention policy testing
- Recovery procedure testing (if soft delete)
- GDPR compliance verification

### Krok 17: Dokumentacja i deployment
- Aktualizacja dokumentacji API z deletion policies
- Security guidelines dla deletion operations
- Compliance documentation dla audit requirements
- Deploy na środowisko produkcyjne z enhanced monitoring

### Krok 18: Production monitoring
- Implementacja metrics dla deletion volume i patterns
- Monitoring authorization failures i security events
- Analytics dla user engagement z deletion feature
- Alerting dla unusual deletion patterns i security violations 