import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayout } from '@/components/layout/AppLayout'
import LibraryView from '@/components/library/LibraryView'

export default async function LibraryPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-background" data-testid="library-page">
      <AppLayout>
        <LibraryView />
      </AppLayout>
    </main>
  )
} 