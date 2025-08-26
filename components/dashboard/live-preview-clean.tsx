'use client'

import { useUserLinks, useCategoryOrder, useUserAppearance } from '@/lib/hooks/use-dashboard-queries'
import { useAuthStore } from '@/stores/auth-store'
import { TemplateRenderer } from '@/components/templates/template-renderer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'

interface LivePreviewProps {
  profileData?: any
}

export function LivePreview({ profileData }: LivePreviewProps) {
  const { user } = useAuthStore()

  // Use clean TanStack Query hooks
  const {
    data: links = {},
    isLoading: linksLoading,
    error: linksError
  } = useUserLinks(user?.id || '')

  const {
    data: categoryOrder = [],
    isLoading: categoryOrderLoading
  } = useCategoryOrder(user?.id || '')

  const {
    data: appearanceSettings,
    isLoading: appearanceLoading
  } = useUserAppearance(user?.id || '')

  // Loading and error states
  const isLoading = linksLoading || categoryOrderLoading || appearanceLoading
  const hasLinks = Object.values(links).some(categoryLinks => 
    Array.isArray(categoryLinks) && categoryLinks.length > 0
  )

  if (linksError) {
    return <ErrorState message="Failed to load profile data" />
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!hasLinks) {
    return <EmptyState message="No links found. Add some links to see your profile preview!" />
  }

  // Use profileData if available, otherwise use user data
  const previewUser = profileData || user

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
        <p className="text-sm text-gray-600">
          See how your profile will look to visitors
        </p>
      </div>
      
      <div className="h-[calc(100%-80px)] overflow-auto">
        <TemplateRenderer
          user={previewUser}
          links={links}
          appearanceSettings={appearanceSettings}
          categoryOrder={categoryOrder}
          isPreview={true}
        />
      </div>
    </div>
  )
}

