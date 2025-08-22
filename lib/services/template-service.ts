import { supabase } from '@/lib/supabase'
import { TemplateId, TemplateConfig } from '@/lib/supabase'
import { getTemplateConfig, isValidTemplateId, getDefaultTemplateId, getAllTemplates, getFreeTemplates } from '@/lib/templates/template-config'

// Helper function to get authorization headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  return headers
}

export class TemplateService {
  
  // Get user's current template
  static async getUserTemplate(userId: string): Promise<TemplateConfig> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('theme_id')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user template:', error)
        return getTemplateConfig(getDefaultTemplateId())
      }

      const templateId = user?.theme_id as TemplateId
      
      if (!templateId || !isValidTemplateId(templateId)) {
        return getTemplateConfig(getDefaultTemplateId())
      }

      return getTemplateConfig(templateId)
    } catch (error) {
      console.error('Error in getUserTemplate:', error)
      return getTemplateConfig(getDefaultTemplateId())
    }
  }

  // Update user's template (client-side version - calls API)
  static async updateUserTemplate(userId: string, templateId: TemplateId): Promise<boolean> {
    try {
      if (!isValidTemplateId(templateId)) {
        throw new Error('Invalid template ID')
      }

      const headers = await getAuthHeaders()

      const response = await fetch('/api/templates/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          templateId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update template')
      }

      const data = await response.json()
      console.log('✅ Template updated successfully:', templateId)
      return data.success
    } catch (error) {
      console.error('Error in updateUserTemplate:', error)
      return false
    }
  }

  // Get template by ID with validation
  static getTemplate(templateId: string): TemplateConfig {
    if (!isValidTemplateId(templateId)) {
      console.warn('Invalid template ID, falling back to default:', templateId)
      return getTemplateConfig(getDefaultTemplateId())
    }
    return getTemplateConfig(templateId)
  }

  // Check if user has access to template (for premium templates)
  static async hasTemplateAccess(userId: string, templateId: TemplateId): Promise<boolean> {
    try {
      const template = getTemplateConfig(templateId)
      
      // Free templates are always accessible
      if (template.category === 'free') {
        return true
      }

      // Check if user is premium for premium templates
      const { data: user, error } = await supabase
        .from('users')
        .select('is_premium')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error checking template access:', error)
        return false
      }

      return user?.is_premium || false
    } catch (error) {
      console.error('Error in hasTemplateAccess:', error)
      return false
    }
  }

  // Get available templates for user
  static async getAvailableTemplates(userId: string): Promise<TemplateConfig[]> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('is_premium')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user premium status:', error)
        // Return only free templates on error
        return getFreeTemplates()
      }

      const isPremium = user?.is_premium || false

      // Return all templates if premium, only free if not
      return isPremium ? getAllTemplates() : getFreeTemplates()
    } catch (error) {
      console.error('Error in getAvailableTemplates:', error)
      return []
    }
  }

  // Validate template configuration
  static validateTemplateConfig(config: Partial<TemplateConfig>): boolean {
    const requiredFields = ['id', 'name', 'description', 'category', 'color_scheme', 'layout', 'typography']
    
    for (const field of requiredFields) {
      if (!(field in config)) {
        console.error('Missing required field in template config:', field)
        return false
      }
    }

    return true
  }

  // Get template CSS variables for dynamic styling
  static getTemplateCSS(templateId: TemplateId): Record<string, string> {
    const config = getTemplateConfig(templateId)
    
    return {
      '--template-primary': config.color_scheme.primary,
      '--template-secondary': config.color_scheme.secondary,
      '--template-accent': config.color_scheme.accent,
      '--template-background': config.color_scheme.background,
      '--template-surface': config.color_scheme.surface,
      '--template-text-primary': config.color_scheme.text_primary,
      '--template-text-secondary': config.color_scheme.text_secondary,
      '--template-border': config.color_scheme.border,
      '--template-heading-size': config.typography.heading_size,
      '--template-body-size': config.typography.body_size
    }
  }
}
