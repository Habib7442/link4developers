'use client'

import { memo } from 'react'
import { User, TemplateId, UserAppearanceSettings } from '@/lib/supabase'
import { UserLink, LinkCategory } from '@/lib/services/link-service'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { getTemplateConfig } from '@/lib/templates/template-config'

// Import all template components
import { DeveloperDarkTemplate } from './developer-dark-template'
import { MinimalistLightTemplate } from './minimalist-light-template'
import { GitHubFocusTemplate } from './github-focus-template'

interface TemplateRendererProps {
  user: User
  links: Record<LinkCategory, UserLinkWithPreview[]>
  templateId?: TemplateId
  appearanceSettings?: UserAppearanceSettings | null
  categoryOrder?: LinkCategory[]
}

const TemplateRendererComponent = ({ user, links, templateId, appearanceSettings, categoryOrder }: TemplateRendererProps) => {

  // Use user's theme_id if no templateId is provided
  const currentTemplateId = templateId || (user.theme_id as TemplateId) || 'developer-dark'

  // Validate template ID and fallback to default if invalid
  const templateConfig = getTemplateConfig(currentTemplateId)

  // Render the appropriate template component
  switch (currentTemplateId) {
    case 'minimalist-light':
      return <MinimalistLightTemplate user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} />

    case 'github-focus':
      return <GitHubFocusTemplate user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} />

    case 'developer-dark':
    default:
      return <DeveloperDarkTemplate user={user} links={links} appearanceSettings={appearanceSettings} categoryOrder={categoryOrder} />
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
    JSON.stringify(prevProps.categoryOrder) === JSON.stringify(nextProps.categoryOrder)
  )
})
