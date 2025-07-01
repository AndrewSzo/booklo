'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import AuthError from './AuthError'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError('')
    setSuccessMessage('')
    
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
          }),
        })

        const result = await response.json()
        
        if (!response.ok || result.error) {
          const errorMessage = result.error || `Błąd ${response.status}: ${response.statusText}`
          console.error('Registration failed:', { status: response.status, error: result.error })
          setAuthError(errorMessage)
          return
        }
        
        if (result.success) {
          setSuccessMessage(result.success)
        }
        
      } catch {
        setAuthError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {authError && <AuthError message={authError} />}
      
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
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
        />
        {errors.email && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
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
            placeholder="Minimum 6 znaków"
            {...register('password')}
            className={`pr-12 transition-all duration-200 ${
              errors.password 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
            disabled={isPending}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600"
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
        {errors.password && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            <span>{errors.password.message}</span>
          </p>
        )}
        
        {/* Password strength indicator */}
        {password && password.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600">Siła hasła:</div>
            <div className="flex space-x-1">
              <div className={`h-1 flex-1 rounded ${password.length >= 6 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
              <div className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
              <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Potwierdź hasło</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Wprowadź hasło ponownie"
            {...register('confirmPassword')}
            className={`pr-12 transition-all duration-200 ${
              errors.confirmPassword 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
            disabled={isPending}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600"
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
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            <span>{errors.confirmPassword.message}</span>
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
        disabled={isPending}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Tworzenie konta...' : 'Utwórz konto'}
      </Button>

      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Masz już konto?{' '}
          <Link
            href="/auth/login"
            className="text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline font-medium transition-colors duration-200"
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    </form>
  )
} 