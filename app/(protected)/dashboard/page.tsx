import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardContent from '@/components/dashboard/DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </main>
  )
} 