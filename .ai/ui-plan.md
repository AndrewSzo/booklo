# Architektura UI dla Book Management App - MVP

## 1. Przegląd struktury UI

### Layout Główny
Aplikacja wykorzystuje **trzyklumnowy responsive layout**:
- **Lewy Sidebar (300px)**: Nawigacja główna z możliwością zwinięcia
- **Główna Strefa (flex-1)**: Dynamiczna lista książek z filtrami
- **Prawy Sidebar (350px)**: Szczegóły książki z możliwością zwinięcia

### Responsywność
- **Desktop (>1200px)**: Pełny trzyklumnowy layout
- **Tablet (768-1200px)**: Prawy sidebar zwijany domyślnie
- **Mobile (<768px)**: Lewy sidebar jako overlay, prawy sidebar jako bottom sheet

### Tech Stack
- **Framework**: Next.js 14 + React 19 + TypeScript 5
- **Styling**: Tailwind 4 + Shadcn/ui
- **State Management**: React Query/TanStack Query + Context API
- **Forms**: React Hook Form + Zod validation

## 2. Lista widoków

### 2.1 Dashboard/Home View
- **Ścieżka**: `/dashboard`
- **Główny cel**: Przegląd aktywności czytelniczej i szybki dostęp do kluczowych funkcji
- **Kluczowe informacje**:
  - Statystyki czytania (liczba książek w każdej kategorii)
  - Ostatnio dodane książki
  - Aktualnie czytane książki
  - Reading streak i progress indicators
- **Kluczowe komponenty**:
  - `StatsCards` - karty z liczbami dla każdej kategorii
  - `RecentBooks` - lista ostatnio dodanych/aktualizowanych
  - `ReadingProgress` - progress bar dla obecnie czytanych
  - `QuickActions` - przyciski szybkich akcji
- **UX/Dostępność**: 
  - Keyboard navigation między kartami
  - ARIA labels dla statystyk
  - High contrast mode support
- **Bezpieczeństwo**: Wszystkie dane personalizowane, wymagana autoryzacja

### 2.2 Library Views (Want to Read/Reading/Finished)
- **Ścieżka**: `/library?status=want_to_read|reading|finished`
- **Główny cel**: Zarządzanie książkami w konkretnej kategorii
- **Kluczowe informacje**:
  - Lista książek w danej kategorii
  - Status, ocena, data dodania/ukończenia
  - Miniaturka notatek
  - Tagi i metadane
- **Kluczowe komponenty**:
  - `BookGrid/BookList` - responsywna lista książek
  - `BookCard` - karta pojedynczej książki
  - `FilterTabs` - górne taby do dodatkowego filtrowania
  - `SearchBar` - search z debouncing
  - `LoadMoreButton` - paginacja
  - `EmptyState` - grafika pustej półki
- **UX/Dostępność**:
  - Grid/List view toggle
  - Sortowanie (tytuł, autor, data, ocena)
  - Keyboard shortcuts (Ctrl+F dla search)
  - Screen reader friendly book cards
- **Bezpieczeństwo**: RLS na poziomie bazy danych, własne książki użytkownika

### 2.3 Feed/Categories Navigation
- **Ścieżka**: Część lewego sidebar'a
- **Główny cel**: Nawigacja między kategoriami książek
- **Kluczowe informacje**:
  - Lista kategorii z liczbą książek
  - Aktualnie wybrana kategoria
  - Shortlist/Pinned items
- **Kluczowe komponenty**:
  - `CategoryList` - lista z highlight aktywnego elementu
  - `CategoryItem` - pojedynczy element z counter'em
  - `PinnedSection` - sekcja ulubionych
- **UX/Dostępność**:
  - Visual highlight aktywnej kategorii
  - Badge z liczbą książek
  - Keyboard navigation (arrow keys)
- **Bezpieczeństwo**: Publiczne kategorie, prywatne countery

### 2.4 Add Book Modal
- **Ścieżka**: Modal overlay z `/books/add`
- **Główny cel**: Dodanie nowej książki do kolekcji
- **Kluczowe informacje**:
  - Formularz książki (tytuł, autor, opis, okładka)
  - Wybór kategorii i statusu
  - Opcjonalna ocena i tagi
- **Kluczowe komponenty**:
  - `AddBookWizard` - steps wizard (3 kroki)
  - `BookBasicInfo` - krok 1: podstawowe dane
  - `BookCategorization` - krok 2: status, tagi
  - `BookReview` - krok 3: ocena, pierwsza notatka
  - `StepIndicator` - progress indicator
  - `BackButton` - strzałka powrotu
- **UX/Dostępność**:
  - Form validation z live feedback
  - Save draft functionality
  - Escape key to close
  - Focus management między krokami
- **Bezpieczeństwo**: Walidacja po stronie klienta i serwera, rate limiting

### 2.5 Book Details Panel (Prawy Sidebar)
- **Ścieżka**: Część prawego sidebar'a
- **Główny cel**: Wyświetlenie szczegółów wybranej książki
- **Kluczowe informacje**:
  - Metadane książki (tytuł, autor, ISBN, opis)
  - Status i daty (rozpoczęcia, ukończenia)
  - Ocena użytkownika
  - Notatki i recenzje
  - Powiązane linki
- **Kluczowe komponenty**:
  - `BookInfo` - sekcja z metadanymi
  - `BookStatus` - current status z możliwością zmiany
  - `InteractiveRating` - click-to-rate stars
  - `NotesSection` - inline editor z autosave
  - `LinksSection` - lista powiązanych linków
  - `CollapseToggle` - przycisk zwijania sidebar'a
- **UX/Dostępność**:
  - Lazy loading zawartości
  - Keyboard shortcuts (Tab navigation)
  - Auto-expand przy wyborze książki
  - Responsive collapse na mobile
- **Bezpieczeństwo**: Tylko własne notatki i oceny, walidacja zmian

### 2.6 Search Results View
- **Ścieżka**: `/search?q=query&filters=...`
- **Główny cel**: Wyświetlenie wyników wyszukiwania
- **Kluczowe informacje**:
  - Lista pasujących książek
  - Filtry aktywne i dostępne
  - Liczba wyników
  - Sugestie jeśli brak wyników
- **Kluczowe komponenty**:
  - `SearchResults` - lista wyników z highlighting
  - `SearchFilters` - dropdown z filtrami
  - `SearchSummary` - podsumowanie query i liczba wyników
  - `NoResults` - empty state z sugestiami
- **UX/Dostępność**:
  - Search term highlighting
  - Filter chips z możliwością usunięcia
  - Recent searches dropdown
  - Live search suggestions
- **Bezpieczeństwo**: Rate limiting dla search, sanitizacja query

### 2.7 User Profile/Settings
- **Ścieżka**: `/profile` lub `/settings`
- **Główny cel**: Zarządzanie profilem i preferencjami użytkownika
- **Kluczowe informacje**:
  - Dane profilu (email, nazwa)
  - Preferencje UI (dark/light mode)
  - Statystyki konta
  - Import/Export options (przyszłość)
- **Kluczowe komponenty**:
  - `ProfileForm` - edycja danych osobowych
  - `PreferencesPanel` - ustawienia UI/UX
  - `StatsOverview` - statystyki użytkownika
  - `AccountActions` - zarządzanie kontem
- **UX/Dostępność**:
  - Form validation
  - Auto-save preferences
  - Confirmation dla destructive actions
  - Accessibility preferences
- **Bezpieczeństwo**: Silna walidacja, confirmation dla zmian email/hasła

### 2.8 Shortlist/Pinned View
- **Ścieżka**: `/shortlist`
- **Główny cel**: Zarządzanie priorytetowymi książkami
- **Kluczowe informacje**:
  - Lista ulubionych/priorytetowych książek
  - Możliwość reorder'owania
  - Quick actions dla każdej książki
- **Kluczowe komponenty**:
  - `PinnedBooksList` - draggable lista
  - `QuickActionMenu` - context menu dla książek
  - `PinToggle` - przycisk dodania/usunięcia z shortlist
- **UX/Dostępność**:
  - Drag & drop reordering
  - Keyboard alternative dla d&d
  - Visual feedback dla pinned items
- **Bezpieczeństwo**: Limit pinned items, własne listy użytkownika

## 3. Mapa podróży użytkownika

### 3.1 Onboarding Flow (Nowy użytkownik)
1. **Landing/Login** → Autoryzacja przez Supabase Auth
2. **Guided Tour** → Overlay tooltips przedstawiające kluczowe funkcje
3. **Empty State** → Dashboard z call-to-action "Dodaj swoją pierwszą książkę"
4. **First Book** → Add Book Modal z dodatkowym guidance
5. **Exploration** → Encourage użytkownika do eksploracji kategorii

### 3.2 Daily Usage Flow (Istniejący użytkownik)
1. **Dashboard** → Przegląd aktywności i statystyk
2. **Category Navigation** → Przejście do konkretnej kategorii przez Feed
3. **Book Management** → Update statusu, dodanie notatek, ocen
4. **Search & Discovery** → Znajdowanie konkretnych książek
5. **Add New Books** → Rozszerzanie kolekcji

### 3.3 Book Management Flow
1. **Book Selection** → Kliknięcie na BookCard w głównej strefie
2. **Details View** → Auto-expand prawego sidebar'a z szczegółami
3. **Status Update** → Zmiana kategorii (Want to Read → Reading → Finished)
4. **Rating & Notes** → Dodanie oceny i notatek inline
5. **Categorization** → Dodanie tagów i linków

### 3.4 Search & Filter Flow
1. **Search Input** → Focus na search bar (Ctrl+K shortcut)
2. **Live Suggestions** → Dropdown z suggestion podczas typowania
3. **Filter Application** → Selekcja filtrów z dropdown'a
4. **Results Review** → Przegląd wyników z highlighting
5. **Book Selection** → Przejście do szczegółów wybranej książki

## 4. Układ i struktura nawigacji

### 4.1 Główna Nawigacja (Lewy Sidebar)
```
📚 Book Management App
├── 🏠 Home (Dashboard)
├── 📖 Library
│   ├── 📚 Want to Read (25)
│   ├── 📖 Reading Now (3)
│   └── ✅ Finished Reading (42)
├── 📡 Feed (Categories view)
├── ⭐ Shortlist (8)
├── 🔍 Search
└── 👤 Profile (User menu)
    ├── ⚙️ Settings
    ├── 🌙 Dark Mode Toggle
    └── 🚪 Logout
```

### 4.2 Nawigacja Kontekstowa
- **Breadcrumbs**: W modalach i deep views
- **Back Buttons**: Strzałka w lewym górnym rogu modali
- **Tab Navigation**: W Library views dla dodatkowego filtrowania
- **Context Menus**: Right-click na BookCard dla quick actions

### 4.3 Keyboard Navigation
- **Global Shortcuts**:
  - `Ctrl+K`: Focus search
  - `Ctrl+N`: New book
  - `Esc`: Close modals/escape current context
  - `?`: Show keyboard shortcuts help
- **Arrow Navigation**: W listach i kategoriach
- **Tab Order**: Logiczny flow przez wszystkie interactive elementy

### 4.4 Mobile Navigation
- **Bottom Tab Bar**: Główne sekcje na mobile
- **Hamburger Menu**: Dostęp do sidebar'a
- **Swipe Gestures**: Między kategoriami i dla sidebar'ów
- **FAB**: Floating Action Button dla dodania książki

## 5. Kluczowe komponenty

### 5.1 Layout Components
- **`ResponsiveLayout`**: Główny container z trzyklumnowym układem
- **`CollapsibleSidebar`**: Sidebar z toggle i localStorage persistence
- **`MobileNavigation`**: Bottom tab bar i hamburger menu dla mobile

### 5.2 Navigation Components
- **`CategoryList`**: Lista kategorii z highlight aktywnego elementu
- **`SearchInput`**: Input z debouncing, filters dropdown i suggestions
- **`Breadcrumbs`**: Nawigacja hierarchiczna dla deep views
- **`BackButton`**: Uniwersalny przycisk powrotu

### 5.3 Book Components
- **`BookCard`**: Podstawowa karta książki z cover, title, author, status
- **`BookGrid`**: Responsywna siatka BookCard'ów
- **`BookList`**: Lista BookCard'ów w układzie tabelarycznym
- **`BookStatusBadge`**: Visual indicator statusu książki
- **`InteractiveRating`**: Click-to-rate stars z hover effects

### 5.4 Form Components
- **`AddBookWizard`**: Multi-step modal dla dodawania książek
- **`TagAutocomplete`**: Dropdown z existing tags i type-ahead
- **`InlineEditor`**: Click-to-edit textarea z autosave
- **`StepIndicator`**: Progress indicator dla wizard'ów

### 5.5 Feedback Components
- **`ToastSystem`**: Notifications dla błędów, sukcesów, confirmations
- **`LoadingSpinner`**: Loader w formie książki dla initial load
- **`SkeletonLoader`**: Placeholder dla ładujących się treści
- **`EmptyState`**: Grafika pustej półki z call-to-action

### 5.6 Utility Components
- **`ErrorBoundary`**: Per-route error handling z fallback UI
- **`LazyWrapper`**: Lazy loading dla heavyweight components
- **`ConfirmDialog`**: Reusable confirmation modals
- **`KeyboardShortcuts`**: Global keyboard shortcuts handler

### 5.7 Data Components
- **`BookProvider`**: Context provider dla selected book state
- **`SearchProvider`**: Context dla search state i history
- **`UIProvider`**: Theme, sidebar state, preferences
- **`QueryProvider`**: React Query setup z cache configuration
