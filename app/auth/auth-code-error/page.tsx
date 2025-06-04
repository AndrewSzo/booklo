import Link from 'next/link'
import { Button } from '@/components/ui/button'
import AuthCard from '@/components/auth/AuthCard'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <AuthCard
      title="Błąd uwierzytelniania"
      description="Wystąpił problem z potwierdzeniem Twojego konta"
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Link potwierdzający jest nieprawidłowy lub wygasł. 
            Spróbuj ponownie lub skontaktuj się z pomocą techniczną.
          </p>
        </div>
        
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Przejdź do logowania
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/register">
              Zarejestruj się ponownie
            </Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  )
} 