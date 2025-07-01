'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  resetPasswordSchema, 
  newPasswordSchema,
  type ResetPasswordFormData,
  type NewPasswordFormData 
} from '@/lib/validations/auth'

import AuthError from './AuthError'
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

interface ResetPasswordFormProps {
  mode?: 'request' | 'reset'
}

export default function ResetPasswordForm({ mode = 'request' }: ResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const searchParams = useSearchParams()
  
  // Check if we're in update mode based on URL params
  const step = searchParams.get('step')
  const isUpdateMode = step === 'update' || mode === 'reset'

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: requestErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  })

  const onSubmitRequest = async (data: ResetPasswordFormData) => {
    setAuthError('')
    setSuccessMessage('')
    
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
          }),
        })

        const result = await response.json()
        
        if (!response.ok || result.error) {
          setAuthError(result.error || 'Wystąpił błąd podczas wysyłania linku')
          return
        }
        
        if (result.success) {
          setSuccessMessage(result.success)
        }
        
      } catch {
        setAuthError('Wystąpił błąd podczas wysyłania linku. Spróbuj ponownie.')
      }
    })
  }

  const onSubmitReset = async (data: NewPasswordFormData) => {
    setAuthError('')
    setSuccessMessage('')
    
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/update-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: data.password,
            confirmPassword: data.confirmPassword,
          }),
        })

        const result = await response.json()
        
        if (!response.ok || result.error) {
          setAuthError(result.error || 'Wystąpił błąd podczas zmiany hasła')
          return
        }
        
        // Redirect to dashboard on success
        window.location.href = '/dashboard'
        
      } catch {
        setAuthError('Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie.')
      }
    })
  }

  if (successMessage) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Email został wysłany</h3>
          <p className="text-sm text-muted-foreground">
            {successMessage}
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/auth/login">
            Przejdź do logowania
          </Link>
        </Button>
      </div>
    )
  }

  if (!isUpdateMode) {
    return (
      <form onSubmit={handleSubmitRequest(onSubmitRequest)} className="space-y-4">
        {authError && <AuthError message={authError} />}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.com"
            {...registerRequest('email')}
            className={requestErrors.email ? 'border-destructive' : ''}
            disabled={isPending}
          />
          {requestErrors.email && (
            <p className="text-sm text-destructive">{requestErrors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Wysyłanie...' : 'Wyślij link resetujący'}
        </Button>

        <div className="text-center">
          <Button variant="ghost" asChild className="text-sm">
            <Link href="/auth/login" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Powrót do logowania
            </Link>
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmitReset(onSubmitReset)} className="space-y-4">
      {authError && <AuthError message={authError} />}
      
      <div className="space-y-2">
        <Label htmlFor="password">Nowe hasło</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Wprowadź nowe hasło"
            {...registerReset('password')}
            className={resetErrors.password ? 'border-destructive pr-10' : 'pr-10'}
            disabled={isPending}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {resetErrors.password && (
          <p className="text-sm text-destructive">{resetErrors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Potwierdź nowe hasło"
            {...registerReset('confirmPassword')}
            className={resetErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
            disabled={isPending}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isPending}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {resetErrors.confirmPassword && (
          <p className="text-sm text-destructive">{resetErrors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Zmienianie hasła...' : 'Zmień hasło'}
      </Button>
    </form>
  )
} 