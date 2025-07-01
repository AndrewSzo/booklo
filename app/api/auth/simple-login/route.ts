import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth'

// Remove edge runtime to test if that's the issue
// export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    console.log('Simple login attempt started')
    
    const body = await request.json()
    const { email, password } = body
    
    console.log('Received data:', { 
      hasEmail: !!email, 
      hasPassword: !!password,
      emailLength: email?.length || 0
    })
    
    // Validate input
    const validationResult = loginSchema.safeParse({ email, password })
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors)
      return NextResponse.json(
        { 
          error: 'Dane logowania są nieprawidłowe',
          validationErrors: validationResult.error.errors
        },
        { status: 400 }
      )
    }
    
    console.log('Validation passed, creating Supabase client')

    const supabase = await createClient()
    
    console.log('Supabase client created, attempting sign in')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Sign in response:', {
      hasData: !!data,
      hasUser: !!data?.user,
      hasError: !!error,
      errorMessage: error?.message
    })

    if (error) {
      console.error('Supabase auth error:', error)
      return NextResponse.json(
        { 
          error: getAuthErrorMessage(error.message),
          supabaseError: error.message
        },
        { status: 401 }
      )
    }

    console.log('Login successful')
    return NextResponse.json({ 
      success: true,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email
      } : null
    })
    
  } catch (error) {
    console.error('Simple login error:', error)
    return NextResponse.json(
      { 
        error: 'Wystąpił błąd podczas logowania',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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