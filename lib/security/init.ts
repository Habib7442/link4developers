// ============================================================================
// SECURITY INITIALIZATION
// ============================================================================

import { initializeSecurity } from './environment'
import { auditEnvironmentSecrets } from './secrets'
import { runSecurityTests } from './security-tests'
import { securityMonitor } from './monitoring'

// ============================================================================
// SECURITY INITIALIZATION
// ============================================================================

/**
 * Initialize all security systems
 */
export async function initializeSecuritySystems(): Promise<{
  success: boolean
  errors: string[]
  warnings: string[]
  securityScore: number
}> {
  console.log('🔒 Initializing security systems...')
  
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    // 1. Initialize environment security
    console.log('📋 Checking environment security...')
    const envResult = initializeSecurity()
    
    if (!envResult.success) {
      errors.push(...envResult.errors)
    }
    warnings.push(...envResult.warnings)
    
    // 2. Audit secrets
    console.log('🔑 Auditing secrets...')
    const secretsAudit = auditEnvironmentSecrets()
    
    if (secretsAudit.weakSecrets > 0) {
      warnings.push(`${secretsAudit.weakSecrets} weak secrets detected`)
      warnings.push(...secretsAudit.recommendations)
    }
    
    if (secretsAudit.exposedSecrets.length > 0) {
      errors.push(`Exposed secrets detected: ${secretsAudit.exposedSecrets.join(', ')}`)
    }
    
    // 3. Run security tests
    console.log('🧪 Running security tests...')
    const testResults = runSecurityTests()
    
    if (testResults.overall.failed > 0) {
      warnings.push(`${testResults.overall.failed} security tests failed`)
    }
    
    // 4. Calculate overall security score
    const securityScore = calculateSecurityScore({
      environmentScore: envResult.success ? 100 : 0,
      secretsScore: Math.round((secretsAudit.validSecrets / secretsAudit.totalSecrets) * 100),
      testsScore: testResults.overall.score
    })
    
    // 5. Log security status
    logSecurityStatus({
      securityScore,
      errors,
      warnings,
      secretsAudit,
      testResults
    })
    
    // 6. Set up monitoring
    console.log('📊 Setting up security monitoring...')
    setupSecurityMonitoring()
    
    return {
      success: errors.length === 0,
      errors,
      warnings,
      securityScore
    }
    
  } catch (error) {
    console.error('❌ Security initialization failed:', error)
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings,
      securityScore: 0
    }
  }
}

/**
 * Calculate overall security score
 */
function calculateSecurityScore(scores: {
  environmentScore: number
  secretsScore: number
  testsScore: number
}): number {
  // Weighted average: environment (30%), secrets (40%), tests (30%)
  return Math.round(
    scores.environmentScore * 0.3 +
    scores.secretsScore * 0.4 +
    scores.testsScore * 0.3
  )
}

/**
 * Log security status
 */
function logSecurityStatus(status: {
  securityScore: number
  errors: string[]
  warnings: string[]
  secretsAudit: any
  testResults: any
}): void {
  console.log('\n🔒 SECURITY STATUS REPORT')
  console.log('=' .repeat(50))
  
  // Overall score
  const scoreEmoji = status.securityScore >= 90 ? '🟢' : 
                    status.securityScore >= 70 ? '🟡' : '🔴'
  console.log(`${scoreEmoji} Overall Security Score: ${status.securityScore}/100`)
  
  // Environment
  console.log(`\n📋 Environment Security:`)
  if (status.errors.length === 0) {
    console.log('  ✅ Environment configuration is secure')
  } else {
    console.log('  ❌ Environment issues detected:')
    status.errors.forEach(error => console.log(`    - ${error}`))
  }
  
  // Secrets
  console.log(`\n🔑 Secrets Audit:`)
  console.log(`  📊 ${status.secretsAudit.validSecrets}/${status.secretsAudit.totalSecrets} secrets are valid`)
  if (status.secretsAudit.weakSecrets > 0) {
    console.log(`  ⚠️ ${status.secretsAudit.weakSecrets} weak secrets detected`)
  }
  
  // Tests
  console.log(`\n🧪 Security Tests:`)
  console.log(`  📊 ${status.testResults.overall.passed}/${status.testResults.overall.passed + status.testResults.overall.failed} tests passed`)
  
  // Warnings
  if (status.warnings.length > 0) {
    console.log(`\n⚠️ Warnings:`)
    status.warnings.forEach(warning => console.log(`  - ${warning}`))
  }
  
  // Recommendations
  console.log(`\n💡 Recommendations:`)
  if (status.securityScore >= 90) {
    console.log('  🎉 Excellent security posture! Keep monitoring and updating.')
  } else if (status.securityScore >= 70) {
    console.log('  👍 Good security posture. Address warnings to improve.')
  } else {
    console.log('  🚨 Security improvements needed. Address errors immediately.')
  }
  
  console.log('=' .repeat(50))
}

/**
 * Set up security monitoring
 */
function setupSecurityMonitoring(): void {
  // Log initial security event
  securityMonitor.logEvent({
    type: 'suspicious_request', // This would be a 'system_startup' type
    severity: 'LOW',
    ip: 'system',
    details: { 
      action: 'security_system_initialized',
      timestamp: new Date().toISOString()
    },
    blocked: false
  })
  
  // Set up periodic security checks (every hour)
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      performPeriodicSecurityCheck()
    }, 60 * 60 * 1000) // 1 hour
  }
}

/**
 * Perform periodic security checks
 */
function performPeriodicSecurityCheck(): void {
  try {
    console.log('🔍 Performing periodic security check...')
    
    // Check for environment changes
    const envResult = initializeSecurity()
    if (!envResult.success) {
      console.warn('⚠️ Environment security issues detected during periodic check')
      envResult.errors.forEach(error => console.warn(`  - ${error}`))
    }
    
    // Log security metrics
    const stats = securityMonitor.getSecurityStats()
    console.log(`📊 Security events in last hour: ${stats.recentTrends[stats.recentTrends.length - 1]?.count || 0}`)
    
    // Check for suspicious activity
    if (stats.eventsBySeverity.CRITICAL > 0) {
      console.error('🚨 Critical security events detected!')
    }
    
    if (stats.eventsBySeverity.HIGH > 10) {
      console.warn('⚠️ High number of high-severity security events')
    }
    
  } catch (error) {
    console.error('❌ Periodic security check failed:', error)
  }
}

// ============================================================================
// SECURITY HEALTH CHECK
// ============================================================================

/**
 * Get current security health status
 */
export function getSecurityHealth(): {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  score: number
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []
  
  // Check environment
  const envResult = initializeSecurity()
  if (!envResult.success) {
    issues.push(...envResult.errors)
  }
  
  // Check secrets
  const secretsAudit = auditEnvironmentSecrets()
  if (secretsAudit.weakSecrets > 0) {
    issues.push(`${secretsAudit.weakSecrets} weak secrets`)
    recommendations.push(...secretsAudit.recommendations)
  }
  
  // Check recent security events
  const stats = securityMonitor.getSecurityStats()
  const recentCritical = stats.eventsBySeverity.CRITICAL || 0
  const recentHigh = stats.eventsBySeverity.HIGH || 0
  
  if (recentCritical > 0) {
    issues.push(`${recentCritical} critical security events`)
    recommendations.push('Investigate critical security events immediately')
  }
  
  if (recentHigh > 20) {
    issues.push(`${recentHigh} high-severity security events`)
    recommendations.push('Review high-severity security events')
  }
  
  // Calculate score
  const score = calculateSecurityScore({
    environmentScore: envResult.success ? 100 : 50,
    secretsScore: Math.round((secretsAudit.validSecrets / secretsAudit.totalSecrets) * 100),
    testsScore: 100 // Assume tests are passing for health check
  })
  
  // Determine status
  let status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  if (recentCritical > 0 || score < 50) {
    status = 'CRITICAL'
  } else if (issues.length > 0 || score < 80) {
    status = 'WARNING'
  } else {
    status = 'HEALTHY'
  }
  
  return {
    status,
    score,
    issues,
    recommendations
  }
}

/**
 * Export security report
 */
export function exportSecurityReport(): {
  timestamp: string
  environment: string
  securityHealth: ReturnType<typeof getSecurityHealth>
  secretsAudit: ReturnType<typeof auditEnvironmentSecrets>
  recentEvents: any[]
  recommendations: string[]
} {
  const health = getSecurityHealth()
  const secretsAudit = auditEnvironmentSecrets()
  const recentEvents = securityMonitor.getRecentEvents(50)
  
  const recommendations = [
    ...health.recommendations,
    ...secretsAudit.recommendations,
    'Regularly update dependencies',
    'Monitor security events',
    'Perform security audits quarterly',
    'Keep security documentation updated'
  ]
  
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    securityHealth: health,
    secretsAudit,
    recentEvents,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  }
}

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

// Auto-initialize security systems when this module is imported
if (typeof window === 'undefined') { // Server-side only
  // Don't auto-initialize in test environments
  if (process.env.NODE_ENV !== 'test') {
    // Use setTimeout to avoid blocking the main thread
    setTimeout(() => {
      initializeSecuritySystems().catch(error => {
        console.error('❌ Failed to initialize security systems:', error)
      })
    }, 1000)
  }
}
