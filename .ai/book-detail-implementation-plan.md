# API Endpoint Implementation Plan: GET /api/books/{id}

## 1. Przegląd punktu końcowego

Endpoint GET /api/books/{id} służy do pobierania szczegółowych informacji o konkretnej książce. Ten endpoint jest używany do wyświetlania pojedynczej książki z wszystkimi powiązanymi danymi użytkownika oraz statystykami globalnymi.

**Główne funkcjonalności:**
- Pobieranie szczegółowych informacji o książce na podstawie ID
- Zwracanie statusu czytania użytkownika dla tej książki
- Uwzględnienie oceny użytkownika i średniej oceny globalnej
- Pokazanie wszystkich tagów przypisanych do książki
- Zwracanie liczby notatek użytkownika dla tej książki
- Pokazanie całkowitej liczby ocen (total_ratings)

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/books/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (string): UUID książki w ścieżce URL
  - **Opcjonalne:** Brak
- **Request Body:** Brak (GET request)
- **Headers:** 
  - `Authorization: Bearer {jwt_token}` (wymagany)
  - `Content-Type: application/json`

## 3. Wykorzystywane typy

```typescript
// Path parameter validation
interface BookDetailParams {
  id: string // UUID
}

// Response DTO
interface BookDetailDTO {
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
  total_ratings: number
  notes_count: number
}

interface BookDetailResponseDTO {
  data: BookDetailDTO
}

interface UserBookStatusDTO {
  status: ReadingStatus
  started_at: string | null
  finished_at: string | null
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
    "title": "Przykładowy tytuł",
    "author": "Przykładowy autor",
    "isbn": "978-0123456789",
    "cover_url": "https://example.com/cover.jpg",
    "description": "Szczegółowy opis książki...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user_status": {
      "status": "reading",
      "started_at": "2024-01-01T00:00:00Z",
      "finished_at": null
    },
    "user_rating": 4,
    "tags": ["fiction", "sci-fi", "dystopian"],
    "average_rating": 4.2,
    "total_ratings": 127,
    "notes_count": 5
  }
}
```

**Kody statusu:**
- `200 OK`: Pomyślne pobranie szczegółów książki
- `400 Bad Request`: Nieprawidłowy format UUID w parametrze ID
- `401 Unauthorized`: Brak autoryzacji lub nieprawidłowy token
- `404 Not Found`: Książka o podanym ID nie istnieje
- `500 Internal Server Error`: Błąd serwera

## 5. Przepływ danych

1. **Walidacja parametrów wejściowych**
   - Sprawdzenie czy parametr `id` jest prawidłowym UUID
   - Walidacja formatu ID zgodnie ze specyfikacją bazy danych

2. **Uwierzytelnianie użytkownika**
   - Weryfikacja JWT tokena przez Supabase Auth
   - Pobranie user_id z kontekstu uwierzytelniania

3. **Sprawdzenie istnienia książki**
   - Zapytanie do tabeli `books` w celu sprawdzenia czy książka istnieje
   - Zwrócenie 404 jeśli książka nie została znaleziona

4. **Budowanie kompleksowego zapytania**
   - Główne zapytanie na tabelę `books` z filtrem WHERE id = $1
   - LEFT JOIN z `book_statuses` dla statusu użytkownika (user_id = current user)
   - LEFT JOIN z `ratings` dla oceny użytkownika i obliczenia średniej
   - LEFT JOIN z `notes` dla liczenia notatek użytkownika
   - JOIN z `book_tags` i `tags` dla pobrania wszystkich tagów

5. **Agregacja danych statystycznych**
   - Obliczenie średniej oceny (average_rating) ze wszystkich ocen
   - Zliczenie całkowitej liczby ocen (total_ratings)
   - Zliczenie notatek użytkownika (notes_count)

6. **Formatowanie odpowiedzi**
   - Mapowanie wyników do BookDetailDTO
   - Zastąpienie null wartościami domyślnymi gdzie to odpowiednie

## 6. Względy bezpieczeństwa

**Uwierzytelnianie:**
- JWT token weryfikowany przez Supabase Auth
- Token przekazywany w nagłówku Authorization
- Automatyczne pobranie user_id z kontekstu sesji

**Autoryzacja:**
- Row Level Security (RLS) policies na poziomie bazy danych
- Publiczny dostęp do podstawowych informacji o książkach
- Użytkownik widzi tylko swoje statusy i oceny
- Brak ograniczeń na oglądanie książek stworzonych przez innych użytkowników

**Walidacja danych:**
- Walidacja UUID format dla parametru id
- Zapobieganie SQL injection poprzez użycie prepared statements
- Sanityzacja wszystkich danych wyjściowych

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
- Brakujący parametr id w ścieżce URL
- Parametr id nie spełnia wymagań formatu

**401 Unauthorized:**
- Brak nagłówka Authorization
- Nieprawidłowy lub wygasły JWT token
- Token nie przeszedł weryfikacji Supabase Auth

**404 Not Found:**
- Książka o podanym ID nie istnieje w bazie danych
- Książka została usunięta

**500 Internal Server Error:**
- Błędy połączenia z bazą danych
- Błędy w kompleksowych zapytaniach SQL
- Niespodziewane błędy podczas agregacji danych

**Struktura odpowiedzi błędu:**
```json
{
  "error": {
    "message": "Opis błędu",
    "code": "ERROR_CODE",
    "details": {
      "book_id": "uuid",
      "field_errors": {
        "id": ["Must be a valid UUID format"]
      }
    }
  }
}
```

## 8. Rozważania dotyczące wydajności

**Optymalizacje bazy danych:**
- Primary key lookup na `books.id` (bardzo szybki)
- Wykorzystanie istniejących indeksów na foreign keys
- Optymalne JOIN'y z wykorzystaniem istniejących relacji

**Caching:**
- Możliwość implementacji cache'owania dla popularnych książek
- Cache dla tagów i statystyk globalnych (average_rating, total_ratings)
- Krótki TTL cache dla danych użytkownika (user_status, user_rating)

**Optymalizacja zapytań:**
- Użycie jednego kompleksowego zapytania zamiast wielu oddzielnych
- Subqueries dla agregacji statystyk
- Efektywne LEFT JOIN'y dla opcjonalnych danych

**Monitoring:**
- Śledzenie czasu wykonania zapytań
- Monitoring cache hit/miss ratio
- Metryki dla 404 errors (frequent missing books)

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Tworzenie pliku route handler w `app/api/books/[id]/route.ts`
- Konfiguracja połączenia z Supabase Client
- Import wymaganych typów z `lib/types.ts`

### Krok 2: Implementacja walidacji parametrów
- Stworzenie funkcji walidującej UUID format
- Implementacja parsowania parametru id z URL
- Walidacja poprawności formatu UUID

### Krok 3: Rozszerzenie BooksService
- Dodanie metody `getBookDetail(bookId: string, userId: string)` do BooksService
- Implementacja kompleksowego zapytania SQL z JOIN'ami
- Obsługa agregacji statystyk (average_rating, total_ratings, notes_count)

### Krok 4: Implementacja route handler
- Funkcja `GET` w route.ts dla ścieżki dynamicznej [id]
- Uwierzytelnianie użytkownika przez Supabase Auth
- Walidacja parametru id i wywołanie BooksService

### Krok 5: Obsługa błędów
- Try-catch dla różnych typów błędów
- Specjalna obsługa przypadku 404 (book not found)
- Mapowanie błędów na odpowiednie kody HTTP i struktury odpowiedzi

### Krok 6: Testy jednostkowe
- Testy walidacji parametru UUID
- Testy BooksService.getBookDetail() z mock'owaną bazą danych
- Testy route handler z różnymi scenariuszami (sukces, błędy)

### Krok 7: Testy integracyjne
- Testy z rzeczywistą bazą danych testową
- Scenariusze end-to-end z uwierzytelnianiem
- Testy z różnymi stanami danych (z/bez statusu, ocen, tagów)
- Testy wydajnościowe dla kompleksowych zapytań

### Krok 8: Implementacja optymalizacji
- Dodanie cache'owania dla popularnych książek
- Optymalizacja zapytań SQL na podstawie EXPLAIN ANALYZE
- Implementacja monitoringu wydajności

### Krok 9: Dokumentacja i deployment
- Aktualizacja dokumentacji API z przykładami
- Przegląd kodu i testowanie manualne
- Deploy na środowisko produkcyjne z monitoringiem

### Krok 10: Monitoring i dalsze optymalizacje
- Implementacja logowania szczegółowych metryk
- Monitoring popularności endpointu i wzorców użycia
- Optymalizacja cache TTL na podstawie rzeczywistego użycia
- A/B testing dla różnych strategii cache'owania 