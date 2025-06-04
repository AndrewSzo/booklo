# API Endpoint Implementation Plan: PUT /api/books/{id}/status

## 1. Przegląd punktu końcowego

Endpoint PUT /api/books/{id}/status służy do aktualizacji statusu czytania książki przez użytkownika. Ten endpoint implementuje kluczową funkcjonalność aplikacji do zarządzania książkami, pozwalając użytkownikom śledzić postęp w czytaniu z automatycznym zarządzaniem timestampami.

**Główne funkcjonalności:**
- Aktualizacja statusu czytania (want_to_read, reading, finished)
- Automatyczne zarządzanie timestampami started_at i finished_at
- Upsert semantyka (create or update)
- Integracja z materialized views dla statystyk użytkownika
- Walidacja reguł biznesowych (timestampy nie mogą być w przyszłości)
- RLS security zapewniające dostęp tylko do własnych statusów

## 2. Szczegóły żądania

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/books/{id}/status`
- **Parametry:**
  - **Wymagane:**
    - `id` (string): UUID książki w ścieżce URL
  - **Opcjonalne:** Brak
- **Request Body:** JSON z wymaganym polem status i opcjonalnymi timestampami
- **Headers:** 
  - `Authorization: Bearer {jwt_token}` (wymagany)
  - `Content-Type: application/json` (wymagany)

**Struktura Request Body:**
```json
{
  "status": "want_to_read|reading|finished (required)",
  "started_at": "timestamp (optional, auto-set when status = 'reading')",
  "finished_at": "timestamp (optional, auto-set when status = 'finished')"
}
```

## 3. Wykorzystywane typy

```typescript
// Path parameter validation
interface BookStatusParams {
  id: string // UUID
}

// Request body DTO
interface UpdateBookStatusDTO {
  status: ReadingStatus
  started_at?: string
  finished_at?: string
}

// Response DTO
interface UpdateBookStatusResponseDTO {
  data: {
    book_id: string
    user_id: string
    status: ReadingStatus
    started_at: string | null
    finished_at: string | null
    updated_at: string
  }
}

// Business logic types
interface StatusTransition {
  from: ReadingStatus | null
  to: ReadingStatus
  shouldSetStartedAt: boolean
  shouldSetFinishedAt: boolean
  shouldClearFinishedAt: boolean
}

// Validation result type
interface StatusValidationResult {
  success: boolean
  data?: UpdateBookStatusDTO
  error?: {
    message: string
    code: string
    details: {
      field_errors: Record<string, string[]>
    }
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

**Struktura odpowiedzi sukcesu (200 OK):**
```json
{
  "data": {
    "book_id": "uuid",
    "user_id": "uuid",
    "status": "reading",
    "started_at": "2024-01-02T10:30:00Z",
    "finished_at": null,
    "updated_at": "2024-01-02T10:30:00Z"
  }
}
```

**Kody statusu:**
- `200 OK`: Pomyślna aktualizacja statusu (update istniejącego)
- `201 Created`: Utworzenie nowego statusu (pierwsza aktualizacja dla tej książki)
- `400 Bad Request`: Nieprawidłowe dane wejściowe, format UUID lub timestampy
- `401 Unauthorized`: Brak autoryzacji lub nieprawidłowy token
- `404 Not Found`: Książka o podanym ID nie istnieje
- `500 Internal Server Error`: Błąd serwera lub bazy danych

## 5. Przepływ danych

1. **Walidacja parametrów wejściowych**
   - Sprawdzenie czy parametr `id` jest prawidłowym UUID
   - Parsowanie i walidacja JSON w request body
   - Walidacja enum values dla status field
   - Walidacja formatów timestamp dla opcjonalnych pól

2. **Uwierzytelnianie użytkownika**
   - Weryfikacja JWT tokena przez Supabase Auth
   - Pobranie user_id z kontekstu uwierzytelniania

3. **Sprawdzenie istnienia książki**
   - Zapytanie do tabeli `books` sprawdzające czy książka istnieje
   - Zwrócenie 404 jeśli książka nie została znaleziona

4. **Pobranie aktualnego statusu**
   - Query do `book_statuses` dla (book_id, user_id)
   - Określenie czy to create vs update operation
   - Pobranie aktualnych timestampów dla porównania

5. **Aplikowanie reguł biznesowych**
   - Automatyczne ustawienie started_at przy zmianie na 'reading'
   - Automatyczne ustawienie finished_at przy zmianie na 'finished'
   - Czyszczenie finished_at przy zmianie z 'finished' na inne statusy
   - Walidacja że finished_at > started_at
   - Walidacja że timestampy nie są w przyszłości

6. **Upsert w bazie danych**
   - INSERT ... ON CONFLICT (book_id, user_id) DO UPDATE
   - Automatyczne ustawienie updated_at timestamp (przez trigger)
   - RETURNING clause dla pobrania zaktualizowanych danych

7. **Post-update operacje**
   - Refresh materialized view user_reading_stats
   - Invalidacja cache dla user's book lists
   - Formatowanie odpowiedzi do UpdateBookStatusResponseDTO

## 6. Względy bezpieczeństwa

**Uwierzytelnianie:**
- JWT token weryfikowany przez Supabase Auth
- Token przekazywany w nagłówku Authorization
- Automatyczne pobranie user_id z kontekstu sesji

**Autoryzacja:**
- Row Level Security (RLS) policies:
  - `book_statuses_insert WITH CHECK (auth.uid() = user_id)`
  - `book_statuses_update USING (auth.uid() = user_id)`
- Użytkownicy mogą tylko zarządzać swoimi statusami
- Brak dostępu do statusów innych użytkowników

**Walidacja danych:**
- Walidacja UUID format dla parametru id
- Enum validation dla status field
- Timestamp validation (format ISO 8601, not in future)
- Sanityzacja wszystkich danych wejściowych

**Rate Limiting:**
- 1000 zapytań na godzinę dla ogólnych endpointów
- Implementacja sliding window algorithm

**Nagłówki bezpieczeństwa:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 7. Obsługa błędów

**400 Bad Request:**
- Nieprawidłowy format UUID w parametrze id
- Nieprawidłowy JSON w request body
- Invalid status value (not in enum)
- Invalid timestamp format (not ISO 8601)
- Business rule violations (finished_at before started_at)
- Timestamp in future

**401 Unauthorized:**
- Brak nagłówka Authorization
- Nieprawidłowy lub wygasły JWT token
- Token nie przeszedł weryfikacji Supabase Auth

**404 Not Found:**
- Książka o podanym ID nie istnieje w bazie danych
- Książka została usunięta

**500 Internal Server Error:**
- Błędy połączenia z bazą danych
- Błędy w zapytaniach UPSERT
- Błędy podczas refresh materialized views
- Niespodziewane błędy podczas walidacji biznesowej

**Struktura odpowiedzi błędu:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "field_errors": {
        "status": ["Must be one of: want_to_read, reading, finished"],
        "finished_at": ["Cannot be before started_at", "Cannot be in the future"]
      }
    }
  }
}
```

## 8. Rozważania dotyczące wydajności

**Optymalizacje bazy danych:**
- Primary key lookup na `books.id` (bardzo szybki)
- Unique index na `book_statuses(book_id, user_id)` dla fast upsert
- UPSERT eliminuje potrzebę separate SELECT + INSERT/UPDATE

**Caching:**
- Cache invalidation dla user's book lists po zmianie statusu
- Cache invalidation dla dashboard statistics
- Krótki TTL cache dla book existence checks

**Materialized Views:**
- Selective refresh user_reading_stats tylko dla affected user
- Asynchroniczny refresh dla lepszej response time
- Monitoring impact refresh operations na overall performance

**Monitoring:**
- Śledzenie czasu wykonania upsert operations
- Monitoring częstotliwości status transitions
- Metryki dla business rule violations

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Tworzenie pliku route handler w `app/api/books/[id]/status/route.ts`
- Konfiguracja połączenia z Supabase Client
- Import wymaganych typów z `lib/types.ts`

### Krok 2: Implementacja walidacji
- Stworzenie schematu walidacji `updateBookStatusSchema` w `lib/validations/book-status.schema.ts`
- Funkcja `validateUpdateBookStatus()` z enum i timestamp validation
- Walidacja UUID format dla parametru id

### Krok 3: Implementacja business logic
- Stworzenie `BookStatusService` w `lib/services/book-status.service.ts`
- Metoda `updateBookStatus(bookId, userId, statusData)` z upsert logic
- Implementacja reading status workflow rules

### Krok 4: Timestamp management
- Funkcje helper dla automatycznego zarządzania timestampami
- `calculateTimestamps(currentStatus, newStatus, providedTimestamps)`
- Walidacja business rules (finished_at > started_at, no future dates)

### Krok 5: Implementacja route handler
- Funkcja `PUT` w route.ts
- Parsowanie request body i walidacja danych
- Uwierzytelnianie użytkownika i wywołanie BookStatusService

### Krok 6: Materialized views integration
- Implementacja `refreshUserStats(userId)` po status update
- Asynchroniczny refresh dla performance
- Error handling dla view refresh failures

### Krok 7: Obsługa błędów
- Try-catch dla różnych typów błędów
- Specjalna obsługa business rule violations
- Mapowanie błędów na structured error responses

### Krok 8: Testy jednostkowe
- Testy walidacji updateBookStatusSchema
- Testy BookStatusService z różnymi status transitions
- Testy business logic dla timestamp management
- Testy route handler z various scenarios

### Krok 9: Testy integracyjne
- Testy z rzeczywistą bazą danych testową
- Scenariusze end-to-end z uwierzytelnianiem
- Testy upsert behavior (create vs update)
- Testy materialized view refresh

### Krok 10: Performance testing
- Load testing dla concurrent status updates
- Performance tests dla materialized view refresh
- Testing impact na user reading statistics

### Krok 11: Dokumentacja i deployment
- Aktualizacja dokumentacji API z business rules
- Dokumentacja timestamp management logic
- Deploy na środowisko produkcyjne z monitoringiem

### Krok 12: Production monitoring
- Implementacja metrics dla status transitions
- Monitoring popular reading patterns
- Alerting dla business rule violations
- Analytics dla user engagement z reading statuses 