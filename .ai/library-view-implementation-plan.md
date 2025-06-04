# Plan implementacji widoku Biblioteki

## 1. Przegląd
Widok Biblioteki (`LibraryView`) to główny komponent aplikacji do przeglądania i zarządzania kolekcją książek użytkownika. Pozwala na filtrowanie książek według statusu czytania (Want to Read, Reading Now, Finished), wyszukiwanie, paginację i wyświetlanie szczegółów książek w prawym sidebarze. Widok implementuje responsywny design z trzyklumnowym layoutem (lewy sidebar, główny obszar, prawy sidebar).

## 2. Routing widoku
- **Główna ścieżka**: `/library`
- **Ścieżka z parametrami**: `/library?status={reading_status}&search={query}&page={number}&tags={tag_names}`
- **Obsługiwane query parametry**:
  - `status`: `want_to_read` | `reading` | `finished` (opcjonalny)
  - `search`: string (opcjonalny)
  - `tags`: string (oddzielone przecinkami, opcjonalny)
  - `page`: number (domyślnie 1)
  - `limit`: number (domyślnie 20)
  - `sort`: `title` | `author` | `created_at` | `rating` (domyślnie `created_at`)
  - `order`: `asc` | `desc` (domyślnie `desc`)

## 3. Struktura komponentów
```
LibraryView
├── LibraryHeader
│   ├── FilterTabs
│   └── SearchBar
├── BooksGrid
│   ├── LoadingGrid (conditional)
│   ├── EmptyState (conditional)
│   └── BookCard[] (multiple)
└── LoadMoreButton (conditional)
```

## 4. Szczegóły komponentów

### LibraryView
- **Opis komponentu**: Główny kontener widoku biblioteki, zarządza stanem całego widoku i koordynuje komunikację między komponentami potomnymi
- **Główne elementy**: `<div>` z głównym layoutem, zawiera LibraryHeader, BooksGrid, LoadMoreButton i prawdopodobnie RightSidebar
- **Obsługiwane interakcje**: 
  - Zmiana filtrów (delegowane do FilterTabs)
  - Wyszukiwanie (delegowane do SearchBar)
  - Wybór książki (otwarcie prawego sidebar)
  - Paginacja (delegowane do LoadMoreButton)
- **Obsługiwana walidacja**: 
  - Walidacja parametrów URL
  - Sprawdzanie czy użytkownik jest zalogowany
  - Walidacja limitów paginacji (1-100)
- **Typy**: `LibraryViewState`, `BookQueryParams`, `BookListResponseDTO`
- **Propsy**: Brak (główny komponent strony)

### LibraryHeader
- **Opis komponentu**: Sekcja nagłówka z tytułem widoku, filtrami statusów i polem wyszukiwania
- **Główne elementy**: `<div>` z flexbox layout, zawiera tytuł sekcji, FilterTabs i SearchBar
- **Obsługiwane interakcje**:
  - Przełączanie między tabami statusów
  - Wyszukiwanie książek
- **Obsługiwana walidacja**: 
  - Walidacja długości search query (1-100 znaków)
  - Walidacja poprawności statusu
- **Typy**: `ReadingStatus`, `FilterTabItem[]`
- **Propsy**: `currentStatus`, `searchQuery`, `onStatusChange`, `onSearchChange`

### FilterTabs
- **Opis komponentu**: Nawigacja tabowa do filtrowania książek według statusu czytania z licznikami książek
- **Główne elementy**: `<div>` z przyciskami reprezentującymi taby (All, Want to Read, Reading Now, Finished)
- **Obsługiwane interakcje**: 
  - Kliknięcie na tab (zmiana aktywnego filtra)
  - Hover effects
- **Obsługiwana walidacja**: 
  - Sprawdzenie czy status jest jednym z dozwolonych wartości
  - Walidacja czy status jest aktywny
- **Typy**: `FilterTabItem[]`, `ReadingStatus`
- **Propsy**: `tabs: FilterTabItem[]`, `activeStatus: ReadingStatus | 'all'`, `onStatusChange: (status: ReadingStatus | 'all') => void`

### SearchBar  
- **Opis komponentu**: Pole wyszukiwania z debouncing i opcjonalnymi filtrami dodatkowymi
- **Główne elementy**: `<input>` z ikoną wyszukiwania, opcjonalnie dropdown z zaawansowanymi filtrami
- **Obsługiwane interakcje**:
  - Wpisywanie tekstu (z debouncing 300ms)
  - Wyczyszczenie pola (x button)
  - Przesłanie formularza (Enter)
- **Obsługiwana walidacja**:
  - Minimalna długość query (1 znak)
  - Maksymalna długość query (100 znaków)
  - Sanityzacja wejścia
- **Typy**: `string`, `BookQueryParams`
- **Propsy**: `value: string`, `placeholder: string`, `onSearch: (query: string) => void`, `isLoading?: boolean`

### BooksGrid
- **Opis komponentu**: Responsywna siatka wyświetlająca karty książek z obsługą różnych stanów (loading, empty, error)
- **Główne elementy**: `<div>` z CSS Grid layout, zawiera BookCard komponenty lub stany alternatywne
- **Obsługiwane interakcje**:
  - Kliknięcie na książkę (selekcja i otwarcie prawego sidebar)
  - Scrollowanie (dla lazy loading)
- **Obsługiwana walidacja**: 
  - Sprawdzenie czy data jest dostępna
  - Walidacja struktury danych książek
- **Typy**: `BookListItemDTO[]`, `LibraryViewState`
- **Propsy**: `books: BookListItemDTO[]`, `isLoading: boolean`, `isEmpty: boolean`, `onBookSelect: (book: BookListItemDTO) => void`

### BookCard
- **Opis komponentu**: Karta reprezentująca pojedynczą książkę z okładką, tytułem, autorem i metadanymi (już istnieje, ewentualnie do rozszerzenia)
- **Główne elementy**: Card component z okładką, tytułem, autorem, statusem, oceną, tagami
- **Obsługiwane interakcje**:
  - Kliknięcie na kartę (selekcja książki)
  - Hover effects
  - Quick actions (zmiana statusu, ocena)
- **Obsługiwana walidacja**:
  - Sprawdzenie wymaganych pól (title, author)
  - Walidacja URL okładki
  - Walidacja oceny (1-5)
- **Typy**: `BookListItemDTO`, `ReadingStatus`
- **Propsy**: Już zdefiniowane w `BookCardProps`

### LoadMoreButton
- **Opis komponentu**: Przycisk do ładowania kolejnych stron wyników z informacją o postępie
- **Główne elementy**: `<button>` z tekstem i opcjonalnie spinnerem ładowania
- **Obsługiwane interakcje**:
  - Kliknięcie (załadowanie kolejnej strony)
  - Disabled state gdy nie ma więcej stron
- **Obsługiwana walidacja**:
  - Sprawdzenie czy są dostępne kolejne strony
  - Walidacja czy nie trwa już ładowanie
- **Typy**: `PaginationDTO`, `boolean`
- **Propsy**: `hasNextPage: boolean`, `isLoading: boolean`, `onLoadMore: () => void`

### EmptyState
- **Opis komponentu**: Komponent wyświetlany gdy brak książek w danej kategorii z call-to-action
- **Główne elementy**: `<div>` z grafiką, tekstem i przyciskiem akcji
- **Obsługiwane interakcje**:
  - Kliknięcie na CTA (dodaj książkę, zmień filtr)
- **Obsługiwana walidacja**: Nie dotyczy
- **Typy**: `ReadingStatus`, `EmptyStateProps`
- **Propsy**: `currentStatus: ReadingStatus | 'all'`, `searchQuery?: string`, `onAddBook: () => void`

### LoadingGrid
- **Opis komponentu**: Skeleton loading state dla siatki książek
- **Główne elementy**: Grid z skeleton komponentami imitującymi BookCard
- **Obsługiwane interakcje**: Brak (tylko wyświetlanie)
- **Obsługiwana walidacja**: Nie dotyczy
- **Typy**: `number` (liczba skeleton elementów)
- **Propsy**: `count?: number` (domyślnie 12)

## 5. Typy

```typescript
// Stan głównego widoku biblioteki
interface LibraryViewState {
  books: BookListItemDTO[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  filters: LibraryFilters
  pagination: PaginationDTO
  hasNextPage: boolean
  selectedBookId: string | null
}

// Filtry biblioteki
interface LibraryFilters {
  status: ReadingStatus | 'all'
  searchQuery: string
  tags: string[]
  sort: SortField
  order: SortOrder
}

// Element taba filtrowania
interface FilterTabItem {
  status: ReadingStatus | 'all'
  label: string
  count?: number
  isActive: boolean
}

// Props dla FilterTabs
interface FilterTabsProps {
  tabs: FilterTabItem[]
  activeStatus: ReadingStatus | 'all'
  onStatusChange: (status: ReadingStatus | 'all') => void
}

// Props dla SearchBar
interface SearchBarProps {
  value: string
  placeholder?: string
  onSearch: (query: string) => void
  isLoading?: boolean
  className?: string
}

// Props dla BooksGrid
interface BooksGridProps {
  books: BookListItemDTO[]
  isLoading: boolean
  isEmpty: boolean
  onBookSelect: (book: BookListItemDTO) => void
  className?: string
}

// Props dla LoadMoreButton
interface LoadMoreButtonProps {
  hasNextPage: boolean
  isLoading: boolean
  onLoadMore: () => void
  className?: string
}

// Props dla EmptyState
interface EmptyStateProps {
  currentStatus: ReadingStatus | 'all'
  searchQuery?: string
  onAddBook: () => void
  className?: string
}

// Props dla LibraryHeader
interface LibraryHeaderProps {
  currentStatus: ReadingStatus | 'all'
  searchQuery: string
  onStatusChange: (status: ReadingStatus | 'all') => void
  onSearchChange: (query: string) => void
  bookCounts?: Record<ReadingStatus, number>
}

// Hook return type
interface UseLibraryReturn {
  state: LibraryViewState
  actions: {
    setFilters: (filters: Partial<LibraryFilters>) => void
    loadMore: () => Promise<void>
    selectBook: (bookId: string | null) => void
    refetch: () => Promise<void>
  }
}
```

## 6. Zarządzanie stanem

### Custom Hook: useLibrary
Główny hook zarządzający stanem widoku biblioteki:

```typescript
const useLibrary = (): UseLibraryReturn => {
  // Stan lokalny
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [filters, setFilters] = useState<LibraryFilters>({
    status: 'all',
    searchQuery: '',
    tags: [],
    sort: 'created_at',
    order: 'desc'
  })

  // React Query do cache'owania danych
  const { data, isLoading, error, fetchNextPage, hasNextPage, refetch } = 
    useInfiniteQuery({
      queryKey: ['books', filters],
      queryFn: ({ pageParam = 1 }) => bookService.getBooks({
        ...filters,
        page: pageParam,
        limit: 20
      }),
      getNextPageParam: (lastPage) => 
        lastPage.pagination.page < lastPage.pagination.total_pages 
          ? lastPage.pagination.page + 1 
          : undefined
    })

  // Synchronizacja z URL
  useEffect(() => {
    // Synchronizacja parametrów URL z filtami
  }, [filters])

  return {
    state: {
      books: data?.pages.flatMap(page => page.data) || [],
      isLoading,
      error: error?.message || null,
      filters,
      pagination: data?.pages[0]?.pagination || defaultPagination,
      hasNextPage: !!hasNextPage,
      selectedBookId
    },
    actions: {
      setFilters: (newFilters) => setFilters(prev => ({ ...prev, ...newFilters })),
      loadMore: fetchNextPage,
      selectBook: setSelectedBookId,
      refetch
    }
  }
}
```

### Context dla Book Selection
```typescript
const BookSelectionContext = createContext<{
  selectedBookId: string | null
  selectBook: (bookId: string | null) => void
}>({
  selectedBookId: null,
  selectBook: () => {}
})
```

### Hook dla debounced search
```typescript
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}
```

## 7. Integracja API

### Endpoint: GET /api/books
- **Typ żądania**: `BookQueryParams`
- **Typ odpowiedzi**: `BookListResponseDTO`
- **Cache strategy**: React Query z `staleTime: 5 minut`
- **Invalidation**: Po dodaniu/edycji/usunięciu książki

```typescript
// Wykorzystanie w useLibrary hook
const fetchBooks = async (params: BookQueryParams): Promise<BookListResponseDTO> => {
  try {
    const response = await bookService.getBooks(params, userId)
    return response
  } catch (error) {
    console.error('Error fetching books:', error)
    throw error
  }
}

// React Query configuration
const booksQuery = useInfiniteQuery({
  queryKey: ['books', filters, userId],
  queryFn: ({ pageParam = 1 }) => fetchBooks({
    ...filters,
    page: pageParam,
    limit: 20
  }),
  getNextPageParam: (lastPage) => 
    lastPage.pagination.page < lastPage.pagination.total_pages 
      ? lastPage.pagination.page + 1 
      : undefined,
  staleTime: 5 * 60 * 1000, // 5 minut
  cacheTime: 10 * 60 * 1000, // 10 minut
  refetchOnWindowFocus: false
})
```

## 8. Interakcje użytkownika

### Filtrowanie według statusu
1. Użytkownik klika na tab (Want to Read/Reading Now/Finished/All)
2. Komponent FilterTabs wywołuje `onStatusChange`
3. Hook `useLibrary` aktualizuje filtry
4. URL jest aktualizowany przez router
5. React Query automatycznie refetch'uje dane z nowym filtrem
6. BooksGrid re-renderuje się z nowymi danymi

### Wyszukiwanie książek
1. Użytkownik wpisuje tekst w SearchBar
2. Tekst jest debounced (300ms)
3. Po debounce wywołuje się `onSearchChange`
4. Hook aktualizuje searchQuery w filtrach
5. React Query refetch'uje z nowym query
6. Wyniki są aktualizowane w BooksGrid

### Wybór książki
1. Użytkownik klika na BookCard
2. BookCard wywołuje `onBookSelect` z obiektem książki
3. Hook `useLibrary` aktualizuje `selectedBookId`
4. Context powiadamia prawy sidebar o zmianie
5. Prawy sidebar pobiera szczegóły wybranej książki
6. Sidebar rozszerza się na desktop/tablet lub otwiera jako modal na mobile

### Paginacja (Load More)
1. Użytkownik klika przycisk "Load More"
2. LoadMoreButton wywołuje `onLoadMore`
3. Hook wykorzystuje `fetchNextPage` z React Query
4. Dane są appendowane do istniejącej listy
5. Przycisk się ukrywa gdy nie ma więcej stron

### Responsive interactions
- **Desktop**: Wszystkie interakcje jednoczesne (lewy + główny + prawy sidebar)
- **Tablet**: Prawy sidebar zwijany domyślnie, otwarcie przez overlay
- **Mobile**: Lewy sidebar jako hamburger menu, prawy jako bottom sheet

## 9. Warunki i walidacja

### Walidacja parametrów URL (LibraryView)
- `status`: Musi być jednym z `ReadingStatus` lub undefined
- `search`: Maksymalnie 100 znaków, bez znaków specjalnych
- `page`: Liczba większa od 0
- `limit`: Liczba między 1-100
- `sort`: Jedno z `SortField`
- `order`: 'asc' lub 'desc'

### Walidacja wyszukiwania (SearchBar)
- Minimalna długość: 1 znak
- Maksymalna długość: 100 znaków
- Dozwolone znaki: litery, cyfry, spacje, podstawowe znaki interpunkcyjne
- Trim whitespace na początku i końcu

### Walidacja selection (BookCard)
- `book.id` musi być niepustym stringiem
- `book.title` i `book.author` są wymagane
- `book.user_rating` jeśli istnieje, musi być liczbą 1-5

### Walidacja paginacji (LoadMoreButton)
- `hasNextPage` sprawdzane z danych pagination
- `isLoading` blokuje ponowne kliknięcie
- Maksymalnie 1000 książek w cache (limitacja UX)

### Walidacja autoryzacji (cały widok)
- Użytkownik musi być zalogowany
- JWT token musi być ważny
- Użytkownik może widzieć tylko swoje książki (RLS)

## 10. Obsługa błędów

### Błędy sieciowe
- **Obsługa**: ErrorBoundary na poziomie LibraryView
- **UI**: Toast notification + retry button
- **Fallback**: Wyświetlenie cached danych jeśli dostępne

### Błędy autoryzacji (401/403)
- **Obsługa**: Interceptor w axios/fetch
- **UI**: Redirect na stronę logowania
- **Akcja**: Czyszczenie lokalnego state i cache

### Błędy walidacji (400)
- **Obsługa**: Catch w query function
- **UI**: Toast z konkretnym komunikatem błędu
- **Akcja**: Reset do domyślnych filtrów

### Błędy serwera (500)
- **Obsługa**: React Query retry (3x z exponential backoff)
- **UI**: Generic error message + contact support
- **Akcja**: Fallback do cached danych

### Empty states
- **Brak książek w kategorii**: EmptyState z CTA do dodania książki
- **Brak wyników wyszukiwania**: EmptyState z sugestią zmiany query
- **Błąd ładowania**: Error state z przyciskiem retry

### Loading states
- **Initial load**: LoadingGrid z skeleton elementami
- **Load more**: Spinner w LoadMoreButton
- **Search**: Loading indicator w SearchBar
- **Filter change**: Overlay loading na BooksGrid

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików
1. Utworzenie `app/(protected)/library/page.tsx` - główna strona
2. Utworzenie `app/(protected)/library/loading.tsx` - loading state
3. Utworzenie `app/(protected)/library/error.tsx` - error boundary
4. Utworzenie folderu `components/library/` dla komponentów

### Krok 2: Implementacja podstawowych komponentów
1. `LibraryView` - główny kontener z podstawowym layoutem
2. `LibraryHeader` - nagłówek z tytułem i podstawową strukturą
3. `BooksGrid` - siatka z placeholder'ami
4. `EmptyState` - stan pusty z podstawowym designem
5. `LoadingGrid` - skeleton loading state

### Krok 3: Implementacja zarządzania stanem
1. `useLibrary` hook - podstawowa struktura z useState
2. Integracja React Query dla pobierania danych
3. URL synchronization z Next.js router
4. Error handling i loading states

### Krok 4: Implementacja filtrowania
1. `FilterTabs` - kompletny komponent z logiką
2. Aktualizacja `useLibrary` o obsługę filtrów
3. Synchronizacja filtrów z URL parameters
4. `BookCounts` integration dla wyświetlania liczników

### Krok 5: Implementacja wyszukiwania
1. `SearchBar` - komponent z debouncing
2. `useDebounce` hook
3. Integracja search z głównym state management
4. Clear search functionality

### Krok 6: Implementacja paginacji
1. `LoadMoreButton` - komponent z infinite scroll
2. React Query infinite queries setup
3. Optimistic updates dla lepszego UX
4. Proper cache management

### Krok 7: Rozszerzenie BookCard
1. Dodanie variant prop dla library view
2. Quick actions (status change, rating)
3. Hover states i animations
4. Accessibility improvements

### Krok 8: Responsywność
1. CSS Grid responsive breakpoints
2. Mobile-first approach
3. Tablet optimizations
4. Touch gestures dla mobile

### Krok 9: Integracja z prawym sidebar
1. Book selection context
2. Communication z RightSidebar component
3. Mobile modal/bottom sheet
4. Deep linking dla wybranych książek

### Krok 10: Optymalizacje i finalizacja
1. Performance optimizations (virtualization jeśli potrzebne)
2. SEO optimizations (meta tags, structured data)
3. Error boundary improvements
4. Accessibility audit i improvements
5. Unit tests dla kluczowych komponentów
6. Integration tests dla user flows 