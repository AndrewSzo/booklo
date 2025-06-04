# 🔐 Specyfikacja Techniczna Systemu Autentykacji - Booklo

## 📋 Przegląd Systemu

Niniejsza specyfikacja opisuje implementację kompleksowego systemu autentykacji dla aplikacji Booklo, zgodnego z wymaganiami US-003 i US-004 z PRD. System umożliwia bezpieczne zarządzanie dostępem użytkowników, przy zachowaniu funkcjonalności "guest mode" dla podstawowych operacji na regułach.

## 🏗️ 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Struktura Routingu Next.js (App Router)

#### 1.1.1 Nowe Route'y Autentykacji
```
app/
├── auth/
│   ├── login/
│   │   └── page.tsx           # Strona logowania
│   ├── register/
│   │   └── page.tsx           # Strona rejestracji
│   ├── reset-password/
│   │   └── page.tsx           # Strona resetowania hasła
│   ├── confirm/
│   │   └── page.tsx           # Potwierdzenie email/reset hasła
│   └── callback/
│       └── route.ts           # API route dla Supabase callback
├── (protected)/               # Grupa route'ów chronionych
│   ├── dashboard/
│   ├── collections/
│   │   ├── page.tsx           # Lista kolekcji (wymaga auth)
│   │   ├── [id]/
│   │   │   └── page.tsx       # Edycja kolekcji
│   │   └── new/
│   │       └── page.tsx       # Tworzenie nowej kolekcji
│   └── profile/
│       └── page.tsx           # Profil użytkownika
└── (public)/                  # Grupa route'ów publicznych
    ├── page.tsx               # Strona główna (dostępna bez auth)
    └── rules/
        └── page.tsx           # Tworzenie reguł "ad-hoc" (bez auth)
```

#### 1.1.2 Aktualizacja Głównego Layout'u
**Plik:** `app/layout.tsx`
- Dodanie `AuthProvider` do QueryProvider
- Dodanie `ToastProvider` dla komunikatów systemu
- Zachowanie obecnej struktury z fontami i metadanymi

#### 1.1.3 Layout Grup Route'ów

**Plik:** `app/(protected)/layout.tsx` - nowy layout dla chronionych stron:
- Server Component wykonujący check autentykacji
- Redirect do `/auth/login` jeśli brak sesji
- Wrapper dla chronionych komponentów

**Plik:** `app/(public)/layout.tsx` - layout dla stron publicznych:
- Prosty wrapper bez wymagań autentykacji
- Opcjonalne wyświetlanie banera zachęcającego do rejestracji

### 1.2 Komponenty Autentykacji

#### 1.2.1 Formularze Autentykacji (Client Components)

**Komponent:** `components/auth/LoginForm.tsx`
- Client Component z React Hook Form i Zod validation
- Pola: email, password
- Integracja z Supabase Auth
- Obsługa błędów i stanów loading
- Link do rejestracji i resetowania hasła

**Komponent:** `components/auth/RegisterForm.tsx`
- Client Component z walidacją haseł
- Pola: email, password, confirmPassword
- Walidacja siły hasła
- Wysyłanie email potwierdzającego

**Komponent:** `components/auth/ResetPasswordForm.tsx`
- Formularz resetowania hasła (email)
- Formularz ustawienia nowego hasła (po kliknięciu w link)

#### 1.2.2 Komponenty UI z Shadcn/ui

**Komponent:** `components/auth/AuthCard.tsx`
- Wrapper card dla formularzy auth
- Wykorzystanie Card z Shadcn/ui
- Responsywny design z Tailwind 4

**Komponent:** `components/auth/AuthError.tsx`
- Komponent wyświetlania błędów
- Wykorzystanie Alert z Shadcn/ui

#### 1.2.3 Aktualizacja Istniejących Komponentów

**Komponent:** `components/dashboard/UserProfileSection.tsx`
- Rozszerzenie o rzeczywiste dane użytkownika z Supabase
- Implementacja faktycznej funkcjonalności logout
- Dodanie obsługi stanów załadowanych/niezaładowanych danych

### 1.3 Nawigacja i Stan Autentykacji

#### 1.3.1 Aktualizacja Navigation
**Komponent:** `components/dashboard/NavigationMenu.tsx`
- Dodanie linków do zarządzania kolekcjami (tylko dla zalogowanych)
- Conditionally rendering w zależności od stanu auth

#### 1.3.2 Auth-Aware Components
**Komponent:** `components/common/AuthButton.tsx`
- Przycisk Login/Register w prawym górnym rogu
- Dynamiczne renderowanie w zależności od stanu auth
- Dropdown menu dla zalogowanych użytkowników

### 1.4 Walidacja i Komunikaty Błędów

#### 1.4.1 Schemat Walidacji Zod
**Plik:** `lib/validations/auth.ts`
```typescript
// Schematy walidacji dla:
// - loginSchema (email, password)
// - registerSchema (email, password, confirmPassword)
// - resetPasswordSchema (email)
// - newPasswordSchema (password, confirmPassword)
```

#### 1.4.2 Komunikaty Błędów
- Wykorzystanie React Hook Form do walidacji po stronie klienta
- Mapowanie błędów Supabase na przyjazne komunikaty w języku polskim
- Toast notifications dla sukcesu/błędów operacji

## 🔧 2. LOGIKA BACKENDOWA

### 2.1 API Routes Next.js

#### 2.1.1 Struktura API
```
app/api/auth/
├── login/
│   └── route.ts               # POST - logowanie użytkownika
├── register/
│   └── route.ts               # POST - rejestracja użytkownika
├── logout/
│   └── route.ts               # POST - wylogowanie użytkownika
├── reset-password/
│   └── route.ts               # POST - inicjacja resetowania hasła
├── confirm/
│   └── route.ts               # GET - potwierdzenie email/reset
└── user/
    └── route.ts               # GET - dane aktualnego użytkownika
```

#### 2.1.2 Walidacja Danych Wejściowych
**Plik:** `lib/api/validation.ts`
- Middleware walidacji z Zod dla API routes
- Sanityzacja inputów
- Rate limiting dla endpointów auth

#### 2.1.3 Obsługa Błędów
**Plik:** `lib/api/error-handler.ts`
- Centralna obsługa błędów API
- Mapowanie błędów Supabase na standardowe response'y
- Logging błędów dla monitoringu

### 2.2 Server Actions

#### 2.2.1 Auth Actions
**Plik:** `lib/actions/auth.ts`
```typescript
// Server Actions for:
// - signInAction(formData)
// - signUpAction(formData)
// - signOutAction()
// - resetPasswordAction(email)
// - updatePasswordAction(password)
```

#### 2.2.2 Collections Actions (Protected)
**Plik:** `lib/actions/collections.ts`
- CRUD operations dla kolekcji reguł
- Walidacja ownership kolekcji
- Wymaganie autentykacji

### 2.3 Database Schema

#### 2.3.1 Rozszerzenie Tabel Supabase
```sql
-- Tabela profili użytkowników (rozszerzenie auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela kolekcji reguł
CREATE TABLE rule_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_collections ENABLE ROW LEVEL SECURITY;

-- Policies dla profiles
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Policies dla rule_collections
CREATE POLICY "Users can view own collections" 
  ON rule_collections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own collections" 
  ON rule_collections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" 
  ON rule_collections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" 
  ON rule_collections FOR DELETE 
  USING (auth.uid() = user_id);
```

## 🔒 3. SYSTEM AUTENTYKACJI

### 3.1 Konfiguracja Supabase Auth

#### 3.1.1 Auth Settings
**Plik:** `lib/supabase/auth-config.ts`
- Konfiguracja redirect URLs
- Ustawienia email templates
- Password policy configuration

#### 3.1.2 Rozszerzenie Klientów Supabase
**Aktualizacja:** `lib/supabase/client.ts`
- Dodanie auth event listeners
- Automatic token refresh handling

**Aktualizacja:** `lib/supabase/server.ts`
- Optymalizacja dla Server Components
- Enhanced error handling

### 3.2 Middleware Next.js

#### 3.2.1 Aktualizacja Middleware
**Plik:** `middleware.ts`
- Implementacja ochrony route'ów chronionych
- Redirect logic dla niezalogowanych użytkowników
- Obsługa callback'ów Supabase Auth
- Walidacja session w cookie

#### 3.2.2 Route Protection Logic
```typescript
// Logika w middleware:
// 1. Public routes: /, /auth/*, /rules (ad-hoc)
// 2. Protected routes: /dashboard/*, /collections/*, /profile/*
// 3. Automatic redirects based on auth state
```

### 3.3 Auth Context i Hooks

#### 3.3.1 Auth Provider
**Plik:** `lib/providers/AuthProvider.tsx`
- Context Provider owijający aplikację
- State management dla user session
- Real-time auth state updates
- Integration z React Query dla cache'owania

#### 3.3.2 Auth Hooks
**Plik:** `hooks/useAuth.ts`
- Custom hook do zarządzania auth state
- Methods: login, register, logout, resetPassword
- Loading states i error handling

**Plik:** `hooks/useUser.ts`
- Hook do pobierania danych użytkownika
- Cache'owanie z React Query
- Automatic refetch na auth state change

### 3.4 Session Management

#### 3.4.1 Token Handling
- Automatic refresh token rotation
- Secure cookie storage
- CSRF protection

#### 3.4.2 Logout Handling
- Global logout functionality
- Session cleanup
- Redirect to appropriate page

## 🔄 4. INTEGRACJA Z ISTNIEJĄCĄ FUNKCJONALNOŚCIĄ

### 4.1 Kompatybilność z Obecnym Kodem

#### 4.1.1 Books Management
- Zachowanie obecnych funkcjonalności w `/dashboard`
- Wszystkie operacje na książkach pozostają bez zmian
- Dashboard dostępny tylko po zalogowaniu

#### 4.1.2 Guest Mode dla Reguł
- Możliwość tworzenia reguł bez logowania na `/rules`
- Local storage dla niezalogowanych użytkowników
- Opcja przeniesienia do konta po rejestracji

### 4.2 Migration Strategy

#### 4.2.1 Database Migrations
- Supabase migrations dla nowych tabel
- Seed data dla istniejących użytkowników testowych
- Backup strategy dla production

#### 4.2.2 Gradual Rollout
- Feature flags dla postupnego włączania auth
- Backward compatibility maintenance
- A/B testing possibilities

## 🧪 5. TESTOWANIE I WALIDACJA

### 5.1 Scenariusze Testowe

#### 5.1.1 Podstawowe Flows
- Rejestracja → Email confirmation → Login → Dashboard
- Forgot password → Reset → Login
- Guest mode → Register → Migration of data

#### 5.1.2 Edge Cases
- Expired sessions handling
- Network connectivity issues
- Browser refresh scenarios
- Multiple tab handling

### 5.2 Security Considerations

#### 5.2.1 Input Validation
- All user inputs validated on client AND server
- SQL injection prevention (RLS)
- XSS protection (CSP headers)

#### 5.2.2 Rate Limiting
- Login attempts limiting
- Registration throttling
- Password reset frequency limits

## 📊 6. MONITORING I ANALYTICS

### 6.1 Auth Metrics
- Registration conversion rates
- Login success/failure rates
- Password reset usage
- Session duration tracking

### 6.2 Error Tracking
- Auth error categorization
- Failed login attempt patterns
- Performance monitoring for auth flows

## 🚀 7. DEPLOYMENT CONSIDERATIONS

### 7.1 Environment Variables
```bash
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=

# Email Configuration
SUPABASE_SMTP_HOST=
SUPABASE_SMTP_PORT=
SUPABASE_SMTP_USER=
SUPABASE_SMTP_PASS=
```

### 7.2 Production Setup
- HTTPS enforcement
- Secure cookie configuration
- CORS policy setup
- Email templates customization

## ✅ 8. KRYTERIA AKCEPTACJI

### 8.1 Funkcjonalne
- ✅ Rejestracja z email/password działa poprawnie
- ✅ Logowanie z email/password działa poprawnie  
- ✅ Reset hasła przez email działa poprawnie
- ✅ Wylogowanie działa we wszystkich częściach aplikacji
- ✅ Dashboard dostępny tylko po zalogowaniu
- ✅ Kolekcje dostępne tylko po zalogowaniu
- ✅ Reguły "ad-hoc" dostępne bez logowania
- ✅ Przycisk Login/Logout w prawym górnym rogu

### 8.2 Niefunkcjonalne  
- ✅ Wszystkie formularze zwalidowane po stronie klienta i serwera
- ✅ Komunikaty błędów w języku polskim
- ✅ Responsywny design na wszystkich urządzeniach
- ✅ Loading states podczas operacji auth
- ✅ Bezpieczne przechowywanie sesji
- ✅ Automatic session refresh

### 8.3 Bezpieczeństwo
- ✅ Wszystkie chronione route'y wymagają autentykacji
- ✅ RLS policies w Supabase skonfigurowane
- ✅ Input validation wszędzie gdzie potrzebna
- ✅ Rate limiting na endpointach auth
- ✅ Secure cookie configuration
- ✅ CSRF protection active

## 📝 9. TECHNICZNE DETALE IMPLEMENTACJI

### 9.1 TypeScript Types
```typescript
// lib/types/auth.ts
interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface RuleCollection {
  id: string
  userId: string
  name: string
  description?: string
  rules: Record<string, any>
  isPublic: boolean
  createdAt: string
  updatedAt: string
}
```

### 9.2 Error Handling Strategy
- Centralized error boundary dla auth errors
- User-friendly error messages mapping
- Automatic retry logic dla network errors
- Graceful degradation for auth failures

### 9.3 Performance Optimizations
- Server Components gdzie możliwe
- Code splitting dla auth components
- Prefetching protected routes dla authenticated users
- Optimistic updates gdzie bezpieczne

Niniejsza specyfikacja zapewnia kompleksowe pokrycie wszystkich wymagań związanych z autentykacją w aplikacji Booklo, przy zachowaniu kompatybilności z istniejącą funkcjonalnością i zapewnieniu wysokiego poziomu bezpieczeństwa i user experience. 