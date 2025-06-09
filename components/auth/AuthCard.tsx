import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
  'data-testid'?: string
}

export default function AuthCard({ title, description, children, 'data-testid': testId }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4" data-testid={testId || "auth-page"}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-xl border-emerald-100" data-testid="auth-card">
        <CardHeader className="space-y-4 text-center">
          {/* Logo */}
          <div className="mx-auto flex items-center justify-center space-x-2" data-testid="auth-logo">
            <BookOpen className="w-10 h-10 text-emerald-700" data-testid="auth-logo-icon" />
            <span className="text-2xl font-bold text-emerald-700" data-testid="auth-logo-text">Booklo</span>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900" data-testid="auth-title">{title}</CardTitle>
            <CardDescription className="text-gray-600" data-testid="auth-description">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4" data-testid="auth-content">
          {children}
        </CardContent>
      </Card>
    </div>
  )
} 