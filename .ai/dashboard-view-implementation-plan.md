# Plan implementacji widoku Dashboard

## 1. Przegląd
Widok Dashboard służy jako główna strona docelowa po zalogowaniu użytkownika. Jego celem jest zapewnienie szybkiego przeglądu aktywności czytelniczej użytkownika oraz dostępu do kluczowych funkcji aplikacji. Widok prezentuje statystyki czytania, ostatnio dodane książki, aktualnie czytane pozycje oraz przyciski szybkich akcji, wszystko w responsywnym trzyklumnowym układzie.

## 2. Routing widoku
- **Ścieżka główna:** `/dashboard`
- **Przekierowanie:** Automatyczne przekierowanie po pomyślnym logowaniu
- **Ochrona:** Wymaga autoryzacji (protected route)
- **Fallback:** Przekierowanie do `/login` jeśli brak autoryzacji

## 3. Struktura komponentów
```
DashboardPage
├── DashboardLayout
│   ├── LeftSidebar
│   │   ├── NavigationMenu
│   │   ├── CategoryList
│   │   └── UserProfileSection
│   ├── DashboardContent
│   │   ├── WelcomeHeader
│   │   ├── StatsCardsGrid
│   │   │   ├── StatCard (Want to Read)
│   │   │   ├── StatCard (Reading Now)
│   │   │   └── StatCard (Finished)
│   │   ├── QuickActionsPanel
│   │   ├── RecentBooksSection
│   │   │   └── BookCard[]
│   │   └── ReadingProgressSection
│   └── RightSidebar
│       └── EmptyState (początkowo pusty)
```

## 4. Szczegóły komponentów

### DashboardPage
- **Opis:** Główny komponent strony dashboardu, zarządza layoutem i globalnym stanem
- **Główne elementy:** `<main>` container z DashboardLayout, loading overlays, error boundaries
- **Obsługiwane interakcje:** Inicjalizacja danych, obsługa błędów globalnych
- **Obsługiwana walidacja:** Sprawdzenie autoryzacji użytkownika przy montowaniu
- **Typy:** `DashboardPageProps`, `DashboardViewModel`
- **Propsy:** Brak (route-level component)

### DashboardLayout
- **Opis:** Responsywny trzyklumnowy layout z zarządzaniem stanem sidebarów
- **Główne elementy:** `<div>` z CSS Grid, responsive breakpoints, sidebar toggles
- **Obsługiwane interakcje:** Toggle lewego/prawego sidebara, responsive resize
- **Obsługiwana walidacja:** Sprawdzenie rozmiaru ekranu dla responsywności
- **Typy:** `LayoutProps`, `ResponsiveState`
- **Propsy:** `children: ReactNode`, `leftSidebarOpen?: boolean`, `rightSidebarOpen?: boolean`

### LeftSidebar
- **Opis:** Panel nawigacji głównej z menu kategorii i profilem użytkownika
- **Główne elementy:** `<aside>` z NavigationMenu, CategoryList, UserProfileSection
- **Obsługiwane interakcje:** Kliknięcia nawigacyjne, toggle collapse
- **Obsługiwana walidacja:** Highlight aktywnej ścieżki, sprawdzenie uprawnień
- **Typy:** `SidebarProps`, `NavigationItem[]`
- **Propsy:** `isOpen: boolean`, `onToggle: () => void`, `currentPath: string`

### StatsCardsGrid
- **Opis:** Siatka kart ze statystykami czytania (3 kategorie książek)
- **Główne elementy:** `<div>` grid container z trzema StatCard components
- **Obsługiwane interakcje:** Kliknięcie na kartę → nawigacja do kategorii
- **Obsługiwana walidacja:** Formatowanie liczb, loading skeletons, sprawdzenie czy dane są dostępne
- **Typy:** `UserStatsDTO`, `StatsCardsProps`
- **Propsy:** `stats: UserStatsDTO`, `isLoading: boolean`, `onCategoryClick: (status: ReadingStatus) => void`

### StatCard
- **Opis:** Pojedyncza karta statystyki z ikoną, liczbą i tytułem kategorii
- **Główne elementy:** `<div>` card z ikoną, licznikiem, tytułem i subtle animation
- **Obsługiwane interakcje:** Click handler, hover effects
- **Obsługiwana walidacja:** Sprawdzenie czy count >= 0, formatowanie dużych liczb
- **Typy:** `StatCardProps`, `StatsCardViewModel`
- **Propsy:** `title: string`, `count: number`, `icon: ReactNode`, `color: string`, `onClick: () => void`, `isLoading?: boolean`

### RecentBooksSection
- **Opis:** Sekcja z listą ostatnio dodanych książek (max 5)
- **Główne elementy:** `<section>` z nagłówkiem i horizontal scroll container dla BookCard
- **Obsługiwane interakcje:** Scroll horizontal, kliknięcie na książkę
- **Obsługiwana walidacja:** Empty state gdy brak książek, loading state, sprawdzenie czy użytkownik ma książki
- **Typy:** `BookListItemDTO[]`, `RecentBooksSectionProps`
- **Propsy:** `books: BookListItemDTO[]`, `isLoading: boolean`, `onBookClick: (book: BookListItemDTO) => void`

### QuickActionsPanel
- **Opis:** Panel z przyciskami szybkich akcji (dodaj książkę, search, itp.)
- **Główne elementy:** `<div>` flex container z Button components
- **Obsługiwane interakcje:** Click handlers dla każdej akcji
- **Obsługiwana walidacja:** Sprawdzenie uprawnień użytkownika do dodawania książek
- **Typy:** `QuickActionProps[]`, `QuickActionsPanelProps`
- **Propsy:** `actions: QuickActionProps[]`, `onActionClick: (actionId: string) => void`

### RightSidebar
- **Opis:** Panel szczegółów (początkowo pusty, gotowy na przyszłe rozszerzenia)
- **Główne elementy:** `<aside>` z EmptyState lub dynamiczną zawartością
- **Obsługiwane interakcje:** Toggle collapse, przyszłe szczegóły książek
- **Obsługiwana walidacja:** Responsive behavior na mobile
- **Typy:** `RightSidebarProps`, `SidebarContent`
- **Propsy:** `isOpen: boolean`, `onToggle: () => void`, `content?: ReactNode`

## 5. Typy

### DashboardViewModel
```typescript
interface DashboardViewModel {
  stats: UserStatsDTO | null
  recentBooks: BookListItemDTO[]
  currentlyReading: BookListItemDTO[]
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
}
```

### StatsCardViewModel
```typescript
interface StatsCardViewModel {
  title: string
  count: number
  icon: ReactNode
  color: 'blue' | 'green' | 'purple'
  route: string
  trend?: {
    value: number
    isPositive: boolean
  }
}
```

### LayoutState
```typescript
interface LayoutState {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
  isLoading: boolean
}
```

### QuickActionProps
```typescript
interface QuickActionProps {
  id: string
  label: string
  icon: ReactNode
  variant: 'primary' | 'secondary'
  disabled?: boolean
}
```

### ResponsiveBreakpoints
```typescript
type ResponsiveBreakpoints = {
  mobile: number  // <768px
  tablet: number  // 768-1200px
  desktop: number // >1200px
}
```

## 6. Zarządzanie stanem

### Custom Hook: useDashboardData
```typescript
const useDashboardData = () => {
  // React Query dla stats: useQuery(['user-stats'])
  // React Query dla recent books: useQuery(['recent-books'])  
  // React Query dla currently reading: useQuery(['currently-reading'])
  // Agregacja loading states
  // Error handling i retry logic
  // Return: DashboardViewModel
}
```

### Custom Hook: useResponsiveLayout
```typescript
const useResponsiveLayout = () => {
  // useState dla sidebar states
  // useEffect dla window resize listener
  // useMediaQuery dla breakpoints
  // localStorage persistence dla sidebar preferences
  // Return: LayoutState + toggle functions
}
```

### Context: DashboardContext
```typescript
const DashboardContext = createContext<{
  dashboardData: DashboardViewModel
  layoutState: LayoutState
  actions: DashboardActions
}>()
```

## 7. Integracja API

### Endpoint: GET /api/user/stats
- **Request type:** Brak body, autoryzacja via JWT header
- **Response type:** `UserStatsResponseDTO`
- **Usage:** Pobranie statystyk dla StatsCards
- **Error handling:** 401 → redirect login, 500 → error state z retry

### Endpoint: GET /api/books (recent)
- **Request type:** Query params: `limit=5&sort=created_at&order=desc`
- **Response type:** `BookListResponseDTO`
- **Usage:** Ostatnio dodane książki dla RecentBooksSection
- **Error handling:** Empty array fallback, loading skeletons

### Endpoint: GET /api/books (currently reading)
- **Request type:** Query params: `status=reading&limit=3`
- **Response type:** `BookListResponseDTO`
- **Usage:** Aktualnie czytane książki dla ReadingProgressSection
- **Error handling:** Empty state component, graceful degradation

## 8. Interakcje użytkownika

### Kliknięcie na StatCard
- **Trigger:** onClick event na StatCard
- **Action:** Nawigacja do `/library?status={category}`
- **Feedback:** Subtle animation, loading state podczas nawigacji

### Kliknięcie na książkę w RecentBooks
- **Trigger:** onClick event na BookCard
- **Action:** Otwarcie szczegółów w RightSidebar (lub nawigacja)
- **Feedback:** Highlight wybranej książki, animacja slide-in

### Toggle sidebarów
- **Trigger:** Kliknięcie na hamburger/collapse buttons
- **Action:** Toggle state + localStorage save
- **Feedback:** Smooth CSS transition, updated layout

### Quick Actions
- **Trigger:** Kliknięcie na action button
- **Action:** Otwarcie modalu (Add Book) lub nawigacja (Search)
- **Feedback:** Button press animation, modal slide-in

### Responsive interactions
- **Trigger:** Window resize poniżej breakpoints
- **Action:** Auto-collapse sidebarów, zmiana na mobile layout
- **Feedback:** Smooth layout transition

## 9. Warunki i walidacja

### Autoryzacja (DashboardPage)
- **Warunek:** Sprawdzenie JWT token w localStorage/cookies
- **Wpływ:** Jeśli brak → redirect do `/login`
- **Komponenty:** Wszystkie komponenty dashboardu

### Loading States (wszystkie data components)
- **Warunek:** `isLoading === true` podczas fetch API
- **Wpływ:** Pokazanie skeleton loaders zamiast danych
- **Komponenty:** StatsCards, RecentBooks, ReadingProgress

### Empty States (RecentBooksSection)
- **Warunek:** `books.length === 0 && !isLoading`
- **Wpływ:** Pokazanie EmptyState z CTA do dodania książki
- **Komponenty:** RecentBooksSection, ReadingProgressSection

### Responsive Breakpoints (DashboardLayout)
- **Warunek:** `window.innerWidth < 768px` (mobile)
- **Wpływ:** Auto-collapse sidebarów, zmiana na single column
- **Komponenty:** DashboardLayout, LeftSidebar, RightSidebar

### Stats Validation (StatsCards)
- **Warunek:** `stats.count >= 0` i `typeof stats.count === 'number'`
- **Wpływ:** Formatowanie liczb, fallback "0" dla błędów
- **Komponenty:** StatCard components

### Error States (globalne)
- **Warunek:** API error responses (500, network failure)
- **Wpływ:** Error boundary z retry button, toast notifications
- **Komponenty:** DashboardPage error boundary

## 10. Obsługa błędów

### Network Errors
- **Scenario:** Brak połączenia internetowego
- **Handling:** Toast notification "Offline mode", cached data display, retry button
- **Components:** useDashboardData hook, global error boundary

### Authentication Errors (401)
- **Scenario:** Token expired lub invalid
- **Handling:** Automatic redirect do `/login`, clear localStorage
- **Components:** API interceptor, DashboardPage useEffect

### Server Errors (500)
- **Scenario:** Backend server issues
- **Handling:** Error state z friendly message, retry mechanism, fallback to cached data
- **Components:** React Query error handling, ErrorBoundary component

### Data Loading Errors
- **Scenario:** Partial API failures (stats OK, books fail)
- **Handling:** Graceful degradation, show available data, error toast dla failed sections
- **Components:** Indywidualne useQuery hooks, per-section error states

### Validation Errors
- **Scenario:** Malformed API responses
- **Handling:** Console warning, fallback values, user-friendly error messages
- **Components:** Data parsing utilities, TypeScript type guards

## 11. Kroki implementacji

1. **Setup routing i layout podstawowy**
   - Konfiguracja `/dashboard` route w Next.js
   - Stworzenie DashboardLayout z CSS Grid
   - Implementacja basic responsive breakpoints

2. **Implementacja custom hooks**
   - useDashboardData z React Query
   - useResponsiveLayout z media queries
   - Konfiguracja error handling i loading states

3. **Budowa LeftSidebar**
   - NavigationMenu z routing
   - CategoryList z active state
   - UserProfileSection z logout

4. **Implementacja StatsCards**
   - StatCard component z animacjami
   - StatsCardsGrid layout
   - Integration z useDashboardData

5. **RecentBooksSection development**
   - BookCard component (reusable)
   - Horizontal scroll container
   - Empty state handling

6. **QuickActions i ReadingProgress**
   - QuickActionsPanel z button handlers
   - ReadingProgressSection z progress bars
   - Modal integration dla Add Book

7. **RightSidebar setup**
   - EmptyState component
   - Responsive collapse logic
   - Przygotowanie dla przyszłej zawartości

8. **Responsive design i polish**
   - Mobile-first CSS
   - Tablet breakpoint optimizations
   - Touch gestures dla mobile

9. **Testing i accessibility**
   - Unit tests dla components
   - Integration tests dla user flows
   - ARIA labels, keyboard navigation

10. **Performance optimization**
    - Lazy loading dla heavy components
    - Memoization dla expensive calculations
    - Bundle splitting i code optimization 