import { NextRequest, NextResponse } from 'next/server'
import { validateUserProfile, validateLink, sanitizeHtml, sanitizeUrl, detectSqlInjection, detectXss } from './validation'
import { checkUserActionRateLimit, RATE_LIMITS, createRateLimitHeaders, createRateLimitError } from './rate-limiting'
import { getUserIdFromRequest, getUserFromRequest, logSecurityViolation, getClientIp } from './auth'

// ============================================================================
// API PROTECTION UTILITIES
// ============================================================================

/**
 * Validate and sanitize request body
 */
export function validateRequestBody(body: any, type: 'profile' | 'link'): {
  success: boolean
  data?: any
  errors?: string[]
} {
  // Check for potential attacks in the raw body
  const bodyString = JSON.stringify(body)
  
  if (detectSqlInjection(bodyString)) {
    return { success: false, errors: ['Potential SQL injection detected'] }
  }
  
  if (detectXss(bodyString)) {
    return { success: false, errors: ['Potential XSS attack detected'] }
  }
  
  // Sanitize string fields
  const sanitizedBody = sanitizeObjectFields(body)
  
  // Validate based on type
  switch (type) {
    case 'profile':
      return validateUserProfile(sanitizedBody)
    case 'link':
      return validateLink(sanitizedBody)
    default:
      return { success: false, errors: ['Invalid validation type'] }
  }
}

/**
 * Sanitize all string fields in an object
 */
function sanitizeObjectFields(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectFields)
  }
  
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Sanitize URLs
      if (key.includes('url') || key.includes('link')) {
        const sanitizedUrl = sanitizeUrl(value)
        sanitized[key] = sanitizedUrl || ''
      } else {
        // Sanitize other text fields
        sanitized[key] = sanitizeHtml(value)
      }
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObjectFields(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

/**
 * Create protected API route handler
 */
export function createProtectedRoute(
  handler: (request: NextRequest, context: { userId: string }) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    rateLimit?: keyof typeof RATE_LIMITS
    validateBody?: 'profile' | 'link'
    allowedMethods?: string[]
  } = {}
) {
  return async (request: NextRequest, routeContext?: any) => {
    try {
      // Check allowed methods
      if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
      }
      
      // Check authentication if required
      let userId: string | null = null
      if (options.requireAuth !== false) {
        const { user, error } = await getUserFromRequest(request)
        if (error || !user) {
          // Log security event
          logSecurityViolation({
            type: 'unauthorized_access',
            ip: getClientIp(request),
            userAgent: request.headers.get('user-agent') || undefined,
            resource: request.nextUrl.pathname,
            details: { error }
          })

          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
        userId = user.id
      }
      
      // Apply rate limiting if specified
      if (options.rateLimit && userId) {
        const rateLimitConfig = RATE_LIMITS[options.rateLimit]
        const result = checkUserActionRateLimit(userId, options.rateLimit, rateLimitConfig)
        
        if (!result.allowed) {
          const error = createRateLimitError(result)
          const headers = createRateLimitHeaders(result)
          
          return NextResponse.json(error, {
            status: 429,
            headers
          })
        }
      }
      
      // Validate request body if specified
      if (options.validateBody && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
        try {
          const body = await request.json()
          const validation = validateRequestBody(body, options.validateBody)
          
          if (!validation.success) {
            return NextResponse.json(
              { error: 'Validation failed', details: validation.errors },
              { status: 400 }
            )
          }
          
          // Replace the request body with validated data
          // Note: This is a simplified approach. In production, you might want to
          // pass the validated data through the context or modify the request object
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
          )
        }
      }
      
      // Call the actual handler
      return await handler(request, { userId: userId! })
      
    } catch (error) {
      console.error('Protected route error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Create public API route handler with basic protection
 */
export function createPublicRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    rateLimit?: keyof typeof RATE_LIMITS
    allowedMethods?: string[]
  } = {}
) {
  return async (request: NextRequest, routeContext?: any) => {
    try {
      // Check allowed methods
      if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405 }
        )
      }
      
      // Apply rate limiting if specified
      if (options.rateLimit) {
        // For public routes, we'll use IP-based rate limiting
        // This is handled by the middleware, but we can add additional checks here
      }
      
      // Call the actual handler
      return await handler(request)
      
    } catch (error) {
      console.error('Public route error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): { success: boolean; error?: string } {
  // Check file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'File size must be less than 5MB' }
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'File must be JPEG, PNG, WebP, or GIF' }
  }
  
  // Check file name
  if (file.name.length > 255) {
    return { success: false, error: 'File name is too long' }
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.js$/i,
    /\.html$/i,
    /\.htm$/i
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    return { success: false, error: 'File type not allowed' }
  }
  
  return { success: true }
}

/**
 * Security response headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

/**
 * Log security events
 */
export function logSecurityEvent(event: {
  type: 'rate_limit' | 'validation_error' | 'auth_failure' | 'suspicious_request'
  userId?: string
  ip?: string
  userAgent?: string
  details?: any
}) {
  // In production, you'd send this to a proper logging service
  console.warn('Security Event:', {
    timestamp: new Date().toISOString(),
    ...event
  })
  
  // You could also send to external services like:
  // - Sentry for error tracking
  // - DataDog for monitoring
  // - Custom security dashboard
}
