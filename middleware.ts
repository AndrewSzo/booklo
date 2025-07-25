import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './lib/database.types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null
  let supabaseConnectionFailed = false
  
  try {
    // Add timeout to avoid hanging middleware
    const userPromise = supabase.auth.getUser()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase request timeout')), 3000)
    )
    
    const {
      data: { user: authUser },
    } = await Promise.race([userPromise, timeoutPromise]) as any
    user = authUser
  } catch (error) {
    // If Supabase is not available, log the error but don't crash
    console.warn('Supabase connection failed in middleware:', error)
    supabaseConnectionFailed = true
    // When Supabase is unavailable, we allow access to avoid blocking the app
  }

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/collections',
    '/profile'
  ]

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if current path is auth route
  const isAuthRoute = pathname.startsWith('/auth/')

  // Only apply auth logic if Supabase connection is working
  if (!supabaseConnectionFailed) {
    // Redirect logic - only when we have a working Supabase connection
    if (isProtectedRoute && !user) {
      // Redirect unauthenticated users to login
      url.pathname = '/auth/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }

    if (isAuthRoute && user) {
      // Redirect authenticated users away from auth pages
      const redirectTo = url.searchParams.get('redirectTo') || '/dashboard'
      url.pathname = redirectTo
      url.searchParams.delete('redirectTo')
      return NextResponse.redirect(url)
    }
  }

  // Handle auth callback
  if (pathname === '/auth/callback') {
    // Let the callback handle the session
    return supabaseResponse
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (they handle auth separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 