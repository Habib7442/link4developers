import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { User } from '@/lib/supabase'
import { logAuthenticationFailure, logAuthenticationSuccess, logUnauthorizedAccess, securityMonitor } from './monitoring'

// Create a server-side Supabase client for auth verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
)

// ============================================================================
// AUTHENTICATION UTILITIES
// ============================================================================

/**
 * Extract and verify user from request with enhanced security
 */
export async function getUserFromRequest(request: NextRequest): Promise<{
  user: User | null
  error?: string
}> {
  try {

    const ip = getClientIp(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check for suspicious user agents
    if (isSuspiciousUserAgent(userAgent)) {
      logAuthenticationFailure(request, 'Suspicious user agent detected')
      return { user: null, error: 'Access denied' }
    }

    // Try to get JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')

      // Validate token format
      if (!isValidJwtFormat(token)) {
        logAuthenticationFailure(request, 'Invalid token format')
        return { user: null, error: 'Invalid token format' }
      }

      // Verify the JWT token with Supabase
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !authUser) {
        logAuthenticationFailure(request, 'Token verification failed', authUser?.id)
        return { user: null, error: 'Invalid or expired token' }
      }

      // Check if user account is active
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        logAuthenticationFailure(request, 'User profile not found', authUser.id)
        return { user: null, error: 'User profile not found' }
      }

      // Check if account is suspended or deleted
      if (userProfile.is_suspended) {
        logAuthenticationFailure(request, 'Account suspended', authUser.id)
        return { user: null, error: 'Account suspended' }
      }

      // Log successful authentication
      logAuthenticationSuccess(request, 'bearer_token', authUser.id)

      return { user: userProfile }
    }
    
    // Try to get from session cookie (for browser requests)
    const sessionCookie = request.cookies.get('sb-access-token')
    
    if (sessionCookie) {
      const token = sessionCookie.value
      
      // Verify the session token
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !authUser) {
        return { user: null, error: 'Invalid session' }
      }
      
      // Get the full user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return { user: null, error: 'User profile not found' }
      }
      
      return { user: userProfile }
    }
    
    return { user: null, error: 'No authentication provided' }
    
  } catch (error) {
    console.error('Error verifying user:', error)
    return { user: null, error: 'Authentication verification failed' }
  }
}

/**
 * Extract user ID from request (simplified version)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const { user } = await getUserFromRequest(request)
  return user?.id || null
}

/**
 * Verify if user has permission to access resource
 */
export async function verifyUserPermission(
  request: NextRequest,
  resourceUserId: string
): Promise<{
  allowed: boolean
  user: User | null
  error?: string
}> {
  const { user, error } = await getUserFromRequest(request)
  
  if (error || !user) {
    return { allowed: false, user: null, error: error || 'Authentication required' }
  }
  
  // Check if user is accessing their own resource
  if (user.id !== resourceUserId) {
    return { allowed: false, user, error: 'Access denied: insufficient permissions' }
  }
  
  return { allowed: true, user }
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(request: NextRequest): Promise<boolean> {
  const { user } = await getUserFromRequest(request)
  return user?.is_admin === true
}

/**
 * Check if user is premium
 */
export async function isUserPremium(request: NextRequest): Promise<boolean> {
  const { user } = await getUserFromRequest(request)
  return user?.is_premium === true
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Create secure session data
 */
export function createSessionData(user: User): {
  id: string
  email: string
  full_name: string
  is_premium: boolean
  is_admin: boolean
} {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    is_premium: user.is_premium || false,
    is_admin: user.is_admin || false
  }
}

/**
 * Validate session expiry
 */
export function isSessionExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt
}

// ============================================================================
// PASSWORD SECURITY
// ============================================================================

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
  score: number // 0-4 (weak to strong)
} {
  const errors: string[] = []
  let score = 0
  
  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else if (password.length >= 12) {
    score += 1
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }
  
  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    score += 1
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password should contain at least one special character')
  } else {
    score += 1
  }
  
  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common')
    score = Math.max(0, score - 2)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(4, score)
  }
}

// ============================================================================
// SECURITY LOGGING
// ============================================================================

/**
 * Log authentication events
 */
export function logAuthEvent(event: {
  type: 'login_success' | 'login_failure' | 'logout' | 'token_refresh' | 'password_change'
  userId?: string
  ip?: string
  userAgent?: string
  details?: any
}) {
  // In production, send to proper logging service
  console.log('Auth Event:', {
    timestamp: new Date().toISOString(),
    ...event
  })
}

/**
 * Log security violations
 */
export function logSecurityViolation(violation: {
  type: 'unauthorized_access' | 'invalid_token' | 'permission_denied' | 'suspicious_activity'
  userId?: string
  ip?: string
  userAgent?: string
  resource?: string
  details?: any
}) {
  // In production, send to security monitoring service
  console.warn('Security Violation:', {
    timestamp: new Date().toISOString(),
    severity: 'HIGH',
    ...violation
  })
}

// ============================================================================
// RATE LIMITING HELPERS
// ============================================================================

/**
 * Get rate limiting identifier for user
 */
export function getUserRateLimitKey(userId: string, action: string): string {
  return `user:${userId}:${action}`
}

/**
 * Get rate limiting identifier for IP
 */
export function getIpRateLimitKey(ip: string, action: string): string {
  return `ip:${ip}:${action}`
}

/**
 * Extract IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0] : realIp || request.ip || 'unknown'
  return ip.trim()
}

// ============================================================================
// AUTHENTICATION SECURITY HELPERS
// ============================================================================

/**
 * Check if user agent is suspicious
 */
function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i,
    /java/i,
    /perl/i,
    /ruby/i,
    /go-http-client/i,
    /okhttp/i,
    /apache-httpclient/i
  ]

  // Allow legitimate bots
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slackbot/i,
    /twitterbot/i,
    /facebookexternalhit/i,
    /linkedinbot/i
  ]

  // Check if it's a legitimate bot first
  if (legitimateBots.some(pattern => pattern.test(userAgent))) {
    return false
  }

  // Check for suspicious patterns
  return suspiciousPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Validate JWT token format
 */
function isValidJwtFormat(token: string): boolean {
  // JWT should have 3 parts separated by dots
  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  // Each part should be base64url encoded
  try {
    for (const part of parts) {
      // Basic check for base64url format
      if (!/^[A-Za-z0-9_-]+$/.test(part)) {
        return false
      }
    }
    return true
  } catch (error) {
    return false
  }
}

/**
 * Check for session hijacking indicators
 */
export function detectSessionHijacking(
  request: NextRequest,
  userId: string,
  lastKnownIp?: string,
  lastKnownUserAgent?: string
): {
  suspicious: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  const currentIp = getClientIp(request)
  const currentUserAgent = request.headers.get('user-agent') || ''

  // Check for IP address changes (allow some flexibility for mobile users)
  if (lastKnownIp && lastKnownIp !== currentIp) {
    // Allow IP changes within the same subnet for mobile users
    const lastIpParts = lastKnownIp.split('.')
    const currentIpParts = currentIp.split('.')

    if (lastIpParts.length === 4 && currentIpParts.length === 4) {
      // Check if first 3 octets match (same subnet)
      const sameSubnet = lastIpParts.slice(0, 3).join('.') === currentIpParts.slice(0, 3).join('.')
      if (!sameSubnet) {
        reasons.push('IP address changed significantly')
      }
    } else {
      reasons.push('IP address format changed')
    }
  }

  // Check for user agent changes
  if (lastKnownUserAgent && lastKnownUserAgent !== currentUserAgent) {
    // Allow minor version changes in browsers
    const majorUserAgentChanged = !areSimilarUserAgents(lastKnownUserAgent, currentUserAgent)
    if (majorUserAgentChanged) {
      reasons.push('User agent changed significantly')
    }
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  }
}

/**
 * Check if two user agents are similar (allowing for minor version differences)
 */
function areSimilarUserAgents(ua1: string, ua2: string): boolean {
  // Extract browser name and major version
  const extractBrowserInfo = (ua: string) => {
    const patterns = [
      /Chrome\/(\d+)/,
      /Firefox\/(\d+)/,
      /Safari\/(\d+)/,
      /Edge\/(\d+)/,
      /Opera\/(\d+)/
    ]

    for (const pattern of patterns) {
      const match = ua.match(pattern)
      if (match) {
        return { browser: pattern.source.split('/')[0], majorVersion: parseInt(match[1]) }
      }
    }
    return null
  }

  const info1 = extractBrowserInfo(ua1)
  const info2 = extractBrowserInfo(ua2)

  if (!info1 || !info2) {
    return false
  }

  // Same browser and major version within 2 versions
  return info1.browser === info2.browser &&
         Math.abs(info1.majorVersion - info2.majorVersion) <= 2
}

/**
 * Generate secure session token
 */
export function generateSecureSessionToken(): string {
  // In a real implementation, you'd use a cryptographically secure random generator
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for Node.js
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }

  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate session token
 */
export function validateSessionToken(token: string): boolean {
  // Check token format (64 hex characters)
  return /^[a-f0-9]{64}$/i.test(token)
}
