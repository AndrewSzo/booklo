import AuthCard from '@/components/auth/AuthCard'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthCard
      title="Utwórz konto"
      description="Wypełnij formularz aby założyć nowe konto"
    >
      <RegisterForm />
    </AuthCard>
  )
} 