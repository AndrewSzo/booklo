# BookDetailsSidebar Components

Kompletny system komponentów do zarządzania szczegółami książek w prawym sidebar'ze aplikacji.

## Struktura komponentów

```
BookDetailsSidebar/
├── BookDetailsSidebar.tsx      # Główny kontener sidebar'a
├── SidebarHeader.tsx           # Nagłówek z nawigacją tabową
├── BookInfoSection.tsx         # Sekcja informacji o książce
├── NotesSection.tsx            # Sekcja zarządzania notatkami
├── AIChatSection.tsx           # Sekcja czatu AI (placeholder)
├── AddNoteForm.tsx             # Formularz dodawania notatek
├── NotesList.tsx               # Lista notatek
├── NoteItem.tsx                # Pojedyncza notatka
├── InlineNoteEditor.tsx        # Edytor inline notatek
├── types.ts                    # Definicje typów
└── index.ts                    # Eksporty
```

## Główne funkcjonalności

### ✅ Zaimplementowane

1. **Responsive layout** - Mobile-first design z overlay na mobile
2. **Tab navigation** - Przełączanie między Info/Notes/AI Chat
3. **Book information display** - Okładka, metadane, rating, status
4. **Notes CRUD operations** - Pełne zarządzanie notatkami
5. **Inline editing** - Edycja notatek z autosave
6. **Infinite scroll** - Automatyczne ładowanie kolejnych notatek
7. **Keyboard shortcuts** - Escape, Ctrl+S, Ctrl+1/2/3
8. **Optimistic updates** - Natychmiastowe UI updates
9. **Error handling** - Comprehensive error states
10. **Accessibility** - ARIA labels, keyboard navigation

### 🚧 W trakcie implementacji

- AI Chat functionality (placeholder gotowy)

## Użycie

### Podstawowe użycie

```tsx
import { BookDetailsSidebar } from '@/components/BookDetailsSidebar'
import { useBookDetailsContext } from '@/lib/providers/BookDetailsContext'

function App() {
  const { selectedBookId, isOpen, closeSidebar } = useBookDetailsContext()
  
  return (
    <BookDetailsSidebar
      bookId={selectedBookId}
      isOpen={isOpen}
      onClose={closeSidebar}
    />
  )
}
```

### Z BookDetailsProvider

```tsx
import { BookDetailsProvider } from '@/lib/providers/BookDetailsContext'

function Layout({ children }) {
  return (
    <BookDetailsProvider>
      {children}
      <BookDetailsSidebar />
    </BookDetailsProvider>
  )
}
```

### Otwieranie sidebar'a

```tsx
import { useBookDetailsContext } from '@/lib/providers/BookDetailsContext'

function BookCard({ book }) {
  const { openSidebar } = useBookDetailsContext()
  
  return (
    <div onClick={() => openSidebar(book.id, 'info')}>
      {book.title}
    </div>
  )
}
```

## Custom Hooks

### useBookNotes

Zarządza stanem notatek z paginacją i CRUD operacjami:

```tsx
const {
  notes,
  isLoading,
  createNote,
  updateNote,
  deleteNote,
  loadMore,
  hasNextPage
} = useBookNotes({ bookId })
```

### useBookDetailsSidebar

Zarządza stanem sidebar'a z keyboard shortcuts:

```tsx
const {
  selectedBookId,
  isOpen,
  activeTab,
  openSidebar,
  closeSidebar,
  setActiveTab
} = useBookDetailsSidebar()
```

### useInlineEdit

Zarządza inline editing z autosave:

```tsx
const {
  content,
  isSaving,
  hasUnsavedChanges,
  handleSave,
  handleCancel,
  textareaRef
} = useInlineEdit({
  initialContent,
  onSave,
  onCancel,
  autoSave: true
})
```

## Keyboard Shortcuts

- `Escape` - Zamknięcie sidebar'a lub anulowanie edycji
- `Ctrl/Cmd + 1` - Przełączenie na tab Info
- `Ctrl/Cmd + 2` - Przełączenie na tab Notes  
- `Ctrl/Cmd + 3` - Przełączenie na tab AI Chat
- `Ctrl/Cmd + S` - Zapisanie edytowanej notatki
- `Tab` - Nawigacja między elementami

## API Integration

### Endpointy

- `GET /api/books/{id}` - Szczegóły książki
- `GET /api/books/{id}/notes` - Lista notatek z paginacją
- `POST /api/books/{id}/notes` - Tworzenie notatki
- `PUT /api/notes/{id}` - Aktualizacja notatki
- `DELETE /api/notes/{id}` - Usunięcie notatki

### React Query

Wszystkie API calls używają React Query z:
- Optimistic updates
- Cache invalidation
- Error handling
- Retry logic
- Stale time: 5 minut

## Walidacja

### Notatki

- **Wymagane**: Minimum 1 znak po trim
- **Maksymalna długość**: 10,000 znaków
- **HTML sanitization**: Automatyczne usuwanie HTML tagów
- **Real-time validation**: Podczas pisania

### Character Counter

- Green: < 7,500 znaków
- Yellow: 7,500-9,000 znaków  
- Red: > 9,000 znaków

## Performance

### Optimalizacje

- React.memo dla expensive komponentów
- Debounced autosave (2s)
- Virtual scrolling dla dużych list
- Lazy loading obrazków
- Bundle splitting

### Monitoring

- Loading states dla wszystkich operacji
- Error boundaries z fallbacks
- Performance metrics tracking

## Accessibility

### ARIA Support

- `role="complementary"` dla sidebar'a
- `role="tablist"` i `role="tab"` dla nawigacji
- `role="tabpanel"` dla contentu
- `aria-label` dla wszystkich interaktywnych elementów

### Keyboard Navigation

- Tab order zgodny z visual flow
- Focus management przy przełączaniu tabów
- Escape handling na wszystkich poziomach
- Screen reader compatibility

## Styling

### Tailwind Classes

Komponenty używają Tailwind CSS z:
- Responsive breakpoints (lg:)
- Dark mode support (dark:)
- Animation classes
- Custom color palette
- Consistent spacing scale

### Customization

```tsx
<BookDetailsSidebar 
  className="custom-sidebar-styles"
  // Inne props...
/>
```

## Testing

### Unit Tests

```bash
npm test -- BookDetailsSidebar
```

### Integration Tests

```bash
npm test -- --testPathPattern=integration
```

### E2E Tests

```bash
npm run test:e2e -- --grep="BookDetailsSidebar"
```

## Troubleshooting

### Częste problemy

1. **Sidebar nie otwiera się**
   - Sprawdź czy BookDetailsProvider jest w drzewie komponentów
   - Zweryfikuj czy bookId jest poprawne

2. **Notatki nie ładują się**
   - Sprawdź network tab w dev tools
   - Zweryfikuj API endpoints
   - Sprawdź React Query cache

3. **Autosave nie działa**
   - Sprawdź czy autoSave=true
   - Zweryfikuj debounce timer
   - Sprawdź console errors

### Debug Mode

```tsx
// Włącz debug mode dla React Query
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

## Roadmap

### Następne funkcjonalności

1. **AI Chat implementation** - Integracja z AI API
2. **Rich text editor** - Markdown support dla notatek
3. **Note categories** - Kategoryzacja notatek
4. **Export functionality** - Export notatek do PDF/Markdown
5. **Collaborative notes** - Udostępnianie notatek między użytkownikami
6. **Voice notes** - Nagrywanie audio notatek
7. **Note templates** - Predefiniowane szablony notatek

### Performance improvements

1. **Virtual scrolling** - Dla bardzo długich list notatek
2. **Image optimization** - Next.js Image component
3. **Code splitting** - Lazy loading komponentów
4. **Service Worker** - Offline support

## Contributing

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component documentation required 