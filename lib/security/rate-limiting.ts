import { NextRequest } from 'next/server'

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.'
  },
  
  SIGNUP: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 signups per hour per IP
    message: 'Too many signup attempts. Please try again in 1 hour.'
  },
  
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 password reset attempts per hour
    message: 'Too many password reset attempts. Please try again in 1 hour.'
  },
  
  // Profile operations
  PROFILE_UPDATE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 updates per minute
    message: 'Too many profile updates. Please slow down.'
  },
  
  AVATAR_UPLOAD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 uploads per minute
    message: 'Too many file uploads. Please wait before uploading again.'
  },
  
  // Link operations
  LINK_CREATE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 links per minute
    message: 'Too many links created. Please slow down.'
  },
  
  LINK_UPDATE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 updates per minute
    message: 'Too many link updates. Please slow down.'
  },

  // Template operations
  TEMPLATE_UPDATE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 template updates per minute
    message: 'Too many theme changes. Please slow down.'
  },

  // Public endpoints
  PUBLIC_PROFILE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute per IP
    message: 'Too many requests. Please slow down.'
  },
  
  LINK_CLICK: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 clicks per minute per IP
    message: 'Too many requests. Please slow down.'
  },
  
  // API endpoints
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'API rate limit exceeded. Please slow down.'
  },
  
  // Category and link management
  CATEGORY_ORDER_UPDATE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 updates per minute
    message: 'Too many category order updates. Please slow down.'
  },
  
  CATEGORY_ORDER_RESET: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 resets per minute
    message: 'Too many category order resets. Please slow down.'
  },
  
  LINK_REORDER: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 reorders per minute
    message: 'Too many link reorders. Please slow down.'
  }
} as const

// ============================================================================
// IN-MEMORY RATE LIMITING STORE
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimitStore {
  private store = new Map<string, RateLimitEntry>()
  
  // Clean up expired entries every 5 minutes
  constructor() {
    setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }
  
  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key)
  }
  
  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry)
  }
  
  delete(key: string): void {
    this.store.delete(key)
  }
  
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key)
      }
    }
  }
}

const rateLimitStore = new RateLimitStore()

// ============================================================================
// RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header or session
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    // Extract user ID from JWT token if available
    try {
      const token = authHeader.replace('Bearer ', '')
      // In a real implementation, you'd decode the JWT here
      // For now, we'll use the token itself as identifier
      return `user:${token.substring(0, 10)}`
    } catch (error) {
      // Fall back to IP
    }
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  return `ip:${ip}`
}

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  allowed: boolean
  remaining: number
  resetTime: number
  message?: string
} {
  const key = `rate_limit:${identifier}`
  const now = Date.now()
  const resetTime = now + config.windowMs
  
  const existing = rateLimitStore.get(key)
  
  if (!existing || existing.resetTime <= now) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime
    })
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime
    }
  }
  
  if (existing.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
      message: config.message || 'Rate limit exceeded'
    }
  }
  
  // Increment count
  existing.count++
  rateLimitStore.set(key, existing)
  
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetTime: existing.resetTime
  }
}

/**
 * Rate limiting middleware for API routes
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const identifier = getClientIdentifier(request)
    return checkRateLimit(identifier, config)
  }
}

/**
 * Rate limiting for specific actions with user context
 */
export function checkUserActionRateLimit(
  userId: string,
  action: string,
  config: RateLimitConfig
): {
  allowed: boolean
  remaining: number
  resetTime: number
  message?: string
} {
  const identifier = `user:${userId}:${action}`
  return checkRateLimit(identifier, config)
}

/**
 * Rate limiting for IP-based actions
 */
export function checkIpRateLimit(
  ip: string,
  action: string,
  config: RateLimitConfig
): {
  allowed: boolean
  remaining: number
  resetTime: number
  message?: string
} {
  const identifier = `ip:${ip}:${action}`
  return checkRateLimit(identifier, config)
}

// ============================================================================
// RATE LIMITING RESPONSE HELPERS
// ============================================================================

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: {
  remaining: number
  resetTime: number
}): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
  }
}

/**
 * Create rate limit error response
 */
export function createRateLimitError(result: {
  remaining: number
  resetTime: number
  message?: string
}) {
  return {
    error: result.message || 'Rate limit exceeded',
    retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    resetTime: result.resetTime
  }
}

// ============================================================================
// ADVANCED RATE LIMITING
// ============================================================================

/**
 * Sliding window rate limiter for more precise control
 */
export class SlidingWindowRateLimiter {
  private windows = new Map<string, number[]>()
  
  check(
    identifier: string,
    windowMs: number,
    maxRequests: number
  ): { allowed: boolean; remaining: number } {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Get or create window for this identifier
    let requests = this.windows.get(identifier) || []
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart)
    
    if (requests.length >= maxRequests) {
      this.windows.set(identifier, requests)
      return { allowed: false, remaining: 0 }
    }
    
    // Add current request
    requests.push(now)
    this.windows.set(identifier, requests)
    
    return { allowed: true, remaining: maxRequests - requests.length }
  }
  
  // Clean up old windows periodically
  cleanup(): void {
    const cutoff = Date.now() - (60 * 60 * 1000) // 1 hour ago
    
    for (const [identifier, requests] of this.windows.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > cutoff)
      
      if (validRequests.length === 0) {
        this.windows.delete(identifier)
      } else {
        this.windows.set(identifier, validRequests)
      }
    }
  }
}

export const slidingWindowLimiter = new SlidingWindowRateLimiter()

// Clean up sliding window limiter every 10 minutes
setInterval(() => {
  slidingWindowLimiter.cleanup()
}, 10 * 60 * 1000)
