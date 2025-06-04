# API Endpoint Implementation Plan: DELETE /api/books/{id}

## 1. Przegląd punktu końcowego

Endpoint DELETE /api/books/{id} służy do permanentnego usunięcia książki z systemu. Ten endpoint pozwala tylko twórcy książki na usunięcie wraz z wszystkimi powiązanymi danymi (statusy, oceny, notatki, tagi). Jest to nieodwracalna operacja wymagająca specjalnej ostrożności.

**Główne funkcjonalności:**
- Permanentne usunięcie książki i wszystkich powiązanych danych
- Sprawdzenie uprawnień użytkownika (tylko twórca może usunąć)
- Kaskadowe usuwanie danych z tabel: book_statuses, ratings, notes, book_tags
- Audit logging operacji usunięcia dla celów bezpieczeństwa
- Invalidacja cache i materialized views zawierających dane książki
- Zwrócenie pustej odpowiedzi 204 No Content

## 2. Szczegóły żądania

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/books/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (string): UUID książki w ścieżce URL
  - **Opcjonalne:** Brak
- **Request Body:** Brak (DELETE request)
- **Headers:** 
  - `Authorization: Bearer {jwt_token}` (wymagany)

## 3. Wykorzystywane typy

```typescript
// Path parameter validation
interface BookDeleteParams {
  id: string // UUID
}

// Service response interface
interface DeleteBookResult {
  success: boolean
  bookId: string
  deletedRelatedData: {
    book_statuses: number
    ratings: number
    notes: number
    book_tags: number
  }
}

// Audit log entry
interface BookDeletionAuditLog {
  book_id: string
  book_title: string
  book_author: string
  deleted_by: string
  deleted_at: string
  related_data_count: {
    book_statuses: number
    ratings: number
    notes: number
    book_tags: number
  }
}

// Error response types
interface ErrorResponseDTO {
  error: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
}
```

## 4. Szczegóły odpowiedzi

**Struktura odpowiedzi sukcesu (204 No Content):**
- Brak body w odpowiedzi
- Tylko status code 204 i headers

**Kody statusu:**
- `204 No Content`: Pomyślne usunięcie książki
- `400 Bad Request`: Nieprawidłowy format UUID w parametrze ID
- `401 Unauthorized`: Brak autoryzacji lub nieprawidłowy token
- `403 Forbidden`: Użytkownik nie ma uprawnień do usunięcia tej książki
- `404 Not Found`: Książka o podanym ID nie istnieje
- `500 Internal Server Error`: Błąd serwera podczas operacji usuwania

## 5. Przepływ danych

1. **Walidacja parametrów wejściowych**
   - Sprawdzenie czy parametr `id` jest prawidłowym UUID
   - Wczesna walidacja formatu przed operacjami bazodanowymi

2. **Uwierzytelnianie użytkownika**
   - Weryfikacja JWT tokena przez Supabase Auth
   - Pobranie user_id z kontekstu uwierzytelniania

3. **Sprawdzenie istnienia i uprawnień**
   - Zapytanie do tabeli `books` sprawdzające istnienie i metadane
   - Weryfikacja czy current user_id == books.created_by
   - Pobranie metadanych do audit log (title, author)
   - Zwrócenie 404 jeśli książka nie istnieje, 403 jeśli brak uprawnień

4. **Pre-deletion audit logging**
   - Zliczenie powiązanych rekordów przed usunięciem
   - Stworzenie wpisu audit log z metadanymi książki
   - Zapisanie informacji o użytkowniku i czasie operacji

5. **Transakcyjne usuwanie danych**
   - START TRANSACTION
   - Usunięcie book_tags (ON DELETE CASCADE)
   - Usunięcie notes (ON DELETE CASCADE)
   - Usunięcie ratings (ON DELETE CASCADE)
   - Usunięcie book_statuses (ON DELETE CASCADE)
   - Usunięcie głównego rekordu books
   - COMMIT TRANSACTION

6. **Post-deletion cleanup**
   - Invalidacja cache związanego z książką
   - Refresh materialized views (user_reading_stats, book_popularity_stats)
   - Aktualizacja audit log z potwierdzeniem sukcesu

## 6. Względy bezpieczeństwa

**Uwierzytelnianie:**
- JWT token weryfikowany przez Supabase Auth
- Token przekazywany w nagłówku Authorization
- Automatyczne pobranie user_id z kontekstu sesji

**Autoryzacja:**
- Row Level Security (RLS) policy: `books_delete USING (auth.uid() = created_by)`
- Tylko twórca książki może ją usunąć
- Dodatkowe sprawdzenie uprawnień na poziomie aplikacji

**Audit Trail:**
- Kompletne logowanie operacji delete z metadanymi
- Zapisywanie informacji o użytkowniku, czasie i usuniętych danych
- Nieusuwalne logi dla celów compliance i forensics

**Rate Limiting:**
- 60 zapytań na godzinę dla operacji create/update/delete
- Specjalne ograniczenia dla operacji delete (niższy limit)
- Implementacja sliding window algorithm

**Data Protection:**
- Confirmation patterns w UI (nie na poziomie API)
- Nieodwracalność operacji - brak soft delete
- Walidacja critical dependencies przed usunięciem

## 7. Obsługa błędów

**400 Bad Request:**
- Nieprawidłowy format UUID w parametrze id
- Brakujący parametr id w ścieżce URL
- Parametr id nie spełnia wymagań formatu UUID v4

**401 Unauthorized:**
- Brak nagłówka Authorization
- Nieprawidłowy lub wygasły JWT token
- Token nie przeszedł weryfikacji Supabase Auth

**403 Forbidden:**
- Użytkownik nie jest twórcą książki (created_by != current user)
- Próba usunięcia książki przez nieautoryzowanego użytkownika
- RLS policy blocked the operation

**404 Not Found:**
- Książka o podanym ID nie istnieje w bazie danych
- Książka została wcześniej usunięta
- Invalid book ID reference

**500 Internal Server Error:**
- Błędy transakcji podczas cascading delete
- Błędy w operacjach na materialized views
- Database connection issues podczas commit
- Audit logging failures

**Struktura odpowiedzi błędu:**
```json
{
  "error": {
    "message": "Forbidden: You can only delete books you created",
    "code": "INSUFFICIENT_PERMISSIONS",
    "details": {
      "book_id": "uuid",
      "created_by": "other_user_id",
      "requested_by": "current_user_id"
    }
  }
}
```

## 8. Rozważania dotyczące wydajności

**Optymalizacje bazy danych:**
- Primary key lookup na `books.id` (bardzo szybki)
- Cascading deletes wykorzystują foreign key constraints
- Transakcyjna spójność zapewnia atomowość operacji

**Caching:**
- Invalidacja cache dla usuniętej książki
- Bulk invalidation dla user's book lists
- Cache invalidation dla search results zawierających książkę
- Refresh materialized views asynchronicznie

**Monitoring:**
- Śledzenie czasu wykonania delete operations
- Monitoring liczby usuniętych powiązanych rekordów
- Alerting dla failed delete transactions
- Metryki dla unauthorized delete attempts

**Materialized Views:**
- Automatyczny refresh views po delete operations
- Asynchroniczny refresh dla large datasets
- Monitoring impact na performance views

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Rozszerzenie istniejącego route handler `app/api/books/[id]/route.ts`
- Dodanie funkcji `DELETE` obok istniejących GET i PUT
- Import wymaganych typów z `lib/types.ts`

### Krok 2: Implementacja walidacji
- Reużycie istniejącej walidacji UUID z GET/PUT endpoints
- Walidacja uprawnień użytkownika
- Early validation przed operacjami bazodanowymi

### Krok 3: Rozszerzenie BooksService
- Dodanie metody `deleteBook(bookId: string, userId: string): Promise<DeleteBookResult>`
- Implementacja sprawdzania uprawnień i istnienia książki
- Transakcyjne usuwanie z obsługą rollback

### Krok 4: Implementacja audit logging
- Stworzenie AuditService dla logowania operacji delete
- Pre-deletion metadata collection
- Post-deletion confirmation logging

### Krok 5: Cache invalidation strategy
- Implementacja CacheService.invalidateBook(bookId)
- Bulk invalidation dla related data
- Asynchroniczny refresh materialized views

### Krok 6: Implementacja route handler
- Funkcja `DELETE` w route.ts
- Uwierzytelnianie użytkownika i walidacja uprawnień
- Wywołanie BooksService.deleteBook() i error handling

### Krok 7: Testy jednostkowe
- Testy BooksService.deleteBook() z mock'owaną bazą danych
- Testy authorization scenarios (owner vs non-owner)
- Testy error handling dla różnych failure modes

### Krok 8: Testy integracyjne
- Testy z rzeczywistą bazą danych testową
- Scenariusze end-to-end z cascading deletes
- Testy transakcyjności i rollback scenarios
- Performance tests dla large related datasets

### Krok 9: Security testing
- Testy unauthorized access attempts
- Verification audit log completeness
- Rate limiting tests dla delete operations
- RLS policy verification tests

### Krok 10: Dokumentacja i deployment
- Aktualizacja dokumentacji API z delete endpoint
- Dokumentacja audit logging i security considerations
- Deploy na środowisko produkcyjne z enhanced monitoring

### Krok 11: Production monitoring
- Implementacja detailed audit logging
- Monitoring delete operation frequency i patterns
- Alerting dla suspicious delete activities
- Performance monitoring dla cascading deletes
- Analytics dla materialized view refresh impact 