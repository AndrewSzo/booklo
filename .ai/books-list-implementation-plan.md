# API Endpoint Implementation Plan: GET /api/books

## 1. Przegląd punktu końcowego

Endpoint GET /api/books służy do pobierania listy książek użytkownika z możliwością filtrowania, wyszukiwania i paginacji. Jest to kluczowy endpoint aplikacji do zarządzania książkami, który zwraca dane z wielu tabel połączonych relacjami wraz ze statystykami i metadanymi.

**Główne funkcjonalności:**
- Pobieranie listy książek z informacjami o statusie czytania użytkownika
- Filtrowanie według statusu czytania (want_to_read, reading, finished)
- Wyszukiwanie pełnotekstowe w tytułach i autorach
- Filtrowanie według tagów
- Sortowanie według różnych kryteriów
- Paginacja wyników
- Zwracanie statystyk (oceny, liczba notatek)

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/books`
- **Parametry:**
  - **Opcjonalne:**
    - `status` (string): Filtrowanie według statusu (`want_to_read`, `reading`, `finished`)
    - `search` (string): Wyszukiwanie w tytule i autorze
    - `tags` (string): Filtrowanie według tagów (oddzielone przecinkami)
    - `page` (number): Numer strony dla paginacji (domyślnie: 1)
    - `limit` (number): Liczba elementów na stronę (domyślnie: 20, maksymalnie: 100)
    - `sort` (string): Pole sortowania (`title`, `author`, `created_at`, `rating`)
    - `order` (string): Kierunek sortowania (`asc`, `desc`, domyślnie: `asc`)
- **Request Body:** Brak (GET request)
- **Headers:** 
  - `Authorization: Bearer {jwt_token}` (wymagany)
  - `Content-Type: application/json`

## 3. Wykorzystywane typy

```typescript
// Input validation
interface BookQueryParams {
  status?: ReadingStatus
  search?: string
  tags?: string
  page?: number
  limit?: number
  sort?: SortField
  order?: SortOrder
}

// Response DTOs
interface BookListItemDTO {
  id: string
  title: string
  author: string
  isbn: string | null
  cover_url: string | null
  description: string | null
  created_at: string
  updated_at: string
  user_status: UserBookStatusDTO | null
  user_rating: number | null
  tags: string[]
  average_rating: number | null
  notes_count: number
}

interface BookListResponseDTO {
  data: BookListItemDTO[]
  pagination: PaginationDTO
}

interface UserBookStatusDTO {
  status: ReadingStatus
  started_at: string | null
  finished_at: string | null
}

interface PaginationDTO {
  page: number
  limit: number
  total: number
  total_pages: number
}
```

## 4. Szczegóły odpowiedzi

**Struktura odpowiedzi sukcesu (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Przykładowy tytuł",
      "author": "Przykładowy autor",
      "isbn": "978-0123456789",
      "cover_url": "https://example.com/cover.jpg",
      "description": "Opis książki...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user_status": {
        "status": "reading",
        "started_at": "2024-01-01T00:00:00Z",
        "finished_at": null
      },
      "user_rating": 4,
      "tags": ["fiction", "sci-fi"],
      "average_rating": 4.2,
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

**Kody statusu:**
- `200 OK`: Pomyślne pobranie listy książek
- `400 Bad Request`: Nieprawidłowe parametry zapytania
- `401 Unauthorized`: Brak autoryzacji lub nieprawidłowy token
- `500 Internal Server Error`: Błąd serwera

## 5. Przepływ danych

1. **Walidacja parametrów wejściowych**
   - Sprawdzenie poprawności parametrów query
   - Walidacja limitów paginacji
   - Sanityzacja parametru search

2. **Uwierzytelnianie użytkownika**
   - Weryfikacja JWT tokena przez Supabase Auth
   - Pobranie user_id z tokena

3. **Budowanie zapytania do bazy danych**
   - Główne zapytanie na tabelę `books`
   - LEFT JOIN z `book_statuses` dla statusu użytkownika
   - LEFT JOIN z `ratings` dla ocen użytkownika i średniej oceny
   - LEFT JOIN z `notes` dla liczby notatek
   - LEFT JOIN z `book_tags` i `tags` dla tagów

4. **Aplikowanie filtrów i sortowania**
   - Filtr według statusu czytania
   - Wyszukiwanie pełnotekstowe (GIN indexes)
   - Filtrowanie według tagów
   - Sortowanie według wybranego kryterium

5. **Paginacja**
   - Obliczenie OFFSET i LIMIT
   - Liczenie całkowitej liczby rekordów

6. **Formatowanie odpowiedzi**
   - Mapowanie wyników do DTO
   - Tworzenie metadanych paginacji

## 6. Względy bezpieczeństwa

**Uwierzytelnianie:**
- JWT token weryfikowany przez Supabase Auth
- Token przekazywany w nagłówku Authorization
- Automatyczne pobranie user_id z kontekstu uwierzytelniania

**Autoryzacja:**
- Row Level Security (RLS) policies na poziomie bazy danych
- Użytkownicy widzą tylko swoje statusy książek i oceny
- Publiczny dostęp do podstawowych informacji o książkach

**Walidacja danych:**
- Sanityzacja parametru search zapobiegająca SQL injection
- Walidacja wszystkich parametrów query
- Ograniczenia na limit paginacji (max 100)

**Rate Limiting:**
- 1000 zapytań na godzinę dla ogólnych endpointów
- 100 zapytań na godzinę dla endpointów z wyszukiwaniem
- Implementacja sliding window algorithm

**Nagłówki bezpieczeństwa:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 7. Obsługa błędów

**400 Bad Request:**
- Nieprawidłowe wartości parametrów query (np. invalid status)
- Limit paginacji przekraczający maksimum (100)
- Nieprawidłowe pole sortowania
- Nieprawidłowy kierunek sortowania

**401 Unauthorized:**
- Brak nagłówka Authorization
- Nieprawidłowy lub wygasły JWT token
- Token nie przeszedł weryfikacji Supabase Auth

**500 Internal Server Error:**
- Błędy połączenia z bazą danych
- Błędy w zapytaniach SQL
- Niespodziewane błędy serwera

**Struktura odpowiedzi błędu:**
```json
{
  "error": {
    "message": "Opis błędu",
    "code": "ERROR_CODE",
    "details": {
      "field_errors": {
        "limit": ["Must be between 1 and 100"]
      }
    }
  }
}
```

## 8. Rozważania dotyczące wydajności

**Optymalizacje bazy danych:**
- Wykorzystanie istniejących indeksów GIN dla wyszukiwania pełnotekstowego
- Indeksy na `book_statuses(user_id, status)` dla filtrowania
- Materialized views dla statystyk popularności książek

**Caching:**
- Możliwość implementacji cache'owania wyników wyszukiwania
- Cache dla popularnych tagów i filtrów

**Paginacja:**
- Ograniczenie domyślne do 20 elementów na stronę
- Maksimum 100 elementów na stronę
- Offset-based pagination dla prostoty

**Monitoring:**
- Śledzenie slow queries
- Monitoring użycia indeksów
- Metryki rate limiting

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Tworzenie pliku route handler w `app/api/books/route.ts`
- Konfiguracja połączenia z Supabase Client
- Import wymaganych typów z `lib/types.ts`

### Krok 2: Implementacja walidacji parametrów
- Stworzenie funkcji walidującej `BookQueryParams`
- Implementacja sanityzacji parametru search
- Walidacja limitów i wartości enum

### Krok 3: Tworzenie BooksService
- Implementacja klasy `BooksService` w `lib/services/books.service.ts`
- Metoda `getBooks()` z kompleksowym zapytaniem SQL
- Obsługa filtrowania, sortowania i paginacji

### Krok 4: Implementacja route handler
- Funkcja `GET` w route.ts
- Uwierzytelnianie użytkownika przez Supabase Auth
- Wywołanie BooksService i formatowanie odpowiedzi

### Krok 5: Obsługa błędów
- Try-catch dla różnych typów błędów
- Mapowanie błędów na odpowiednie kody HTTP
- Strukturyzowane odpowiedzi błędów

### Krok 6: Testy jednostkowe
- Testy walidacji parametrów
- Testy BooksService z mock'owaną bazą danych
- Testy route handler z różnymi scenariuszami

### Krok 7: Testy integracyjne
- Testy z rzeczywistą bazą danych testową
- Scenariusze end-to-end z uwierzytelnianiem
- Testy wydajnościowe z dużymi zbiorami danych

### Krok 8: Dokumentacja i deployment
- Aktualizacja dokumentacji API
- Przegląd kodu i merge do main branch
- Deploy na środowisko produkcyjne z monitoringiem

### Krok 9: Monitoring i optymalizacja
- Implementacja logowania i metryk
- Monitoring wydajności zapytań
- Optymalizacja na podstawie rzeczywistego użycia 