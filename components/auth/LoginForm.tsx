'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import AuthError from './AuthError'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setAuthError('')
    
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        })

        const result = await response.json()
        
        if (!response.ok || result.error) {
          const errorMessage = result.error || `Błąd ${response.status}: ${response.statusText}`
          console.error('Login failed:', { status: response.status, error: result.error })
          setAuthError(errorMessage)
          return
        }
        
        // Redirect to dashboard on success
        const redirectTo = searchParams.get('redirectTo') || '/dashboard'
        
        // Small delay to ensure cookies are set
        setTimeout(() => {
          window.location.href = redirectTo
        }, 100)
        
      } catch {
        setAuthError('Wystąpił błąd podczas logowania. Spróbuj ponownie.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="login-form">
      {authError && <AuthError message={authError} data-testid="auth-error" />}
      
      {redirectTo && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800" data-testid="redirect-notice">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full flex-shrink-0"></div>
            <span>Zaloguj się, aby uzyskać dostęp do tej strony</span>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="twoj@email.com"
          {...register('email')}
          className={`transition-all duration-200 ${
            errors.email 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'
          }`}
          disabled={isPending}
          data-testid="email-input"
        />
        {errors.email && (
          <p className="text-sm text-red-600 flex items-center space-x-1" data-testid="email-error">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            <span>{errors.email.message}</span>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium">Hasło</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Wprowadź hasło"
            {...register('password')}
            className={`pr-12 transition-all duration-200 ${
              errors.password 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
            disabled={isPending}
            data-testid="password-input"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
            data-testid="password-toggle"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600 flex items-center space-x-1" data-testid="password-error">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            <span>{errors.password.message}</span>
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/auth/reset-password"
          className="text-sm text-gray-600 hover:text-emerald-600 underline-offset-4 hover:underline transition-colors duration-200"
          data-testid="forgot-password-link"
        >
          Zapomniałeś hasła?
        </Link>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
        disabled={isPending}
        data-testid="login-submit-button"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Logowanie...' : 'Zaloguj się'}
      </Button>

      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Nie masz konta?{' '}
          <Link
            href="/auth/register"
            className="text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline font-medium transition-colors duration-200"
            data-testid="signup-link"
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </form>
  )
} 