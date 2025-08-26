'use client'

import { User as SupabaseUser, TemplateId } from '@/lib/types/supabase-types'
import { LinkCategory } from '@/lib/domain/entities'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { UserAppearanceSettings } from '@/lib/types/supabase-types'
import { DeveloperDarkTemplate } from '@/components/templates/developer-dark-template'
import { MinimalistLightTemplate } from '@/components/templates/minimalist-light-template'
import { GitHubFocusTemplate } from '@/components/templates/github-focus-template'
import { GTAViceCityTemplate } from '@/components/templates/gta-vice-city-template'
import { CyberpunkNeonTemplate } from '@/components/templates/cyberpunk-neon-template'
import { SunsetGradientTemplate } from '@/components/templates/sunset-gradient-template'

interface TemplateRendererProps {
  user: SupabaseUser
  links: Record<LinkCategory, UserLinkWithPreview[]>
  templateId?: TemplateId
  appearanceSettings?: UserAppearanceSettings | null
  categoryOrder?: LinkCategory[]
  isPreview?: boolean
}

export function TemplateRenderer({
  user,
  links,
  templateId = 'developer-dark',
  appearanceSettings,
  categoryOrder,
  isPreview = false
}: TemplateRendererProps) {
  // Add console logging to help debug which theme is being rendered
  console.log('🔍 Template Renderer - Template ID:', templateId);
  console.log('🔍 Template Renderer - User ID:', user.id);
  console.log('🔍 Template Renderer - User Theme ID:', user.theme_id);
  console.log('🔍 Template Renderer - Is Preview:', isPreview);
  
  // If no template ID provided, try to use the user's theme_id
  const effectiveTemplateId = templateId || user.theme_id || 'developer-dark';
  console.log('🔍 Template Renderer - Effective Template ID:', effectiveTemplateId);
  
  // Render the appropriate template based on templateId
  switch (effectiveTemplateId) {
    case 'minimalist-light':
      return (
        <MinimalistLightTemplate
          user={user}
          links={links}
          appearanceSettings={appearanceSettings}
          categoryOrder={categoryOrder}
          isPreview={isPreview}
        />
      )
    case 'github-focus':
      return (
        <GitHubFocusTemplate
          user={user}
          links={links}
          appearanceSettings={appearanceSettings}
          categoryOrder={categoryOrder}
          isPreview={isPreview}
        />
      )
    case 'gta-vice-city':
      return (
        <GTAViceCityTemplate
          user={user}
          links={links}
          appearanceSettings={appearanceSettings}
          categoryOrder={categoryOrder}
          isPreview={isPreview}
        />
      )
    case 'cyberpunk-neon':
      return (
        <CyberpunkNeonTemplate
          user={user}
          links={links}
          appearanceSettings={appearanceSettings}
          categoryOrder={categoryOrder}
          isPreview={isPreview}
        />
      )
    case 'sunset-gradient':
      return (
        <SunsetGradientTemplate
          user={user}
          links={links}
          appearanceSettings={appearanceSettings}
          categoryOrder={categoryOrder}
          isPreview={isPreview}
        />
      )
    case 'developer-dark':
    default:
      return (
        <DeveloperDarkTemplate
          user={user}
          links={links}
          appearanceSettings={appearanceSettings}
          categoryOrder={categoryOrder}
          isPreview={isPreview}
        />
      )
  }
}