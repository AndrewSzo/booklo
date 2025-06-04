import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface AuthErrorProps {
  message: string
}

export default function AuthError({ message }: AuthErrorProps) {
  if (!message) return null

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
} 