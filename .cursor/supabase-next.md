# Supabase Next.js Initialization

This document provides a reproducible guide to create the necessary file structure for integrating Supabase with your Next.js project.

## Prerequisites

- Your project should use Next.js 15, TypeScript 5, React 19, and Tailwind 4.
- Install the `@supabase/supabase-js` and `@supabase/ssr` packages.
- Ensure that `/supabase/config.toml` exists
- Ensure that a file `/lib/database.types.ts` exists and contains the correct type definitions for your database.

IMPORTANT: Check prerequisites before performing actions below. If they're not met, stop and ask a user for the fix.

## Environment Variables

Create or update your `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Structure and Setup

### 1. Browser Client

Create the file `/lib/supabase/client.ts` with the following content:

```ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

This file creates a Supabase client for use in Client Components and browser-side operations.

### 2. Server Client

Create the file `/lib/supabase/server.ts` with the following content:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../database.types'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

This file creates a Supabase client for use in Server Components, Route Handlers, and Server Actions.

### 3. Middleware Setup

Create the file `/middleware.ts` (in the root directory) with the following content:

```ts
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
          cookiesToSet.forEach(({ name, value, options }) => 
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Optional: Add authentication logic here
  // if (!user && !request.nextUrl.pathname.startsWith('/login')) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

This middleware refreshes the user's session and handles authentication state across your application.

### 4. TypeScript Environment Definitions (Optional)

If you need additional type definitions, create the file `/lib/types.ts` with the following content:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export type TypedSupabaseClient = SupabaseClient<Database>

// You can add more custom types here as needed
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
```

## Usage Examples

### In a Server Component:
```ts
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  const { data: books } = await supabase.from('books').select('*')
  
  return <div>{/* Your component */}</div>
}
```

### In a Client Component:
```ts
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [books, setBooks] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase.from('books').select('*')
      setBooks(data || [])
    }
    fetchBooks()
  }, [supabase])
  
  return <div>{/* Your component */}</div>
}
```

### In a Route Handler:
```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: books } = await supabase.from('books').select('*')
  
  return NextResponse.json({ books })
}
```

This setup provides a complete, type-safe integration of Supabase with Next.js 15, following the latest best practices and ensuring proper session management across your application.