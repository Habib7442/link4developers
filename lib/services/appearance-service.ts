import { supabase, UserAppearanceSettings, BackgroundGradient } from '@/lib/supabase'
import { PremiumAccessService } from './premium-access-service'
import { invalidateUserProfileCache } from '@/lib/actions/cache-actions'

// ============================================================================
// APPEARANCE SETTINGS SERVICE
// ============================================================================

export interface AppearanceUpdateData {
  // Background Settings
  background_type?: 'color' | 'gradient' | 'image'
  background_color?: string
  background_gradient?: BackgroundGradient
  background_image_url?: string
  background_image_position?: string
  background_image_size?: string
  
  // Typography Settings
  primary_font?: string
  secondary_font?: string
  font_size_base?: number
  font_size_heading?: number
  font_size_subheading?: number
  line_height_base?: number
  line_height_heading?: number
  
  // Color Scheme
  text_primary_color?: string
  text_secondary_color?: string
  text_accent_color?: string
  link_color?: string
  link_hover_color?: string
  border_color?: string
  
  // Card Styling
  card_background_color?: string
  card_border_radius?: number
  card_border_width?: number
  card_shadow?: string
  card_backdrop_blur?: number
  
  // Visual Settings (not layout structure)
  profile_avatar_size?: number
  
  // Social Media Icons
  social_icon_size?: number
  social_icon_style?: 'rounded' | 'square' | 'circle'
  social_icon_color?: string
  social_icon_background?: string
  
  // Link Button Styling
  button_style?: 'glassmorphic' | 'solid' | 'outline' | 'minimal'
  button_border_radius?: number
  button_padding_x?: number
  button_padding_y?: number
  
  // Advanced Settings
  custom_css?: string
  animation_enabled?: boolean
  glassmorphic_enabled?: boolean
}

export const DEFAULT_APPEARANCE_SETTINGS: Omit<UserAppearanceSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  // Background Settings
  background_type: 'color',
  background_color: '#18181a',
  background_gradient: undefined,
  background_image_url: undefined,
  background_image_path: undefined,
  background_image_position: 'center',
  background_image_size: 'cover',
  
  // Typography Settings
  primary_font: 'Sharp Grotesk',
  secondary_font: 'Inter',
  font_size_base: 16,
  font_size_heading: 32,
  font_size_subheading: 24,
  line_height_base: 1.5,
  line_height_heading: 1.2,
  
  // Color Scheme
  text_primary_color: '#ffffff',
  text_secondary_color: '#7a7a83',
  text_accent_color: '#54E0FF',
  link_color: '#54E0FF',
  link_hover_color: '#29ADFF',
  border_color: '#33373b',
  
  // Card Styling
  card_background_color: 'rgba(0, 0, 0, 0.20)',
  card_border_radius: 20,
  card_border_width: 1,
  card_shadow: '0px 16px 30.7px rgba(0,0,0,0.30)',
  card_backdrop_blur: 10,
  
  // Visual Settings (not layout structure)
  profile_avatar_size: 120,
  
  // Social Media Icons
  social_icon_size: 24,
  social_icon_style: 'rounded',
  social_icon_color: '#ffffff',
  social_icon_background: 'transparent',
  
  // Link Button Styling
  button_style: 'glassmorphic',
  button_border_radius: 12,
  button_padding_x: 24,
  button_padding_y: 12,
  
  // Advanced Settings
  custom_css: undefined,
  animation_enabled: true,
  glassmorphic_enabled: true
}

/**
 * Service for managing user appearance settings
 */
export class AppearanceService {
  
  /**
   * Get user's appearance settings with fallback to defaults
   */
  static async getUserAppearanceSettings(userId: string): Promise<UserAppearanceSettings | null> {
    try {
      // Check if user has access to appearance customization
      const hasAccess = await PremiumAccessService.hasAppearanceAccess(userId)
      if (!hasAccess) {
        console.log('User does not have access to appearance customization')
        return null
      }

      const { data, error } = await supabase
        .from('user_appearance_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default ones
          return this.createDefaultSettings(userId)
        }
        console.error('Error fetching appearance settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserAppearanceSettings:', error)
      return null
    }
  }

  /**
   * Create default appearance settings for a user
   */
  static async createDefaultSettings(userId: string): Promise<UserAppearanceSettings | null> {
    try {
      // Check if user has access to appearance customization
      const hasAccess = await PremiumAccessService.hasAppearanceAccess(userId)
      if (!hasAccess) {
        console.log('User does not have access to appearance customization')
        return null
      }

      const { data, error } = await supabase
        .from('user_appearance_settings')
        .insert([{
          user_id: userId,
          ...DEFAULT_APPEARANCE_SETTINGS
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating default appearance settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createDefaultSettings:', error)
      return null
    }
  }

  /**
   * Update user's appearance settings
   */
  static async updateAppearanceSettings(
    userId: string, 
    updates: AppearanceUpdateData
  ): Promise<UserAppearanceSettings | null> {
    try {
      // Check if user has access to appearance customization
      const hasAccess = await PremiumAccessService.hasAppearanceAccess(userId)
      if (!hasAccess) {
        throw new Error('Premium access required for appearance customization')
      }

      // Validate the updates
      const validatedUpdates = this.validateAppearanceData(updates)

      const { data, error } = await supabase
        .from('user_appearance_settings')
        .update(validatedUpdates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating appearance settings:', error)
        return null
      }

      // Invalidate public profile cache for this user
      try {
        await invalidateUserProfileCache(userId)
      } catch (cacheError) {
        console.error('Error invalidating cache:', cacheError)
        // Don't fail the whole operation if cache invalidation fails
      }

      return data
    } catch (error) {
      console.error('Error in updateAppearanceSettings:', error)
      throw error
    }
  }

  /**
   * Reset user's appearance settings to defaults
   */
  static async resetToDefaults(userId: string): Promise<UserAppearanceSettings | null> {
    try {
      // Check if user has access to appearance customization
      const hasAccess = await PremiumAccessService.hasAppearanceAccess(userId)
      if (!hasAccess) {
        throw new Error('Premium access required for appearance customization')
      }

      const { data, error } = await supabase
        .from('user_appearance_settings')
        .update(DEFAULT_APPEARANCE_SETTINGS)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error resetting appearance settings:', error)
        return null
      }

      // Invalidate public profile cache for this user
      try {
        await invalidateUserProfileCache(userId)
      } catch (cacheError) {
        console.error('Error invalidating cache:', cacheError)
        // Don't fail the whole operation if cache invalidation fails
      }

      return data
    } catch (error) {
      console.error('Error in resetToDefaults:', error)
      throw error
    }
  }

  /**
   * Delete user's appearance settings
   */
  static async deleteAppearanceSettings(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_appearance_settings')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting appearance settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteAppearanceSettings:', error)
      return false
    }
  }

  /**
   * Get appearance settings for public profile (no access check)
   */
  static async getPublicAppearanceSettings(userId: string): Promise<UserAppearanceSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_appearance_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No custom settings, return null (will use default theme)
          return null
        }
        console.error('Error fetching public appearance settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getPublicAppearanceSettings:', error)
      return null
    }
  }

  /**
   * Validate appearance data before saving
   */
  private static validateAppearanceData(data: AppearanceUpdateData): AppearanceUpdateData {
    const validated: AppearanceUpdateData = {}

    // Validate colors (hex format)
    const colorFields = [
      'background_color', 'text_primary_color', 'text_secondary_color', 
      'text_accent_color', 'link_color', 'link_hover_color', 'border_color',
      'card_background_color', 'social_icon_color', 'social_icon_background'
    ] as const

    colorFields.forEach(field => {
      if (data[field] !== undefined) {
        const color = data[field] as string
        if (this.isValidColor(color)) {
          validated[field] = color
        }
      }
    })

    // Validate numeric fields
    const numericFields = [
      'font_size_base', 'font_size_heading', 'font_size_subheading',
      'line_height_base', 'line_height_heading', 'card_border_radius',
      'card_border_width', 'card_backdrop_blur', 'container_max_width',
      'section_spacing', 'element_spacing', 'profile_avatar_size',
      'social_icon_size', 'button_border_radius', 'button_padding_x', 'button_padding_y'
    ] as const

    numericFields.forEach(field => {
      if (data[field] !== undefined) {
        const value = data[field] as number
        if (typeof value === 'number' && value >= 0) {
          validated[field] = value
        }
      }
    })

    // Validate enum fields
    if (data.background_type && ['color', 'gradient', 'image'].includes(data.background_type)) {
      validated.background_type = data.background_type
    }

    if (data.social_icon_style && ['rounded', 'square', 'circle'].includes(data.social_icon_style)) {
      validated.social_icon_style = data.social_icon_style
    }

    if (data.button_style && ['glassmorphic', 'solid', 'outline', 'minimal'].includes(data.button_style)) {
      validated.button_style = data.button_style
    }

    // Validate boolean fields
    if (typeof data.animation_enabled === 'boolean') {
      validated.animation_enabled = data.animation_enabled
    }

    if (typeof data.glassmorphic_enabled === 'boolean') {
      validated.glassmorphic_enabled = data.glassmorphic_enabled
    }

    // Validate string fields
    const stringFields = [
      'background_image_url', 'background_image_position', 'background_image_size',
      'primary_font', 'secondary_font', 'card_shadow', 'custom_css'
    ] as const

    stringFields.forEach(field => {
      if (data[field] !== undefined && typeof data[field] === 'string') {
        validated[field] = data[field] as string
      }
    })

    // Validate gradient object
    if (data.background_gradient) {
      const gradient = data.background_gradient
      if (gradient.type && gradient.colors && Array.isArray(gradient.colors)) {
        validated.background_gradient = gradient
      }
    }

    return validated
  }

  /**
   * Validate color format (hex, rgb, rgba, hsl, hsla, or CSS color names)
   */
  private static isValidColor(color: string): boolean {
    // Basic validation for common color formats
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
    const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/
    const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/
    const hslaPattern = /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/
    
    return hexPattern.test(color) || 
           rgbPattern.test(color) || 
           rgbaPattern.test(color) || 
           hslPattern.test(color) || 
           hslaPattern.test(color) ||
           color === 'transparent'
  }
}
