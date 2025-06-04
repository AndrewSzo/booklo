# AI Chat Setup Guide

## Konfiguracja AI Chat w Booklo

### Wymagania
- Konto OpenAI z dostępem do API
- Klucz API OpenAI

### Kroki instalacji

1. **Uzyskaj klucz API OpenAI**
   - Przejdź do https://platform.openai.com/api-keys
   - Zaloguj się do swojego konta OpenAI
   - Utwórz nowy klucz API

2. **Skonfiguruj zmienne środowiskowe**
   - Stwórz plik `.env.local` w głównym katalogu projektu (jeśli nie istnieje)
   - Dodaj następującą linię:
   ```
   OPENAI_API_KEY=twój_klucz_api_tutaj
   ```
   - Zastąp `twój_klucz_api_tutaj` swoim rzeczywistym kluczem API

3. **Uruchom aplikację**
   ```bash
   npm run dev
   ```

## Funkcjonalności AI Chat

### Podstawowe funkcje
- **Rekomendacje książek** - Poproś o sugestie na podstawie swoich preferencji
- **Podsumowania książek** - Uzyskaj krótkie streszczenia wybranych tytułów
- **Analiza literacka** - Dyskusje o tematach, stylach i autorach
- **Personalizowane porady** - AI uwzględnia kontekst Twojej biblioteki

### Zaawansowane funkcje
- **Historia konwersacji** - Automatyczne zapisywanie i zarządzanie czatami
- **Quick Suggestions** - Gotowe pytania do szybkiego rozpoczęcia rozmowy
- **Streaming responses** - Odpowiedzi w czasie rzeczywistym (jak ChatGPT)
- **Zarządzanie sesjami** - Tworzenie nowych czatów i przełączanie między nimi

### Interfejs użytkownika

#### Główne elementy:
- **New Chat** - Rozpocznij nową konwersację
- **History** - Przeglądaj poprzednie rozmowy
- **Quick Suggestions** - Kliknij gotowe pytania na start
- **Streaming** - Obserwuj odpowiedzi pojawiające się na żywo

#### Historia konwersacji:
- Automatyczne zapisywanie w localStorage
- Maksymalnie 10 ostatnich rozmów
- Tytuły generowane z pierwszej wiadomości
- Możliwość usuwania pojedynczych czatów
- Opcja wyczyszczenia całej historii

### Przykładowe zapytania

#### Quick Suggestions (wbudowane):
- "Recommend me a book based on my library"
- "What's a good fantasy book for beginners?"
- "Summarize the main themes in 1984"
- "What should I read after Harry Potter?"

#### Inne przydatne pytania:
- "Poleć mi książkę sci-fi podobną do Diuny"
- "Jakie są najlepsze książki o sztucznej inteligencji?"
- "Wyjaśnij różnice między realizmem magicznym a fantasy"
- "Porównaj style pisania Tolkiena i Martina"

### Techniczne szczegóły

#### Endpoints API:
- `/api/ai-chat` - Standardowe odpowiedzi (JSON)
- `/api/ai-chat/stream` - Streaming responses (SSE)

#### Modele AI:
- **Model**: `gpt-3.5-turbo`
- **Max tokens**: 500 per response
- **Temperature**: 0.7 (kreatywne odpowiedzi)

#### Zarządzanie danymi:
- **Storage**: localStorage (client-side)
- **Maksymalna liczba konwersacji**: 10
- **Auto-tytuły**: Z pierwszej wiadomości użytkownika
- **Timestamps**: Automatyczne dla wszystkich wiadomości

### Rozwiązywanie problemów

**Błąd: "OpenAI API key not configured"**
- Sprawdź, czy plik `.env.local` istnieje
- Upewnij się, że klucz API jest poprawnie ustawiony
- Restartuj serwer deweloperski

**Błąd: "Failed to get AI response"**
- Sprawdź połączenie internetowe
- Zweryfikuj ważność klucza API
- Sprawdź limity na koncie OpenAI

**Problemy ze streamingiem:**
- Sprawdź wsparcie przeglądarki dla Server-Sent Events
- Wyłącz blokery reklam mogące blokować streaming
- W przypadku problemów, system automatycznie przełączy się na standardowe odpowiedzi

**Historia konwersacji nie zapisuje się:**
- Sprawdź czy localStorage jest włączony
- Sprawdź miejsce w localStorage (quota)
- Wyczyść localStorage i spróbuj ponownie

### Bezpieczeństwo

- **NIE** commituj pliku `.env.local` do repozytorium
- Regularnie odnawiaj klucze API
- Monitoruj użycie API w panelu OpenAI
- Historia konwersacji jest przechowywana lokalnie (nie na serwerze)

### Koszty i optymalizacja

#### Koszty:
- AI Chat używa modelu `gpt-3.5-turbo`
- Koszt zależy od liczby tokenów w zapytaniach i odpowiedziach
- Monitoruj użycie w panelu OpenAI: https://platform.openai.com/usage

#### Optymalizacje:
- **Streaming** - Lepsza percepcja szybkości odpowiedzi
- **Lokalna historia** - Brak kosztów serwera dla historii
- **Kontekst biblioteki** - Bardziej precyzyjne odpowiedzi
- **Limit tokenów** - Kontrola kosztów przez ograniczenie długości odpowiedzi

### Wsparcie techniczne

Jeśli napotkasz problemy:
1. Sprawdź konsolę deweloperską w przeglądarce
2. Zweryfikuj konfigurację OpenAI API
3. Sprawdź logi serwera (`npm run dev`)
4. Wyczyść localStorage i rozpocznij od nowa 