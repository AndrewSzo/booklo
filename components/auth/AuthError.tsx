import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface AuthErrorProps {
  message: string
  'data-testid'?: string
}

export default function AuthError({ message, 'data-testid': testId }: AuthErrorProps) {
  if (!message) return null

  return (
    <Alert variant="destructive" data-testid={testId}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
} 