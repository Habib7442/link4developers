'use client'

import { memo } from 'react'
import { User as SupabaseUser, UserAppearanceSettings as SupabaseUserAppearanceSettings, TemplateId } from '@/lib/types/supabase-types'
import { UserLink, LinkCategory } from '@/lib/services/link-service'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { getTemplateConfig } from '@/lib/templates/template-config'

// Import all template components
import { DeveloperDarkTemplate } from './developer-dark-template'
import { MinimalistLightTemplate } from './minimalist-light-template'
import { GitHubFocusTemplate } from './github-focus-template'
import { GTAViceCityTemplate } from './gta-vice-city-template'
import { CyberpunkNeonTemplate } from './cyberpunk-neon-template'
import { SunsetGradientTemplate } from './sunset-gradient-template'

interface TemplateRendererProps {
  user: SupabaseUser
  links: Record<LinkCategory, UserLinkWithPreview[]>
  templateId?: TemplateId
  appearanceSettings?: SupabaseUserAppearanceSettings | null
  categoryOrder?: LinkCategory[]
  isPreview?: boolean
}

const TemplateRendererComponent = ({ user, links, templateId, appearanceSettings, categoryOrder, isPreview = false }: TemplateRendererProps) => {

  // Use user's theme_id if no templateId is provided
  const currentTemplateId = templateId || (user.theme_id as TemplateId) || 'developer-dark'

  // Validate template ID and fallback to default if invalid
  const templateConfig = getTemplateConfig(currentTemplateId)

  // Render the appropriate template component with proper bottom padding for mobile
  switch (currentTemplateId) {
    case 'minimalist-light':
      return <div className="pb-4"><MinimalistLightTemplate user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} isPreview={isPreview} /></div>

    case 'github-focus':
      return <div className="pb-4"><GitHubFocusTemplate user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} isPreview={isPreview} /></div>

    case 'gta-vice-city':
      return <div className="pb-4"><GTAViceCityTemplate user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} isPreview={isPreview} /></div>

    case 'cyberpunk-neon':
      return <div className="pb-4"><CyberpunkNeonTemplate user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} isPreview={isPreview} /></div>

    case 'sunset-gradient':
      return <div className="pb-4"><SunsetGradientTemplate user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} isPreview={isPreview} /></div>

    case 'developer-dark':
    default:
      return <div className="pb-4"><DeveloperDarkTemplate user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} isPreview={isPreview} /></div>
  }
}

// Memoize the component to prevent unnecessary re-renders
export const TemplateRenderer = memo(TemplateRendererComponent, (prevProps, nextProps) => {
  // Custom comparison to avoid re-renders when appearance settings object reference changes
  // but the actual content is the same
  return (
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.templateId === nextProps.templateId &&
    JSON.stringify(prevProps.links) === JSON.stringify(nextProps.links) &&
    JSON.stringify(prevProps.appearanceSettings) === JSON.stringify(nextProps.appearanceSettings) &&
    JSON.stringify(prevProps.categoryOrder) === JSON.stringify(nextProps.categoryOrder) &&
    prevProps.isPreview === nextProps.isPreview
  )
})