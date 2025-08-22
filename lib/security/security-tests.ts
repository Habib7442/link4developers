// ============================================================================
// SECURITY TESTING UTILITIES
// ============================================================================

import { validateUserProfile, validateLink, sanitizeUrl, sanitizeText, detectSqlInjection, detectXss } from './validation'
import { checkRateLimit, RATE_LIMITS } from './rate-limiting'
import { validateEnvironmentVariables, checkSecurityMisconfigurations } from './environment'

// ============================================================================
// SECURITY TEST CASES
// ============================================================================

/**
 * Test input validation and sanitization
 */
export function testInputValidation(): {
  passed: number
  failed: number
  results: Array<{ test: string; passed: boolean; details?: string }>
} {
  const results: Array<{ test: string; passed: boolean; details?: string }> = []
  
  // Test XSS detection
  const xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src="x" onerror="alert(1)">',
    '<svg onload="alert(1)">',
    '"><script>alert(1)</script>'
  ]
  
  for (const payload of xssPayloads) {
    const detected = detectXss(payload)
    results.push({
      test: `XSS Detection: ${payload.substring(0, 30)}...`,
      passed: detected,
      details: detected ? 'XSS detected correctly' : 'XSS not detected - SECURITY RISK'
    })
  }
  
  // Test SQL injection detection
  const sqlPayloads = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "UNION SELECT * FROM users",
    "'; INSERT INTO users VALUES ('hacker'); --",
    "1; EXEC xp_cmdshell('dir')"
  ]
  
  for (const payload of sqlPayloads) {
    const detected = detectSqlInjection(payload)
    results.push({
      test: `SQL Injection Detection: ${payload.substring(0, 30)}...`,
      passed: detected,
      details: detected ? 'SQL injection detected correctly' : 'SQL injection not detected - SECURITY RISK'
    })
  }
  
  // Test URL sanitization
  const maliciousUrls = [
    'javascript:alert("xss")',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox("xss")',
    'file:///etc/passwd',
    'ftp://malicious.com/file'
  ]
  
  for (const url of maliciousUrls) {
    const sanitized = sanitizeUrl(url)
    results.push({
      test: `URL Sanitization: ${url}`,
      passed: sanitized === null,
      details: sanitized === null ? 'Malicious URL blocked' : `URL allowed: ${sanitized} - SECURITY RISK`
    })
  }
  
  // Test valid URLs
  const validUrls = [
    'https://example.com',
    'http://localhost:3000',
    'https://github.com/user/repo',
    'https://www.google.com/search?q=test'
  ]
  
  for (const url of validUrls) {
    const sanitized = sanitizeUrl(url)
    results.push({
      test: `Valid URL: ${url}`,
      passed: sanitized !== null,
      details: sanitized !== null ? 'Valid URL allowed' : 'Valid URL blocked - FALSE POSITIVE'
    })
  }
  
  // Test text sanitization
  const maliciousTexts = [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(1)">',
    '"><script>alert(1)</script>',
    '<iframe src="javascript:alert(1)"></iframe>'
  ]
  
  for (const text of maliciousTexts) {
    const sanitized = sanitizeText(text)
    const containsHtml = /<[^>]*>/.test(sanitized)
    results.push({
      test: `Text Sanitization: ${text.substring(0, 30)}...`,
      passed: !containsHtml,
      details: !containsHtml ? 'HTML tags removed' : `HTML tags remain: ${sanitized} - SECURITY RISK`
    })
  }
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  return { passed, failed, results }
}

/**
 * Test rate limiting functionality
 */
export function testRateLimiting(): {
  passed: number
  failed: number
  results: Array<{ test: string; passed: boolean; details?: string }>
} {
  const results: Array<{ test: string; passed: boolean; details?: string }> = []
  
  // Test rate limit configurations
  const rateLimitTests = [
    { name: 'LOGIN', config: RATE_LIMITS.LOGIN },
    { name: 'SIGNUP', config: RATE_LIMITS.SIGNUP },
    { name: 'API_GENERAL', config: RATE_LIMITS.API_GENERAL }
  ]
  
  for (const { name, config } of rateLimitTests) {
    // Test that rate limit exists
    results.push({
      test: `Rate Limit Config: ${name}`,
      passed: config !== undefined && config.maxRequests > 0 && config.windowMs > 0,
      details: config ? `${config.maxRequests} requests per ${config.windowMs}ms` : 'Config missing'
    })
    
    // Test rate limit enforcement (simulation)
    const testIdentifier = `test-${name}-${Date.now()}`
    let blocked = false
    
    // Simulate exceeding rate limit
    for (let i = 0; i <= config.maxRequests; i++) {
      const result = checkRateLimit(testIdentifier, config)
      if (!result.allowed) {
        blocked = true
        break
      }
    }
    
    results.push({
      test: `Rate Limit Enforcement: ${name}`,
      passed: blocked,
      details: blocked ? 'Rate limit enforced correctly' : 'Rate limit not enforced - SECURITY RISK'
    })
  }
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  return { passed, failed, results }
}

/**
 * Test environment security
 */
export function testEnvironmentSecurity(): {
  passed: number
  failed: number
  results: Array<{ test: string; passed: boolean; details?: string }>
} {
  const results: Array<{ test: string; passed: boolean; details?: string }> = []
  
  // Test environment variable validation
  const envValidation = validateEnvironmentVariables()
  results.push({
    test: 'Environment Variables',
    passed: envValidation.isValid,
    details: envValidation.isValid ? 'All required variables present' : envValidation.errors.join(', ')
  })
  
  // Test security misconfigurations
  const securityCheck = checkSecurityMisconfigurations()
  results.push({
    test: 'Security Misconfigurations',
    passed: securityCheck.errors.length === 0,
    details: securityCheck.errors.length === 0 
      ? `No errors, ${securityCheck.warnings.length} warnings` 
      : securityCheck.errors.join(', ')
  })
  
  // Test NODE_ENV setting
  results.push({
    test: 'NODE_ENV Setting',
    passed: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development',
    details: `NODE_ENV: ${process.env.NODE_ENV}`
  })
  
  // Test for debug mode in production
  if (process.env.NODE_ENV === 'production') {
    results.push({
      test: 'Debug Mode in Production',
      passed: process.env.DEBUG !== 'true',
      details: process.env.DEBUG === 'true' ? 'Debug mode enabled in production - SECURITY RISK' : 'Debug mode disabled'
    })
  }
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  return { passed, failed, results }
}

/**
 * Test data validation schemas
 */
export function testDataValidation(): {
  passed: number
  failed: number
  results: Array<{ test: string; passed: boolean; details?: string }>
} {
  const results: Array<{ test: string; passed: boolean; details?: string }> = []
  
  // Test valid profile data
  const validProfile = {
    full_name: 'John Doe',
    profile_title: 'Software Developer',
    bio: 'I love coding!',
    profile_slug: 'john-doe',
    github_username: 'johndoe',
    website_url: 'https://johndoe.com',
    location: 'San Francisco',
    company: 'Tech Corp',
    twitter_username: 'johndoe',
    linkedin_url: 'https://linkedin.com/in/johndoe'
  }
  
  const profileValidation = validateUserProfile(validProfile)
  results.push({
    test: 'Valid Profile Data',
    passed: profileValidation.success,
    details: profileValidation.success ? 'Profile validation passed' : profileValidation.errors?.join(', ')
  })
  
  // Test invalid profile data
  const invalidProfile = {
    full_name: '', // Empty name
    profile_slug: 'a', // Too short
    website_url: 'not-a-url', // Invalid URL
    github_username: 'user@name' // Invalid characters
  }
  
  const invalidProfileValidation = validateUserProfile(invalidProfile)
  results.push({
    test: 'Invalid Profile Data',
    passed: !invalidProfileValidation.success,
    details: !invalidProfileValidation.success ? 'Invalid data rejected correctly' : 'Invalid data accepted - SECURITY RISK'
  })
  
  // Test valid link data
  const validLink = {
    title: 'My Website',
    url: 'https://example.com',
    description: 'Check out my website',
    category: 'personal' as const,
    icon_type: 'link'
    // position is now optional and will be auto-assigned
  }
  
  const linkValidation = validateLink(validLink)
  results.push({
    test: 'Valid Link Data',
    passed: linkValidation.success,
    details: linkValidation.success ? 'Link validation passed' : linkValidation.errors?.join(', ')
  })
  
  // Test invalid link data
  const invalidLink = {
    title: '', // Empty title
    url: 'not-a-url', // Invalid URL
    category: 'invalid' as any, // Invalid category
    icon_type: 'invalid@icon' // Invalid icon type format
  }
  
  const invalidLinkValidation = validateLink(invalidLink)
  results.push({
    test: 'Invalid Link Data',
    passed: !invalidLinkValidation.success,
    details: !invalidLinkValidation.success ? 'Invalid data rejected correctly' : 'Invalid data accepted - SECURITY RISK'
  })
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  return { passed, failed, results }
}

/**
 * Run comprehensive security test suite
 */
export function runSecurityTests(): {
  overall: { passed: number; failed: number; score: number }
  categories: {
    inputValidation: ReturnType<typeof testInputValidation>
    rateLimiting: ReturnType<typeof testRateLimiting>
    environmentSecurity: ReturnType<typeof testEnvironmentSecurity>
    dataValidation: ReturnType<typeof testDataValidation>
  }
} {
  console.log('🔒 Running comprehensive security test suite...')
  
  const inputValidation = testInputValidation()
  const rateLimiting = testRateLimiting()
  const environmentSecurity = testEnvironmentSecurity()
  const dataValidation = testDataValidation()
  
  const totalPassed = inputValidation.passed + rateLimiting.passed + environmentSecurity.passed + dataValidation.passed
  const totalFailed = inputValidation.failed + rateLimiting.failed + environmentSecurity.failed + dataValidation.failed
  const totalTests = totalPassed + totalFailed
  const score = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0
  
  console.log(`✅ Security tests completed: ${totalPassed}/${totalTests} passed (${score}%)`)
  
  if (totalFailed > 0) {
    console.warn(`⚠️ ${totalFailed} security tests failed - review required`)
  }
  
  return {
    overall: { passed: totalPassed, failed: totalFailed, score },
    categories: {
      inputValidation,
      rateLimiting,
      environmentSecurity,
      dataValidation
    }
  }
}
