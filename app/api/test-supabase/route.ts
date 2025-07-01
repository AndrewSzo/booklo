import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    const testInfo = {
      timestamp: new Date().toISOString(),
      connection: 'success',
      sessionData: {
        hasSession: !!data.session,
        sessionExists: data.session !== null
      },
      error: error ? {
        message: error.message,
        status: error.status
      } : null,
      supabaseClient: {
        created: 'success',
        hasAuth: !!supabase.auth,
        hasFrom: !!supabase.from
      }
    }

    return NextResponse.json(testInfo)
    
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json(
      { 
        error: 'Supabase connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 