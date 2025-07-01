import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordSchema } from '@/lib/validations/auth'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    // Validate input
    const validationResult = resetPasswordSchema.safeParse({ email })
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Podaj poprawny adres email' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?step=update`
    })

    if (error) {
      return NextResponse.json(
        { error: getAuthErrorMessage(error.message) },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: 'Instrukcje resetowania hasła zostały wysłane na Twój email'
    })
    
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas resetowania hasła' },
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