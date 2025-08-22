import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, detectSessionHijacking, getClientIp } from './auth'
import { logAuthenticationFailure, logUnauthorizedAccess, securityMonitor } from './monitoring'
import { checkUserActionRateLimit, RATE_LIMITS } from './rate-limiting'
import { User } from '@/lib/supabase'

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

interface AuthMiddlewareOptions {
  requireAuth?: boolean
  requirePremium?: boolean
  requireAdmin?: boolean
  allowedRoles?: string[]
  rateLimit?: keyof typeof RATE_LIMITS
  checkSessionHijacking?: boolean
}

interface AuthContext {
  user: User | null
  isAuthenticated: boolean
  isPremium: boolean
  isAdmin: boolean
}

/**
 * Enhanced authentication middleware
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  return async (request: NextRequest): Promise<{
    success: boolean
    context?: AuthContext
    response?: NextResponse
  }> => {
    try {
      const ip = getClientIp(request)
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      // Get user from request
      const { user, error } = await getUserFromRequest(request)
      
      // Create auth context
      const context: AuthContext = {
        user,
        isAuthenticated: !!user,
        isPremium: user?.is_premium || false,
        isAdmin: user?.is_admin || false
      }
      
      // Check authentication requirement
      if (options.requireAuth && !context.isAuthenticated) {
        logAuthenticationFailure(request, 'Authentication required')
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
      }
      
      // Check premium requirement
      if (options.requirePremium && !context.isPremium) {
        logUnauthorizedAccess(request, 'Premium feature', user?.id)
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Premium subscription required' },
            { status: 403 }
          )
        }
      }
      
      // Check admin requirement
      if (options.requireAdmin && !context.isAdmin) {
        logUnauthorizedAccess(request, 'Admin feature', user?.id)
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        }
      }
      
      // Check session hijacking if user is authenticated
      if (context.isAuthenticated && options.checkSessionHijacking && user) {
        const hijackingCheck = detectSessionHijacking(
          request,
          user.id,
          user.last_known_ip,
          user.last_known_user_agent
        )
        
        if (hijackingCheck.suspicious) {
          securityMonitor.logEvent({
            type: 'suspicious_request',
            severity: 'HIGH',
            userId: user.id,
            ip,
            userAgent,
            resource: request.nextUrl.pathname,
            details: { 
              reasons: hijackingCheck.reasons,
              suspectedSessionHijacking: true 
            },
            blocked: true
          })
          
          return {
            success: false,
            response: NextResponse.json(
              { error: 'Session security check failed. Please log in again.' },
              { status: 401 }
            )
          }
        }
      }
      
      // Apply rate limiting if specified
      if (options.rateLimit && context.isAuthenticated && user) {
        const rateLimitConfig = RATE_LIMITS[options.rateLimit]
        const result = checkUserActionRateLimit(user.id, options.rateLimit, rateLimitConfig)
        
        if (!result.allowed) {
          securityMonitor.logEvent({
            type: 'rate_limit_exceeded',
            severity: 'MEDIUM',
            userId: user.id,
            ip,
            userAgent,
            resource: request.nextUrl.pathname,
            details: { action: options.rateLimit },
            blocked: true
          })
          
          return {
            success: false,
            response: NextResponse.json(
              { 
                error: result.message || 'Rate limit exceeded',
                retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
              },
              { 
                status: 429,
                headers: {
                  'X-RateLimit-Remaining': result.remaining.toString(),
                  'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
                  'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
                }
              }
            )
          }
        }
      }
      
      return {
        success: true,
        context
      }
      
    } catch (error) {
      console.error('Auth middleware error:', error)
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Authentication service error' },
          { status: 500 }
        )
      }
    }
  }
}

// ============================================================================
// PREDEFINED MIDDLEWARE CONFIGURATIONS
// ============================================================================

/**
 * Middleware for public endpoints (no auth required)
 */
export const publicMiddleware = createAuthMiddleware({
  requireAuth: false
})

/**
 * Middleware for authenticated endpoints
 */
export const authenticatedMiddleware = createAuthMiddleware({
  requireAuth: true,
  checkSessionHijacking: true
})

/**
 * Middleware for premium features
 */
export const premiumMiddleware = createAuthMiddleware({
  requireAuth: true,
  requirePremium: true,
  checkSessionHijacking: true
})

/**
 * Middleware for admin features
 */
export const adminMiddleware = createAuthMiddleware({
  requireAuth: true,
  requireAdmin: true,
  checkSessionHijacking: true
})

/**
 * Middleware for rate-limited endpoints
 */
export const rateLimitedMiddleware = createAuthMiddleware({
  requireAuth: true,
  rateLimit: 'API_GENERAL',
  checkSessionHijacking: true
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract auth context from middleware result
 */
export function extractAuthContext(middlewareResult: {
  success: boolean
  context?: AuthContext
  response?: NextResponse
}): AuthContext {
  return middlewareResult.context || {
    user: null,
    isAuthenticated: false,
    isPremium: false,
    isAdmin: false
  }
}

/**
 * Create protected route handler with auth middleware
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, context: AuthContext, ...args: T) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const middleware = createAuthMiddleware(options)
    const result = await middleware(request)
    
    if (!result.success) {
      return result.response!
    }
    
    return handler(request, result.context!, ...args)
  }
}

/**
 * Create API route with authentication
 */
export function createAuthenticatedRoute(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = { requireAuth: true }
) {
  return withAuth(handler, options)
}

/**
 * Create premium API route
 */
export function createPremiumRoute(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return withAuth(handler, { requireAuth: true, requirePremium: true })
}

/**
 * Create admin API route
 */
export function createAdminRoute(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return withAuth(handler, { requireAuth: true, requireAdmin: true })
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Update user session info
 */
export async function updateUserSession(userId: string, request: NextRequest): Promise<void> {
  try {
    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || ''
    
    // In a real implementation, you'd update the user's session info in the database
    // For now, we'll just log it
    securityMonitor.logEvent({
      type: 'invalid_authentication', // This would be a 'session_update' type
      severity: 'LOW',
      userId,
      ip,
      userAgent,
      resource: request.nextUrl.pathname,
      details: { 
        action: 'session_update',
        lastSeenIp: ip,
        lastSeenUserAgent: userAgent
      },
      blocked: false
    })
  } catch (error) {
    console.error('Error updating user session:', error)
  }
}

/**
 * Invalidate user session
 */
export async function invalidateUserSession(userId: string, reason: string): Promise<void> {
  try {
    // In a real implementation, you'd:
    // 1. Remove session from database
    // 2. Add session ID to blacklist
    // 3. Notify user of session invalidation
    
    securityMonitor.logEvent({
      type: 'invalid_authentication', // This would be a 'session_invalidated' type
      severity: 'MEDIUM',
      userId,
      ip: 'system',
      details: { 
        action: 'session_invalidated',
        reason
      },
      blocked: false
    })
    
    console.log(`Session invalidated for user ${userId}: ${reason}`)
  } catch (error) {
    console.error('Error invalidating user session:', error)
  }
}
