// ============================================================================
// SECURITY MONITORING AND LOGGING
// ============================================================================

import { getClientIp } from './auth'
import { NextRequest } from 'next/server'

// ============================================================================
// TYPES
// ============================================================================

interface SecurityEvent {
  id: string
  timestamp: string
  type: SecurityEventType
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  ip: string
  userAgent?: string
  resource?: string
  details: Record<string, any>
  blocked: boolean
}

type SecurityEventType =
  | 'rate_limit_exceeded'
  | 'invalid_authentication'
  | 'successful_authentication'
  | 'unauthorized_access'
  | 'suspicious_request'
  | 'xss_attempt'
  | 'sql_injection_attempt'
  | 'malicious_file_upload'
  | 'csrf_attempt'
  | 'brute_force_attempt'
  | 'data_breach_attempt'
  | 'privilege_escalation'
  | 'suspicious_user_agent'
  | 'geo_anomaly'
  | 'time_anomaly'

// ============================================================================
// SECURITY EVENT LOGGING
// ============================================================================

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private maxEvents = 10000 // Keep last 10k events in memory
  
  /**
   * Log a security event
   */
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      ...event
    }
    
    // Add to in-memory store
    this.events.push(securityEvent)
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }
    
    // Log to console based on severity
    this.logToConsole(securityEvent)
    
    // In production, you would also:
    // - Send to external logging service (e.g., Sentry, DataDog)
    // - Store in database for analysis
    // - Send alerts for critical events
    // - Update security metrics
    
    // Handle critical events immediately
    if (securityEvent.severity === 'CRITICAL') {
      this.handleCriticalEvent(securityEvent)
    }
  }
  
  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Log to console with appropriate level
   */
  private logToConsole(event: SecurityEvent): void {
    const logMessage = `[SECURITY] ${event.type} - ${event.severity} - ${event.ip} - ${event.resource || 'N/A'}`
    
    switch (event.severity) {
      case 'CRITICAL':
        console.error('🚨', logMessage, event.details)
        break
      case 'HIGH':
        console.warn('⚠️', logMessage, event.details)
        break
      case 'MEDIUM':
        console.warn('⚡', logMessage, event.details)
        break
      case 'LOW':
        console.info('ℹ️', logMessage, event.details)
        break
    }
  }
  
  /**
   * Handle critical security events
   */
  private handleCriticalEvent(event: SecurityEvent): void {
    // In production, you would:
    // - Send immediate alerts to security team
    // - Temporarily block the IP address
    // - Invalidate user sessions if needed
    // - Trigger incident response procedures
    
    console.error('🚨 CRITICAL SECURITY EVENT DETECTED:', event)
    
    // For now, just log the critical event
    if (event.userId) {
      console.error(`🚨 User ${event.userId} involved in critical security event`)
    }
  }
  
  /**
   * Get recent security events
   */
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit).reverse()
  }
  
  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEventType, limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
      .reverse()
  }
  
  /**
   * Get events by IP
   */
  getEventsByIp(ip: string, limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.ip === ip)
      .slice(-limit)
      .reverse()
  }
  
  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalEvents: number
    eventsBySeverity: Record<string, number>
    eventsByType: Record<string, number>
    topIps: Array<{ ip: string; count: number }>
    recentTrends: Array<{ hour: string; count: number }>
  } {
    const eventsBySeverity: Record<string, number> = {}
    const eventsByType: Record<string, number> = {}
    const ipCounts: Record<string, number> = {}
    
    // Count events by severity and type
    this.events.forEach(event => {
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1
    })
    
    // Get top IPs
    const topIps = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }))
    
    // Get recent trends (last 24 hours by hour)
    const now = new Date()
    const recentTrends: Array<{ hour: string; count: number }> = []
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourStr = hour.toISOString().substring(0, 13) + ':00:00.000Z'
      const count = this.events.filter(event => 
        event.timestamp >= hourStr && 
        event.timestamp < new Date(hour.getTime() + 60 * 60 * 1000).toISOString()
      ).length
      
      recentTrends.push({
        hour: hour.toISOString().substring(11, 16), // HH:MM format
        count
      })
    }
    
    return {
      totalEvents: this.events.length,
      eventsBySeverity,
      eventsByType,
      topIps,
      recentTrends
    }
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log rate limit exceeded event
 */
export function logRateLimitExceeded(request: NextRequest, action: string, details?: any): void {
  securityMonitor.logEvent({
    type: 'rate_limit_exceeded',
    severity: 'MEDIUM',
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    resource: request.nextUrl.pathname,
    details: { action, ...details },
    blocked: true
  })
}

/**
 * Log authentication failure
 */
export function logAuthenticationFailure(request: NextRequest, reason: string, userId?: string): void {
  securityMonitor.logEvent({
    type: 'invalid_authentication',
    severity: 'HIGH',
    userId,
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    resource: request.nextUrl.pathname,
    details: { reason },
    blocked: true
  })
}

/**
 * Log successful authentication
 */
export function logAuthenticationSuccess(request: NextRequest, method: string, userId: string): void {
  securityMonitor.logEvent({
    type: 'successful_authentication',
    severity: 'LOW',
    userId,
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    resource: request.nextUrl.pathname,
    details: { method, success: true },
    blocked: false
  })
}

/**
 * Log unauthorized access attempt
 */
export function logUnauthorizedAccess(request: NextRequest, resource: string, userId?: string): void {
  securityMonitor.logEvent({
    type: 'unauthorized_access',
    severity: 'HIGH',
    userId,
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    resource,
    details: { attemptedResource: resource },
    blocked: true
  })
}

/**
 * Log suspicious request
 */
export function logSuspiciousRequest(request: NextRequest, reason: string, details?: any): void {
  securityMonitor.logEvent({
    type: 'suspicious_request',
    severity: 'MEDIUM',
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    resource: request.nextUrl.pathname,
    details: { reason, ...details },
    blocked: true
  })
}

/**
 * Log XSS attempt
 */
export function logXssAttempt(request: NextRequest, payload: string, userId?: string): void {
  securityMonitor.logEvent({
    type: 'xss_attempt',
    severity: 'HIGH',
    userId,
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    resource: request.nextUrl.pathname,
    details: { payload: payload.substring(0, 200) }, // Limit payload length
    blocked: true
  })
}

/**
 * Log SQL injection attempt
 */
export function logSqlInjectionAttempt(request: NextRequest, payload: string, userId?: string): void {
  securityMonitor.logEvent({
    type: 'sql_injection_attempt',
    severity: 'CRITICAL',
    userId,
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    resource: request.nextUrl.pathname,
    details: { payload: payload.substring(0, 200) }, // Limit payload length
    blocked: true
  })
}

/**
 * Log brute force attempt
 */
export function logBruteForceAttempt(request: NextRequest, target: string, attemptCount: number): void {
  securityMonitor.logEvent({
    type: 'brute_force_attempt',
    severity: attemptCount > 10 ? 'CRITICAL' : 'HIGH',
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    resource: request.nextUrl.pathname,
    details: { target, attemptCount },
    blocked: true
  })
}

/**
 * Check if IP should be blocked based on recent events
 */
export function shouldBlockIp(ip: string): boolean {
  const recentEvents = securityMonitor.getEventsByIp(ip, 50)
  const recentTime = new Date(Date.now() - 60 * 60 * 1000) // Last hour
  
  const recentCriticalEvents = recentEvents.filter(event => 
    event.severity === 'CRITICAL' && 
    new Date(event.timestamp) > recentTime
  )
  
  const recentHighEvents = recentEvents.filter(event => 
    event.severity === 'HIGH' && 
    new Date(event.timestamp) > recentTime
  )
  
  // Block if more than 1 critical event or more than 5 high severity events in the last hour
  return recentCriticalEvents.length > 1 || recentHighEvents.length > 5
}

/**
 * Get security dashboard data
 */
export function getSecurityDashboard() {
  return {
    stats: securityMonitor.getSecurityStats(),
    recentEvents: securityMonitor.getRecentEvents(20),
    criticalEvents: securityMonitor.getEventsByType('sql_injection_attempt', 10)
      .concat(securityMonitor.getEventsByType('data_breach_attempt', 10))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  }
}
