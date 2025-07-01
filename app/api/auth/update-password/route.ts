import { createClient } from '@/lib/supabase/api'
import { NextRequest, NextResponse } from 'next/server'
import { newPasswordSchema } from '@/lib/validations/auth'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, confirmPassword } = body
    
    // Validate input
    const validationResult = newPasswordSchema.safeParse({ 
      password, 
      confirmPassword 
    })
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Nowe hasło jest nieprawidłowe' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      return NextResponse.json(
        { error: getAuthErrorMessage(error.message) },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji hasła' },
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