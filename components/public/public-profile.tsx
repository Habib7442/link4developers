'use client'

import { useSearchParams } from 'next/navigation'
import { User, TemplateId, UserAppearanceSettings } from '@/lib/supabase'
import { UserLink, LinkCategory } from '@/lib/services/link-service'
import { TemplateRenderer } from '@/components/templates/template-renderer'
import { isValidTemplateId } from '@/lib/templates/template-config'

interface PublicProfileProps {
  user: User
  links: Record<LinkCategory, UserLink[]>
  appearanceSettings?: UserAppearanceSettings | null
  categoryOrder?: LinkCategory[]
}

export function PublicProfile({ user, links, appearanceSettings, categoryOrder }: PublicProfileProps) {
  const searchParams = useSearchParams()

  // Check for preview parameter to override template
  const previewTemplate = searchParams.get('preview')
  let templateId: TemplateId | undefined

  if (previewTemplate && isValidTemplateId(previewTemplate)) {
    templateId = previewTemplate as TemplateId
  }

  // Add debugging log to check user data and theme
  console.log('🔍 Public Profile - User:', { 
    id: user.id, 
    theme_id: user.theme_id, 
    username: user.profile_slug || user.github_username 
  })
  console.log('🔍 Public Profile - Template ID:', templateId || 'Using user.theme_id')
  console.log('🔍 Public Profile - Appearance Settings:', !!appearanceSettings)

  // Use the TemplateRenderer to dynamically render the appropriate template
  return (
    <TemplateRenderer
      user={user}
      links={links}
      templateId={templateId || user.theme_id}
      appearanceSettings={appearanceSettings}
      categoryOrder={categoryOrder}
    />
  )
}