# API Endpoint Implementation Plan: PUT /api/books/{id}

## 1. Przegląd punktu końcowego

Endpoint PUT /api/books/{id} służy do aktualizacji podstawowych informacji o książce. Ten endpoint pozwala tylko twórcy książki na modyfikację metadanych książki, nie obejmuje aktualizacji statusu czytania, ocen czy tagów.

**Główne funkcjonalności:**
- Aktualizacja podstawowych metadanych książki (tytuł, autor, ISBN, okładka, opis)
- Sprawdzenie uprawnień użytkownika (tylko twórca może edytować)
- Walidacja danych wejściowych zgodnie z regułami biznesowymi
- Atomowa aktualizacja z automatycznym timestampem updated_at
- Zwracanie zaktualizowanych danych książki

## 2. Szczegóły żądania

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/books/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (string): UUID książki w ścieżce URL
  - **Opcjonalne:** Brak
- **Request Body:** JSON z opcjonalnymi polami do aktualizacji
- **Headers:** 
  - `Authorization: Bearer {jwt_token}` (wymagany)
  - `Content-Type: application/json` (wymagany)

**Struktura Request Body:**
```json
{
  "title": "string (optional, 1-255 characters)",
  "author": "string (optional, 1-255 characters)",
  "isbn": "string (optional, max 20 characters)",
  "cover_url": "string (optional, valid URL, max 500 characters)",
  "description": "string (optional, max 2000 characters)"
}
```

## 3. Wykorzystywane typy

```typescript
// Path parameter validation
interface BookUpdateParams {
  id: string // UUID
}

// Request body DTO
interface UpdateBookDTO {
  title?: string
  author?: string
  isbn?: string
  cover_url?: string
  description?: string
}

// Response DTO
interface UpdateBookResponseDTO {
  data: {
    id: string
    title: string
    author: string
    isbn: string | null
    cover_url: string | null
    description: string | null
    updated_at: string
  }
}

// Validation result type
interface ValidationResult {
  success: boolean
  data?: UpdateBookDTO
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
    "id": "uuid",
    "title": "Zaktualizowany tytuł",
    "author": "Zaktualizowany autor",
    "isbn": "978-0123456789",
    "cover_url": "https://example.com/new-cover.jpg",
    "description": "Zaktualizowany opis książki...",
    "updated_at": "2024-01-02T10:30:00Z"
  }
}
```

**Kody statusu:**
- `200 OK`: Pomyślna aktualizacja książki
- `400 Bad Request`: Nieprawidłowe dane wejściowe lub format UUID
- `401 Unauthorized`: Brak autoryzacji lub nieprawidłowy token
- `403 Forbidden`: Użytkownik nie ma uprawnień do edycji tej książki
- `404 Not Found`: Książka o podanym ID nie istnieje
- `500 Internal Server Error`: Błąd serwera lub bazy danych

## 5. Przepływ danych

1. **Walidacja parametrów wejściowych**
   - Sprawdzenie czy parametr `id` jest prawidłowym UUID
   - Parsowanie i walidacja JSON w request body
   - Walidacja opcjonalnych pól zgodnie z regułami biznesowymi

2. **Uwierzytelnianie użytkownika**
   - Weryfikacja JWT tokena przez Supabase Auth
   - Pobranie user_id z kontekstu uwierzytelniania

3. **Sprawdzenie istnienia i uprawnień**
   - Zapytanie do tabeli `books` sprawdzające istnienie księgi
   - Weryfikacja czy current user_id == books.created_by
   - Zwrócenie 404 jeśli książka nie istnieje, 403 jeśli brak uprawnień

4. **Walidacja i sanityzacja danych**
   - Trim i validacja długości wszystkich string fields
   - Walidacja formatu URL dla cover_url
   - Sprawdzenie constraintów biznesowych (np. unique title+author)

5. **Aktualizacja w bazie danych**
   - Przygotowanie UPDATE statement z RETURNING clause
   - Automatyczne ustawienie updated_at timestamp (przez trigger)
   - Transakcyjna aktualizacja zapewniająca spójność

6. **Formatowanie odpowiedzi**
   - Mapowanie zaktualizowanych danych do UpdateBookResponseDTO
   - Zwrócenie pełnych danych książki wraz z nowym timestamp

## 6. Względy bezpieczeństwa

**Uwierzytelnianie:**
- JWT token weryfikowany przez Supabase Auth
- Token przekazywany w nagłówku Authorization
- Automatyczne pobranie user_id z kontekstu sesji

**Autoryzacja:**
- Row Level Security (RLS) policy: `books_update USING (auth.uid() = created_by)`
- Tylko twórca książki może ją edytować
- Sprawdzenie uprawnień na poziomie aplikacji i bazy danych

**Walidacja danych:**
- Walidacja UUID format dla parametru id
- Sanityzacja i walidacja wszystkich pól request body
- Zapobieganie SQL injection poprzez prepared statements
- Walidacja długości i formatu wszystkich string fields

**Rate Limiting:**
- 60 zapytań na godzinę dla operacji create/update
- Implementacja sliding window algorithm

**Nagłówki bezpieczeństwa:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 7. Obsługa błędów

**400 Bad Request:**
- Nieprawidłowy format UUID w parametrze id
- Nieprawidłowy JSON w request body
- Błędy walidacji pól (zbyt długie stringi, nieprawidłowy URL)
- Pustе request body (brak pól do aktualizacji)
- Naruszenie unique constraint (title + author)

**401 Unauthorized:**
- Brak nagłówka Authorization
- Nieprawidłowy lub wygasły JWT token
- Token nie przeszedł weryfikacji Supabase Auth

**403 Forbidden:**
- Użytkownik nie jest twórcą książki (created_by != current user)
- Próba edycji książki przez nieautoryzowanego użytkownika

**404 Not Found:**
- Książka o podanym ID nie istnieje w bazie danych
- Książka została wcześniej usunięta

**500 Internal Server Error:**
- Błędy połączenia z bazą danych
- Błędy w zapytaniach UPDATE
- Niespodziewane błędy podczas walidacji lub mapowania danych

**Struktura odpowiedzi błędu:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "field_errors": {
        "title": ["Title must be between 1 and 255 characters"],
        "cover_url": ["Must be a valid URL"]
      }
    }
  }
}
```

## 8. Rozważania dotyczące wydajności

**Optymalizacje bazy danych:**
- Primary key lookup na `books.id` (bardzo szybki)
- Index na `books.created_by` dla sprawdzenia uprawnień
- RETURNING clause eliminuje potrzebę dodatkowego SELECT

**Caching:**
- Invalidation cache dla książki po aktualizacji
- Cache invalidation dla powiązanych danych (user's book lists)
- Krótki TTL cache dla sprawdzania uprawnień

**Walidacja:**
- Wczesna walidacja UUID i JSON przed zapytaniami do DB
- Lazy validation - tylko pola obecne w request body
- Batch validation dla wszystkich pól jednocześnie

**Monitoring:**
- Śledzenie czasu wykonania operacji UPDATE
- Monitoring częstotliwości błędów 403 (unauthorized attempts)
- Metryki dla walidacji i konfliktów unique constraints

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Tworzenie pliku route handler w `app/api/books/[id]/route.ts`
- Konfiguracja połączenia z Supabase Client
- Import wymaganych typów z `lib/types.ts`

### Krok 2: Implementacja walidacji
- Stworzenie schematu walidacji `updateBookSchema` w `lib/validations/book.schema.ts`
- Funkcja `validateUpdateBook()` z szczegółową walidacją pól
- Walidacja UUID format dla parametru id

### Krok 3: Rozszerzenie BooksService
- Dodanie metody `updateBook(bookId: string, userId: string, updateData: UpdateBookDTO)`
- Implementacja sprawdzania uprawnień i istnienia książki
- Query UPDATE z RETURNING clause i error handling

### Krok 4: Implementacja route handler
- Funkcja `PUT` w route.ts dla ścieżki dynamicznej [id]
- Parsowanie request body i walidacja danych
- Uwierzytelnianie użytkownika i wywołanie BooksService

### Krok 5: Obsługa błędów i autoryzacji
- Try-catch dla różnych typów błędów
- Specjalna obsługa przypadków 403 Forbidden i 404 Not Found
- Mapowanie błędów walidacji na structured error responses

### Krok 6: Testy jednostkowe
- Testy walidacji updateBookSchema z różnymi scenariuszami
- Testy BooksService.updateBook() z mock'owaną bazą danych
- Testy route handler z authorization scenarios

### Krok 7: Testy integracyjne
- Testy z rzeczywistą bazą danych testową
- Scenariusze end-to-end z uwierzytelnianiem i autoryzacją
- Testy edge cases (empty body, partial updates, constraint violations)

### Krok 8: Implementacja optymalizacji
- Cache invalidation strategies po aktualizacji
- Optymalizacja zapytań SQL z EXPLAIN ANALYZE
- Rate limiting implementation dla update operations

### Krok 9: Dokumentacja i deployment
- Aktualizacja dokumentacji API z przykładami request/response
- Dokumentacja reguł walidacji i autoryzacji
- Deploy na środowisko produkcyjne z monitoringiem

### Krok 10: Monitoring i bezpieczeństwo
- Implementacja audit logging dla update operations
- Monitoring attempted unauthorized updates (403 errors)
- Alerting dla suspicious update patterns
- Performance monitoring i optimization na podstawie real-world usage 