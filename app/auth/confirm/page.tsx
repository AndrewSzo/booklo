import { Suspense } from 'react'
import AuthCard from '@/components/auth/AuthCard'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ConfirmPage() {
  return (
    <AuthCard
      title="Ustaw nowe hasło"
      description="Wprowadź nowe hasło dla swojego konta"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm mode="reset" />
      </Suspense>
    </AuthCard>
  )
} 