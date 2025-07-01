import { createClient } from '@/lib/supabase/api'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST() {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return NextResponse.json(
        { error: 'Wystąpił błąd podczas wylogowywania' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas wylogowywania' },
      { status: 500 }
    )
  }
} 