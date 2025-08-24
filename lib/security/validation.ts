import validator from 'validator'
import DOMPurify from 'dompurify'
import { z } from 'zod'

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

// User Profile Validation Schema
export const UserProfileSchema = z.object({
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Full name contains invalid characters'),
  
  profile_title: z.string()
    .max(150, 'Profile title must be less than 150 characters')
    .optional(),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  profile_slug: z.string()
    .min(3, 'Profile URL must be at least 3 characters')
    .max(50, 'Profile URL must be less than 50 characters')
    .regex(/^[a-z0-9\-_]+$/, 'Profile URL can only contain lowercase letters, numbers, hyphens, and underscores'),
  
  github_username: z.string()
    .max(39, 'GitHub username must be less than 39 characters')
    .regex(/^[a-zA-Z0-9\-]+$/, 'Invalid GitHub username format')
    .optional(),
  
  website_url: z.string()
    .url('Invalid website URL')
    .max(500, 'Website URL must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  company: z.string()
    .max(100, 'Company must be less than 100 characters')
    .optional(),
  
  twitter_username: z.string()
    .max(15, 'Twitter username must be less than 15 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Invalid Twitter username format')
    .optional(),
  
  linkedin_url: z.string()
    .url('Invalid LinkedIn URL')
    .max(500, 'LinkedIn URL must be less than 500 characters')
    .optional()
    .or(z.literal('')),
})

// Link Validation Schema
export const LinkSchema = z.object({
  title: z.string()
    .min(1, 'Link title is required')
    .max(100, 'Link title must be less than 100 characters'),

  url: z.string()
    .url('Invalid URL format')
    .max(2000, 'URL must be less than 2000 characters'),

  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),

  category: z.enum(['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom']),

  icon_type: z.string()
    .max(50, 'Icon type must be less than 50 characters')
    .regex(/^[a-z0-9_-]+$/, 'Invalid icon type format. Use lowercase letters, numbers, underscores, and hyphens only'),

  position: z.number()
    .int('Position must be an integer')
    .min(0, 'Position must be non-negative')
    .max(1000, 'Position must be less than 1000')
    .optional(), // Position is optional since it's auto-assigned by the API
    
  // Universal icon fields
  custom_icon_url: z.string()
    .url('Invalid custom icon URL')
    .max(2000, 'Custom icon URL must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
    
  uploaded_icon_url: z.string()
    .url('Invalid uploaded icon URL')
    .max(2000, 'Uploaded icon URL must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
    
  icon_variant: z.string()
    .max(50, 'Icon variant must be less than 50 characters')
    .regex(/^[a-z0-9_-]+$/, 'Invalid icon variant format')
    .optional(),
    
  use_custom_icon: z.boolean()
    .optional(),
    
  icon_selection_type: z.enum(['default', 'platform', 'upload', 'url']).optional(),
  
  platform_detected: z.string()
    .max(50, 'Platform detected must be less than 50 characters')
    .regex(/^[a-z0-9_-]*$/, 'Invalid platform detected format')
    .optional(),
    
  // GitHub Projects specific field
  live_project_url: z.string()
    .optional()
    .refine((val) => {
      // Allow undefined, null, or empty string
      if (!val || val.trim() === '') return true;
      // If value exists, validate as URL
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, {
      message: 'Live project URL must be a valid URL or empty'
    }),
})

// Authentication Validation Schema
export const AuthSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email must be less than 254 characters'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
})

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }
  
  // Client-side: use DOMPurify
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
}

/**
 * Safely validate a URL string
 * @param urlString - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export function isValidUrl(urlString?: string): boolean {
  if (!urlString || urlString.trim() === '') return false;
  
  // First check with validator
  const isValid = validator.isURL(urlString.trim(), {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_host: true,
    require_valid_protocol: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
    disallow_auth: true
  });
  
  if (!isValid) return false;
  
  // Double-check with URL constructor for additional validation
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize and validate URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    // Early return for empty strings
    if (!url || url.trim() === '') return null;
    
    // Remove any potential XSS vectors
    const cleaned = url.trim();
    
    // Check for javascript: or data: protocols
    if (cleaned.toLowerCase().startsWith('javascript:') || 
        cleaned.toLowerCase().startsWith('data:') ||
        cleaned.toLowerCase().startsWith('vbscript:')) {
      return null;
    }
    
    // Use our isValidUrl function for validation
    if (!isValidUrl(cleaned)) {
      return null;
    }
    
    return cleaned;
  } catch (error) {
    console.error('URL sanitization error:', error);
    return null;
  }
}

/**
 * Sanitize text input
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  return sanitizeHtml(input.trim()).substring(0, maxLength)
}

/**
 * Sanitize username/slug
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-_]/g, '')
    .substring(0, 50)
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  const cleaned = email.trim().toLowerCase()
  return validator.isEmail(cleaned) ? cleaned : null
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate user profile data
 */
export function validateUserProfile(data: any): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validated = UserProfileSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

/**
 * Validate link data
 */
export function validateLink(data: any): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validated = LinkSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    console.error('Link validation error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => {
          const path = err.path.length > 0 ? err.path.join('.') : 'field'
          return `${path}: ${err.message}`
        })
      }
    }

    // Handle other types of errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
    return {
      success: false,
      errors: [`Validation failed: ${errorMessage}`]
    }
  }
}

/**
 * Validate authentication data
 */
export function validateAuth(data: any): { success: boolean; data?: any; errors?: string[] } {
  try {
    const validated = AuthSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// ============================================================================
// FILE UPLOAD VALIDATION
// ============================================================================

/**
 * Validate file upload for avatar
 */
export function validateAvatarFile(file: File): { success: boolean; error?: string } {
  // Check file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'File size must be less than 5MB' }
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'File must be JPEG, PNG, WebP, or GIF' }
  }
  
  // Check file name
  if (file.name.length > 255) {
    return { success: false, error: 'File name is too long' }
  }
  
  return { success: true }
}

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Check for potential SQL injection patterns
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|'|"|`)/,
    /(\bOR\b|\bAND\b).*?[=<>]/i,
    /\b(WAITFOR|DELAY)\b/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Check for potential XSS patterns
 */
export function detectXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<link\b/i,
    /<meta\b/i
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * Rate limiting key generator
 */
export function generateRateLimitKey(identifier: string, action: string): string {
  return `rate_limit:${action}:${identifier}`
}
