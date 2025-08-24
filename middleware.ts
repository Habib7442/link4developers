import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRateLimiter, RATE_LIMITS, createRateLimitHeaders, createRateLimitError } from '@/lib/security/rate-limiting'
import { getSecurityHeaders, isOriginAllowed } from '@/lib/security/environment'

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Apply security headers to all responses
  const response = NextResponse.next()

  // Apply security headers from configuration
  const securityHeaders = getSecurityHeaders()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  // CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    if (origin && isOriginAllowed(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
    }
  }
  
  // Enhanced Content Security Policy
  const isDevelopment = process.env.NODE_ENV === 'development'

  const csp = [
    "default-src 'self'",
    // Scripts: Allow self, inline for development, and trusted CDNs
    isDevelopment
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com"
      : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    // Styles: Allow self, inline, and Google Fonts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Fonts: Allow self and Google Fonts
    "font-src 'self' https://fonts.gstatic.com data:",
    // Images: Allow self, data URLs, HTTPS, and blob for uploads
    "img-src 'self' data: https: blob:",
    // Connect: Allow self, GitHub API, Supabase, and analytics
    "connect-src 'self' https://api.github.com https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
    // Media: Allow self and data URLs
    "media-src 'self' data: blob:",
    // Workers: Allow self and blob for web workers
    "worker-src 'self' blob:",
    // Child sources: Allow self for iframes if needed
    "child-src 'self'",
    // Frame sources: Deny all frames
    "frame-src 'none'",
    // Object sources: Deny all objects/embeds
    "object-src 'none'",
    // Base URI: Only allow self
    "base-uri 'self'",
    // Form actions: Only allow self
    "form-action 'self'",
    // Frame ancestors: Deny all (prevent clickjacking)
    "frame-ancestors 'none'",
    // Manifest: Allow self
    "manifest-src 'self'",
    // Upgrade insecure requests in production
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"])
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  // Report-Only CSP for monitoring (optional)
  if (process.env.CSP_REPORT_URI) {
    const reportOnlyCsp = csp + `; report-uri ${process.env.CSP_REPORT_URI}`
    response.headers.set('Content-Security-Policy-Report-Only', reportOnlyCsp)
  }
  
  // Handle preflight OPTIONS requests for CORS
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }
  
  // Rate Limiting for different endpoints
  let rateLimitConfig = null
  let rateLimitKey = ''
  
  // Authentication endpoints
  if (pathname.startsWith('/api/auth/signin') || pathname.startsWith('/auth/signin')) {
    rateLimitConfig = RATE_LIMITS.LOGIN
    rateLimitKey = 'login'
  } else if (pathname.startsWith('/api/auth/signup') || pathname.startsWith('/auth/signup')) {
    rateLimitConfig = RATE_LIMITS.SIGNUP
    rateLimitKey = 'signup'
  }
  // Profile endpoints
  else if (pathname.startsWith('/api/profile') && request.method !== 'GET') {
    rateLimitConfig = RATE_LIMITS.PROFILE_UPDATE
    rateLimitKey = 'profile_update'
  }
  // Link endpoints
  else if (pathname.startsWith('/api/links') && request.method === 'POST') {
    rateLimitConfig = RATE_LIMITS.LINK_CREATE
    rateLimitKey = 'link_create'
  } else if (pathname.startsWith('/api/links') && (request.method === 'PUT' || request.method === 'PATCH')) {
    rateLimitConfig = RATE_LIMITS.LINK_UPDATE
    rateLimitKey = 'link_update'
  }
  // Public endpoints
  else if (pathname.startsWith('/api/public/profile')) {
    rateLimitConfig = RATE_LIMITS.PUBLIC_PROFILE
    rateLimitKey = 'public_profile'
  } else if (pathname.startsWith('/api/public/track-click')) {
    rateLimitConfig = RATE_LIMITS.LINK_CLICK
    rateLimitKey = 'link_click'
  }
  // General API endpoints
  else if (pathname.startsWith('/api/')) {
    rateLimitConfig = RATE_LIMITS.API_GENERAL
    rateLimitKey = 'api_general'
  }
  
  // Apply rate limiting if configured
  if (rateLimitConfig) {
    const rateLimiter = createRateLimiter(rateLimitConfig)
    const result = rateLimiter(request)
    
    // Add rate limit headers
    const headers = createRateLimitHeaders(result)
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Block if rate limit exceeded
    if (!result.allowed) {
      const error = createRateLimitError(result)
      return new NextResponse(JSON.stringify(error), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })
    }
  }
  
  // Block suspicious requests
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i
  ]
  
  // Allow legitimate bots but block suspicious ones for sensitive endpoints
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/profile')) {
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))
    if (isSuspicious && !userAgent.includes('Googlebot') && !userAgent.includes('Bingbot')) {
      return new NextResponse(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  // Block requests with suspicious query parameters
  const url = request.nextUrl
  const queryString = url.search
  
  if (queryString) {
    const suspiciousQueryPatterns = [
      /[<>'"]/,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /(union|select|insert|update|delete|drop|create|alter)/i,
      /(\.\.|\/\.\.|\\\.\.)/
    ]
    
    const hasSuspiciousQuery = suspiciousQueryPatterns.some(pattern => pattern.test(queryString))
    if (hasSuspiciousQuery) {
      return new NextResponse(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  // Block requests with suspicious headers
  const referer = request.headers.get('referer') || ''
  const origin = request.headers.get('origin') || ''
  
  // Check for suspicious referers (basic protection)
  if (referer && pathname.startsWith('/api/')) {
    try {
      const refererUrl = new URL(referer)
      const allowedDomains = [
        'localhost',
        '127.0.0.1',
        'link4coders.in',
        'www.link4coders.in'
      ]
      
      const isAllowedDomain = allowedDomains.some(domain => 
        refererUrl.hostname === domain || refererUrl.hostname.endsWith(`.${domain}`)
      )
      
      if (!isAllowedDomain && process.env.NODE_ENV === 'production') {
        return new NextResponse(JSON.stringify({ error: 'Invalid referer' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    } catch (error) {
      // Invalid referer URL
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse(JSON.stringify({ error: 'Invalid referer' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
  }
  
  return response
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
