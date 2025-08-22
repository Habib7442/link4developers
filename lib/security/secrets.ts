// ============================================================================
// SECRETS MANAGEMENT AND VALIDATION
// ============================================================================

import { createHash } from 'crypto'

// ============================================================================
// TYPES
// ============================================================================

interface SecretValidationResult {
  isValid: boolean
  strength: 'WEAK' | 'MEDIUM' | 'STRONG'
  issues: string[]
  recommendations: string[]
}

interface SecretsAuditResult {
  totalSecrets: number
  validSecrets: number
  weakSecrets: number
  exposedSecrets: string[]
  recommendations: string[]
}

// ============================================================================
// SECRET VALIDATION
// ============================================================================

/**
 * Validate API key strength and format
 */
export function validateApiKey(key: string, keyName: string): SecretValidationResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let strength: 'WEAK' | 'MEDIUM' | 'STRONG' = 'WEAK'
  
  // Check length
  if (key.length < 32) {
    issues.push('API key is too short (minimum 32 characters recommended)')
    recommendations.push('Use longer API keys (64+ characters)')
  } else if (key.length >= 64) {
    strength = 'STRONG'
  } else {
    strength = 'MEDIUM'
  }
  
  // Check for common patterns
  if (/^[a-zA-Z0-9]+$/.test(key)) {
    // Good - alphanumeric
  } else if (/[^a-zA-Z0-9\-_]/.test(key)) {
    issues.push('API key contains unusual characters')
  }
  
  // Check for obvious test/development keys
  const testPatterns = [
    /test/i,
    /dev/i,
    /demo/i,
    /sample/i,
    /example/i,
    /fake/i,
    /mock/i,
    /placeholder/i
  ]
  
  if (testPatterns.some(pattern => pattern.test(key))) {
    issues.push('API key appears to be a test/development key')
    recommendations.push('Use production API keys in production environment')
    strength = 'WEAK'
  }
  
  // Check for repeated patterns
  if (/(.{3,})\1{2,}/.test(key)) {
    issues.push('API key contains repeated patterns')
    strength = 'WEAK'
  }
  
  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(key)) {
    issues.push('API key contains sequential characters')
    recommendations.push('Use randomly generated API keys')
    strength = 'WEAK'
  }
  
  return {
    isValid: issues.length === 0,
    strength,
    issues,
    recommendations
  }
}

/**
 * Validate JWT secret strength
 */
export function validateJwtSecret(secret: string): SecretValidationResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let strength: 'WEAK' | 'MEDIUM' | 'STRONG' = 'WEAK'
  
  // Check minimum length
  if (secret.length < 32) {
    issues.push('JWT secret is too short (minimum 32 characters)')
    recommendations.push('Use at least 64 characters for JWT secrets')
  } else if (secret.length >= 64) {
    strength = 'STRONG'
  } else {
    strength = 'MEDIUM'
  }
  
  // Check entropy
  const uniqueChars = new Set(secret).size
  const entropyRatio = uniqueChars / secret.length
  
  if (entropyRatio < 0.3) {
    issues.push('JWT secret has low entropy (too many repeated characters)')
    recommendations.push('Use a cryptographically secure random generator')
    strength = 'WEAK'
  }
  
  // Check for common weak secrets
  const weakSecrets = [
    'secret',
    'password',
    'jwt-secret',
    'your-secret-key',
    'change-me',
    'default-secret'
  ]
  
  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    issues.push('JWT secret contains common weak patterns')
    recommendations.push('Use a randomly generated secret')
    strength = 'WEAK'
  }
  
  return {
    isValid: issues.length === 0,
    strength,
    issues,
    recommendations
  }
}

/**
 * Validate database connection string
 */
export function validateDatabaseUrl(url: string): SecretValidationResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let strength: 'WEAK' | 'MEDIUM' | 'STRONG' = 'MEDIUM'
  
  try {
    const parsedUrl = new URL(url)
    
    // Check protocol
    if (!['postgres:', 'postgresql:', 'mysql:', 'mongodb:'].includes(parsedUrl.protocol)) {
      issues.push('Unsupported database protocol')
    }
    
    // Check for localhost in production
    if (process.env.NODE_ENV === 'production' && 
        (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')) {
      issues.push('Using localhost database URL in production')
      recommendations.push('Use production database URL')
      strength = 'WEAK'
    }
    
    // Check for default ports
    const defaultPorts = {
      'postgres:': '5432',
      'postgresql:': '5432',
      'mysql:': '3306',
      'mongodb:': '27017'
    }
    
    if (parsedUrl.port && parsedUrl.port === defaultPorts[parsedUrl.protocol as keyof typeof defaultPorts]) {
      recommendations.push('Consider using non-default ports for additional security')
    }
    
    // Check for weak passwords in URL
    if (parsedUrl.password) {
      const passwordValidation = validatePassword(parsedUrl.password)
      if (!passwordValidation.isValid) {
        issues.push('Database password is weak')
        recommendations.push('Use strong database passwords')
        strength = 'WEAK'
      }
    }
    
    // Check for SSL/TLS
    if (!parsedUrl.searchParams.get('sslmode') && !parsedUrl.searchParams.get('ssl')) {
      recommendations.push('Enable SSL/TLS for database connections')
    }
    
  } catch (error) {
    issues.push('Invalid database URL format')
    strength = 'WEAK'
  }
  
  return {
    isValid: issues.length === 0,
    strength,
    issues,
    recommendations
  }
}

/**
 * Validate password strength
 */
function validatePassword(password: string): SecretValidationResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let strength: 'WEAK' | 'MEDIUM' | 'STRONG' = 'WEAK'
  
  if (password.length < 12) {
    issues.push('Password is too short')
    recommendations.push('Use passwords with at least 12 characters')
  } else if (password.length >= 16) {
    strength = 'STRONG'
  } else {
    strength = 'MEDIUM'
  }
  
  // Check character variety
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  
  const varietyCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
  
  if (varietyCount < 3) {
    issues.push('Password lacks character variety')
    recommendations.push('Use a mix of uppercase, lowercase, numbers, and special characters')
    strength = 'WEAK'
  }
  
  return {
    isValid: issues.length === 0,
    strength,
    issues,
    recommendations
  }
}

// ============================================================================
// SECRETS AUDIT
// ============================================================================

/**
 * Audit all environment secrets
 */
export function auditEnvironmentSecrets(): SecretsAuditResult {
  const secrets = [
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, type: 'api_key' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY, type: 'api_key' },
    { name: 'JWT_SECRET', value: process.env.JWT_SECRET, type: 'jwt_secret' },
    { name: 'DATABASE_URL', value: process.env.DATABASE_URL, type: 'database_url' }
  ]
  
  let validSecrets = 0
  let weakSecrets = 0
  const exposedSecrets: string[] = []
  const recommendations: string[] = []
  
  for (const secret of secrets) {
    if (!secret.value) {
      continue
    }
    
    let validation: SecretValidationResult
    
    switch (secret.type) {
      case 'api_key':
        validation = validateApiKey(secret.value, secret.name)
        break
      case 'jwt_secret':
        validation = validateJwtSecret(secret.value)
        break
      case 'database_url':
        validation = validateDatabaseUrl(secret.value)
        break
      default:
        continue
    }
    
    if (validation.isValid) {
      validSecrets++
    }
    
    if (validation.strength === 'WEAK') {
      weakSecrets++
      exposedSecrets.push(secret.name)
    }
    
    recommendations.push(...validation.recommendations.map(rec => `${secret.name}: ${rec}`))
  }
  
  return {
    totalSecrets: secrets.filter(s => s.value).length,
    validSecrets,
    weakSecrets,
    exposedSecrets,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  }
}

/**
 * Check for exposed secrets in code
 */
export function checkForExposedSecrets(content: string): {
  exposedSecrets: Array<{ type: string; pattern: string; line?: number }>
  recommendations: string[]
} {
  const exposedSecrets: Array<{ type: string; pattern: string; line?: number }> = []
  const recommendations: string[] = []
  
  // Patterns for different types of secrets
  const secretPatterns = [
    { type: 'API Key', pattern: /['"](sk_|pk_|rk_)[a-zA-Z0-9]{20,}['"]/ },
    { type: 'JWT Token', pattern: /['"](eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)['"]/ },
    { type: 'Database URL', pattern: /['"](postgres|mysql|mongodb):\/\/[^'"]+['"]/ },
    { type: 'AWS Access Key', pattern: /['"](AKIA[0-9A-Z]{16})['"]/ },
    { type: 'GitHub Token', pattern: /['"](ghp_[a-zA-Z0-9]{36})['"]/ },
    { type: 'Generic Secret', pattern: /['"](secret|password|key)['"]\s*:\s*['"][^'"]{8,}['"]/ }
  ]
  
  const lines = content.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    for (const { type, pattern } of secretPatterns) {
      const match = line.match(pattern)
      if (match) {
        exposedSecrets.push({
          type,
          pattern: match[0],
          line: i + 1
        })
      }
    }
  }
  
  if (exposedSecrets.length > 0) {
    recommendations.push('Move secrets to environment variables')
    recommendations.push('Use a secrets management service')
    recommendations.push('Add secrets to .gitignore')
    recommendations.push('Rotate any exposed secrets immediately')
  }
  
  return {
    exposedSecrets,
    recommendations
  }
}

// ============================================================================
// SECRET GENERATION
// ============================================================================

/**
 * Generate a secure API key
 */
export function generateSecureApiKey(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generate a secure JWT secret
 */
export function generateJwtSecret(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Hash secret for comparison (without storing the actual secret)
 */
export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

/**
 * Verify secret against hash
 */
export function verifySecretHash(secret: string, hash: string): boolean {
  return hashSecret(secret) === hash
}
