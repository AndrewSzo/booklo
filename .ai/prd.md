# 📚 Book Management App – MVP

## 🧩 Main Problem
Many readers lose track of their reading lists: they forget what they've already read, what they plan to read, or which books they're currently reading. There's a lack of a simple and intuitive tool to manage reading plans and reflections — without unnecessary features or a cluttered interface.

## 🖥️ User Interface Structure

### 🔹 Left Sidebar
- **Home** – main dashboard
- **Library** – the core section, divided into:
  - Want to Read
  - Reading Now
  - Finished Reading
  - Optional sections like: Books, Notes, PDFs, etc.
- **Feed** – a list of recently added books (inspired by Readwise Inbox)
- **Shortlist / Pinned** – prioritized or favorited items
- **Search and Preferences**
- **User Profile** – e.g., "Andrzej", with login/logout options

### 🔹 Main Page Area
- **Top tabs** for book filtering:
  - 📖 Reading
  - ⏭️ Next
  - ✅ Finished
- **Search bar** for filtering books by title or author
- **Book List Display** with:
  - Title, author, current status
  - Rating (e.g., star system)
  - Optional: date added or completed

### 🔹 Right Sidebar
- **Info** – details about the selected book (title, author, metadata, etc.)
- **Notes** – a space for adding personal reflections or summaries
- **Links** – curated articles, videos, or web pages related to the book or its themes

## 🔧 Minimum Viable Functionality (MVP)
- Add a book to one of three categories:
  - "Want to Read"
  - "Reading Now"
  - "Finished Reading"
- View book list with the ability to filter by status
- Rate books (e.g., 1–5 stars)
- Add short notes or reviews for books
- Edit and delete books
- Store data in the browser's local storage (or a simple backend like Supabase)

## 🚫 Out of Scope for MVP
- Cross-device account synchronization / cloud sync
- Importing data from external sources (e.g., Goodreads, CSV, ISBN)
- Book cover scanning / integration with book databases
- Book recommendations
- Social features (comments, user profiles, sharing)
- Mobile app (web version only in MVP)
- Adding notes to individual chapters
- AI-powered linking of ideas across books

## ✅ Success Criteria
- Users add at least 10 books during their first week of usage
- At least 60% of books in the "Finished Reading" list include a rating and/or a short review
- Users engage with the app in more than 3 sessions per week 




## 🔄 User Flows

### UF-001: Rejestracja użytkownika

- Tytuł: Rejestracja nowego użytkownika
- Opis: Nowy użytkownik chce założyć konto w aplikacji
- Przepływ:
  1. Użytkownik klika przycisk "Sign Up" w prawym górnym rogu
  2. Użytkownik wypełnia formularz rejestracji (email, hasło, potwierdzenie hasła)
  3. Po pomyślnej rejestracji użytkownik zostaje automatycznie przekierowany na `/dashboard`
  4. Użytkownik widzi powitalną wiadomość i może rozpocząć dodawanie książek

### UF-002: Logowanie użytkownika

- Tytuł: Logowanie istniejącego użytkownika
- Opis: Zarejestrowany użytkownik chce zalogować się do aplikacji
- Przepływ:
  1. Użytkownik klika przycisk "Login" w prawym górnym rogu
  2. Użytkownik wprowadza swój email i hasło
  3. Po pomyślnym zalogowaniu użytkownik zostaje przekierowany na `/dashboard`
  4. Użytkownik widzi swoje dane i może kontynuować zarządzanie książkami

### UF-003: Wylogowanie użytkownika

- Tytuł: Wylogowanie z aplikacji
- Opis: Zalogowany użytkownik chce się wylogować z aplikacji
- Przepływ:
  1. Zalogowany użytkownik klika na ikonę swojego profilu w prawym górnym rogu
  2. Z rozwijanego menu wybiera opcję "Logout"
  3. Użytkownik zostaje przekierowany na stronę główną aplikacji
  4. Sesja użytkownika zostaje zakończona

### UF-004: Zarządzanie profilem użytkownika

- Tytuł: Edycja danych osobowych i ustawień konta
- Opis: Użytkownik chce edytować swoje dane osobowe lub zarządzać kontem
- Przepływ:
  1. Zalogowany użytkownik klika na ikonę swojego profilu w prawym górnym rogu
  2. Z menu wybiera opcję "Profile" lub "My Account"
  3. Użytkownik zostaje przekierowany na stronę profilu
  4. Użytkownik może edytować dane osobowe (imię, nazwisko, email)
  5. Użytkownik może zmienić hasło podając aktualne i nowe hasło
  6. Użytkownik może usunąć konto (z potwierdzeniem)
  7. Zmiany są zapisywane po kliknięciu "Save Changes"

### UF-005: Zmiana motywu aplikacji

- Tytuł: Personalizacja wyglądu aplikacji
- Opis: Użytkownik chce zmienić wygląd aplikacji na dark mode
- Przepływ:
  1. Użytkownik przechodzi do sekcji "Settings" z głównego menu
  2. W ustawieniach znajduje opcję "Appearance" lub "Theme"
  3. Użytkownik może przełączyć między trybem jasnym a ciemnym
  4. Zmiana zostaje zastosowana natychmiast i zapisana w preferencjach użytkownika

### UF-006: Przeglądanie biblioteki książek

- Tytuł: Główny widok biblioteki z książkami
- Opis: Użytkownik chce przeglądać swoją kolekcję książek w formie kafelków
- Przepływ:
  1. Użytkownik klika "Library" w lewym sidebarze lub przechodzi na `/library`
  2. Wyświetlają się kafelki z książkami zawierające:
     - Okładkę książki
     - Tytuł
     - Autora
     - Krótki opis
  3. Użytkownik może filtrować książki używając zakładek: "Want to Read", "Reading Now", "Finished"
  4. Po wybraniu książki otwiera się prawy sidebar z:
     - Szczegółowymi informacjami o książce
     - Notatkami użytkownika
     - Chatem AI do dyskusji o książce

### UF-007: Wyszukiwanie książek

- Tytuł: Globalne wyszukiwanie w bibliotece
- Opis: Użytkownik chce znaleźć konkretne książki używając wyszukiwarki
- Przepływ:
  1. Użytkownik klika w pole wyszukiwania na górnym pasku (między logo a profilem)
  2. Użytkownik wprowadza frazę wyszukiwania (tytuł, autor, słowa kluczowe)
  3. Użytkownik zostaje przekierowany na stronę `/search`
  4. Strona wyświetla wyniki w układzie podobnym do `/library`
  5. Pokazywane są tylko książki odpowiadające kryteriom wyszukiwania
  6. Użytkownik może dalej filtrować wyniki lub kliknąć na książkę

### UF-008: Edycja książki

- Tytuł: Modyfikacja danych książki
- Opis: Użytkownik chce edytować informacje o książce lub zmienić jej status
- Przepływ:
  1. Użytkownik klika na książkę w bibliotece lub wynikach wyszukiwania
  2. Otwiera się modal lub strona edycji książki
  3. Użytkownik może edytować:
     - Tytuł i autora
     - Status (Want to Read, Reading Now, Finished)
     - Ocenę (gwiazdki)
     - Opis/notatki
  4. Użytkownik może usunąć książkę (z potwierdzeniem)
  5. Zmiany są zapisywane po kliknięciu "Save"

### UF-009: Zarządzanie notatkami i chat AI

- Tytuł: Dodawanie notatek i dyskusja z AI o książce
- Opis: Użytkownik chce dodać notatki do książki i skorzystać z AI do analizy
- Przepływ:
  1. Użytkownik klika na książkę, co otwiera prawy sidebar
  2. W sidebarze dostępne są sekcje:
     - "Info" - szczegóły książki
     - "Notes" - miejsce na notatki użytkownika
     - "AI Chat" - chat z AI na tematy związane z książką
  3. Użytkownik może dodawać, edytować i usuwać notatki
  4. W sekcji AI Chat użytkownik może zadawać pytania o:
     - Analizę tematów książki
     - Podsumowania rozdziałów
     - Rekomendacje podobnych książek
  5. Wszystkie notatki i historia chatu są zapisywane

### UF-010: Dashboard - przegląd statusów

- Tytuł: Główny dashboard z podsumowaniem biblioteki
- Opis: Użytkownik chce zobaczyć ogólny przegląd swojej biblioteki
- Przepływ:
  1. Użytkownik przechodzi na `/dashboard` (domyślna strona po zalogowaniu)
  2. Dashboard wyświetla:
     - Statystyki: liczbę książek w każdym statusie
     - Karty/kafelki ze statusami: "Want to Read", "Reading Now", "Finished"
     - Sekcję "Currently Reading" z listą aktualnie czytanych książek
  3. Książki w sekcji "Currently Reading" wyświetlane są podobnie jak w `/library`:
     - Okładka, tytuł, autor
     - Możliwość szybkiego przejścia do szczegółów
  4. Użytkownik może kliknąć na statystyki, aby przejść do odpowiedniej sekcji w bibliotece

### UF-011: Dodawanie nowej książki

- Tytuł: Dodanie książki do biblioteki
- Opis: Użytkownik chce dodać nową książkę do swojej biblioteki
- Przepływ:
  1. Użytkownik klika przycisk "Add Book" lub "+" dostępny na stronie `/library` lub `/dashboard`
  2. Otwiera się modal lub formularze dodawania książki
  3. Użytkownik wypełnia wymagane pola:
     - Tytuł książki (wymagane)
     - Autor (wymagane)
     - Status początkowy: "Want to Read", "Reading Now", lub "Finished" (domyślnie "Want to Read")
  4. Użytkownik może opcjonalnie wypełnić:
     - Opis/notatki
     - Ocenę (jeśli status to "Finished")
     - Link do okładki lub upload pliku okładki
  5. Użytkownik klika "Save" lub "Add Book"
  6. Książka zostaje dodana do biblioteki w odpowiednim statusie
  7. Użytkownik zostaje przekierowany na `/library` lub widzi potwierdzenie dodania

### UF-012: Usuwanie książki

- Tytuł: Usunięcie książki z biblioteki
- Opis: Użytkownik chce trwale usunąć książkę ze swojej biblioteki
- Przepływ:
  1. Użytkownik klika na książkę w bibliotece, co otwiera prawy sidebar lub modal szczegółów
  2. Użytkownik klika przycisk "Delete" lub ikonę kosza
  3. Pojawia się modal potwierdzenia z ostrzeżeniem:
     - "Are you sure you want to delete this book?"
     - "This action cannot be undone. All notes and data related to this book will be permanently deleted."
  4. Użytkownik może:
     - Kliknąć "Cancel" aby anulować operację
     - Kliknąć "Delete" aby potwierdzić usunięcie
  5. Po potwierdzeniu książka zostaje trwale usunięta wraz z:
     - Wszystkimi notatkami użytkownika
     - Historią czatu AI
     - Wszystkimi powiązanymi danymi
  6. Użytkownik widzi komunikat potwierdzający usunięcie
  7. Widok biblioteki zostaje odświeżony bez usuniętej książki

### US-011: Kolekcje reguł

- Tytuł: Kolekcje reguł
- Opis: Jako użytkownik chcę móc zapisywać i edytować zestawy reguł, aby szybko wykorzystywać sprawdzone rozwiązania w różnych projektach.
- Kryteria akceptacji:
  - Użytkownik może zapisać aktualny zestaw reguł (US-001) jako kolekcję (nazwa, opis, reguły).
  - Użytkownik może aktualizować kolekcję.
  - Użytkownik może usunąć kolekcję.
  - Użytkownik może przywrócić kolekcję do poprzedniej wersji (pending changes).
  - Funkcjonalność kolekcji nie jest dostępna bez logowania się do systemu (US-004).

### US-012: Bezpieczny dostęp i uwierzytelnianie

- Tytuł: Bezpieczny dostęp
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik MOŻE korzystać z tworzenia reguł "ad-hoc" bez logowania się do systemu (US-001).
  - Użytkownik NIE MOŻE korzystać z funkcji Kolekcji bez logowania się do systemu (US-003).
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.