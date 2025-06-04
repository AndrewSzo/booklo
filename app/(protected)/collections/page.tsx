import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, BookOpen } from 'lucide-react'

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Moje Kolekcje</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj swoimi zapisanymi zestawami reguł
          </p>
        </div>
        
        <Button asChild>
          <Link href="/collections/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nowa Kolekcja
          </Link>
        </Button>
      </div>

      {/* Placeholder for collections list */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Brak kolekcji</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Utwórz swoją pierwszą kolekcję reguł
            </p>
            <Button asChild size="sm">
              <Link href="/collections/new">
                Utwórz kolekcję
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 