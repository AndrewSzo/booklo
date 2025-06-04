import { createClient } from '@/lib/supabase/server'
import type { ErrorResponseDTO } from '@/lib/types'

export interface AuthResult {
  success: boolean
  userId?: string
  error?: ErrorResponseDTO['error']
}

export interface AuthError extends Error {
  status: number
  code: string
  details?: Record<string, unknown>
}

/**
 * Checks if the user is authenticated and returns the user ID
 * @returns AuthResult object with success status and user ID or error
 */
export async function checkAuthentication(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Authentication error:', error)
      return {
        success: false,
        error: {
          message: 'Authentication failed',
          code: 'AUTH_ERROR',
          details: { auth_error: error.message }
        }
      }
    }
    
    if (!user) {
      return {
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED'
        }
      }
    }
    
    return {
      success: true,
      userId: user.id
    }
  } catch (error) {
    console.error('Unexpected authentication error:', error)
    return {
      success: false,
      error: {
        message: 'Authentication check failed',
        code: 'AUTH_CHECK_FAILED'
      }
    }
  }
}

/**
 * Middleware-like function to handle authentication for API routes
 * Returns user ID if authenticated, or throws an error with appropriate HTTP status
 */
export async function requireAuthentication(): Promise<string> {
  const authResult = await checkAuthentication()
  
  if (!authResult.success) {
    const error = new Error(authResult.error?.message || 'Authentication required') as AuthError
    error.status = 401
    error.code = authResult.error?.code || 'UNAUTHORIZED'
    error.details = authResult.error?.details
    throw error
  }
  
  return authResult.userId!
} 