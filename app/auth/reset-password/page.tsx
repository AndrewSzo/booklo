import { Suspense } from 'react'
import AuthCard from '@/components/auth/AuthCard'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { Loader2 } from 'lucide-react'

function ResetPasswordFormWrapper() {
  return <ResetPasswordForm mode="request" />
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Resetuj hasło"
      description="Podaj adres email aby otrzymać link do zmiany hasła"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }>
        <ResetPasswordFormWrapper />
      </Suspense>
    </AuthCard>
  )
} 