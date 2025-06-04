import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Plus, Save } from 'lucide-react'
import Link from 'next/link'

export default function RulesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Kreator Reguł</h1>
          <p className="text-muted-foreground mt-2">
            Twórz reguły bez konieczności rejestracji - tryb gościa
          </p>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Pracujesz w trybie gościa. Twoje reguły będą zapisane lokalnie w przeglądarce. 
            Aby zapisać je na stałe i mieć dostęp z różnych urządzeń, 
            <Link href="/auth/register" className="underline font-medium ml-1">
              zarejestruj się
            </Link>.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Rule Creator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nowa Reguła
              </CardTitle>
              <CardDescription>
                Utwórz nową regułę dla swojego projektu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nazwa reguły</label>
                  <input 
                    type="text" 
                    placeholder="np. Walidacja email"
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Opis</label>
                  <textarea 
                    placeholder="Opisz co robi ta reguła..."
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md h-20"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Kod reguły</label>
                  <textarea 
                    placeholder="// Wprowadź kod reguły..."
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md h-32 font-mono text-sm"
                  />
                </div>
                
                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Zapisz regułę
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Zapisane Reguły</CardTitle>
              <CardDescription>
                Reguły zapisane w tej sesji
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Brak zapisanych reguł</p>
                <p className="text-sm mt-1">
                  Utwórz swoją pierwszą regułę po lewej stronie
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Chcesz więcej możliwości?</h3>
              <p className="text-muted-foreground">
                Zarejestruj się, aby zapisywać kolekcje reguł, synchronizować między urządzeniami 
                i mieć dostęp do zaawansowanych funkcji.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/auth/register">
                    Zarejestruj się
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">
                    Mam już konto
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 