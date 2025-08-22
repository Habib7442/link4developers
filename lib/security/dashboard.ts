// ============================================================================
// SECURITY MONITORING DASHBOARD
// ============================================================================

import { securityMonitor, getSecurityDashboard } from './monitoring'
import { getDatabaseSecurityStatus } from './database-security'
import { getSecurityHealth, exportSecurityReport } from './init'
import { auditEnvironmentSecrets } from './secrets'
import { runSecurityTests } from './security-tests'

// ============================================================================
// DASHBOARD DATA TYPES
// ============================================================================

interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  highSeverityEvents: number
  blockedRequests: number
  suspiciousIPs: string[]
  topThreats: Array<{ type: string; count: number }>
  responseTime: number
  uptime: number
}

interface SecurityTrends {
  hourly: Array<{ time: string; events: number; blocked: number }>
  daily: Array<{ date: string; events: number; blocked: number }>
  weekly: Array<{ week: string; events: number; blocked: number }>
}

interface SecurityAlerts {
  active: Array<{
    id: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    type: string
    message: string
    timestamp: string
    acknowledged: boolean
  }>
  recent: Array<{
    id: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    type: string
    message: string
    timestamp: string
    resolved: boolean
  }>
}

// ============================================================================
// DASHBOARD DATA AGGREGATION
// ============================================================================

/**
 * Get comprehensive security dashboard data
 */
export async function getSecurityDashboardData(): Promise<{
  metrics: SecurityMetrics
  trends: SecurityTrends
  alerts: SecurityAlerts
  health: ReturnType<typeof getSecurityHealth>
  databaseStatus: Awaited<ReturnType<typeof getDatabaseSecurityStatus>>
  secretsAudit: ReturnType<typeof auditEnvironmentSecrets>
  recentEvents: any[]
}> {
  try {
    // Get basic dashboard data
    const dashboardData = getSecurityDashboard()
    
    // Get security health
    const health = getSecurityHealth()
    
    // Get database security status
    const databaseStatus = await getDatabaseSecurityStatus()
    
    // Get secrets audit
    const secretsAudit = auditEnvironmentSecrets()
    
    // Calculate metrics
    const metrics = calculateSecurityMetrics(dashboardData)
    
    // Generate trends
    const trends = generateSecurityTrends(dashboardData)
    
    // Get alerts
    const alerts = generateSecurityAlerts(dashboardData)
    
    return {
      metrics,
      trends,
      alerts,
      health,
      databaseStatus,
      secretsAudit,
      recentEvents: dashboardData.recentEvents
    }
    
  } catch (error) {
    console.error('Error getting security dashboard data:', error)
    throw error
  }
}

/**
 * Calculate security metrics
 */
function calculateSecurityMetrics(dashboardData: any): SecurityMetrics {
  const stats = dashboardData.stats
  
  // Calculate suspicious IPs (IPs with multiple high-severity events)
  const suspiciousIPs = stats.topIps
    .filter((ip: any) => ip.count > 5)
    .map((ip: any) => ip.ip)
    .slice(0, 10)
  
  // Calculate top threats
  const topThreats = Object.entries(stats.eventsByType)
    .map(([type, count]) => ({ type, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  // Calculate blocked requests (events that were blocked)
  const blockedRequests = dashboardData.recentEvents
    .filter((event: any) => event.blocked)
    .length
  
  return {
    totalEvents: stats.totalEvents,
    criticalEvents: stats.eventsBySeverity.CRITICAL || 0,
    highSeverityEvents: stats.eventsBySeverity.HIGH || 0,
    blockedRequests,
    suspiciousIPs,
    topThreats,
    responseTime: 0, // Would be calculated from actual metrics
    uptime: 99.9 // Would be calculated from actual uptime data
  }
}

/**
 * Generate security trends
 */
function generateSecurityTrends(dashboardData: any): SecurityTrends {
  const stats = dashboardData.stats
  
  // Convert recent trends to hourly data
  const hourly = stats.recentTrends.map((trend: any) => ({
    time: trend.hour,
    events: trend.count,
    blocked: Math.floor(trend.count * 0.3) // Estimate blocked events
  }))
  
  // Generate daily trends (last 7 days)
  const daily = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split('T')[0],
      events: Math.floor(Math.random() * 100) + 20, // Mock data
      blocked: Math.floor(Math.random() * 30) + 5
    }
  }).reverse()
  
  // Generate weekly trends (last 4 weeks)
  const weekly = Array.from({ length: 4 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (i * 7))
    return {
      week: `Week ${4 - i}`,
      events: Math.floor(Math.random() * 500) + 100, // Mock data
      blocked: Math.floor(Math.random() * 150) + 25
    }
  })
  
  return { hourly, daily, weekly }
}

/**
 * Generate security alerts
 */
function generateSecurityAlerts(dashboardData: any): SecurityAlerts {
  const recentEvents = dashboardData.recentEvents
  
  // Generate active alerts from critical and high severity events
  const active = recentEvents
    .filter((event: any) => 
      (event.severity === 'CRITICAL' || event.severity === 'HIGH') &&
      new Date(event.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    )
    .map((event: any) => ({
      id: event.id,
      severity: event.severity,
      type: event.type,
      message: generateAlertMessage(event),
      timestamp: event.timestamp,
      acknowledged: false
    }))
    .slice(0, 10)
  
  // Generate recent alerts (last 24 hours)
  const recent = recentEvents
    .filter((event: any) => 
      new Date(event.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
    .map((event: any) => ({
      id: event.id,
      severity: event.severity,
      type: event.type,
      message: generateAlertMessage(event),
      timestamp: event.timestamp,
      resolved: event.severity === 'LOW' || event.severity === 'MEDIUM'
    }))
    .slice(0, 20)
  
  return { active, recent }
}

/**
 * Generate alert message from security event
 */
function generateAlertMessage(event: any): string {
  const messages: Record<string, string> = {
    'rate_limit_exceeded': `Rate limit exceeded from IP ${event.ip}`,
    'invalid_authentication': `Authentication failure from IP ${event.ip}`,
    'unauthorized_access': `Unauthorized access attempt to ${event.resource}`,
    'suspicious_request': `Suspicious request detected from IP ${event.ip}`,
    'xss_attempt': `XSS attack attempt detected from IP ${event.ip}`,
    'sql_injection_attempt': `SQL injection attempt detected from IP ${event.ip}`,
    'brute_force_attempt': `Brute force attack detected from IP ${event.ip}`,
    'malicious_file_upload': `Malicious file upload attempt from IP ${event.ip}`
  }
  
  return messages[event.type] || `Security event: ${event.type} from IP ${event.ip}`
}

// ============================================================================
// REAL-TIME MONITORING
// ============================================================================

/**
 * Start real-time security monitoring
 */
export function startRealTimeMonitoring(): {
  stop: () => void
  getStatus: () => { active: boolean; eventsProcessed: number }
} {
  let active = true
  let eventsProcessed = 0
  
  const monitoringInterval = setInterval(() => {
    if (!active) return
    
    try {
      // Check for new security events
      const recentEvents = securityMonitor.getRecentEvents(10)
      const newCriticalEvents = recentEvents.filter(event => 
        event.severity === 'CRITICAL' &&
        new Date(event.timestamp) > new Date(Date.now() - 60 * 1000) // Last minute
      )
      
      // Process critical events immediately
      newCriticalEvents.forEach(event => {
        handleCriticalSecurityEvent(event)
        eventsProcessed++
      })
      
      // Check system health
      const health = getSecurityHealth()
      if (health.status === 'CRITICAL') {
        console.error('🚨 CRITICAL SECURITY STATUS DETECTED')
        // In production, trigger immediate alerts
      }
      
    } catch (error) {
      console.error('Error in real-time monitoring:', error)
    }
  }, 30000) // Check every 30 seconds
  
  return {
    stop: () => {
      active = false
      clearInterval(monitoringInterval)
    },
    getStatus: () => ({ active, eventsProcessed })
  }
}

/**
 * Handle critical security events
 */
function handleCriticalSecurityEvent(event: any): void {
  console.error('🚨 CRITICAL SECURITY EVENT:', event)
  
  // In production, you would:
  // 1. Send immediate notifications to security team
  // 2. Temporarily block the IP address
  // 3. Invalidate related user sessions
  // 4. Create incident ticket
  // 5. Update security metrics
  
  // For now, just log the event
  const alertMessage = generateAlertMessage(event)
  console.error(`🚨 ALERT: ${alertMessage}`)
}

// ============================================================================
// SECURITY REPORTING
// ============================================================================

/**
 * Generate security report for a specific time period
 */
export async function generateSecurityReport(
  startDate: Date,
  endDate: Date
): Promise<{
  summary: {
    totalEvents: number
    criticalEvents: number
    blockedAttacks: number
    uniqueIPs: number
    topThreats: Array<{ type: string; count: number }>
  }
  details: {
    eventsByDay: Array<{ date: string; count: number }>
    eventsByType: Record<string, number>
    eventsBySeverity: Record<string, number>
    topIPs: Array<{ ip: string; count: number }>
  }
  recommendations: string[]
}> {
  try {
    // Get events for the time period
    const allEvents = securityMonitor.getRecentEvents(10000) // Get more events
    const periodEvents = allEvents.filter(event => {
      const eventDate = new Date(event.timestamp)
      return eventDate >= startDate && eventDate <= endDate
    })
    
    // Calculate summary
    const summary = {
      totalEvents: periodEvents.length,
      criticalEvents: periodEvents.filter(e => e.severity === 'CRITICAL').length,
      blockedAttacks: periodEvents.filter(e => e.blocked).length,
      uniqueIPs: new Set(periodEvents.map(e => e.ip)).size,
      topThreats: Object.entries(
        periodEvents.reduce((acc: Record<string, number>, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1
          return acc
        }, {})
      )
        .map(([type, count]) => ({ type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }
    
    // Calculate details
    const eventsByDay: Record<string, number> = {}
    const eventsByType: Record<string, number> = {}
    const eventsBySeverity: Record<string, number> = {}
    const ipCounts: Record<string, number> = {}
    
    periodEvents.forEach(event => {
      const date = event.timestamp.split('T')[0]
      eventsByDay[date] = (eventsByDay[date] || 0) + 1
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
      ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1
    })
    
    const details = {
      eventsByDay: Object.entries(eventsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      eventsByType,
      eventsBySeverity,
      topIPs: Object.entries(ipCounts)
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }
    
    // Generate recommendations
    const recommendations = generateSecurityRecommendations(summary, details)
    
    return { summary, details, recommendations }
    
  } catch (error) {
    console.error('Error generating security report:', error)
    throw error
  }
}

/**
 * Generate security recommendations based on report data
 */
function generateSecurityRecommendations(
  summary: any,
  details: any
): string[] {
  const recommendations: string[] = []
  
  // Check for high attack volume
  if (summary.criticalEvents > 10) {
    recommendations.push('High number of critical security events detected. Review and strengthen security measures.')
  }
  
  // Check for repeat offenders
  const topIP = details.topIPs[0]
  if (topIP && topIP.count > 50) {
    recommendations.push(`IP ${topIP.ip} has generated ${topIP.count} events. Consider blocking this IP.`)
  }
  
  // Check for specific attack types
  if (details.eventsByType['sql_injection_attempt'] > 0) {
    recommendations.push('SQL injection attempts detected. Review input validation and parameterized queries.')
  }
  
  if (details.eventsByType['xss_attempt'] > 0) {
    recommendations.push('XSS attempts detected. Review output encoding and Content Security Policy.')
  }
  
  if (details.eventsByType['brute_force_attempt'] > 0) {
    recommendations.push('Brute force attempts detected. Consider implementing account lockouts and CAPTCHA.')
  }
  
  // General recommendations
  recommendations.push('Regularly review security logs and update security policies.')
  recommendations.push('Keep all dependencies and security tools up to date.')
  recommendations.push('Conduct regular security audits and penetration testing.')
  
  return recommendations
}
