import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
}

export default function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-xl border-emerald-100">
        <CardHeader className="space-y-4 text-center">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
            <CardDescription className="text-gray-600">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  )
} 