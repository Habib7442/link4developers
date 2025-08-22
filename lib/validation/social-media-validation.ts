// Social Media Validation for Link4Coders
// Validates social media links, custom icon URLs, and icon preferences

import { isValidIconUrl, detectPlatformFromUrl, SOCIAL_PLATFORMS } from '@/lib/config/social-icons'

export interface SocialMediaLinkData {
  url: string
  title: string
  category: 'social'
  custom_icon_url?: string
  icon_variant?: string
  use_custom_icon?: boolean
  platform_detected?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  sanitizedData?: Partial<SocialMediaLinkData>
}

export class SocialMediaValidator {
  
  /**
   * Validate a complete social media link
   */
  static validateSocialMediaLink(data: Partial<SocialMediaLinkData>): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const sanitizedData: Partial<SocialMediaLinkData> = { ...data }

    // Validate URL
    const urlValidation = this.validateUrl(data.url || '')
    if (!urlValidation.isValid) {
      errors.push(...urlValidation.errors)
    } else {
      sanitizedData.url = urlValidation.sanitizedUrl
      sanitizedData.platform_detected = urlValidation.detectedPlatform
    }

    // Validate title
    const titleValidation = this.validateTitle(data.title || '')
    if (!titleValidation.isValid) {
      errors.push(...titleValidation.errors)
    } else {
      sanitizedData.title = titleValidation.sanitizedTitle
    }

    // Validate icon preferences
    const iconValidation = this.validateIconPreferences({
      custom_icon_url: data.custom_icon_url,
      icon_variant: data.icon_variant,
      use_custom_icon: data.use_custom_icon,
      platform_detected: sanitizedData.platform_detected
    })
    
    if (!iconValidation.isValid) {
      errors.push(...iconValidation.errors)
    }
    warnings.push(...iconValidation.warnings)
    
    // Apply sanitized icon data
    Object.assign(sanitizedData, iconValidation.sanitizedData)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    }
  }

  /**
   * Validate social media URL
   */
  static validateUrl(url: string): {
    isValid: boolean
    errors: string[]
    sanitizedUrl?: string
    detectedPlatform?: string
  } {
    const errors: string[] = []

    if (!url || url.trim().length === 0) {
      errors.push('URL is required')
      return { isValid: false, errors }
    }

    // Basic URL validation
    try {
      const urlObj = new URL(url.trim())
      
      // Must be HTTPS for security
      if (urlObj.protocol !== 'https:') {
        errors.push('Social media URLs must use HTTPS')
      }

      // Check for common social media domains
      const detectedPlatform = detectPlatformFromUrl(url)
      if (!detectedPlatform) {
        // Not a recognized platform, but still allow it
        console.warn('Unrecognized social media platform:', urlObj.hostname)
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedUrl: url.trim(),
        detectedPlatform: detectedPlatform || undefined
      }

    } catch (error) {
      errors.push('Invalid URL format')
      return { isValid: false, errors }
    }
  }

  /**
   * Validate social media link title
   */
  static validateTitle(title: string): {
    isValid: boolean
    errors: string[]
    sanitizedTitle?: string
  } {
    const errors: string[] = []

    if (!title || title.trim().length === 0) {
      errors.push('Title is required')
      return { isValid: false, errors }
    }

    const trimmedTitle = title.trim()

    // Length validation
    if (trimmedTitle.length > 100) {
      errors.push('Title must be 100 characters or less')
    }

    if (trimmedTitle.length < 1) {
      errors.push('Title must be at least 1 character')
    }

    // Basic sanitization - remove potentially harmful characters
    const sanitizedTitle = trimmedTitle
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/\s+/g, ' ') // Normalize whitespace

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedTitle: errors.length === 0 ? sanitizedTitle : undefined
    }
  }

  /**
   * Validate icon preferences
   */
  static validateIconPreferences(data: {
    custom_icon_url?: string
    icon_variant?: string
    use_custom_icon?: boolean
    platform_detected?: string
  }): {
    isValid: boolean
    errors: string[]
    warnings: string[]
    sanitizedData: Partial<SocialMediaLinkData>
  } {
    const errors: string[] = []
    const warnings: string[] = []
    const sanitizedData: Partial<SocialMediaLinkData> = {}

    const { custom_icon_url, icon_variant, use_custom_icon, platform_detected } = data

    // If using custom icon, validate the URL
    if (use_custom_icon) {
      if (!custom_icon_url || custom_icon_url.trim().length === 0) {
        errors.push('Custom icon URL is required when using custom icon')
      } else {
        const customUrlValidation = this.validateCustomIconUrl(custom_icon_url)
        if (!customUrlValidation.isValid) {
          errors.push(...customUrlValidation.errors)
        } else {
          sanitizedData.custom_icon_url = customUrlValidation.sanitizedUrl
          sanitizedData.use_custom_icon = true
          sanitizedData.icon_variant = 'custom'
        }
      }
    } else {
      // Using platform icon
      sanitizedData.use_custom_icon = false
      
      if (platform_detected && SOCIAL_PLATFORMS[platform_detected]) {
        const platformConfig = SOCIAL_PLATFORMS[platform_detected]
        
        // Validate icon variant
        if (icon_variant && !platformConfig.iconVariants.includes(icon_variant)) {
          warnings.push(`Icon variant '${icon_variant}' not available for ${platformConfig.displayName}. Using default.`)
          sanitizedData.icon_variant = platformConfig.defaultIcon
        } else {
          sanitizedData.icon_variant = icon_variant || platformConfig.defaultIcon
        }
      } else {
        // Unknown platform, use default
        sanitizedData.icon_variant = 'default'
        if (platform_detected) {
          warnings.push(`Platform '${platform_detected}' not recognized. Using default icon.`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData
    }
  }

  /**
   * Validate custom icon URL
   */
  static validateCustomIconUrl(url: string): {
    isValid: boolean
    errors: string[]
    sanitizedUrl?: string
  } {
    const errors: string[] = []

    if (!url || url.trim().length === 0) {
      errors.push('Custom icon URL cannot be empty')
      return { isValid: false, errors }
    }

    const trimmedUrl = url.trim()

    // Basic URL validation
    try {
      const urlObj = new URL(trimmedUrl)
      
      // Must be HTTPS for security
      if (urlObj.protocol !== 'https:') {
        errors.push('Custom icon URLs must use HTTPS')
      }

      // Validate file extension
      if (!isValidIconUrl(trimmedUrl)) {
        errors.push('Custom icon URL must point to a valid image file (PNG, JPG, JPEG, SVG, WebP, GIF)')
      }

      // Check URL length
      if (trimmedUrl.length > 500) {
        errors.push('Custom icon URL is too long (maximum 500 characters)')
      }

      return {
        isValid: errors.length === 0,
        errors,
        sanitizedUrl: errors.length === 0 ? trimmedUrl : undefined
      }

    } catch (error) {
      errors.push('Invalid custom icon URL format')
      return { isValid: false, errors }
    }
  }

  /**
   * Validate icon variant for a platform
   */
  static validateIconVariant(platform: string, variant: string): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    if (!platform || !SOCIAL_PLATFORMS[platform]) {
      warnings.push(`Platform '${platform}' not recognized`)
      return { isValid: true, errors, warnings }
    }

    const platformConfig = SOCIAL_PLATFORMS[platform]
    
    if (!variant || !platformConfig.iconVariants.includes(variant)) {
      warnings.push(`Icon variant '${variant}' not available for ${platformConfig.displayName}`)
      return { isValid: true, errors, warnings }
    }

    return { isValid: true, errors, warnings }
  }

  /**
   * Sanitize social media link data for database storage
   */
  static sanitizeForDatabase(data: SocialMediaLinkData): SocialMediaLinkData {
    return {
      url: data.url.trim(),
      title: data.title.trim().replace(/[<>]/g, '').replace(/\s+/g, ' '),
      category: 'social',
      custom_icon_url: data.custom_icon_url?.trim() || undefined,
      icon_variant: data.icon_variant || 'default',
      use_custom_icon: Boolean(data.use_custom_icon),
      platform_detected: data.platform_detected || undefined
    }
  }

  /**
   * Generate suggestions for improving social media links
   */
  static generateSuggestions(data: Partial<SocialMediaLinkData>): string[] {
    const suggestions: string[] = []

    // URL suggestions
    if (data.url) {
      const detectedPlatform = detectPlatformFromUrl(data.url)
      if (detectedPlatform && SOCIAL_PLATFORMS[detectedPlatform]) {
        const platformConfig = SOCIAL_PLATFORMS[detectedPlatform]
        suggestions.push(`Consider using the platform name "${platformConfig.displayName}" as the title`)
        
        if (!data.use_custom_icon) {
          suggestions.push(`${platformConfig.iconVariants.length} icon styles available for ${platformConfig.displayName}`)
        }
      }
    }

    // Icon suggestions
    if (data.use_custom_icon && data.custom_icon_url) {
      suggestions.push('Custom icons work best when they are square (1:1 aspect ratio) and at least 64x64 pixels')
    }

    return suggestions
  }
}
