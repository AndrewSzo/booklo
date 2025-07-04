import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
    }

    // Test auth operation with simple client
    const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
    
    const { data, error } = await client.auth.signInWithPassword({
      email: 'nonexistent@test.com',
      password: 'wrongpassword'
    })
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      testAuthResult: {
        hasData: !!data,
        hasUser: !!data?.user,
        error: error?.message || null,
        errorStatus: error?.status || null
      }
    })
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 