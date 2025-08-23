import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  github_username?: string
  github_url?: string
  bio?: string
  website_url?: string
  location?: string
  company?: string
  twitter_username?: string
  linkedin_url?: string
  is_premium: boolean
  profile_slug?: string
  profile_title?: string
  theme_id?: string
  custom_domain?: string
  is_public: boolean
  category_order?: string[] // Custom order of category sections
  created_at: string
  updated_at: string
}

// Template system types
export type TemplateId = 'developer-dark' | 'minimalist-light' | 'github-focus' | 'gta-vice-city'

export interface TemplateConfig {
  id: TemplateId
  name: string
  description: string
  category: 'free' | 'premium'
  preview_image: string
  features: string[]
  color_scheme: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text_primary: string
    text_secondary: string
    border: string
  }
  layout: {
    header_style: 'centered' | 'left-aligned' | 'minimal'
    link_style: 'cards' | 'buttons' | 'list'
    spacing: 'compact' | 'normal' | 'spacious'
    avatar_size: 'small' | 'medium' | 'large'
  }
  typography: {
    heading_font: string
    body_font: string
    heading_size: string
    body_size: string
  }
}

export interface UserLink {
  id: string
  user_id: string
  title: string
  url: string
  description?: string
  icon_type: 'github' | 'linkedin' | 'twitter' | 'website' | 'email' | 'custom' | 'link'
  position: number
  is_active: boolean
  click_count: number
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email?: string
  user_metadata: {
    full_name?: string
    name?: string
    avatar_url?: string
    user_name?: string
    html_url?: string
  }
}

// Appearance customization types
export interface BackgroundGradient {
  type: 'linear' | 'radial'
  colors: string[]
  direction?: string
  position?: string
}

export interface UserAppearanceSettings {
  id: string
  user_id: string

  // Background Settings
  background_type: 'color' | 'gradient' | 'image'
  background_color: string
  background_gradient?: BackgroundGradient
  background_image_url?: string
  background_image_path?: string // For tracking uploaded images
  background_image_position: string
  background_image_size: string

  // Typography Settings
  primary_font: string
  secondary_font: string
  font_size_base: number
  font_size_heading: number
  font_size_subheading: number
  line_height_base: number
  line_height_heading: number

  // Color Scheme
  text_primary_color: string
  text_secondary_color: string
  text_accent_color: string
  link_color: string
  link_hover_color: string
  border_color: string

  // Card Styling
  card_background_color: string
  card_border_radius: number
  card_border_width: number
  card_shadow: string
  card_backdrop_blur: number

  // Visual Settings (not layout structure)
  profile_avatar_size: number

  // Social Media Icons
  social_icon_size: number
  social_icon_style: 'rounded' | 'square' | 'circle'
  social_icon_color: string
  social_icon_background: string

  // Link Button Styling
  button_style: 'glassmorphic' | 'solid' | 'outline' | 'minimal'
  button_border_radius: number
  button_padding_x: number
  button_padding_y: number

  // Advanced Settings
  custom_css?: string
  animation_enabled: boolean
  glassmorphic_enabled: boolean

  // Metadata
  created_at: string
  updated_at: string
}

export default supabase;