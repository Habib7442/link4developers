// ============================================================================
// ENVIRONMENT SECURITY CONFIGURATION
// ============================================================================

/**
 * Validate required environment variables
 */
export function validateEnvironmentVariables(): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  // Check for missing variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }
  
  // Validate URL format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
    } catch (error) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL')
    }
  }
  
  // Check for development vs production settings
  if (process.env.NODE_ENV === 'production') {
    // Production-specific checks
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ')) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY appears to be invalid for production')
    }
    
    // Ensure no development URLs in production
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
      errors.push('Production environment should not use localhost URLs')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get secure environment configuration
 */
export function getSecureConfig() {
  const validation = validateEnvironmentVariables()
  
  if (!validation.isValid) {
    throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`)
  }
  
  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    },
    app: {
      environment: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production'
    },
    security: {
      // Rate limiting settings
      rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      
      // CORS settings
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'https://link4coders.in',
        'https://www.link4coders.in'
      ],
      
      // Security headers
      enableSecurityHeaders: process.env.SECURITY_HEADERS_ENABLED !== 'false',
      
      // HTTPS enforcement
      enforceHttps: process.env.NODE_ENV === 'production',
      
      // Session settings
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400'), // 24 hours default
      
      // File upload settings
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
      ]
    }
  }
}

/**
 * Sanitize environment variables for logging
 */
export function sanitizeEnvForLogging(env: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') {
      // Hide sensitive values
      if (key.toLowerCase().includes('key') || 
          key.toLowerCase().includes('secret') || 
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('token')) {
        sanitized[key] = value ? `${value.substring(0, 4)}****` : undefined
      } else {
        sanitized[key] = value
      }
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

/**
 * Check for common security misconfigurations
 */
export function checkSecurityMisconfigurations(): {
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []
  
  // Check for debug mode in production
  if (process.env.NODE_ENV === 'production' && process.env.DEBUG === 'true') {
    warnings.push('Debug mode is enabled in production')
  }
  
  // Check for weak session settings
  const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT || '86400')
  if (sessionTimeout > 604800) { // 7 days
    warnings.push('Session timeout is longer than recommended (7 days)')
  }
  
  // Check for insecure CORS settings
  if (process.env.ALLOWED_ORIGINS === '*') {
    errors.push('CORS is configured to allow all origins - this is insecure')
  }
  
  // Check for missing security headers
  if (process.env.SECURITY_HEADERS_ENABLED === 'false') {
    warnings.push('Security headers are disabled')
  }
  
  // Check for development keys in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
      errors.push('Using localhost Supabase URL in production')
    }
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('test') || 
        process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('dev')) {
      warnings.push('Service role key appears to be for development/testing')
    }
  }
  
  return { warnings, errors }
}

/**
 * Initialize security configuration
 */
export function initializeSecurity(): {
  success: boolean
  errors: string[]
  warnings: string[]
} {
  try {
    // Validate environment
    const envValidation = validateEnvironmentVariables()
    if (!envValidation.isValid) {
      return {
        success: false,
        errors: envValidation.errors,
        warnings: []
      }
    }
    
    // Check for misconfigurations
    const securityCheck = checkSecurityMisconfigurations()
    
    // Log security status
    console.log('🔒 Security initialization completed')
    
    if (securityCheck.warnings.length > 0) {
      console.warn('⚠️ Security warnings:', securityCheck.warnings)
    }
    
    if (securityCheck.errors.length > 0) {
      console.error('❌ Security errors:', securityCheck.errors)
      return {
        success: false,
        errors: securityCheck.errors,
        warnings: securityCheck.warnings
      }
    }
    
    return {
      success: true,
      errors: [],
      warnings: securityCheck.warnings
    }
    
  } catch (error) {
    console.error('❌ Security initialization failed:', error)
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: []
    }
  }
}

/**
 * Get allowed origins for CORS
 */
export function getAllowedOrigins(): string[] {
  const config = getSecureConfig()
  return config.security.allowedOrigins
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string): boolean {
  const allowedOrigins = getAllowedOrigins()
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*')
}

/**
 * Get security headers configuration
 */
export function getSecurityHeaders(): Record<string, string> {
  const config = getSecureConfig()
  
  if (!config.security.enableSecurityHeaders) {
    return {}
  }
  
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
  
  // Add HSTS in production
  if (config.security.enforceHttps) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }
  
  return headers
}
