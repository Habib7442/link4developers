export interface Template {
  id: string
  name: string
  description: string
  preview_image: string
  is_premium: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TemplateId = 
  | 'sunset-gradient'
  | 'developer-dark'
  | 'minimalist-light'
  | 'github-focus'
  | 'gta-vice-city'
  | 'cyberpunk-neon'

export interface TemplateConfig {
  id: TemplateId
  name: string
  description: string
  preview_image: string
  is_premium: boolean
  is_active: boolean
  category: 'free' | 'premium'
  tags: string[]
}

