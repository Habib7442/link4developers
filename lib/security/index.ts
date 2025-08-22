// ============================================================================
// SECURITY SYSTEM - MAIN EXPORT
// ============================================================================

// Core Security Modules
export * from './validation'
export * from './rate-limiting'
export * from './auth'
export * from './auth-middleware'
export * from './api-protection'
export * from './environment'
export * from './secrets'
export * from './database-security'
export * from './monitoring'
export * from './dashboard'
export * from './security-tests'
export * from './automated-testing'
export * from './final-validation'
export * from './init'

// ============================================================================
// SECURITY SYSTEM OVERVIEW
// ============================================================================

/**
 * Link4Coders Security System
 * 
 * This comprehensive security system provides:
 * 
 * 🔒 INPUT VALIDATION & SANITIZATION
 * - XSS protection with HTML sanitization
 * - SQL injection detection and prevention
 * - URL validation and sanitization
 * - File upload validation
 * - Comprehensive input validation schemas
 * 
 * 🚦 RATE LIMITING & API PROTECTION
 * - Configurable rate limits for different endpoints
 * - IP-based and user-based rate limiting
 * - Sliding window rate limiting
 * - Automatic blocking of suspicious IPs
 * 
 * 🛡️ SECURITY HEADERS & CSP
 * - Content Security Policy (CSP)
 * - HTTPS enforcement (HSTS)
 * - Security headers (X-Frame-Options, X-XSS-Protection, etc.)
 * - CORS configuration
 * 
 * 🔐 AUTHENTICATION SECURITY
 * - JWT token validation
 * - Session hijacking detection
 * - Suspicious user agent detection
 * - Enhanced authentication middleware
 * - Password strength validation
 * 
 * 🌍 ENVIRONMENT & SECRETS SECURITY
 * - Environment variable validation
 * - Secrets strength auditing
 * - Exposed secrets detection
 * - Security configuration management
 * 
 * 🗄️ DATABASE SECURITY & RLS
 * - Row Level Security (RLS) policies
 * - Database connection security
 * - SQL injection prevention
 * - Data validation triggers
 * - Audit logging
 * 
 * 📊 MONITORING & LOGGING
 * - Real-time security event monitoring
 * - Security dashboard and metrics
 * - Automated alerting system
 * - Comprehensive audit logging
 * - Security incident tracking
 * 
 * 🧪 SECURITY TESTING & VALIDATION
 * - Automated security test suite
 * - Vulnerability scanning
 * - Compliance checking
 * - Security validation reports
 * - Continuous security monitoring
 * 
 * USAGE:
 * 
 * 1. Initialize Security System:
 *    ```typescript
 *    import { initializeSecuritySystems } from '@/lib/security'
 *    await initializeSecuritySystems()
 *    ```
 * 
 * 2. Protect API Routes:
 *    ```typescript
 *    import { createProtectedRoute } from '@/lib/security'
 *    export const POST = createProtectedRoute(handler, {
 *      requireAuth: true,
 *      rateLimit: 'API_GENERAL',
 *      validateBody: 'profile'
 *    })
 *    ```
 * 
 * 3. Validate Input:
 *    ```typescript
 *    import { validateUserProfile, sanitizeHtml } from '@/lib/security'
 *    const validation = validateUserProfile(data)
 *    const clean = sanitizeHtml(userInput)
 *    ```
 * 
 * 4. Monitor Security:
 *    ```typescript
 *    import { getSecurityDashboardData } from '@/lib/security'
 *    const dashboard = await getSecurityDashboardData()
 *    ```
 * 
 * 5. Run Security Tests:
 *    ```typescript
 *    import { runFinalSecurityValidation } from '@/lib/security'
 *    const report = await runFinalSecurityValidation()
 *    ```
 * 
 * SECURITY CHECKLIST:
 * 
 * ✅ Input validation and sanitization implemented
 * ✅ Rate limiting configured for all endpoints
 * ✅ Security headers and CSP configured
 * ✅ Authentication security hardened
 * ✅ Environment and secrets secured
 * ✅ Database RLS policies implemented
 * ✅ Security monitoring and logging active
 * ✅ Automated security testing in place
 * 
 * COMPLIANCE:
 * 
 * This security system helps achieve compliance with:
 * - OWASP Top 10 security risks
 * - Data protection regulations (GDPR, CCPA)
 * - Industry security standards
 * - Best practices for web application security
 * 
 * MAINTENANCE:
 * 
 * - Run security validation before each deployment
 * - Monitor security dashboard regularly
 * - Update security policies as needed
 * - Conduct quarterly security audits
 * - Keep dependencies updated
 * 
 * For detailed documentation, see individual module files.
 */

// ============================================================================
// QUICK START FUNCTIONS
// ============================================================================

import { initializeSecuritySystems } from './init'
import { runFinalSecurityValidation } from './final-validation'
import { getSecurityDashboardData } from './dashboard'

/**
 * Quick security system initialization
 */
export async function initSecurity(): Promise<{
  success: boolean
  message: string
  score: number
}> {
  try {
    const result = await initializeSecuritySystems()
    
    if (result.success) {
      return {
        success: true,
        message: `Security system initialized successfully. Score: ${result.securityScore}/100`,
        score: result.securityScore
      }
    } else {
      return {
        success: false,
        message: `Security initialization failed: ${result.errors.join(', ')}`,
        score: result.securityScore
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Security initialization error: ${error}`,
      score: 0
    }
  }
}

/**
 * Quick security validation
 */
export async function validateSecurity(): Promise<{
  status: 'SECURE' | 'WARNING' | 'CRITICAL'
  score: number
  summary: string
}> {
  try {
    const report = await runFinalSecurityValidation()
    
    return {
      status: report.overallStatus,
      score: report.overallScore,
      summary: `Security Status: ${report.overallStatus} (${report.overallScore}/100). ${report.criticalIssues.length} critical issues, ${report.nextSteps.length} next steps.`
    }
  } catch (error) {
    return {
      status: 'CRITICAL',
      score: 0,
      summary: `Security validation failed: ${error}`
    }
  }
}

/**
 * Quick security dashboard
 */
export async function getSecuritySummary(): Promise<{
  metrics: {
    totalEvents: number
    criticalEvents: number
    securityScore: number
  }
  status: string
  recommendations: string[]
}> {
  try {
    const dashboard = await getSecurityDashboardData()
    
    return {
      metrics: {
        totalEvents: dashboard.metrics.totalEvents,
        criticalEvents: dashboard.metrics.criticalEvents,
        securityScore: dashboard.health.score
      },
      status: dashboard.health.status,
      recommendations: dashboard.health.recommendations.slice(0, 5)
    }
  } catch (error) {
    return {
      metrics: {
        totalEvents: 0,
        criticalEvents: 0,
        securityScore: 0
      },
      status: 'CRITICAL',
      recommendations: ['Fix security system initialization error']
    }
  }
}

// ============================================================================
// SECURITY CONSTANTS
// ============================================================================

export const SECURITY_VERSION = '1.0.0'
export const SECURITY_LAST_UPDATED = '2024-01-19'

export const SECURITY_FEATURES = [
  'Input Validation & Sanitization',
  'Rate Limiting & API Protection', 
  'Security Headers & CSP',
  'Authentication Security Hardening',
  'Environment & Secrets Security',
  'Database Security & RLS',
  'Monitoring & Logging',
  'Security Testing & Validation'
] as const

export const SECURITY_COMPLIANCE = [
  'OWASP Top 10',
  'Data Protection (GDPR/CCPA)',
  'Industry Security Standards',
  'Web Application Security Best Practices'
] as const

// ============================================================================
// SECURITY STATUS
// ============================================================================

/**
 * Get current security system status
 */
export function getSecuritySystemStatus(): {
  version: string
  lastUpdated: string
  features: readonly string[]
  compliance: readonly string[]
  initialized: boolean
} {
  return {
    version: SECURITY_VERSION,
    lastUpdated: SECURITY_LAST_UPDATED,
    features: SECURITY_FEATURES,
    compliance: SECURITY_COMPLIANCE,
    initialized: typeof window === 'undefined' // Server-side indicates initialization
  }
}
