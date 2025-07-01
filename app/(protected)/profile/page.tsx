import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Calendar, Settings } from 'lucide-react'

export const runtime = 'edge'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null // This shouldn't happen due to layout protection
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profil Użytkownika</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj swoimi danymi osobowymi i ustawieniami konta
          </p>
        </div>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informacje o koncie
              </CardTitle>
              <CardDescription>
                Podstawowe informacje o Twoim koncie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Data rejestracji</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ustawienia konta
              </CardTitle>
              <CardDescription>
                Zarządzaj bezpieczeństwem i preferencjami konta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Zmiana hasła</p>
                  <p className="text-sm text-muted-foreground">
                    Zaktualizuj hasło do swojego konta
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Zmień hasło
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Usunięcie konta</p>
                  <p className="text-sm text-muted-foreground">
                    Trwale usuń swoje konto i wszystkie dane
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Usuń konto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 