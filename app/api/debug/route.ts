import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    const nodeEnv = process.env.NODE_ENV

    const debugInfo = {
      environment: nodeEnv,
      timestamp: new Date().toISOString(),
      supabase: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        urlLength: supabaseUrl?.length || 0,
        keyLength: supabaseAnonKey?.length || 0,
        urlPrefix: supabaseUrl?.substring(0, 8) || 'missing',
        keyPrefix: supabaseAnonKey?.substring(0, 8) || 'missing'
      },
      site: {
        hasSiteUrl: !!siteUrl,
        siteUrl: siteUrl || 'missing'
      },
      runtime: 'edge'
    }

    return NextResponse.json(debugInfo)
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 