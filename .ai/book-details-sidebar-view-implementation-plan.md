# Plan implementacji widoku Book Details Sidebar

## 1. Przegląd

Widok Book Details Sidebar to prawy panel aplikacji zarządzania książkami, który wyświetla szczegółowe informacje o wybranej książce wraz z funkcjonalnościami zarządzania notatkami i czatu AI. Sidebar składa się z trzech głównych sekcji: informacje o książce (Info), notatki użytkownika (Notes) oraz chat z AI (AI Chat). Widok umożliwia pełne zarządzanie notatkami (CRUD) oraz interakcję z AI w kontekście wybranej książki.

## 2. Routing widoku

Widok nie ma własnej ścieżki routingu, ponieważ jest integralną częścią głównego layout'u aplikacji. Sidebar jest wyświetlany jako prawy panel po wybraniu książki w głównej strefie aplikacji. Stan sidebar'a jest zarządzany przez kontekst globalny i może być dostępny na wszystkich stronach gdzie widoczna jest lista książek (np. `/library`, `/dashboard`, `/search`).

## 3. Struktura komponentów

```
BookDetailsSidebar
├── SidebarHeader
│   ├── SidebarToggle
│   └── SidebarTabs
├── BookInfoSection
│   ├── BookCover
│   ├── BookMetadata
│   └── BookActions
├── NotesSection
│   ├── AddNoteForm
│   ├── NotesList
│   │   └── NoteItem[]
│   │       ├── NoteContent
│   │       ├── InlineNoteEditor
│   │       └── NoteActions
│   └── NotesPagination
└── AIChatSection
    ├── ChatHistory
    │   └── ChatMessage[]
    ├── ChatInput
    └── ChatActions
```

## 4. Szczegóły komponentów

### BookDetailsSidebar
- **Opis**: Główny kontener prawego sidebar'a aplikacji, zarządzający wyświetlaniem szczegółów wybranej książki
- **Główne elementy**: `<aside>` z trzema sekcjami w układzie pionowym, system tabów do przełączania między sekcjami
- **Obsługiwane interakcje**: przełączanie między tabami (Info/Notes/AI Chat), zamykanie sidebar'a, keyboard navigation (Tab, Escape)
- **Obsługiwana walidacja**: sprawdzenie czy książka jest wybrana przed wyświetleniem contentu
- **Typy**: `BookDetailsSidebarProps`, `BookDetailsSidebarViewModel`, `BookDetailDTO`
- **Propsy**: `bookId: string | null`, `isOpen: boolean`, `onClose: () => void`

### SidebarHeader
- **Opis**: Nagłówek sidebar'a zawierający taby nawigacyjne i przycisk zamknięcia
- **Główne elementy**: `<header>` z nawigacją tabową (`<nav>` z buttonami), przycisk close (`<button>`)
- **Obsługiwane interakcje**: przełączanie aktywnego tabu, zamykanie sidebar'a
- **Obsługiwana walidacja**: sprawdzenie czy aktywny tab jest poprawny
- **Typy**: `SidebarHeaderProps`, `TabType`
- **Propsy**: `activeTab: TabType`, `onTabChange: (tab: TabType) => void`, `onClose: () => void`

### BookInfoSection
- **Opis**: Sekcja wyświetlająca podstawowe informacje o książce
- **Główne elementy**: `<section>` z okładką książki (`<img>`), metadanymi (`<div>` z tytułem, autorem, opisem), przyciskami akcji
- **Obsługiwane interakcje**: zmiana statusu książki, edycja oceny
- **Obsługiwana walidacja**: sprawdzenie poprawności danych książki
- **Typy**: `BookInfoSectionProps`, `BookDetailDTO`
- **Propsy**: `book: BookDetailDTO`, `onStatusChange: (status: ReadingStatus) => void`

### NotesSection
- **Opis**: Sekcja zarządzania notatkami użytkownika dla wybranej książki
- **Główne elementy**: `<section>` z formularzem dodawania (`AddNoteForm`), listą notatek (`NotesList`), paginacją
- **Obsługiwane interakcje**: dodawanie, edycja, usuwanie notatek, paginacja
- **Obsługiwana walidacja**: walidacja contentu notatek (1-10,000 znaków), sprawdzenie uprawnień użytkownika
- **Typy**: `NotesSectionProps`, `NotesViewModel`, `NoteItemDTO[]`
- **Propsy**: `bookId: string`, `notes: NoteItemDTO[]`, `isLoading: boolean`, `error: string | null`

### AddNoteForm
- **Opis**: Formularz do dodawania nowych notatek
- **Główne elementy**: `<form>` z `<textarea>` dla contentu, przycisk submit, licznik znaków
- **Obsługiwane interakcje**: wprowadzanie tekstu, submit formularza, auto-resize textarea
- **Obsługiwana walidacja**: required content (min 1 znak), max 10,000 znaków, trim whitespace, HTML sanitization
- **Typy**: `AddNoteFormProps`, `CreateNoteDTO`, `FormErrors`
- **Propsy**: `onSubmit: (content: string) => Promise<void>`, `isSubmitting: boolean`

### NotesList
- **Opis**: Lista wszystkich notatek użytkownika dla danej książki
- **Główne elementy**: `<ul>` z elementami `NoteItem`, loading spinner, empty state
- **Obsługiwane interakcje**: scrollowanie, lazy loading, inline editing
- **Obsługiwana walidacja**: sprawdzenie czy użytkownik ma uprawnienia do wyświetlania notatek
- **Typy**: `NotesListProps`, `NoteItemDTO[]`, `PaginationDTO`
- **Propsy**: `notes: NoteItemDTO[]`, `isLoading: boolean`, `onEdit: (id: string, content: string) => void`, `onDelete: (id: string) => void`

### NoteItem
- **Opis**: Pojedyncza notatka z możliwością inline edycji i usunięcia
- **Główne elementy**: `<li>` z contentem notatki, datą utworzenia, przyciskami akcji (edit/delete)
- **Obsługiwane interakcje**: przełączanie między trybem wyświetlania a edycji, usuwanie z potwierdzeniem
- **Obsługiwana walidacja**: sprawdzenie ownership notatki, walidacja edytowanego contentu
- **Typy**: `NoteItemProps`, `NoteItemDTO`, `EditState`
- **Propsy**: `note: NoteItemDTO`, `isEditing: boolean`, `onEdit: (content: string) => void`, `onDelete: () => void`, `onToggleEdit: () => void`

### InlineNoteEditor
- **Opis**: Komponent do inline edycji notatek z autosave
- **Główne elementy**: `<textarea>` z auto-resize, przyciski save/cancel, debounced autosave
- **Obsługiwane interakcje**: edycja tekstu, autosave po 2s bezczynności, cancel z przywróceniem oryginalnej wartości
- **Obsługiwana walidacja**: identyczna jak AddNoteForm (1-10,000 znaków, HTML sanitization)
- **Typy**: `InlineNoteEditorProps`, `UpdateNoteDTO`, `AutosaveState`
- **Propsy**: `initialContent: string`, `onSave: (content: string) => Promise<void>`, `onCancel: () => void`, `autoSave?: boolean`

### AIChatSection
- **Opis**: Sekcja czatu z AI na tematy związane z książką
- **Główne elementy**: `<section>` z historią czatu, inputem do wiadomości, suggested prompts
- **Obsługiwane interakcje**: wysyłanie wiadomości, scrollowanie historii, kopiowanie odpowiedzi AI
- **Obsługiwana walidacja**: sprawdzenie dostępności AI, walidacja długości wiadomości
- **Typy**: `AIChatSectionProps`, `AIChatViewModel`, `ChatMessage[]`
- **Propsy**: `bookId: string`, `messages: ChatMessage[]`, `isLoading: boolean`, `onSendMessage: (content: string) => void`

## 5. Typy

```typescript
// Główne ViewModel typy
interface BookDetailsSidebarViewModel {
  selectedBook: BookDetailDTO | null
  isOpen: boolean
  activeTab: TabType
  isLoading: boolean
  error: string | null
}

interface NotesViewModel {
  notes: NoteItemDTO[]
  isLoading: boolean
  isCreating: boolean
  error: string | null
  pagination: PaginationDTO
  editingNoteId: string | null
}

interface AIChatViewModel {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  isTyping: boolean
}

// Enum i utility typy
type TabType = 'info' | 'notes' | 'ai-chat'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  isError?: boolean
}

interface EditState {
  isEditing: boolean
  originalContent: string
  currentContent: string
  hasChanges: boolean
}

interface AutosaveState {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
}

interface FormErrors {
  content?: string[]
  general?: string
}

// Props interfaces
interface BookDetailsSidebarProps {
  bookId: string | null
  isOpen: boolean
  onClose: () => void
  className?: string
}

interface NotesSectionProps {
  bookId: string
  notes: NoteItemDTO[]
  isLoading: boolean
  error: string | null
  pagination: PaginationDTO
  onCreateNote: (content: string) => Promise<void>
  onUpdateNote: (id: string, content: string) => Promise<void>
  onDeleteNote: (id: string) => Promise<void>
  onLoadMore: () => void
}

interface AddNoteFormProps {
  onSubmit: (content: string) => Promise<void>
  isSubmitting: boolean
  maxLength?: number
}

interface InlineNoteEditorProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
  onCancel: () => void
  autoSave?: boolean
  debounceMs?: number
}
```

## 6. Zarządzanie stanem

### Global State (Context)
Sidebar używa globalnego kontekstu `BookDetailsContext` do zarządzania:
- `selectedBookId`: ID aktualnie wybranej książki
- `sidebarOpen`: czy sidebar jest otwarty
- `activeTab`: aktywna zakładka

### Custom Hooks

**useBookDetailsSidebar**
```typescript
const useBookDetailsSidebar = () => {
  // Zarządzanie stanem sidebar'a
  // Integracja z global context
  // Keyboard shortcuts (Escape to close)
  // Responsive behavior
}
```

**useBookNotes**
```typescript
const useBookNotes = (bookId: string) => {
  // CRUD operacje na notatkach
  // Paginacja z infinite scroll
  // Optimistic updates
  // Error handling i retry logic
  // Cache invalidation
}
```

**useInlineEdit**
```typescript
const useInlineEdit = (initialContent: string, onSave: Function) => {
  // Zarządzanie stanem inline edycji
  // Autosave z debouncing
  // Dirty state tracking
  // Keyboard shortcuts (Escape, Ctrl+S)
}
```

**useAIChat**
```typescript
const useAIChat = (bookId: string) => {
  // Zarządzanie historii czatu
  // Wysyłanie wiadomości do AI
  // Streaming responses
  // Context about book dla AI
}
```

### Local State
Każdy komponent zarządza własnym lokalnym stanem dla:
- Form inputs i validation state
- UI state (loading, editing, expanded)
- Temporary data before API calls

## 7. Integracja API

### Endpointy używane przez widok

**GET /api/books/{id}/notes**
- Żądanie: `{ page?: number, limit?: number }`
- Odpowiedź: `NotesListResponseDTO`
- Hook: `useBookNotes` z React Query
- Caching: 5 minut, refetch on window focus

**POST /api/books/{id}/notes**
- Żądanie: `CreateNoteDTO` - `{ content: string }`
- Odpowiedź: `CreateNoteResponseDTO`
- Optymistyczne updates w UI
- Invalidation cache po sukcesie

**PUT /api/notes/{id}**
- Żądanie: `UpdateNoteDTO` - `{ content: string }`
- Odpowiedź: `UpdateNoteResponseDTO`
- Debounced autosave co 2 sekundy
- Rollback on error

**DELETE /api/notes/{id}**
- Żądanie: brak body
- Odpowiedź: 204 No Content
- Confirmation dialog przed usunięciem
- Optimistic removal z rollback

### React Query konfiguracja
```typescript
const notesQueryKey = (bookId: string) => ['books', bookId, 'notes']

const useNotesQuery = (bookId: string, page: number) => 
  useQuery({
    queryKey: [...notesQueryKey(bookId), page],
    queryFn: () => fetchBookNotes(bookId, page),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
```

## 8. Interakcje użytkownika

### Nawigacja w sidebar'ze
1. **Otwieranie sidebar'a**: Kliknięcie na książkę w głównej liście
2. **Przełączanie tabów**: Kliknięcie na tab Info/Notes/AI Chat
3. **Zamykanie sidebar'a**: Przycisk X, klawisz Escape, kliknięcie poza sidebar

### Zarządzanie notatkami
1. **Dodawanie notatki**: Wpisanie tekstu w formularz → Enter lub przycisk Save
2. **Edycja notatki**: Kliknięcie na notatkę → inline editor → autosave lub manual save
3. **Usuwanie notatki**: Przycisk delete → confirmation dialog → API call
4. **Paginacja**: Scroll do końca listy → auto-load więcej notatek

### Chat AI
1. **Wysyłanie wiadomości**: Wpisanie tekstu → Enter lub przycisk Send
2. **Suggested prompts**: Kliknięcie na sugerowane pytanie
3. **Kopiowanie odpowiedzi**: Przycisk copy przy odpowiedzi AI

### Keyboard shortcuts
- `Escape`: Zamknięcie sidebar'a lub cancelowanie edycji
- `Tab`: Nawigacja między elementami
- `Ctrl/Cmd + S`: Zapisanie edytowanej notatki
- `Ctrl/Cmd + Enter`: Wysłanie wiadomości AI

## 9. Warunki i walidacja

### Walidacja notatek (zgodnie z API)
- **Content wymagany**: Minimum 1 znak po trim
- **Maksymalna długość**: 10,000 znaków
- **HTML sanitization**: Usunięcie wszystkich HTML tagów
- **Whitespace normalization**: Trim i collapse multiple spaces

### Walidacja na poziomie komponentów

**AddNoteForm**
- Real-time validation podczas pisania
- Character counter z color coding (green < 9000, yellow 9000-9900, red > 9900)
- Disabled submit button gdy validation fails
- Error messages pod textarea

**InlineNoteEditor**
- Identyczna walidacja jak AddNoteForm
- Visual indicator unsaved changes (dirty state)
- Auto-revert on validation error
- Confirmation przy zmianie focus z unsaved changes

**Form states wpływające na UI**
- `isValid`: czy formularz można submit
- `isDirty`: czy są niezapisane zmiany
- `isSubmitting`: czy trwa wysyłanie
- `errors`: obiekt z błędami walidacji

### Business rules validation
- **Rate limiting**: Max 60 notatek na godzinę (wyświetlenie warning)
- **Book ownership**: Tylko notatki dla książek użytkownika
- **Note ownership**: Edycja/usuwanie tylko własnych notatek

## 10. Obsługa błędów

### Scenariusze błędów i handling

**Błędy ładowania notatek**
- Network error → Retry button z exponential backoff
- 404 Book not found → Redirect do library z toast message
- 401 Unauthorized → Redirect do login page

**Błędy operacji CRUD**
- **Create error**: Toast error message, focus pozostaje na formularzu
- **Update error**: Rollback do poprzedniej wartości, error toast
- **Delete error**: Restore deleted item, error notification

**Błędy walidacji**
- Inline error messages w real-time
- Field-level errors pod inputs
- General error message na górze formularza

**Błędy AI Chat**
- API timeout → Retry button przy wiadomości
- Rate limiting → Informacja o limicie i retry after
- Model unavailable → Fallback do simplified responses

### Error Boundaries
```typescript
<ErrorBoundary
  fallback={<SidebarErrorFallback />}
  onError={(error, errorInfo) => logError('SidebarError', error, errorInfo)}
>
  <BookDetailsSidebar />
</ErrorBoundary>
```

### User feedback
- **Toast notifications**: Sukces/błąd operacji CRUD
- **Loading states**: Spinners, skeleton loading, disabled buttons
- **Error states**: Inline errors, retry buttons, helpful messages
- **Empty states**: Friendly ilustracje when no notes exist

## 11. Kroki implementacji

### Krok 1: Przygotowanie infrastruktury (1-2 dni)
1. Stworzenie struktury folderów `components/BookDetailsSidebar/`
2. Konfiguracja TypeScript types w `types/sidebar.ts`
3. Setup React Query hooks dla notes API
4. Implementacja global context `BookDetailsContext`

### Krok 2: Layout i podstawowa struktura (2-3 dni)
1. Implementacja `BookDetailsSidebar` głównego kontenera
2. Responsive layout z Tailwind CSS
3. Tab navigation system
4. Keyboard shortcuts i accessibility

### Krok 3: BookInfoSection (1-2 dni)
1. Wyświetlanie podstawowych informacji o książce
2. Integration z `BookDetailDTO` type
3. Actions dla zmiany statusu i oceny
4. Loading states i error handling

### Krok 4: NotesSection - podstawy (3-4 dni)
1. `AddNoteForm` z walidacją i character counter
2. `NotesList` z basic rendering
3. `NoteItem` z display mode
4. Integration z API endpoints (GET, POST)

### Krok 5: Inline editing notatek (2-3 dni)
1. `InlineNoteEditor` component
2. Toggle między display a edit mode
3. Autosave z debouncing
4. Keyboard shortcuts i focus management

### Krok 6: CRUD operations completion (2 dni)
1. Update notes (PUT /api/notes/{id})
2. Delete notes z confirmation dialog
3. Optimistic updates i error rollback
4. Cache invalidation strategies

### Krok 7: Paginacja i infinite scroll (1-2 dni)
1. `NotesPagination` component
2. Infinite scroll implementation
3. Loading states dla additional pages
4. Performance optimization dla large lists

### Krok 8: AIChatSection (3-4 dni)
1. `ChatHistory` z message rendering
2. `ChatInput` z suggested prompts
3. Integration z AI API
4. Streaming responses i typing indicators

### Krok 9: Polish i accessibility (2-3 dni)
1. ARIA labels i roles
2. Screen reader compatibility
3. Keyboard navigation refinement
4. Focus management między tabs

### Krok 10: Error handling i edge cases (2 dni)
1. Comprehensive error boundaries
2. Network error recovery
3. Rate limiting handling
4. Empty states i fallbacks

### Krok 11: Testing (3-4 dni)
1. Unit tests dla custom hooks
2. Integration tests dla API calls
3. Accessibility testing
4. Manual testing cross-browser

### Krok 12: Performance optimization (1-2 dni)
1. React.memo dla expensive components
2. Virtual scrolling dla large note lists
3. Bundle size optimization
4. Image lazy loading

### Krok 13: Documentation i deployment (1 dzień)
1. Component documentation
2. API integration guide
3. Accessibility guidelines
4. Performance monitoring setup 