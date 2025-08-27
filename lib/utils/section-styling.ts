import { UserAppearanceSettings } from '@/lib/supabase'
import { LinkCategory } from '@/lib/services/link-service'

export interface SectionStyleOverride {
  card_border_color?: string
  card_border_radius?: number
  card_border_width?: number
  link_hover_color?: string
  link_color?: string
}

export type SectionStyleOverrides = Partial<Record<'profile' | LinkCategory, SectionStyleOverride>>

/**
 * Parse section style overrides from appearance settings
 */
export function parseSectionOverrides(appearanceSettings?: UserAppearanceSettings | null): SectionStyleOverrides {
  if (!appearanceSettings?.custom_css) return {}
  
  try {
    if (appearanceSettings.custom_css.startsWith('SECTION_OVERRIDES:')) {
      return JSON.parse(appearanceSettings.custom_css.replace('SECTION_OVERRIDES:', ''))
    }
  } catch (error) {
    console.error('Error parsing section overrides:', error)
  }
  
  return {}
}

/**
 * Get section-specific styles with global fallbacks
 * Includes special handling for light themes to ensure visibility
 */
export function getSectionStyles(
  section: 'profile' | LinkCategory,
  appearanceSettings?: UserAppearanceSettings | null,
  forceTheme?: 'light' | 'dark' | null
): React.CSSProperties & { sectionColors: SectionStyleOverride } {
  // For light themes, provide safe defaults regardless of appearance settings
  if (forceTheme === 'light') {
    return {
      sectionColors: {
        card_border_color: '#e5e7eb', // Light gray border
        card_border_radius: 20,
        card_border_width: 1,
        link_hover_color: '#2563eb' // Darker blue on hover
      }
    }
  }

  // For dark themes or when no appearance settings exist, provide dark glassmorphic defaults
  if (!appearanceSettings) {
    return {
      sectionColors: {
        card_border_color: 'rgba(255, 255, 255, 0.2)', // Subtle white border
        card_border_radius: 20,
        card_border_width: 1,
        link_hover_color: '#ffc0cb' // Pink hover for Miami theme
      }
    }
  }

  const overrides = parseSectionOverrides(appearanceSettings)
  const sectionOverride = overrides[section] || {}

  const sectionColors: SectionStyleOverride = {
    card_border_color: sectionOverride.card_border_color || appearanceSettings.border_color || 'rgba(255, 255, 255, 0.2)',
    card_border_radius: sectionOverride.card_border_radius ?? (appearanceSettings.card_border_radius || 20),
    card_border_width: sectionOverride.card_border_width ?? 1,
    link_hover_color: sectionOverride.link_hover_color || appearanceSettings.link_hover_color || '#ffc0cb'
  }

  return {
    backgroundColor: appearanceSettings.card_background_color || 'rgba(0, 0, 0, 0.20)',
    borderColor: sectionColors.card_border_color,
    borderRadius: `${sectionColors.card_border_radius}px`,
    borderWidth: `${sectionColors.card_border_width}px`,
    color: appearanceSettings.text_primary_color || '#ffffff',
    sectionColors
  }
}

/**
 * Get typography style for a specific section
 * Includes special handling for light themes to ensure visibility
 */
export function getSectionTypographyStyle(
  section: 'profile' | LinkCategory,
  type: 'heading' | 'subheading' | 'body' | 'accent' | 'link',
  appearanceSettings?: UserAppearanceSettings | null,
  isHover = false,
  forceTheme?: 'light' | 'dark' | null
): React.CSSProperties {
  // For light themes, provide safe color defaults regardless of appearance settings
  if (forceTheme === 'light') {
    const lightThemeDefaults: React.CSSProperties = {
      fontFamily: 'Sharp Grotesk, system-ui, sans-serif'
    }
    
    // Apply safe colors for light theme
    switch (type) {
      case 'heading':
        return { ...lightThemeDefaults, color: '#111827', fontSize: '32px', lineHeight: '1.2', fontWeight: 'bold' }
      case 'subheading':
        return { ...lightThemeDefaults, color: '#3b82f6', fontSize: '18px', lineHeight: '1.4', fontWeight: 'medium' }
      case 'body':
      case 'accent':
        return { ...lightThemeDefaults, color: '#4b5563', fontSize: '16px', lineHeight: '1.5', fontWeight: 'normal' }
      case 'link':
        return { 
          ...lightThemeDefaults, 
          color: isHover ? '#1d4ed8' : '#2563eb', 
          fontSize: '16px', 
          lineHeight: '1.5', 
          fontWeight: 'medium' 
        }
    }
  }
  
  // For dark themes or when no appearance settings exist, provide dark theme defaults
  if (!appearanceSettings) {
    const darkThemeDefaults: React.CSSProperties = {
      fontFamily: 'Rajdhani, system-ui, sans-serif' // Miami Nights theme font
    }
    
    switch (type) {
      case 'heading':
        return { ...darkThemeDefaults, color: '#ffffff', fontSize: '36px', lineHeight: '1.2', fontWeight: 'bold' }
      case 'subheading':
        return { ...darkThemeDefaults, color: '#ffffff', fontSize: '20px', lineHeight: '1.4', fontWeight: '600' }
      case 'body':
      case 'accent':
        return { ...darkThemeDefaults, color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px', lineHeight: '1.5', fontWeight: 'normal' }
      case 'link':
        return { 
          ...darkThemeDefaults, 
          color: isHover ? '#ffc0cb' : '#ffffff', 
          fontSize: '18px', 
          lineHeight: '1.5', 
          fontWeight: '600' 
        }
    }
  }
  
  const sectionStyles = getSectionStyles(section, appearanceSettings, forceTheme)
  const { sectionColors } = sectionStyles

  // Base typography from global settings
  const baseStyle: React.CSSProperties = {}
  
  if (appearanceSettings) {
    // Apply font family
    if (type === 'heading' || type === 'subheading') {
      baseStyle.fontFamily = appearanceSettings.primary_font || 'Sharp Grotesk'
    } else {
      baseStyle.fontFamily = appearanceSettings.secondary_font || 'Sharp Grotesk'
    }

    // Apply font size
    switch (type) {
      case 'heading':
        baseStyle.fontSize = `${appearanceSettings.font_size_heading || 32}px`
        baseStyle.lineHeight = `${appearanceSettings.line_height_heading || 1.2}`
        break
      case 'subheading':
        baseStyle.fontSize = `${appearanceSettings.font_size_subheading || 18}px`
        baseStyle.lineHeight = `${appearanceSettings.line_height_base || 1.5}`
        break
      case 'body':
      case 'accent':
      case 'link':
        baseStyle.fontSize = `${appearanceSettings.font_size_base || 16}px`
        baseStyle.lineHeight = `${appearanceSettings.line_height_base || 1.5}`
        break
    }
  }

  // Apply global colors from appearance settings
  switch (type) {
    case 'heading':
      baseStyle.color = appearanceSettings.text_primary_color || '#ffffff'
      break
    case 'subheading':
      baseStyle.color = appearanceSettings.text_accent_color || '#ffffff'
      break
    case 'body':
    case 'accent':
      baseStyle.color = appearanceSettings.text_secondary_color || 'rgba(255, 255, 255, 0.9)'
      break
    case 'link':
      baseStyle.color = isHover 
        ? (appearanceSettings.link_hover_color || '#ffc0cb')
        : (appearanceSettings.link_color || '#ffffff')
      break
  }

  return baseStyle
}