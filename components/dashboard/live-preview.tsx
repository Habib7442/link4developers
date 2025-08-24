'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { LinkService, UserLink, LinkCategory } from '@/lib/services/link-service'
import { CategoryOrderService } from '@/lib/services/category-order-service'
import { TemplateRenderer } from '@/components/templates/template-renderer'
import { User, UserAppearanceSettings } from '@/lib/supabase'
import { AppearanceService } from '@/lib/services/appearance-service'
import { useAppearanceSettings } from '@/contexts/appearance-context'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LivePreviewProps {
  profileData?: Partial<User>
  refreshTrigger?: number
}

export function LivePreview({ profileData, refreshTrigger = 0 }: LivePreviewProps) {
  const { user } = useAuthStore()
  const contextAppearanceSettings = useAppearanceSettings()
  const [links, setLinks] = useState<Record<LinkCategory, UserLink[]>>({
    social: [],
    projects: [],
    professional: [],
    other: []
  })
  const [categoryOrder, setCategoryOrder] = useState<LinkCategory[]>([])
  const [fallbackAppearanceSettings, setFallbackAppearanceSettings] = useState<UserAppearanceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [linksLoaded, setLinksLoaded] = useState(false)
  const [scale, setScale] = useState(0.6)

  // Merge current user data with any profile updates
  const previewUser: User = {
    ...user,
    ...profileData
  } as User

  // Load user links and category order
  useEffect(() => {
    const loadLinksAndOrder = async () => {
      if (!user?.id) return

      try {
        setLoading(true)
        setLinksLoaded(false)

        // Load both links and category order in parallel
        const [userLinks, userCategoryOrder] = await Promise.all([
          LinkService.getUserLinks(user.id),
          CategoryOrderService.getCategoryOrder(user.id)
        ])

        setLinks(userLinks)
        setCategoryOrder(userCategoryOrder)
        setLinksLoaded(true)
      } catch (error) {
        console.error('Error loading links and category order for preview:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLinksAndOrder()
  }, [user?.id, refreshTrigger])

  // Load fallback appearance settings only when context settings are not available
  useEffect(() => {
    const loadFallbackSettings = async () => {
      if (!user?.id || contextAppearanceSettings) return

      try {
        const settings = await AppearanceService.getUserAppearanceSettings(user.id)
        setFallbackAppearanceSettings(settings)
      } catch (error) {
        // User doesn't have premium access or settings don't exist
        setFallbackAppearanceSettings(null)
      }
    }

    loadFallbackSettings()
  }, [user?.id, contextAppearanceSettings])

  // Use context appearance settings (which includes real-time preview updates) if available, otherwise fallback
  // Memoize to prevent unnecessary re-renders when object reference changes but content is the same
  const appearanceSettings = useMemo(() => {
    return contextAppearanceSettings || fallbackAppearanceSettings
  }, [contextAppearanceSettings, fallbackAppearanceSettings])

  // Handle opening full preview in new tab
  const handleOpenFullPreview = () => {
    if (!user?.profile_slug && !user?.github_username) {
      return
    }
    
    const username = user.profile_slug || user.github_username
    const previewUrl = `/${username}`
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload()
  }

  // Only show loading if we're actually loading links and haven't loaded them yet
  if (loading && !linksLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="w-6 h-6 text-[#54E0FF]" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[14px] text-[#7a7a83] font-sharp-grotesk">
            Please log in to see preview
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      
      {/* Preview Controls */}
      <div className="p-4 border-b border-[#33373b] flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              size="sm"
              className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 px-3"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            
            <Button
              onClick={handleOpenFullPreview}
              size="sm"
              className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 px-3"
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
              links={links}
              templateId={user?.theme_id}
              appearanceSettings={appearanceSettings}
              categoryOrder={categoryOrder}
              isPreview={true}
            />
          </div>
        </div>
      </div>

      {/* Preview Info - Improved spacing and styling with rounded bottom corners */}
      <div className="p-4 border-t border-[#33373b] flex-shrink-0 bg-[#1e1e20] rounded-b-[20px]">
        <p className="text-[11px] font-medium text-[#54E0FF] font-sharp-grotesk text-center">
          {user?.profile_slug ? `link4coders.com/${user.profile_slug}` : 'Set up your profile URL to enable preview'}
        </p>
      </div>
    </div>
  )
}
