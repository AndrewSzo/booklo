import { createClientForEdge } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Debug: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseAnonKey?.length || 0,
      processEnvKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
    })

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Konfiguracja serwera jest nieprawidłowa' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password } = body
    
    console.log('Login attempt:', { email: email?.substring(0, 3) + '***' })
    
    // Validate input
    const validationResult = loginSchema.safeParse({ email, password })
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors)
      return NextResponse.json(
        { error: 'Dane logowania są nieprawidłowe' },
        { status: 400 }
      )
    }

    // Create response first to handle cookies
    const response = NextResponse.json({ success: true })
    const supabase = createClientForEdge(request, response)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase auth error:', error.message)
      return NextResponse.json(
        { 
          error: getAuthErrorMessage(error.message),
          debug: error.message // Temporary debug info
        },
        { status: 401 }
      )
    }

    console.log('Login successful - session should be set in cookies')
    return response
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas logowania' },
      { status: 500 }
    )
  }
}

// Helper function to map Supabase errors to Polish messages
function getAuthErrorMessage(error: string): string {
  switch (error) {
    case 'Invalid login credentials':
      return 'Nieprawidłowy email lub hasło'
    case 'Email not confirmed':
      return 'Potwierdź swój adres email przed zalogowaniem'
    case 'User already registered':
      return 'Użytkownik z tym adresem email już istnieje'
    case 'Password should be at least 6 characters':
      return 'Hasło musi mieć co najmniej 6 znaków'
    case 'Signup is disabled':
      return 'Rejestracja jest obecnie wyłączona'
    case 'Email rate limit exceeded':
      return 'Zbyt wiele prób. Spróbuj ponownie za chwilę'
    default:
      return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie'
  }
} 