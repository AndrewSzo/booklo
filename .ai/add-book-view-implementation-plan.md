# Plan implementacji widoku dodawania nowej książki

## 1. Przegląd

Widok dodawania nowej książki to modalny interfejs umożliwiający użytkownikom dodanie książki do swojej biblioteki. Składa się z trzystopniowego kreatora (wizard), który prowadzi użytkownika przez proces dodawania podstawowych informacji, kategoryzacji i opcjonalnej oceny książki. Modal jest dostępny z poziomu `/library` i `/dashboard` poprzez przyciski "Add Book" lub "+".

## 2. Routing widoku

- **Typ widoku**: Modal overlay (nie dedykowana strona)
- **Dostęp**: Przyciski na stronach `/library` i `/dashboard`
- **Modal route**: Stan modalny bez zmiany URL (opcjonalnie: shallow routing z query param `?modal=add-book`)
- **Zamknięcie**: Powrót do poprzedniej strony bez zmiany stanu

## 3. Struktura komponentów

```
AddBookModal
├── ModalOverlay
├── ModalContent
│   ├── ModalHeader
│   │   ├── Title
│   │   └── CloseButton
│   ├── AddBookWizard
│   │   ├── StepIndicator
│   │   └── StepContent
│   │       ├── BookBasicInfoStep
│   │       ├── BookCategorizationStep
│   │       └── BookReviewStep
│   └── ModalFooter
│       ├── BackButton
│       ├── SaveDraftButton
│       ├── NextButton
│       └── SaveButton
```

## 4. Szczegóły komponentów

### AddBookModal
- **Opis**: Główny kontener modala z overlay, zarządzający stanem otwarcia/zamknięcia i integracją z wizard'em
- **Główne elementy**: Modal overlay, modal content, escape key handling, click outside handling
- **Obsługiwane interakcje**: zamknięcie przez Escape, kliknięcie poza modalem, kliknięcie X
- **Obsługiwana walidacja**: sprawdzenie czy są niezapisane zmiany przed zamknięciem
- **Typy**: `AddBookModalProps`, `AddBookFormData`
- **Propsy**: `isOpen: boolean`, `onClose: () => void`, `onSuccess?: (book: BookResponseDTO) => void`

### AddBookWizard
- **Opis**: Zarządza stanem trzystopniowego kreatora, przechodzi między krokami i koordynuje walidację
- **Główne elementy**: StepIndicator, aktualny step component, navigation logic
- **Obsługiwane interakcje**: przejście do następnego/poprzedniego kroku, walidacja kroków
- **Obsługiwana walidacja**: walidacja każdego kroku przed przejściem dalej, finalna walidacja przed zapisem
- **Typy**: `WizardStep`, `AddBookFormData`, `StepValidationResult`
- **Propsy**: `onComplete: (data: CreateBookDTO) => void`, `onCancel: () => void`

### BookBasicInfoStep
- **Opis**: Pierwszy krok zawierający podstawowe informacje o książce - tytuł, autor, ISBN, okładka, opis
- **Główne elementy**: Input dla tytułu, input dla autora, input dla ISBN, textarea dla opisu, input/upload dla okładki
- **Obsługiwane interakcje**: wpisywanie tekstu, upload okładki, walidacja na blur
- **Obsługiwana walidacja**: tytuł (wymagane, 1-500 znaków), autor (wymagane, 1-200 znaków), ISBN (opcjonalne, format ISBN-10/13), opis (opcjonalne, max 2000 znaków)
- **Typy**: `BasicBookInfo`, `ValidationErrors`
- **Propsy**: `data: BasicBookInfo`, `onChange: (data: BasicBookInfo) => void`, `errors: ValidationErrors`

### BookCategorizationStep
- **Opis**: Drugi krok do wyboru statusu czytania i dodania tagów
- **Główne elementy**: Radio buttons/select dla statusu, tag autocomplete, lista wybranych tagów
- **Obsługiwane interakcje**: wybór statusu, dodawanie/usuwanie tagów, autocomplete tagów
- **Obsługiwana walidacja**: status (wymagane, jedna z trzech opcji), tagi (opcjonalne, max 3, valid names)
- **Typy**: `BookCategorization`, `ReadingStatus`, `TagItem[]`
- **Propsy**: `data: BookCategorization`, `onChange: (data: BookCategorization) => void`, `availableTags: TagItem[]`

### BookReviewStep
- **Opis**: Trzeci krok dla opcjonalnej oceny i pierwszej notatki
- **Główne elementy**: Interaktywne gwiazdki do oceny, textarea dla notatki
- **Obsługiwane interakcje**: kliknięcie gwiazdek, hover efekty, wpisywanie notatki
- **Obsługiwana walidacja**: ocena (opcjonalne, 1-5), notatka (opcjonalne, max 10000 znaków)
- **Typy**: `BookReview`, `ValidationErrors`
- **Propsy**: `data: BookReview`, `onChange: (data: BookReview) => void`, `errors: ValidationErrors`

### StepIndicator
- **Opis**: Wizualny wskaźnik postępu w kreatorze z numerami kroków i opisami
- **Główne elementy**: Lista kroków z kółkami, linie połączenia, opisy kroków
- **Obsługiwane interakcje**: brak (tylko wyświetlanie)
- **Obsługiwana walidacja**: brak
- **Typy**: `WizardStep`, `StepStatus`
- **Propsy**: `currentStep: WizardStep`, `completedSteps: WizardStep[]`, `totalSteps: number`

## 5. Typy

```typescript
// Enum dla kroków wizard'a
export enum WizardStep {
  BASIC_INFO = 1,
  CATEGORIZATION = 2,
  REVIEW = 3
}

// Główny typ danych formularza
export interface AddBookFormData {
  basicInfo: BasicBookInfo
  categorization: BookCategorization
  review: BookReview
}

// Krok 1: Podstawowe informacje
export interface BasicBookInfo {
  title: string
  author: string
  isbn?: string
  cover_url?: string
  description?: string
}

// Krok 2: Kategoryzacja
export interface BookCategorization {
  status: ReadingStatus
  tags: string[]
}

// Krok 3: Recenzja
export interface BookReview {
  rating?: number // 1-5
  notes?: string
}

// Wynik walidacji kroku
export interface StepValidationResult {
  isValid: boolean
  errors: ValidationErrors
}

// Błędy walidacji
export interface ValidationErrors {
  [fieldName: string]: string[]
}

// Props dla głównego modala
export interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (book: BookResponseDTO) => void
}

// Stan kroku w indicator'ze
export type StepStatus = 'pending' | 'current' | 'completed' | 'error'

// Item dla autocomplete tagów
export interface TagItem {
  id: string
  name: string
  book_count: number
}
```

## 6. Zarządzanie stanem

### Custom Hook: useAddBookForm
```typescript
const useAddBookForm = () => {
  const [formData, setFormData] = useState<AddBookFormData>()
  const [currentStep, setCurrentStep] = useState<WizardStep>()
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>()
  const [isDirty, setIsDirty] = useState<boolean>()
  
  // Metody do zarządzania stanem
  const updateBasicInfo = (data: BasicBookInfo) => void
  const updateCategorization = (data: BookCategorization) => void
  const updateReview = (data: BookReview) => void
  const validateStep = (step: WizardStep) => StepValidationResult
  const resetForm = () => void
  const saveDraft = () => void
  const loadDraft = () => void
}
```

### Custom Hook: useBookCreation
```typescript
const useBookCreation = () => {
  const [isLoading, setIsLoading] = useState<boolean>()
  const [error, setError] = useState<ErrorResponseDTO | null>()
  
  const createBook = async (data: CreateBookDTO) => Promise<BookResponseDTO>
}
```

### Draft Management
- Automatyczne zapisywanie draft'u w localStorage co 30 sekund
- Przywracanie draft'u przy ponownym otwarciu modala
- Czyszczenie draft'u po udanym zapisie

## 7. Integracja API

### Endpoint: POST /api/books
- **Request Type**: `CreateBookDTO`
- **Response Type**: `CreateBookResponseDTO`
- **Error Types**: `ErrorResponseDTO`, `ValidationErrorResponseDTO`

### Mapowanie danych formularza na DTO:
```typescript
const mapFormDataToDTO = (formData: AddBookFormData): CreateBookDTO => ({
  title: formData.basicInfo.title,
  author: formData.basicInfo.author,
  isbn: formData.basicInfo.isbn,
  cover_url: formData.basicInfo.cover_url,
  description: formData.basicInfo.description,
  status: formData.categorization.status,
  rating: formData.review.rating,
  tags: formData.categorization.tags
})
```

### Dodatkowe API calls:
- `GET /api/tags` - dla autocomplete tagów w kroku 2

## 8. Interakcje użytkownika

### Otwieranie modala
- Kliknięcie przycisku "Add Book" lub "+" na `/library` lub `/dashboard`
- Modal pojawia się z fade-in animacją
- Focus automatycznie na pierwszym polu (tytuł)

### Nawigacja w kreatorze
- Przycisk "Next" - przejście do następnego kroku (z walidacją)
- Przycisk "Back" - powrót do poprzedniego kroku
- Kliknięcie na step indicator - przejście do kroku (jeśli dozwolone)

### Zapisywanie
- "Save Draft" - zapisanie w localStorage bez wysyłania do API
- "Add Book" - finalna walidacja i wysłanie do API
- Po udanym zapisie - wyświetlenie sukcesu i zamknięcie modala

### Zamykanie modala
- Kliknięcie "X" w nagłówku
- Naciśnięcie klawisza Escape
- Kliknięcie poza modalem
- Sprawdzenie niezapisanych zmian i wyświetlenie potwierdzenia

## 9. Warunki i walidacja

### Walidacja w czasie rzeczywistym (on blur):
- **BookBasicInfoStep**:
  - `title`: wymagane, 1-500 znaków, trim whitespace
  - `author`: wymagane, 1-200 znaków, trim whitespace
  - `isbn`: opcjonalne, format ISBN-10 lub ISBN-13
  - `description`: opcjonalne, max 2000 znaków
  
### Walidacja przy przejściu między krokami:
- **Krok 1 → 2**: Sprawdzenie wymaganych pól (title, author)
- **Krok 2 → 3**: Sprawdzenie poprawności statusu i liczby tagów (max 3)
- **Krok 3 → Submit**: Sprawdzenie zakresu oceny (1-5) jeśli podana

### Walidacja przed wysłaniem:
- Wszystkie powyższe warunki
- Sprawdzenie unikalności kombinacji (title, author) - obsługiwane przez API
- Sanityzacja danych (trim, escape)

### Feedback wizualny:
- Czerwone obramowanie dla niepoprawnych pól
- Komunikaty błędów pod polami
- Dezaktywacja przycisków Next/Save przy błędach
- Loading state podczas API calls

## 10. Obsługa błędów

### Błędy walidacji (400 Bad Request)
- Wyświetlenie błędów field-level pod odpowiednimi polami
- Przejście do kroku zawierającego błędne pole
- Highlight błędnego pola

### Błędy duplikatu (409 Conflict)
- Wyświetlenie komunikatu: "Książka o tym tytule i autorze już istnieje w Twojej bibliotece"
- Zaproponowanie przejścia do istniejącej książki
- Możliwość modyfikacji danych

### Błędy sieciowe (500, timeout)
- Wyświetlenie ogólnego komunikatu błędu
- Przycisk "Spróbuj ponownie"
- Zachowanie draft'u formularza

### Błędy uwierzytelnienia (401)
- Przekierowanie na stronę logowania
- Zachowanie draft'u do przywrócenia po zalogowaniu

### Toast notifications
- Sukces: "Książka została dodana do biblioteki"
- Błąd: "Wystąpił błąd podczas dodawania książki"
- Info: "Draft został zapisany"

## 11. Kroki implementacji

### Krok 1: Podstawowa struktura komponentów
- Utworzenie `AddBookModal` z podstawowym layout'em
- Implementacja overlay i mechanizmu zamykania
- Dodanie przycisków otwierających modal na `/library` i `/dashboard`

### Krok 2: Implementacja wizard'a i step indicator
- Utworzenie `AddBookWizard` z logiką przełączania kroków
- Implementacja `StepIndicator` z wizualizacją postępu
- Dodanie nawigacji między krokami (Next/Back)

### Krok 3: Implementacja kroków formularza
- `BookBasicInfoStep` z polami podstawowymi
- `BookCategorizationStep` z wyborem statusu
- `BookReviewStep` z oceną i notatkami

### Krok 4: Walidacja i error handling
- Implementacja walidacji dla każdego kroku
- Dodanie obsługi błędów walidacji
- Implementacja walidacji w czasie rzeczywistym

### Krok 5: Zarządzanie stanem
- Implementacja `useAddBookForm` hook'a
- Dodanie mechanizmu draft'ów (localStorage)
- Integracja stanu między komponentami

### Krok 6: Integracja API
- Implementacja `useBookCreation` hook'a
- Mapowanie danych formularza na `CreateBookDTO`
- Obsługa response'ów i błędów API

### Krok 7: Tag autocomplete
- Integracja z `GET /api/tags`
- Implementacja autocomplete w `BookCategorizationStep`
- Obsługa dodawania/usuwania tagów

### Krok 8: UX i accessibility
- Implementacja focus management
- Dodanie animacji i transition'ów
- Obsługa keyboard navigation
- ARIA labels i screen reader support

### Krok 9: Responsive design
- Adaptacja modala na urządzenia mobilne
- Testowanie na różnych rozmiarach ekranów
- Optymalizacja touch interactions

### Krok 10: Testowanie i debugging
- Unit testy dla hook'ów i komponentów
- Integration testy dla flow'u dodawania książki
- Manual testing wszystkich ścieżek użytkownika
- Performance testing i optymalizacja 