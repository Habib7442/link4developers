// ============================================================================
// FINAL SECURITY VALIDATION
// ============================================================================

import { runAutomatedSecurityTests } from './automated-testing'
import { getSecurityHealth, exportSecurityReport } from './init'
import { getSecurityDashboardData } from './dashboard'
import { auditEnvironmentSecrets } from './secrets'
import { validateRLSPolicies } from './database-security'

// ============================================================================
// COMPREHENSIVE SECURITY VALIDATION
// ============================================================================

interface SecurityValidationReport {
  timestamp: string
  environment: string
  overallStatus: 'SECURE' | 'WARNING' | 'CRITICAL'
  overallScore: number
  categories: {
    inputValidation: { score: number; status: string; issues: string[] }
    authentication: { score: number; status: string; issues: string[] }
    authorization: { score: number; status: string; issues: string[] }
    database: { score: number; status: string; issues: string[] }
    environment: { score: number; status: string; issues: string[] }
    monitoring: { score: number; status: string; issues: string[] }
  }
  criticalIssues: string[]
  recommendations: string[]
  testResults: any
  complianceStatus: {
    dataProtection: boolean
    accessControl: boolean
    auditLogging: boolean
    incidentResponse: boolean
  }
  nextSteps: string[]
}

/**
 * Run comprehensive security validation
 */
export async function runFinalSecurityValidation(): Promise<SecurityValidationReport> {
  console.log('🔒 Starting comprehensive security validation...')
  const startTime = Date.now()
  
  try {
    // 1. Run automated security tests
    console.log('🧪 Running automated security tests...')
    const testResults = await runAutomatedSecurityTests()
    
    // 2. Get security health status
    console.log('🏥 Checking security health...')
    const healthStatus = getSecurityHealth()
    
    // 3. Validate environment secrets
    console.log('🔑 Validating secrets...')
    const secretsAudit = auditEnvironmentSecrets()
    
    // 4. Validate database security
    console.log('🗄️ Validating database security...')
    const rlsValidation = await validateRLSPolicies()
    
    // 5. Get dashboard data
    console.log('📊 Gathering monitoring data...')
    const dashboardData = await getSecurityDashboardData()
    
    // 6. Calculate overall security status
    const validation = calculateSecurityValidation({
      testResults,
      healthStatus,
      secretsAudit,
      rlsValidation,
      dashboardData
    })
    
    const executionTime = Date.now() - startTime
    console.log(`✅ Security validation completed in ${executionTime}ms`)
    console.log(`📊 Overall security score: ${validation.overallScore}/100`)
    console.log(`🛡️ Security status: ${validation.overallStatus}`)
    
    return validation
    
  } catch (error) {
    console.error('❌ Security validation failed:', error)
    throw error
  }
}

/**
 * Calculate comprehensive security validation
 */
function calculateSecurityValidation(data: {
  testResults: any
  healthStatus: any
  secretsAudit: any
  rlsValidation: any
  dashboardData: any
}): SecurityValidationReport {
  const { testResults, healthStatus, secretsAudit, rlsValidation, dashboardData } = data
  
  // Calculate category scores
  const categories = {
    inputValidation: {
      score: testResults.categories.input_validation?.score || 0,
      status: testResults.categories.input_validation?.score >= 80 ? 'SECURE' : 'WARNING',
      issues: testResults.categories.input_validation?.tests
        .filter((t: any) => t.status !== 'PASS')
        .map((t: any) => t.details) || []
    },
    authentication: {
      score: testResults.categories.authentication?.score || 0,
      status: testResults.categories.authentication?.score >= 80 ? 'SECURE' : 'WARNING',
      issues: testResults.categories.authentication?.tests
        .filter((t: any) => t.status !== 'PASS')
        .map((t: any) => t.details) || []
    },
    authorization: {
      score: testResults.categories.authorization?.score || 0,
      status: testResults.categories.authorization?.score >= 80 ? 'SECURE' : 'WARNING',
      issues: testResults.categories.authorization?.tests
        .filter((t: any) => t.status !== 'PASS')
        .map((t: any) => t.details) || []
    },
    database: {
      score: rlsValidation.success ? 100 : 50,
      status: rlsValidation.success ? 'SECURE' : 'WARNING',
      issues: rlsValidation.issues || []
    },
    environment: {
      score: Math.round((secretsAudit.validSecrets / secretsAudit.totalSecrets) * 100),
      status: secretsAudit.weakSecrets === 0 ? 'SECURE' : 'WARNING',
      issues: secretsAudit.exposedSecrets || []
    },
    monitoring: {
      score: dashboardData.health.score,
      status: dashboardData.health.status === 'HEALTHY' ? 'SECURE' : 'WARNING',
      issues: dashboardData.health.issues || []
    }
  }
  
  // Calculate overall score
  const categoryScores = Object.values(categories).map(c => c.score)
  const overallScore = Math.round(categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length)
  
  // Determine overall status
  let overallStatus: 'SECURE' | 'WARNING' | 'CRITICAL'
  const criticalIssues: string[] = []
  
  if (overallScore < 60) {
    overallStatus = 'CRITICAL'
    criticalIssues.push('Overall security score is below acceptable threshold')
  } else if (overallScore < 80) {
    overallStatus = 'WARNING'
  } else {
    overallStatus = 'SECURE'
  }
  
  // Check for critical issues
  if (secretsAudit.exposedSecrets.length > 0) {
    overallStatus = 'CRITICAL'
    criticalIssues.push(`Exposed secrets detected: ${secretsAudit.exposedSecrets.join(', ')}`)
  }
  
  if (dashboardData.metrics.criticalEvents > 0) {
    overallStatus = 'CRITICAL'
    criticalIssues.push(`${dashboardData.metrics.criticalEvents} critical security events detected`)
  }
  
  if (!rlsValidation.success) {
    overallStatus = 'CRITICAL'
    criticalIssues.push('Database Row Level Security policies are not properly configured')
  }
  
  // Generate recommendations
  const recommendations = generateFinalRecommendations(categories, criticalIssues, overallScore)
  
  // Check compliance status
  const complianceStatus = checkComplianceStatus(categories)
  
  // Generate next steps
  const nextSteps = generateNextSteps(overallStatus, criticalIssues, categories)
  
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    overallStatus,
    overallScore,
    categories,
    criticalIssues,
    recommendations,
    testResults,
    complianceStatus,
    nextSteps
  }
}

/**
 * Generate final security recommendations
 */
function generateFinalRecommendations(
  categories: any,
  criticalIssues: string[],
  overallScore: number
): string[] {
  const recommendations: string[] = []
  
  // Critical issue recommendations
  if (criticalIssues.length > 0) {
    recommendations.push('🚨 IMMEDIATE ACTION REQUIRED: Address all critical security issues before deployment')
    recommendations.push('🔄 Re-run security validation after fixing critical issues')
  }
  
  // Category-specific recommendations
  Object.entries(categories).forEach(([category, data]: [string, any]) => {
    if (data.score < 80) {
      recommendations.push(`🔧 Improve ${category} security (current score: ${data.score}/100)`)
    }
  })
  
  // Overall score recommendations
  if (overallScore < 60) {
    recommendations.push('🛑 Security posture is inadequate - comprehensive security review required')
  } else if (overallScore < 80) {
    recommendations.push('⚠️ Security posture needs improvement - address identified issues')
  } else if (overallScore < 95) {
    recommendations.push('✅ Good security posture - minor improvements recommended')
  } else {
    recommendations.push('🎉 Excellent security posture - maintain current standards')
  }
  
  // General recommendations
  recommendations.push('📅 Schedule regular security audits (quarterly)')
  recommendations.push('🔄 Keep all dependencies and security tools updated')
  recommendations.push('📚 Provide security training for development team')
  recommendations.push('📋 Document security procedures and incident response plans')
  recommendations.push('🔍 Implement continuous security monitoring')
  
  return recommendations
}

/**
 * Check compliance status
 */
function checkComplianceStatus(categories: any): {
  dataProtection: boolean
  accessControl: boolean
  auditLogging: boolean
  incidentResponse: boolean
} {
  return {
    dataProtection: categories.inputValidation.score >= 80 && categories.database.score >= 80,
    accessControl: categories.authentication.score >= 80 && categories.authorization.score >= 80,
    auditLogging: categories.monitoring.score >= 80,
    incidentResponse: categories.monitoring.score >= 80 && categories.environment.score >= 80
  }
}

/**
 * Generate next steps based on security status
 */
function generateNextSteps(
  overallStatus: string,
  criticalIssues: string[],
  categories: any
): string[] {
  const nextSteps: string[] = []
  
  if (overallStatus === 'CRITICAL') {
    nextSteps.push('🚨 DO NOT DEPLOY - Critical security issues must be resolved first')
    nextSteps.push('🔧 Fix all critical issues identified in this report')
    nextSteps.push('🧪 Re-run security validation after fixes')
    nextSteps.push('👥 Conduct security team review before proceeding')
  } else if (overallStatus === 'WARNING') {
    nextSteps.push('⚠️ Address security warnings before production deployment')
    nextSteps.push('📋 Create action plan for identified issues')
    nextSteps.push('🔍 Implement additional monitoring for warning areas')
    nextSteps.push('📅 Schedule follow-up security review in 2 weeks')
  } else {
    nextSteps.push('✅ Security validation passed - ready for deployment')
    nextSteps.push('📊 Set up continuous security monitoring')
    nextSteps.push('📅 Schedule next security audit in 3 months')
    nextSteps.push('📚 Document current security configuration')
  }
  
  // Add category-specific next steps
  Object.entries(categories).forEach(([category, data]: [string, any]) => {
    if (data.score < 60) {
      nextSteps.push(`🔧 Priority: Improve ${category} security immediately`)
    } else if (data.score < 80) {
      nextSteps.push(`📋 Plan: Address ${category} security issues in next sprint`)
    }
  })
  
  return nextSteps
}

/**
 * Generate security validation summary
 */
export function generateValidationSummary(report: SecurityValidationReport): string {
  const statusEmoji = {
    'SECURE': '🟢',
    'WARNING': '🟡',
    'CRITICAL': '🔴'
  }
  
  let summary = `
🔒 SECURITY VALIDATION REPORT
${'='.repeat(50)}

${statusEmoji[report.overallStatus]} Overall Status: ${report.overallStatus}
📊 Security Score: ${report.overallScore}/100
🕒 Generated: ${new Date(report.timestamp).toLocaleString()}
🌍 Environment: ${report.environment}

📋 CATEGORY SCORES:
${Object.entries(report.categories)
  .map(([category, data]: [string, any]) => 
    `  ${data.score >= 80 ? '✅' : data.score >= 60 ? '⚠️' : '❌'} ${category}: ${data.score}/100`
  )
  .join('\n')}

🛡️ COMPLIANCE STATUS:
  ${report.complianceStatus.dataProtection ? '✅' : '❌'} Data Protection
  ${report.complianceStatus.accessControl ? '✅' : '❌'} Access Control
  ${report.complianceStatus.auditLogging ? '✅' : '❌'} Audit Logging
  ${report.complianceStatus.incidentResponse ? '✅' : '❌'} Incident Response
`
  
  if (report.criticalIssues.length > 0) {
    summary += `
🚨 CRITICAL ISSUES:
${report.criticalIssues.map(issue => `  - ${issue}`).join('\n')}
`
  }
  
  summary += `
🎯 NEXT STEPS:
${report.nextSteps.slice(0, 5).map(step => `  - ${step}`).join('\n')}

💡 TOP RECOMMENDATIONS:
${report.recommendations.slice(0, 5).map(rec => `  - ${rec}`).join('\n')}

${'='.repeat(50)}
`
  
  return summary
}

/**
 * Export security validation report
 */
export async function exportValidationReport(format: 'json' | 'text' = 'json'): Promise<string> {
  const report = await runFinalSecurityValidation()
  
  if (format === 'text') {
    return generateValidationSummary(report)
  }
  
  return JSON.stringify(report, null, 2)
}
