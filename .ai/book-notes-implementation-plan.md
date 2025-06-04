# API Endpoint Implementation Plan: GET /api/books/{id}/notes

## 1. Przegląd punktu końcowego

Endpoint GET /api/books/{id}/notes służy do pobierania wszystkich notatek użytkownika dla konkretnej książki. Ten endpoint umożliwia użytkownikom przeglądanie swoich prywatnych notatek i refleksji związanych z czytaniem konkretnej książki, z obsługą paginacji dla dużych ilości notatek.

**Główne funkcjonalności:**
- Pobieranie wszystkich notatek użytkownika dla konkretnej książki
- Paginacja wyników z konfigurowalnymi limitami
- RLS security zapewniające dostęp tylko do własnych notatek
- Sortowanie notatek według daty utworzenia (najnowsze pierwsze)
- Walidacja istnienia książki przed pobraniem notatek
- Full-text search capability w content notatek (opcjonalnie)

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/books/{id}/notes`
- **Parametry:**
  - **Wymagane:**
    - `id` (string): UUID książki w ścieżce URL
  - **Opcjonalne:**
    - `page` (number): Numer strony dla paginacji (domyślnie: 1)
    - `limit` (number): Liczba elementów na stronę (domyślnie: 10, maksymalnie: 50)
- **Request Body:** Brak (GET request)
- **Headers:** 
  - `Authorization: Bearer {jwt_token}` (wymagany)

## 3. Wykorzystywane typy

```typescript
// Path parameter validation
interface BookNotesParams {
  id: string // UUID
}

// Query parameters validation
interface NotesQueryParams {
  page?: number
  limit?: number
}

// Response DTOs
interface NoteItemDTO {
  id: string
  book_id: string
  content: string
  created_at: string
  updated_at: string
}

interface NotesListResponseDTO {
  data: NoteItemDTO[]
  pagination: PaginationDTO
}

interface PaginationDTO {
  page: number
  limit: number
  total: number
  total_pages: number
}

// Service types
interface NotesQueryOptions {
  bookId: string
  userId: string
  page: number
  limit: number
  orderBy?: 'created_at' | 'updated_at'
  orderDirection?: 'asc' | 'desc'
}

interface NotesQueryResult {
  notes: NoteItemDTO[]
  totalCount: number
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
  "data": [
    {
      "id": "uuid",
      "book_id": "uuid",
      "content": "Świetna książka! Szczególnie podobał mi się rozdział o...",
      "created_at": "2024-01-02T10:30:00Z",
      "updated_at": "2024-01-02T15:45:00Z"
    },
    {
      "id": "uuid",
      "book_id": "uuid", 
      "content": "Interesujący punkt widzenia autora na temat...",
      "created_at": "2024-01-01T14:20:00Z",
      "updated_at": "2024-01-01T14:20:00Z"
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

**Kody statusu:**
- `200 OK`: Pomyślne pobranie listy notatek (może być pusta lista)
- `400 Bad Request`: Nieprawidłowy format UUID lub parametry paginacji
- `401 Unauthorized`: Brak autoryzacji lub nieprawidłowy token
- `404 Not Found`: Książka o podanym ID nie istnieje
- `500 Internal Server Error`: Błąd serwera

## 5. Przepływ danych

1. **Walidacja parametrów wejściowych**
   - Sprawdzenie czy parametr `id` jest prawidłowym UUID
   - Walidacja parametrów query (page >= 1, limit 1-50)
   - Ustawienie wartości domyślnych dla opcjonalnych parametrów

2. **Uwierzytelnianie użytkownika**
   - Weryfikacja JWT tokena przez Supabase Auth
   - Pobranie user_id z kontekstu uwierzytelniania

3. **Sprawdzenie istnienia książki**
   - Zapytanie do tabeli `books` sprawdzające czy książka istnieje
   - Zwrócenie 404 jeśli książka nie została znaleziona
   - Cache book existence check dla performance

4. **Budowanie zapytania do notatek**
   - Query do tabeli `notes` z filtrem book_id i user_id
   - Aplikowanie paginacji (LIMIT, OFFSET)
   - Sortowanie według created_at DESC (najnowsze pierwsze)
   - RLS automatycznie filtruje tylko notatki aktualnego użytkownika

5. **Liczenie całkowitej liczby notatek**
   - Osobne zapytanie COUNT(*) dla metadanych paginacji
   - Filtrowanie według tych samych kryteriów co główne zapytanie
   - Cache total count dla short TTL performance

6. **Formatowanie odpowiedzi**
   - Mapowanie wyników do NoteItemDTO[]
   - Obliczenie total_pages na podstawie total i limit
   - Tworzenie metadanych paginacji
   - Zwrócenie pustej listy jeśli brak notatek

## 6. Względy bezpieczeństwa

**Uwierzytelnianie:**
- JWT token weryfikowany przez Supabase Auth
- Token przekazywany w nagłówku Authorization
- Automatyczne pobranie user_id z kontekstu sesji

**Autoryzacja:**
- Row Level Security (RLS) policy: `notes_select USING (auth.uid() = user_id)`
- Użytkownicy widzą tylko swoje notatki
- Automatyczne filtrowanie notatek innych użytkowników
- Brak możliwości dostępu do notatek innych użytkowników

**Walidacja danych:**
- Walidacja UUID format dla parametru id
- Walidacja zakresów dla parametrów paginacji
- Zapobieganie SQL injection poprzez prepared statements
- Sanityzacja wszystkich parametrów query

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
- Parametry paginacji poza dozwolonymi zakresami (page < 1, limit > 50)
- Nieprawidłowe typy parametrów query (non-numeric page/limit)

**401 Unauthorized:**
- Brak nagłówka Authorization
- Nieprawidłowy lub wygasły JWT token
- Token nie przeszedł weryfikacji Supabase Auth

**404 Not Found:**
- Książka o podanym ID nie istnieje w bazie danych
- Książka została usunięta

**500 Internal Server Error:**
- Błędy połączenia z bazą danych
- Błędy w zapytaniach SELECT lub COUNT
- Błędy podczas obliczania metadanych paginacji

**Struktura odpowiedzi błędu:**
```json
{
  "error": {
    "message": "Book not found",
    "code": "BOOK_NOT_FOUND",
    "details": {
      "book_id": "uuid"
    }
  }
}
```

## 8. Rozważania dotyczące wydajności

**Optymalizacje bazy danych:**
- Primary key lookup na `books.id` dla book existence check
- Composite index na `notes(book_id, user_id, created_at)` dla efektywnego sortowania
- Index na `notes(user_id)` dla RLS performance
- Separate COUNT query z same filters dla pagination metadata

**Caching:**
- Cache book existence checks (short TTL)
- Cache total count dla stable datasets
- Cache first page of notes dla popular books
- Cache invalidation po dodaniu/edycji/usunięciu notatek

**Paginacja:**
- Limit maksymalny 50 elementów per page dla performance
- Domyślny limit 10 dla optimal UX
- Offset-based pagination dla simplicity
- Consider cursor-based pagination dla very large datasets

**Monitoring:**
- Śledzenie popularnych książek z dużą liczbą notatek
- Monitoring slow queries dla large note collections
- Metryki cache hit/miss ratio
- Analytics dla patterns użycia paginacji

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Tworzenie pliku route handler w `app/api/books/[id]/notes/route.ts`
- Konfiguracja połączenia z Supabase Client
- Import wymaganych typów z `lib/types.ts`

### Krok 2: Implementacja walidacji
- Stworzenie schematu walidacji `notesQuerySchema` w `lib/validations/notes.schema.ts`
- Funkcja `validateNotesQuery()` z page/limit validation
- Walidacja UUID format dla parametru id

### Krok 3: Tworzenie NotesService
- Implementacja klasy `NotesService` w `lib/services/notes.service.ts`
- Metoda `getBookNotes(bookId, userId, queryOptions)` z paginacją
- Metoda `countBookNotes(bookId, userId)` dla pagination metadata

### Krok 4: Book existence validation
- Dodanie book existence check do BooksService
- Cache layer dla popular book lookups
- Integration z NotesService dla validation

### Krok 5: Implementacja route handler
- Funkcja `GET` w route.ts
- Parsowanie query parameters i walidacja
- Uwierzytelnianie użytkownika i wywołanie NotesService

### Krok 6: Paginacja i sortowanie
- Implementacja pagination logic z proper LIMIT/OFFSET
- Default sorting by created_at DESC
- Calculation total_pages z total count

### Krok 7: Obsługa błędów
- Try-catch dla różnych typów błędów
- Specjalna obsługa 404 dla missing books
- Structured error responses z field-level details

### Krok 8: Cache implementation
- Cache layer dla book existence checks
- Cache strategy dla note counts
- Cache invalidation triggers

### Krok 9: Testy jednostkowe
- Testy walidacji notesQuerySchema
- Testy NotesService.getBookNotes() z różnymi scenarios
- Testy pagination edge cases (empty results, single page)
- Testy route handler z authentication

### Krok 10: Testy integracyjne
- Testy z rzeczywistą bazą danych testową
- Scenariusze end-to-end z uwierzytelnianiem
- Testy RLS policies (user isolation)
- Performance tests z large note collections

### Krok 11: Performance optimization
- Analyze query performance z EXPLAIN ANALYZE
- Optimize database indexes na podstawie query patterns
- Implement cache strategies na podstawie usage metrics

### Krok 12: Dokumentacja i deployment
- Aktualizacja dokumentacji API z pagination examples
- Dokumentacja caching strategies i performance considerations
- Deploy na środowisko produkcyjne z monitoringiem

### Krok 13: Production monitoring
- Implementacja metrics dla note collection sizes
- Monitoring cache performance i hit ratios
- Analytics dla user engagement z notes feature
- Alerting dla slow query performance 