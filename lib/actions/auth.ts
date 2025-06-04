'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema, resetPasswordSchema, newPasswordSchema } from '@/lib/validations/auth'

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  // Validate input
  const validationResult = loginSchema.safeParse({ email, password })
  if (!validationResult.success) {
    return {
      error: 'Dane logowania są nieprawidłowe'
    }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: getAuthErrorMessage(error.message)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  // Validate input
  const validationResult = registerSchema.safeParse({ 
    email, 
    password, 
    confirmPassword 
  })
  
  if (!validationResult.success) {
    return {
      error: 'Dane rejestracji są nieprawidłowe'
    }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })

  if (error) {
    return {
      error: getAuthErrorMessage(error.message)
    }
  }

  return {
    success: 'Sprawdź swoją skrzynkę e-mail w celu potwierdzenia konta'
  }
}

export async function signOutAction() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return {
      error: 'Wystąpił błąd podczas wylogowywania'
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get('email') as string
  
  // Validate input
  const validationResult = resetPasswordSchema.safeParse({ email })
  if (!validationResult.success) {
    return {
      error: 'Podaj poprawny adres email'
    }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?step=update`
  })

  if (error) {
    return {
      error: getAuthErrorMessage(error.message)
    }
  }

  return {
    success: 'Instrukcje resetowania hasła zostały wysłane na Twój email'
  }
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  // Validate input
  const validationResult = newPasswordSchema.safeParse({ 
    password, 
    confirmPassword 
  })
  
  if (!validationResult.success) {
    return {
      error: 'Nowe hasło jest nieprawidłowe'
    }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password
  })

  if (error) {
    return {
      error: getAuthErrorMessage(error.message)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
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