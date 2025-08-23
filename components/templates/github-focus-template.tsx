'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User, UserAppearanceSettings } from '@/lib/supabase'
import { UserLink, LinkCategory, LINK_CATEGORIES } from '@/lib/services/link-service'
import { ApiLinkService } from '@/lib/services/api-link-service'
import { CategoryOrderService } from '@/lib/services/category-order-service'
import { Button } from '@/components/ui/button'
import { RichLinkPreview } from '@/components/rich-preview/rich-link-preview'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { SocialMediaSection } from '@/components/social-media/social-media-section'
import { getFontFamilyWithFallbacks, loadGoogleFont } from '@/lib/utils/font-loader'
import { getSectionStyles, getSectionTypographyStyle } from '@/lib/utils/section-styling'
import { 
  MapPin, 
  Building, 
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Globe,
  BookOpen,
  Award,
  Share2,
  Copy,
  Check,
  GitFork,
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryIconService, CategoryIconConfig } from '@/lib/services/category-icon-service'
import { CategoryIconPreview } from '@/components/category-icons/category-icon-preview'

interface GitHubFocusTemplateProps {
  user: User
  links: Record<LinkCategory, UserLinkWithPreview[]>
  appearanceSettings?: UserAppearanceSettings | null
  categoryOrder?: LinkCategory[]
}

// Icon mapping for different link types
const getIconForType = (iconType: string) => {
  switch (iconType) {
    case 'github': return Github
    case 'linkedin': return Linkedin
    case 'twitter': return Twitter
    case 'email': return Mail
    case 'website': return Globe
    default: return ExternalLink
  }
}

// Category icon mapping
const getCategoryIcon = (category: LinkCategory, customIcons: Record<LinkCategory, CategoryIconConfig>) => {
  // Check if user has custom icon for this category
  const customIcon = customIcons[category]
  if (customIcon) {
    return () => <CategoryIconPreview config={customIcon} size={16} />
  }

  // Fallback to default icon
  const config = LINK_CATEGORIES[category]
  switch (config?.icon) {
    case 'Github': return Github
    case 'BookOpen': return BookOpen
    case 'Award': return Award
    case 'Mail': return Mail
    default: return ExternalLink
  }
}

export function GitHubFocusTemplate({ user, links, appearanceSettings, categoryOrder: propCategoryOrder }: GitHubFocusTemplateProps) {
  const [copied, setCopied] = useState(false)
  const [categoryIcons, setCategoryIcons] = useState<Record<LinkCategory, CategoryIconConfig>>({} as Record<LinkCategory, CategoryIconConfig>)
  const [categoryOrder, setCategoryOrder] = useState<LinkCategory[]>(propCategoryOrder || CategoryOrderService.DEFAULT_ORDER)

  // Load fonts when appearance settings change
  useEffect(() => {
    if (!appearanceSettings) return

    const fontsToLoad = []
    if (appearanceSettings.primary_font && appearanceSettings.primary_font !== 'Sharp Grotesk') {
      fontsToLoad.push(appearanceSettings.primary_font)
    }
    if (appearanceSettings.secondary_font && appearanceSettings.secondary_font !== 'Sharp Grotesk' && appearanceSettings.secondary_font !== appearanceSettings.primary_font) {
      fontsToLoad.push(appearanceSettings.secondary_font)
    }

    if (fontsToLoad.length > 0) {
      fontsToLoad.forEach(font => {
        loadGoogleFont(font).catch(error => {
          console.error(`Failed to load font ${font}:`, error)
        })
      })
    }
  }, [appearanceSettings?.primary_font, appearanceSettings?.secondary_font])

  // Load category icons and order
  useEffect(() => {
    if (user?.id) {
      CategoryIconService.getAllCategoryIcons(user.id)
        .then(icons => setCategoryIcons(icons))
        .catch(error => console.error('Error loading category icons:', error))

      // Only load category order if not provided as prop
      if (!propCategoryOrder) {
        CategoryOrderService.getCategoryOrder(user.id)
          .then(order => setCategoryOrder(order))
          .catch(error => console.error('Error loading category order:', error))
      }
    }
  }, [user?.id, propCategoryOrder])

  // Update category order when prop changes
  useEffect(() => {
    if (propCategoryOrder) {
      setCategoryOrder(propCategoryOrder)
    }
  }, [propCategoryOrder])

  // Generate background style from appearance settings
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!appearanceSettings) {
      return { backgroundColor: '#0d1117' } // Default GitHub dark background
    }

    const style: React.CSSProperties = {}

    if (appearanceSettings.background_type === 'gradient' && appearanceSettings.background_gradient) {
      const { type, colors, direction } = appearanceSettings.background_gradient
      if (type === 'linear') {
        style.background = `linear-gradient(${direction || '45deg'}, ${colors.join(', ')})`
      } else if (type === 'radial') {
        style.background = `radial-gradient(${appearanceSettings.background_gradient.position || 'center'}, ${colors.join(', ')})`
      }
    } else if (appearanceSettings.background_type === 'image') {
      if (appearanceSettings.background_image_url) {
        // Image is set, use it
        style.backgroundImage = `url(${appearanceSettings.background_image_url})`
        style.backgroundPosition = appearanceSettings.background_image_position || 'center'
        style.backgroundSize = appearanceSettings.background_image_size || 'cover'
        style.backgroundRepeat = 'no-repeat'
        // Set a fallback background color in case image fails to load
        style.backgroundColor = appearanceSettings.background_color || '#0d1117'
      } else {
        // No image set yet, show a neutral background instead of falling back to solid color
        style.backgroundColor = '#0d1117' // Use default GitHub dark background
      }
    } else {
      // Default to solid color
      style.backgroundColor = appearanceSettings.background_color || '#0d1117'
    }

    return style
  }

  // Generate typography styles from appearance settings
  const getTypographyStyle = (type: 'heading' | 'subheading' | 'body' | 'accent' | 'link', isHover = false): React.CSSProperties => {
    if (!appearanceSettings) {
      // Default styles for GitHub theme
      const defaults = {
        heading: { fontFamily: 'Sharp Grotesk', fontSize: '32px', color: '#f0f6fc', lineHeight: '38px' },
        subheading: { fontFamily: 'Sharp Grotesk', fontSize: '18px', color: '#58a6ff', lineHeight: '24px' },
        body: { fontFamily: 'Sharp Grotesk', fontSize: '16px', color: '#8b949e', lineHeight: '24px' },
        accent: { fontFamily: 'Sharp Grotesk', fontSize: '14px', color: '#8b949e', lineHeight: '20px' },
        link: { fontFamily: 'Sharp Grotesk', fontSize: '16px', color: '#58a6ff', lineHeight: '24px' }
      }
      return defaults[type]
    }

    const style: React.CSSProperties = {}

    // Apply font family
    if (type === 'heading' || type === 'subheading') {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.primary_font || 'Sharp Grotesk')
    } else {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.secondary_font || 'Sharp Grotesk')
    }

    // Apply font size
    switch (type) {
      case 'heading':
        style.fontSize = `${appearanceSettings.font_size_heading || 32}px`
        style.lineHeight = `${appearanceSettings.line_height_heading || 1.2}`
        break
      case 'subheading':
        style.fontSize = `${appearanceSettings.font_size_subheading || 18}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.5}`
        break
      case 'body':
      case 'accent':
      case 'link':
        style.fontSize = `${appearanceSettings.font_size_base || 16}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.5}`
        break
    }

    // Apply colors
    switch (type) {
      case 'heading':
        style.color = appearanceSettings.text_primary_color || '#f0f6fc'
        break
      case 'subheading':
        style.color = appearanceSettings.text_accent_color || '#58a6ff'
        break
      case 'body':
      case 'accent':
        style.color = appearanceSettings.text_secondary_color || '#8b949e'
        break
      case 'link':
        style.color = isHover
          ? (appearanceSettings.link_hover_color || '#79c0ff')
          : (appearanceSettings.link_color || '#58a6ff')
        break
    }

    return style
  }

  const handleLinkClick = async (link: UserLinkWithPreview) => {
    // Track the click for analytics
    await ApiLinkService.trackLinkClick(link.id)

    // Open the link
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  const handleRefreshPreview = async (linkId: string) => {
    try {
      await ApiLinkService.refreshLinkPreview(user.id, linkId)
      // Optionally trigger a re-fetch of the links data
      window.location.reload() // Simple approach for now
    } catch (error) {
      console.error('Failed to refresh preview:', error)
    }
  }

  const handleShare = async () => {
    const profileUrl = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.full_name || user.github_username}'s Profile`,
          text: user.bio || `Check out ${user.full_name || user.github_username}'s developer profile`,
          url: profileUrl
        })
      } catch (error) {
        // Fallback to copy
        copyToClipboard(profileUrl)
      }
    } else {
      copyToClipboard(profileUrl)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Profile URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  // Get active links for display
  const hasLinks = Object.values(links).some(categoryLinks => categoryLinks.length > 0)

  return (
    <div className="min-h-screen" style={getBackgroundStyle()}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Profile Header - GitHub Style */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Side - Avatar and Basic Info */}
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={`${user.full_name || user.github_username}'s avatar`}
                  width={80}
                  height={80}
                  className="w-[80px] h-[80px] rounded-full object-cover border border-[#30363d]"
                />
              ) : (
                <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#238636] to-[#2ea043] flex items-center justify-center">
                  <span className="text-[32px] font-bold text-white font-sharp-grotesk">
                    {(user.full_name || user.github_username || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side - Profile Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.72px] font-sharp-grotesk text-[#f0f6fc] mb-1">
                    {user.full_name || user.github_username || 'Developer'}
                  </h1>
                  
                  {user.github_username && (
                    <p className="text-[16px] font-normal leading-[22px] text-[#8b949e] font-sharp-grotesk mb-3">
                      @{user.github_username}
                    </p>
                  )}

                  {user.profile_title && (
                    <p className="text-[14px] font-medium leading-[20px] text-[#2ea043] font-sharp-grotesk mb-3">
                      {user.profile_title}
                    </p>
                  )}

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-[14px] font-normal leading-[20px] text-[#f0f6fc] font-sharp-grotesk mb-4">
                      {user.bio}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#8b949e] font-sharp-grotesk">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>{user.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <Button
                  onClick={handleShare}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 px-4 py-2 rounded-[6px] font-medium text-[14px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* All Categories Section - Respecting Category Order */}
        {hasLinks ? (
          <div className="space-y-4">
            {categoryOrder.map((category) => {
              const categoryLinks = links[category] || []
              if (categoryLinks.length === 0) return null

              // Handle social media category specially
              if (category === 'social') {
                return (
                  <SocialMediaSection
                    key={category}
                    socialLinks={categoryLinks}
                    onLinkClick={handleLinkClick}
                    variant="github"
                    appearanceSettings={appearanceSettings}
                  />
                )
              }

              const categoryConfig = LINK_CATEGORIES[category]
              const CategoryIcon = getCategoryIcon(category, categoryIcons)
              
              return (
                <div 
                  key={category} 
                  className="bg-[#161b22] border border-[#30363d] rounded-[12px] overflow-hidden"
                >
                  
                  {/* Category Header */}
                  <div className="bg-[#21262d] border-b border-[#30363d] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon 
                        className="w-4 h-4" 
                        style={{ color: '#2ea043' }}
                      />
                      <h2 className="text-[14px] font-semibold leading-[18px] font-sharp-grotesk text-[#f0f6fc]">
                        {categoryConfig?.label || category}
                      </h2>
                      <span className="text-[12px] text-[#8b949e] font-sharp-grotesk">
                        {categoryLinks.length}
                      </span>
                    </div>
                  </div>

                  {/* Rich Link Previews */}
                  <div className="space-y-2">
                    {categoryLinks.map((link) => (
                      <div key={link.id} className="px-4 py-2">
                        <RichLinkPreview
                          link={link}
                          onClick={() => handleLinkClick(link)}
                          onRefresh={handleRefreshPreview}
                          variant="compact"
                          showRefreshButton={true}
                          className="bg-transparent border-0 shadow-none hover:bg-[#21262d] rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] p-8 text-center">
            <h2 className="text-[16px] font-semibold leading-[20px] font-sharp-grotesk text-[#f0f6fc] mb-2">
              No repositories yet
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#8b949e] font-sharp-grotesk">
              This developer hasn't added any links to their profile yet.
            </p>
          </div>
        )}

        {/* Powered by Link4Coders Footer */}
        {!user.is_premium && (
          <div className="mt-8 text-center">
            <div className="bg-[#161b22] border border-[#30363d] rounded-[8px] p-3 inline-block">
              <p className="text-[12px] font-normal text-[#8b949e] font-sharp-grotesk">
                Powered by{' '}
                <a 
                  href="https://link4coders.com?ref=profile" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#58a6ff] hover:text-[#79c0ff] transition-colors font-medium"
                  onClick={() => {
                    // Track branding click for analytics
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'branding_click', {
                        event_category: 'engagement',
                        event_label: 'powered_by_footer'
                      })
                    }
                  }}
                >
                  Link4Coders
                </a>
                {' '}⭐
              </p>
              <p className="text-[10px] text-[#8b949e] font-sharp-grotesk mt-1">
                Create your developer profile for free
              </p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
