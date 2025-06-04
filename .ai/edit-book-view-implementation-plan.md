# Plan implementacji widoku edycji książki

## 1. Przegląd

Widok edycji książki umożliwia użytkownikom modyfikację wszystkich aspektów książki w ich bibliotece, w tym metadanych (tytuł, autor, ISBN, okładka, opis), statusu czytania (Want to Read, Reading Now, Finished), oceny (1-5 gwiazdek) oraz usuwanie książki. Widok implementowany jest jako modal overlay, który otwiera się po kliknięciu na książkę w bibliotece lub wynikach wyszukiwania.

## 2. Routing widoku

Widok implementowany jest jako modal overlay dostępny poprzez:
- **Główna ścieżka**: Brak dedykowanej ścieżki - modal overlay
- **Trigger**: Kliknięcie na BookCard w `/library`, `/search`, `/dashboard`
- **State management**: URL query parameter `?edit={bookId}` dla deep linking
- **Zamknięcie**: Usunięcie query parameter i powrót do poprzedniego widoku

## 3. Struktura komponentów

```
EditBookModal (główny kontener)
├── ModalHeader
│   ├── Title ("Edytuj książkę")
│   └── CloseButton
├── ModalBody
│   ├── BookEditForm
│   │   ├── BasicInfoSection
│   │   │   ├── TextInput (title)
│   │   │   ├── TextInput (author)
│   │   │   ├── TextInput (isbn)
│   │   │   ├── URLInput (cover_url)
│   │   │   └── TextArea (description)
│   │   ├── ReadingSection
│   │   │   ├── StatusSelector
│   │   │   └── RatingInput
│   │   └── FormErrors
│   └── LoadingSpinner (conditional)
├── ModalFooter
│   ├── ActionButtons
│   │   ├── DeleteButton
│   │   ├── CancelButton
│   │   └── SaveButton
│   └── DirtyIndicator
└── DeleteConfirmDialog (conditional)
```

## 4. Szczegóły komponentów

### EditBookModal
- **Opis**: Główny modal kontener zarządzający całym procesem edycji książki. Obsługuje ładowanie danych, zarządzanie stanem formularza, komunikację z API i nawigację.
- **Główne elementy**: Dialog overlay, header z tytułem i przyciskiem zamknięcia, body z formularzem, footer z akcjami
- **Obsługiwane interakcje**: 
  - Otwarcie/zamknięcie modala
  - Zapisywanie zmian (Ctrl+S)
  - Zamknięcie przez Escape
  - Kliknięcie outside to close
- **Obsługiwana walidacja**: 
  - Walidacja przed zapisaniem
  - Sprawdzenie czy formularz jest dirty przed zamknięciem
  - Potwierdzenie opuszczenia przy niezapisanych zmianach
- **Typy**: `EditBookModalProps`, `EditBookViewModel`, `FormErrors`
- **Propsy**: `bookId: string`, `isOpen: boolean`, `onClose: () => void`

### BookEditForm
- **Opis**: Główny formularz edycji zawierający wszystkie pola do modyfikacji metadanych książki. Zarządza walidacją pól i stanem formularza.
- **Główne elementy**: Form wrapper, sekcje grupujące pola, komponenty input, wyświetlanie błędów
- **Obsługiwane interakcje**:
  - Edycja tekstu w polach
  - Real-time walidacja
  - Submit przez Enter
  - Auto-save draft (opcjonalne)
- **Obsługiwana walidacja**:
  - title: wymagane, 1-255 znaków, trimmed
  - author: wymagane, 1-255 znaków, trimmed  
  - isbn: opcjonalne, max 20 znaków, format ISBN
  - cover_url: opcjonalne, valid URL, max 500 znaków
  - description: opcjonalne, max 2000 znaków
- **Typy**: `BookEditFormProps`, `UpdateBookDTO`, `FormErrors`
- **Propsy**: `initialData: BookDetailDTO`, `onSubmit: (data: UpdateBookDTO) => void`, `errors: FormErrors`, `isLoading: boolean`

### StatusSelector
- **Opis**: Dropdown pozwalający na wybór statusu czytania książki. Zarządza zmianą statusu i automatycznym ustawianiem dat rozpoczęcia/ukończenia.
- **Główne elementy**: Select dropdown z trzema opcjami, ikony statusów, labels
- **Obsługiwane interakcje**:
  - Wybór nowego statusu z dropdown
  - Keyboard navigation (arrow keys)
  - Auto-submit po zmianie
- **Obsługiwana walidacja**:
  - status: wymagane, jeden z: 'want_to_read', 'reading', 'finished'
  - Automatyczne ustawianie started_at przy 'reading'
  - Automatyczne ustawianie finished_at przy 'finished'
- **Typy**: `StatusSelectorProps`, `ReadingStatus`, `UpdateBookStatusDTO`
- **Propsy**: `currentStatus: ReadingStatus`, `onChange: (status: ReadingStatus) => void`, `isLoading: boolean`

### RatingInput
- **Opis**: Interaktywny komponent gwiazdek umożliwiający ustawienie i zmianę oceny książki. Obsługuje hover effects i accessibility.
- **Główne elementy**: 5 gwiazdek (clickable), hover effects, current rating display, clear rating button
- **Obsługiwane interakcje**:
  - Kliknięcie na gwiazdkę (ustawienie oceny)
  - Hover preview
  - Keyboard navigation (arrow keys)
  - Clear rating (Backspace)
- **Obsługiwana walidacja**:
  - rating: opcjonalne, liczba całkowita 1-5
  - Walidacja że rating nie jest null/undefined przy submit
- **Typy**: `RatingInputProps`, `CreateRatingDTO`
- **Propsy**: `currentRating: number | null`, `onChange: (rating: number | null) => void`, `isLoading: boolean`, `size?: 'sm' | 'md' | 'lg'`

### DeleteConfirmDialog
- **Opis**: Modal potwierdzenia usunięcia książki z ostrzeżeniem o trwałym charakterze operacji. Wyświetla informacje o danych, które zostaną usunięte.
- **Główne elementy**: Warning icon, confirmation message, book title/author, akcje (Cancel/Delete)
- **Obsługiwane interakcje**:
  - Potwierdzenie usunięcia
  - Anulowanie operacji
  - Zamknięcie przez Escape
- **Obsługiwana walidacja**:
  - Sprawdzenie uprawnień do usunięcia
  - Potwierdzenie przez wpisanie nazwy książki (opcjonalne dla dodatkowego bezpieczeństwa)
- **Typy**: `DeleteConfirmDialogProps`, `DeleteBookResult`
- **Propsy**: `isOpen: boolean`, `book: Pick<BookDetailDTO, 'title' | 'author'>`, `onConfirm: () => void`, `onCancel: () => void`, `isLoading: boolean`

### ActionButtons
- **Opis**: Sekcja przycisków akcji w footer modala. Zarządza stanem przycisków w zależności od loading state i dirty state formularza.
- **Główne elementy**: Delete button (destructive), Cancel button, Save button (primary)
- **Obsługiwane interakcje**:
  - Save (with loading state)
  - Cancel (with unsaved changes warning)
  - Delete (opens confirmation dialog)
- **Obsługiwana walidacja**:
  - Save button disabled gdy form invalid
  - Delete button disabled gdy user nie ma uprawnień
- **Typy**: `ActionButtonsProps`
- **Propsy**: `onSave: () => void`, `onCancel: () => void`, `onDelete: () => void`, `isLoading: boolean`, `isDirty: boolean`, `isValid: boolean`, `canDelete: boolean`

## 5. Typy

### Główne typy ViewModel

```typescript
interface EditBookViewModel {
  // Podstawowe metadane książki
  id: string
  title: string
  author: string
  isbn: string
  cover_url: string
  description: string
  
  // Status czytania i ocena
  status: ReadingStatus
  rating: number | null
  started_at: string | null
  finished_at: string | null
  
  // Stan formularza
  isLoading: boolean
  isDirty: boolean
  isValid: boolean
  canDelete: boolean
  
  // Błędy walidacji
  errors: FormErrors
  
  // Metadane
  created_at: string
  updated_at: string
}

interface FormErrors {
  title?: string[]
  author?: string[]
  isbn?: string[]
  cover_url?: string[]
  description?: string[]
  status?: string[]
  rating?: string[]
  general?: string[]
}

interface EditBookFormData {
  title: string
  author: string
  isbn: string
  cover_url: string
  description: string
}

interface EditBookState {
  formData: EditBookFormData
  status: ReadingStatus
  rating: number | null
  originalData: BookDetailDTO | null
  isLoading: boolean
  isDirty: boolean
  errors: FormErrors
}
```

### Component Props Types

```typescript
interface EditBookModalProps {
  bookId: string
  isOpen: boolean
  onClose: () => void
  onBookUpdated?: (book: BookDetailDTO) => void
  onBookDeleted?: (bookId: string) => void
}

interface BookEditFormProps {
  initialData: EditBookFormData
  onChange: (data: Partial<EditBookFormData>) => void
  errors: FormErrors
  isLoading: boolean
}

interface StatusSelectorProps {
  currentStatus: ReadingStatus
  onChange: (status: ReadingStatus) => void
  isLoading: boolean
  className?: string
}

interface RatingInputProps {
  currentRating: number | null
  onChange: (rating: number | null) => void
  isLoading: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

interface DeleteConfirmDialogProps {
  isOpen: boolean
  book: Pick<BookDetailDTO, 'title' | 'author'>
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}
```

## 6. Zarządzanie stanem

Zarządzanie stanem realizowane jest przez niestandardowy hook `useEditBook` który centralizuje całą logikę edycji:

```typescript
const useEditBook = (bookId: string) => {
  // Stan lokalny
  const [formData, setFormData] = useState<EditBookFormData>()
  const [status, setStatus] = useState<ReadingStatus>()
  const [rating, setRating] = useState<number | null>()
  const [errors, setErrors] = useState<FormErrors>({})
  const [isDirty, setIsDirty] = useState(false)
  
  // React Query hooks
  const { data: book, isLoading } = useQuery(['book', bookId], ...)
  const updateBookMutation = useMutation(updateBook)
  const updateStatusMutation = useMutation(updateBookStatus)
  const updateRatingMutation = useMutation(updateBookRating)
  const deleteBookMutation = useMutation(deleteBook)
  
  // Funkcje akcji
  const updateField = (field: string, value: any) => { ... }
  const saveChanges = async () => { ... }
  const deleteBook = async () => { ... }
  const resetForm = () => { ... }
  
  return {
    // Stan
    formData, status, rating, errors, isDirty, isLoading,
    // Akcje  
    updateField, saveChanges, deleteBook, resetForm,
    // Metadane
    canDelete: book?.created_by === currentUserId
  }
}
```

Hook zarządza:
- **Ładowanie danych książki** przez React Query
- **Stan formularza** z dirty tracking
- **Walidację** real-time i server-side
- **Mutacje API** z optimistic updates
- **Error handling** z retry logic
- **Cache invalidation** po zapisaniu/usunięciu

## 7. Integracja API

### Typy żądań i odpowiedzi

**Pobieranie danych książki:**
- **Request**: `GET /api/books/{id}`
- **Response**: `BookDetailResponseDTO`
- **Wykorzystanie**: Inicjalne załadowanie danych do formularza

**Aktualizacja metadanych:**
- **Request**: `PUT /api/books/{id}` z body typu `UpdateBookDTO`
- **Response**: `UpdateBookResponseDTO`
- **Wykorzystanie**: Zapisanie zmian w polach title, author, isbn, cover_url, description

**Aktualizacja statusu:**
- **Request**: `PUT /api/books/{id}/status` z body typu `UpdateBookStatusDTO`
- **Response**: `UpdateBookStatusResponseDTO`
- **Wykorzystanie**: Zmiana statusu czytania z automatycznym ustawianiem dat

**Aktualizacja oceny:**
- **Request**: `POST /api/books/{id}/rating` z body typu `CreateRatingDTO`
- **Response**: `CreateRatingResponseDTO`
- **Wykorzystanie**: Ustawienie/zmiana oceny książki

**Usunięcie książki:**
- **Request**: `DELETE /api/books/{id}`
- **Response**: `204 No Content`
- **Wykorzystanie**: Trwałe usunięcie książki i wszystkich powiązanych danych

### Strategia zapisywania

1. **Batch updates**: Grupowanie zmian metadanych w jednym wywołaniu PUT
2. **Separate endpoints**: Status i rating aktualizowane osobno dla lepszej granularności
3. **Optimistic updates**: Natychmiastowa aktualizacja UI z rollback przy błędzie
4. **Debounced auto-save**: Opcjonalne automatyczne zapisywanie po 2s bezczynności

## 8. Interakcje użytkownika

### Główne przepływy interakcji

**Otwieranie modala edycji:**
1. Użytkownik klika na BookCard w bibliotece/wyszukiwaniu
2. Modal EditBookModal otwiera się z loading state
3. Dane książki ładują się i wypełniają formularz
4. Użytkownik może rozpocząć edycję

**Edycja metadanych:**
1. Użytkownik modyfikuje pola tekstowe (title, author, isbn, cover_url, description)
2. Real-time walidacja sprawdza poprawność danych
3. Stan formularza zmienia się na "dirty"
4. Błędy walidacji wyświetlają się pod polami

**Zmiana statusu czytania:**
1. Użytkownik otwiera dropdown StatusSelector
2. Wybiera nowy status (Want to Read / Reading Now / Finished)
3. System automatycznie ustawia odpowiednie daty
4. Zmiana zapisuje się natychmiast z optimistic update

**Zmiana oceny:**
1. Użytkownik klika na gwiazdki w RatingInput
2. Hover effect pokazuje preview oceny
3. Kliknięcie ustawia ocenę i zapisuje natychmiast
4. Możliwość usunięcia oceny przez kliknięcie na aktualną gwiazdkę

**Zapisywanie zmian:**
1. Użytkownik klika przycisk "Save" lub używa Ctrl+S
2. Walidacja wszystkich pól przed zapisaniem
3. Wywołania API w odpowiedniej kolejności
4. Feedback o sukcesie/błędzie + zamknięcie modala

**Usuwanie książki:**
1. Użytkownik klika przycisk "Delete"
2. Otwiera się DeleteConfirmDialog z ostrzeżeniem
3. Użytkownik potwierdza usunięcie
4. Wywołanie DELETE API + zamknięcie modala + powrót do biblioteki

### Keyboard shortcuts
- **Ctrl+S**: Zapisanie zmian
- **Escape**: Zamknięcie modala (z ostrzeżeniem przy dirty state)
- **Tab**: Nawigacja między polami
- **Enter**: Submit formularza (jeśli wszystkie pola valid)

## 9. Warunki i walidacja

### Walidacja po stronie klienta

**Walidacja pól metadanych (BookEditForm):**
- `title`: Sprawdzenie długości 1-255 znaków, trimming, nie może być puste
- `author`: Sprawdzenie długości 1-255 znaków, trimming, nie może być puste
- `isbn`: Opcjonalne, sprawdzenie formatu ISBN-10/ISBN-13, max 20 znaków
- `cover_url`: Opcjonalne, walidacja URL format, max 500 znaków, sprawdzenie dostępności obrazu
- `description`: Opcjonalne, max 2000 znaków, trimming

**Walidacja statusu (StatusSelector):**
- Sprawdzenie czy wybrany status należy do enum ReadingStatus
- Automatyczna walidacja dat started_at/finished_at
- Logiczna walidacja: finished_at > started_at

**Walidacja oceny (RatingInput):**
- Sprawdzenie zakresu 1-5 (liczba całkowita)
- Sprawdzenie czy ocena nie jest null gdy wymagana

### Walidacja biznesowa

**Sprawdzenie uprawnień:**
- Weryfikacja czy current user jest twórcą książki (canDelete flag)
- Wyłączenie przycisku Delete jeśli brak uprawnień
- Komunikat o braku uprawnień przy próbie edycji

**Sprawdzenie stanu formularza:**
- isDirty flag sprawdza czy są niezapisane zmiany
- isValid flag sprawdza czy wszystkie pola przeszły walidację
- Blokada przycisku Save gdy formularz invalid

**Walidacja przed usunięciem:**
- Potwierdzenie przez DeleteConfirmDialog
- Sprawdzenie czy książka nadal istnieje
- Weryfikacja uprawnień przed wywołaniem API

### Wpływ na stan UI

- **Błędy walidacji**: Wyświetlanie czerwonych komunikatów pod polami, czerwone obramowanie
- **Loading states**: Wyłączenie przycisków i pól podczas zapisywania
- **Dirty state**: Żółta ikona przy nazwie modala, ostrzeżenie przed zamknięciem
- **Success feedback**: Zielony toast po zapisaniu, zamknięcie modala
- **Error feedback**: Czerwony toast z szczegółami błędu

## 10. Obsługa błędów

### Typy błędów i reakcja

**400 Bad Request (Błędy walidacji):**
- Parsing server validation errors do FormErrors
- Wyświetlenie błędów pod odpowiednimi polami
- Highlight pól z błędami
- Focus na pierwsze pole z błędem

**401 Unauthorized:**
- Redirect do strony logowania
- Zachowanie stanu formularza w localStorage (draft)
- Toast z informacją o wygaśnięciu sesji

**403 Forbidden:**
- Wyłączenie przycisków edycji
- Komunikat "Nie masz uprawnień do edycji tej książki"
- Możliwość tylko odczytu danych

**404 Not Found:**
- Komunikat "Książka nie została znaleziona"
- Automatyczne zamknięcie modala
- Przekierowanie do biblioteki

**409 Conflict (Duplicate book):**
- Komunikat "Książka o tym tytule i autorze już istnieje"
- Highlight pól title i author
- Sugestia sprawdzenia istniejących książek

**500 Internal Server Error:**
- Toast z ogólnym komunikatem błędu
- Przycisk "Spróbuj ponownie"
- Możliwość zapisania draft lokalnie

### Mechanizmy odzyskiwania

**Retry logic:**
- Automatyczne ponawianie żądań dla błędów 5xx
- Exponential backoff (1s, 2s, 4s)
- Maksymalnie 3 próby

**Optimistic updates rollback:**
- Przywrócenie poprzedniego stanu przy błędzie
- Wyświetlenie komunikatu o niepowodzeniu
- Możliwość ponownej próby

**Draft auto-save:**
- Zapisywanie stanu formularza w localStorage co 30s
- Przywrócenie draft przy ponownym otwarciu
- Czyszczenie draft po pomyślnym zapisaniu

**Network error handling:**
- Wykrywanie braku połączenia
- Queue żądań do wykonania po powrocie sieci
- Offline indicator w UI

## 11. Kroki implementacji

### Etap 1: Przygotowanie infrastruktury (1-2 dni)
1. **Utworzenie plików komponentów**: `EditBookModal.tsx`, `BookEditForm.tsx`, `StatusSelector.tsx`, `RatingInput.tsx`, `DeleteConfirmDialog.tsx`
2. **Definicja typów**: Dodanie typów `EditBookViewModel`, `FormErrors`, `EditBookState` do `lib/types.ts`
3. **Konfiguracja routingu**: Obsługa query parametru `?edit={bookId}` w layout
4. **Setup React Query**: Konfiguracja queries i mutations dla book endpoints

### Etap 2: Implementacja komponentów bazowych (2-3 dni)
5. **StatusSelector**: Dropdown z trzema opcjami, ikony statusów, keyboard navigation
6. **RatingInput**: Interaktywne gwiazdki, hover effects, accessibility
7. **DeleteConfirmDialog**: Modal potwierdzenia z ostrzeżeniami
8. **ActionButtons**: Sekcja przycisków z odpowiednimi stanami

### Etap 3: Główny formularz edycji (3-4 dni)
9. **BookEditForm**: Wszystkie pola input z walidacją real-time
10. **Walidacja**: Implementacja schematu walidacji z Zod
11. **Error handling**: Wyświetlanie błędów pod polami, styling
12. **Form state management**: Dirty tracking, auto-save draft

### Etap 4: Główny modal i orchestracja (2-3 dni)
13. **EditBookModal**: Layout modala, header, footer, zarządzanie stanem
14. **useEditBook hook**: Centralizacja logiki edycji, API calls
15. **Integracja komponentów**: Połączenie wszystkich części w całość
16. **Loading states**: Skeletony, spinnery, disabled states

### Etap 5: Integracja API (2-3 dni)
17. **API client methods**: Funkcje do wszystkich endpoint'ów
18. **React Query integration**: Queries, mutations, cache invalidation
19. **Optimistic updates**: Natychmiastowa aktualizacja UI
20. **Error mapping**: Mapowanie błędów API na UI states

### Etap 6: UX i accessibility (2-3 dni)
21. **Keyboard navigation**: Tab order, shortcuts, escape handling
22. **ARIA labels**: Screen reader support, proper labeling
23. **Focus management**: Auto-focus, trap focus w modalu
24. **Responsive design**: Mobile adaptacja, touch interactions

### Etap 7: Testy (3-4 dni)
25. **Unit testy**: Komponenty, hooki, utility functions
26. **Integration testy**: Przepływy użytkownika end-to-end
27. **Error scenarios**: Testowanie przypadków błędów
28. **Accessibility testy**: Automatyczne i manualne testy a11y

### Etap 8: Optymalizacja i dokumentacja (1-2 dni)
29. **Performance optimization**: Code splitting, lazy loading
30. **Bundle size analysis**: Sprawdzenie rozmiaru komponentów
31. **Dokumentacja**: JSDoc komentarze, README dla komponentów
32. **Code review**: Przegląd kodu i refaktoring

### Etap 9: Integracja z aplikacją (1-2 dni)
33. **Trigger integration**: Podłączenie do BookCard kliknięć
34. **Navigation updates**: Cache invalidation, state updates
35. **Toast notifications**: Komunikaty o sukcesie/błędzie
36. **Final testing**: Testy w kontekście całej aplikacji

### Etap 10: Deploy i monitoring (1 dzień)
37. **Staging deployment**: Deploy na środowisko testowe
38. **Production deployment**: Release na produkcję
39. **Monitoring setup**: Error tracking, performance metrics
40. **User feedback collection**: Mechanizm zbierania opinii użytkowników

**Szacowany czas całkowity**: 18-25 dni roboczych 