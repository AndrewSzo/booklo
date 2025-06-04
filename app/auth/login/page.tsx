import { Suspense } from 'react'
import AuthCard from '@/components/auth/AuthCard'
import LoginForm from '@/components/auth/LoginForm'
import { Loader2 } from 'lucide-react'

function LoginFormWrapper() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Zaloguj się"
      description="Wprowadź swoje dane aby uzyskać dostęp do konta"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }>
        <LoginFormWrapper />
      </Suspense>
    </AuthCard>
  )
} 