import { createClientForEdge } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Create response first to handle cookies
    const response = NextResponse.json({ success: true })
    const supabase = createClientForEdge(request, response)
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return NextResponse.json(
        { error: 'Wystąpił błąd podczas wylogowywania' },
        { status: 500 }
      )
    }

    return response
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas wylogowywania' },
      { status: 500 }
    )
  }
} 