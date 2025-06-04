# Plan Wdrożenia Endpointu API: POST /api/books

## 1. Przegląd punktu końcowego

Endpoint POST /api/books służy do tworzenia nowej książki w systemie wraz z opcjonalnym statusem czytania, oceną i tagami. Jest to kompleksowy endpoint, który może wykonywać operacje na wielu tabelach w ramach jednej transakcji.

**Główne funkcjonalności:**
- Tworzenie nowej książki w tabeli `books`
- Opcjonalne ustawienie statusu czytania w tabeli `book_statuses`
- Opcjonalne dodanie oceny w tabeli `ratings`
- Opcjonalne przypisanie tagów w tabeli `book_tags`

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/books`
- **Content-Type:** `application/json`
- **Uwierzytelnienie:** Wymagane (Supabase Auth)

### Parametry:

**Wymagane:**
- `title` (string) - Tytuł książki
- `author` (string) - Autor książki

**Opcjonalne:**
- `isbn` (string) - Numer ISBN
- `cover_url` (string) - URL okładki książki
- `description` (string) - Opis książki
- `status` (enum) - Status czytania: `want_to_read|reading|finished` (domyślnie: `want_to_read`)
- `rating` (number) - Ocena od 1 do 5
- `tags` (array) - Tablica nazw tagów (maksymalnie 3)

### Request Body:
```json
{
  "title": "string (required)",
  "author": "string (required)",
  "isbn": "string (optional)",
  "cover_url": "string (optional)",
  "description": "string (optional)",
  "status": "want_to_read|reading|finished (optional)",
  "rating": 1-5 (optional),
  "tags": ["tag1", "tag2"] (optional, max 3)
}
```

## 3. Wykorzystywane typy

### DTOs i Command Modele:
- `CreateBookDTO` - Input DTO dla tworzenia książki
- `BookResponseDTO` - Base response typu książki
- `CreateBookResponseDTO` - Wrapper response dla utworzonej książki
- `UpdateBookStatusDTO` - DTO dla statusu czytania
- `CreateRatingDTO` - DTO dla oceny
- `AddTagsToBookDTO` - DTO dla tagów

### Typy wewnętrzne:
```typescript
interface CreateBookRequest extends CreateBookDTO {
  // Rozszerzenie o dodatkowe pola walidacyjne
}

interface BookCreationResult {
  book: BookResponseDTO;
  status?: BookStatusResponseDTO;
  rating?: RatingResponseDTO;
  tags?: string[];
}
```

## 4. Szczegóły odpowiedzi

### Sukces (201 Created):
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

### Błędy:
- **400 Bad Request:** Nieprawidłowe dane wejściowe
- **401 Unauthorized:** Brak uwierzytelnienia
- **409 Conflict:** Duplikat książki (title + author)
- **500 Internal Server Error:** Błąd serwera

## 5. Przepływ danych

### Sekwencja operacji:
1. **Walidacja uwierzytelnienia** - Sprawdzenie auth.uid()
2. **Walidacja danych wejściowych** - Sprawdzenie wymaganych pól i formatów
3. **Sprawdzenie duplikatu** - Weryfikacja unique constraint (title + author)
4. **Rozpoczęcie transakcji bazy danych**
5. **Utworzenie książki** - Insert do tabeli `books`
6. **Utworzenie statusu** (jeśli podano) - Insert do tabeli `book_statuses`
7. **Utworzenie oceny** (jeśli podano) - Insert do tabeli `ratings`
8. **Obsługa tagów** (jeśli podano):
   - Sprawdzenie istniejących tagów
   - Utworzenie nowych tagów w razie potrzeby
   - Połączenie książki z tagami w tabeli `book_tags`
9. **Zatwierdzenie transakcji**
10. **Zwrócenie odpowiedzi**

### Interakcje z bazą danych:
```sql
-- Główne operacje w transakcji
INSERT INTO books (title, author, isbn, cover_url, description, created_by)
INSERT INTO book_statuses (book_id, user_id, status, started_at, finished_at)
INSERT INTO ratings (book_id, user_id, rating)
INSERT INTO tags (name) -- jeśli nowe tagi
INSERT INTO book_tags (book_id, tag_id)
```

## 6. Względy bezpieczeństwa

### Uwierzytelnienie i autoryzacja:
- **Supabase Auth:** Wymagane uwierzytelnienie użytkownika
- **RLS Policies:** Automatyczne filtrowanie na poziomie bazy danych
- **User Context:** Użycie auth.uid() jako created_by i user_id

### Walidacja danych:
- **Input Sanitization:** Oczyszczanie stringów z potencjalnie niebezpiecznych znaków
- **Type Safety:** Wykorzystanie TypeScript dla bezpieczeństwa typów
- **Business Rules:** Walidacja reguł biznesowych (max 3 tagi, rating 1-5)

### Zabezpieczenia przed atakami:
- **SQL Injection:** Wykorzystanie Supabase client z prepared statements
- **Rate Limiting:** Implementacja na poziomie middleware
- **Data Validation:** Kompleksowa walidacja wszystkich pól wejściowych

## 7. Obsługa błędów

### Scenariusze błędów i obsługa:

**400 Bad Request:**
- Brak wymaganych pól (title, author)
- Nieprawidłowy format rating (poza zakresem 1-5)
- Nieprawidłowy status (nie w enum)
- Zbyt dużo tagów (>3)
- Nieprawidłowy format danych

**401 Unauthorized:**
- Brak tokenu uwierzytelnienia
- Nieprawidłowy token
- Token wygasł

**409 Conflict:**
- Duplikat książki (kombinacja title + author już istnieje)
- Constraint violation na poziomie bazy danych

**500 Internal Server Error:**
- Błędy połączenia z bazą danych
- Błędy transakcji
- Nieoczekiwane błędy systemu

### Struktura odpowiedzi błędu:
```json
{
  "error": {
    "message": "string",
    "code": "string",
    "details": {
      "field_errors": {
        "field_name": ["error_message"]
      }
    }
  }
}
```

## 8. Rozważania dotyczące wydajności

### Potencjalne wąskie gardła:
- **Sprawdzanie duplikatów:** Query na indeksie (title, author)
- **Transakcje bazodanowe:** Multiple table operations
- **Tag operations:** Potencjalne N+1 queries przy tworzeniu tagów

### Strategie optymalizacji:
- **Batch Operations:** Grupowanie operacji INSERT dla tagów
- **Index Usage:** Wykorzystanie istniejących indeksów dla search operations
- **Connection Pooling:** Efektywne zarządzanie połączeniami przez Supabase
- **Caching:** Cache popularnych tagów w Redis (future enhancement)

### Monitoring wydajności:
- **Query Performance:** Monitoring czasu wykonania queries
- **Transaction Duration:** Śledzenie długości transakcji
- **Error Rates:** Monitoring częstotliwości błędów

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie infrastruktury
- Utworzenie route handler w `app/api/books/route.ts`
- Konfiguracja middleware dla uwierzytelnienia
- Setup walidacji z wykorzystaniem Zod lub podobnej biblioteki

### Krok 2: Implementacja core business logic
- Utworzenie `BookService` z metodą `createBook`
- Implementacja walidacji biznesowej
- Obsługa sprawdzania duplikatów

### Krok 3: Implementacja operacji bazodanowych
- Setup transakcji Supabase
- Implementacja insertów do wszystkich potrzebnych tabel
- Obsługa foreign key relationships

### Krok 4: Implementacja obsługi tagów
- Service do zarządzania tagami
- Logika tworzenia nowych tagów
- Łączenie książek z tagami

### Krok 5: Implementacja obsługi błędów
- Comprehensive error handling
- Proper HTTP status codes
- Detailed error messages

### Krok 6: Testowanie
- Unit testy dla business logic
- Integration testy dla API endpoint
- Edge cases testing

### Krok 7: Dokumentacja i deployment
- Aktualizacja API documentation
- Deployment na środowisko testowe
- Performance testing

### Struktura plików:
```
app/
├── api/
│   └── books/
│       └── route.ts           # Main endpoint handler
├── lib/
│   ├── services/
│   │   └── book.service.ts    # Business logic
│   ├── validations/
│   │   └── book.schema.ts     # Input validation schemas
│   └── utils/
│       └── errors.ts          # Error handling utilities
└── types/
    └── api.ts                 # API-specific types
```

### Kolejność implementacji w kodzie:
1. **Route Handler Setup** - Basic struktura endpointu
2. **Input Validation** - Walidacja danych wejściowych
3. **Authentication Check** - Sprawdzenie uwierzytelnienia
4. **Book Creation Logic** - Core tworzenie książki
5. **Related Data Creation** - Status, rating, tags
6. **Error Handling** - Comprehensive obsługa błędów
7. **Response Formatting** - Proper response structure
8. **Testing** - Unit i integration tests
``` 