'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useQueryClient } from '@tanstack/react-query'
import { TemplateRenderer } from '@/components/templates/template-renderer'
import { User as SupabaseUser, UserAppearanceSettings as SupabaseUserAppearanceSettings, TemplateId } from '@/lib/types/supabase-types'
import { useAppearanceSettings } from '@/contexts/appearance-context'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { UserLinkWithPreview, isGitHubUrl, isBlogUrl } from '@/lib/types/rich-preview'
import { useUserLinks, useCategoryOrder, useUserAppearance, useUserTheme, useUserProfile } from '@/lib/hooks/use-dashboard-queries'
import { LinkCategory } from '@/lib/services/link-service'

interface LivePreviewProps {
  profileData?: Partial<SupabaseUser>
  refreshTrigger?: number
}

export function LivePreview({ profileData, refreshTrigger }: LivePreviewProps) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const contextAppearanceSettings = useAppearanceSettings()
  const [scale, setScale] = useState(0.6)

  // Use TanStack Query hooks for data fetching
  const { 
    data: links = {} as Record<LinkCategory, UserLinkWithPreview[]>, 
    isLoading: linksLoading, 
    error: linksError 
  } = useUserLinks(user?.id || '', true) // Pass true to indicate this is for preview

  const { 
    data: categoryOrder = [], 
    isLoading: categoryOrderLoading 
  } = useCategoryOrder(user?.id || '')

  const { 
    data: fallbackAppearanceSettings, 
    isLoading: appearanceLoading 
  } = useUserAppearance(user?.id || '')

  const { 
    data: userTheme,
    isLoading: themeLoading
  } = useUserTheme(user?.id || '')

  // Effect to handle refresh trigger
  useEffect(() => {
    if (refreshTrigger) {
      handleManualRefresh()
    }
  }, [refreshTrigger])

  // Merge current user data with any profile updates
  const previewUser: SupabaseUser = {
    ...user,
    ...profileData
  } as SupabaseUser

  // Merge appearance settings from context and fallback
  const finalAppearanceSettings = contextAppearanceSettings || fallbackAppearanceSettings

  // Manual refresh function
  const handleManualRefresh = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['links', user.id] })
      queryClient.invalidateQueries({ queryKey: ['categoryOrder', user.id] })
      queryClient.invalidateQueries({ queryKey: ['appearance', user.id] })
      queryClient.invalidateQueries({ queryKey: ['userTheme', user.id] })
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
      // Add feedback that refresh was triggered
      toast.success('Profile data refreshed')
    }
  }

  // Loading states
  const isLoading = linksLoading || categoryOrderLoading || appearanceLoading || themeLoading
  const hasLinks = Object.values(links).some(categoryLinks => Array.isArray(categoryLinks) && categoryLinks.length > 0)

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-[#18181a]/80 backdrop-blur-sm z-10">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#54E0FF]"></div>
      <p className="text-[#54E0FF] text-base font-medium">Loading profile data...</p>
    </div>
  )

  // Error state component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
      <div className="text-red-500 text-6xl">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-800">Failed to load profile</h3>
      <p className="text-gray-600 text-sm max-w-md">
        There was an error loading your profile data. Please try refreshing.
      </p>
      <Button onClick={handleManualRefresh} variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>
  )

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
      <div className="text-gray-400 text-6xl">📝</div>
      <h3 className="text-lg font-semibold text-gray-800">No Profile Data</h3>
      <p className="text-gray-600 text-sm max-w-md">
        Your profile doesn&apos;t have any links yet. Add some links to see them here.
      </p>
    </div>
  )

  // Handle opening full preview in new tab
  const handleOpenFullPreview = () => {
    if (user?.profile_slug) {
      window.open(`/${user.profile_slug}`, '_blank')
    } else if (user?.github_username) {
      window.open(`/${user.github_username}`, '_blank')
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload()
  }

  // Return the component with loading overlay when loading
  if (isLoading) {
    return (
      <div className="h-full flex flex-col relative">
        <LoadingSpinner />
        {/* Show basic container while loading */}
        <div className="p-4 border-b border-[#33373b] flex-shrink-0"></div>
        <div className="flex-1 overflow-hidden bg-[#18181a] relative"></div>
        <div className="p-4 border-t border-[#33373b] flex-shrink-0 bg-[#1e1e20] rounded-b-[20px]"></div>
      </div>
    )
  }

  // Show error state if there's an error
  if (linksError) {
    return <ErrorState />
  }

  // Don't render preview until we have complete user data
  if (!user || !previewUser) {
    return <EmptyState />
  }

  // Don't render if we don't have links data yet
  if (!hasLinks) {
    return <EmptyState />
  }

  // Show a message if we're still loading appearance settings
  if (!fallbackAppearanceSettings && !contextAppearanceSettings) {
    return <LoadingSpinner />
  }

  return (
    <div className="h-full flex flex-col">

      {/* Preview Controls */}
      <div className="p-3 border-b border-[#33373b] flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              onClick={handleManualRefresh}
              size="sm"
              className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 px-2"
              title="Refresh all data including rich previews"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>

            <Button
              onClick={handleOpenFullPreview}
              size="sm"
              className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 px-2"
              disabled={!user?.profile_slug && !user?.github_username}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>

          {/* Scale Controls */}
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setScale(Math.max(0.4, scale - 0.1))}
              size="sm"
              className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 w-8 p-0 text-xs"
            >
              -
            </Button>
            <span className="text-[11px] text-[#7a7a83] font-sharp-grotesk min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              onClick={() => setScale(Math.min(1, scale + 0.1))}
              size="sm"
              className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 w-8 p-0 text-xs"
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden bg-[#18181a] relative">
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-200"
          style={{
            transform: `scale(${scale})`,
            width: `${100 / scale}%`,
            height: `${100 / scale}%`
          }}
        >
          <div className="w-full h-full overflow-y-auto custom-scrollbar pb-4">
            <TemplateRenderer
              user={previewUser}
              links={links as Record<LinkCategory, UserLinkWithPreview[]>}
              templateId={userTheme?.id as TemplateId}
              appearanceSettings={finalAppearanceSettings as SupabaseUserAppearanceSettings | null | undefined}
              categoryOrder={categoryOrder as LinkCategory[]}
              isPreview={true}
            />
          </div>
        </div>
      </div>

      {/* Preview Info - Improved spacing and styling with rounded bottom corners */}
      <div className="p-3 border-t border-[#33373b] flex-shrink-0 bg-[#1e1e20] rounded-b-[20px]">
        <p className="text-[11px] font-medium text-[#54E0FF] font-sharp-grotesk text-center truncate">
          {user?.profile_slug ? `link4coders.in/${user.profile_slug}` : 'Set up your profile URL to enable preview'}
        </p>
      </div>
    </div>
  )
}