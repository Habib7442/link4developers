'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User as SupabaseUser, UserAppearanceSettings as SupabaseUserAppearanceSettings } from '@/lib/types/supabase-types'
import { LinkCategory } from '@/lib/domain/entities'
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
  Star,
  User,
  Link
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryIconService, CategoryIconConfig } from '@/lib/services/category-icon-service'
import { CategoryIconPreview } from '@/components/category-icons/category-icon-preview'

interface GitHubFocusTemplateProps {
  user: SupabaseUser
  links: Record<LinkCategory, UserLinkWithPreview[]>
  appearanceSettings?: SupabaseUserAppearanceSettings | null
  categoryOrder?: LinkCategory[]
  isPreview?: boolean
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

  // Fallback to default icon - map categories to icon components
  switch (category) {
    case 'projects': return Github
    case 'blogs': return BookOpen
    case 'achievements': return Award
    case 'contact': return Mail
    case 'personal': return User
    case 'social': return Share2
    case 'custom': return Link
    default: return ExternalLink
  }
}

export function GitHubFocusTemplate({ user, links, appearanceSettings, categoryOrder: propCategoryOrder, isPreview = false }: GitHubFocusTemplateProps) {
  const [copied, setCopied] = useState(false)
  const [categoryIcons, setCategoryIcons] = useState<Record<LinkCategory, CategoryIconConfig>>({} as Record<LinkCategory, CategoryIconConfig>)
  const [categoryOrder, setCategoryOrder] = useState<LinkCategory[]>(propCategoryOrder || ['personal', 'projects', 'blogs', 'achievements', 'contact', 'custom', 'social'])

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
        // For now, use default order since we're not using the old service
        setCategoryOrder(['personal', 'projects', 'blogs', 'achievements', 'contact', 'custom', 'social'])
      } else {
        setCategoryOrder(propCategoryOrder)
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
      return { backgroundColor: '#0D1117' } // Default GitHub dark mode base
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
        style.backgroundColor = appearanceSettings.background_color || '#0D1117'
      } else {
        // No image set yet, show a neutral background instead of falling back to solid color
        style.backgroundColor = '#0D1117' // Use default GitHub dark mode base
      }
    } else {
      // Default to solid color
      style.backgroundColor = appearanceSettings.background_color || '#0D1117'
    }

    return style
  }

  // Generate typography styles from appearance settings
  const getTypographyStyle = (type: 'heading' | 'subheading' | 'body' | 'accent' | 'link', isHover = false): React.CSSProperties => {
    if (!appearanceSettings) {
      // Default styles for GitHub Focus theme - EXACT specifications
      const defaults = {
        heading: { fontFamily: 'Inter, sans-serif', fontSize: '32px', color: '#F0F6FC', lineHeight: '1.2' }, // White headings
        subheading: { fontFamily: 'Inter, sans-serif', fontSize: '18px', color: '#58A6FF', lineHeight: '1.4' }, // Blue subheadings
        body: { fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#C9D1D9', lineHeight: '1.6' }, // Light gray body
        accent: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#8B949E', lineHeight: '1.4' }, // Muted gray
        link: { fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#58A6FF', lineHeight: '1.6' } // Blue links
      }
      return defaults[type]
    }

    const style: React.CSSProperties = {}

    // Apply font family - GitHub Focus uses Inter for most text
    if (type === 'heading' || type === 'subheading') {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.primary_font || 'Inter')
    } else {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.secondary_font || 'Inter')
    }

    // Apply font size
    switch (type) {
      case 'heading':
        style.fontSize = `${appearanceSettings.font_size_heading || 32}px`
        style.lineHeight = `${appearanceSettings.line_height_heading || 1.2}`
        break
      case 'subheading':
        style.fontSize = `${appearanceSettings.font_size_subheading || 18}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.4}`
        break
      case 'body':
      case 'accent':
      case 'link':
        style.fontSize = `${appearanceSettings.font_size_base || 16}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.6}`
        break
    }

    // Apply colors - EXACT GitHub Focus specifications
    switch (type) {
      case 'heading':
        style.color = appearanceSettings.text_primary_color || '#F0F6FC' // White
        break
      case 'subheading':
        style.color = appearanceSettings.text_accent_color || '#58A6FF' // Blue
        break
      case 'body':
        style.color = appearanceSettings.text_secondary_color || '#C9D1D9' // Light gray
        break
      case 'accent':
        style.color = appearanceSettings.text_secondary_color || '#8B949E' // Muted gray
        break
      case 'link':
        style.color = isHover
          ? (appearanceSettings.link_hover_color || '#1F6FEB') // Brighter blue on hover
          : (appearanceSettings.link_color || '#58A6FF') // Blue
        break
    }

    return style
  }

  const handleLinkClick = async (link: UserLinkWithPreview) => {
    // For now, just open the link (analytics will be handled by the new clean architecture)
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  const handleRefreshPreview = async (linkId: string) => {
    try {
      // For now, just reload the page (preview refresh will be handled by the new clean architecture)
      window.location.reload()
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
        
        {/* Profile Header - GitHub Focus Style */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-[12px] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Side - Avatar and Basic Info */}
            <div className="flex-shrink-0">
              {user.avatar_url && user.avatar_url.trim() !== '' ? (
                <Image
                  src={user.avatar_url}
                  alt={`${user.full_name || user.github_username}'s avatar`}
                  width={80}
                  height={80}
                  className="w-[80px] h-[80px] rounded-full object-cover border border-[#30363D]"
                />
              ) : (
                <div className="w-[80px] h-[80px] rounded-full bg-[#238636] flex items-center justify-center border border-[#30363D]">
                  <span className="text-[32px] font-bold text-white font-inter">
                    {(user.full_name || user.github_username || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side - Profile Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-[24px] font-semibold leading-[30px] tracking-[-0.72px] font-inter text-[#F0F6FC] mb-1"
                       style={getTypographyStyle('heading')}>
                    {user.full_name || user.github_username || 'Developer'}
                  </h1>
                  
                  {user.github_username && (
                    <p className="text-[16px] font-normal leading-[22px] text-[#8B949E] font-inter mb-3"
                       style={getTypographyStyle('accent')}>
                      @{user.github_username}
                    </p>
                  )}

                  {user.profile_title && (
                    <p className="text-[14px] font-medium leading-[20px] text-[#238636] font-inter mb-3"
                       style={getTypographyStyle('subheading')}>
                      {user.profile_title}
                    </p>
                  )}

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-[14px] font-normal leading-[20px] text-[#C9D1D9] font-inter mb-4"
                       style={getTypographyStyle('body')}>
                      {user.bio}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#8B949E] font-inter"
                       style={getTypographyStyle('accent')}>
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#8B949E]" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-[#8B949E]" />
                        <span>{user.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#8B949E]" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Share Button - GitHub Focus Style */}
                <Button
                  onClick={handleShare}
                  className="bg-[#238636] hover:bg-[#2EA043] text-white border-0 px-4 py-2 rounded-[6px] font-medium text-[14px] font-inter transition-colors"
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
                    getTypographyStyle={getTypographyStyle}
                  />
                )
              }

              const CategoryIcon = getCategoryIcon(category, categoryIcons)
              
              return (
                <div 
                  key={category} 
                  className="bg-[#161B22] border border-[#30363D] rounded-[12px] overflow-hidden"
                >
                  
                  {/* Category Header */}
                  <div className="bg-[#1C2128] border-b border-[#30363D] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-[#238636]/20 border border-[#238636]/30">
                        <CategoryIcon 
                          className="w-4 h-4" 
                          style={{ color: '#238636' }}
                        />
                      </div>
                      <h2 className="text-[14px] font-semibold leading-[18px] font-inter text-[#F0F6FC]"
                          style={getTypographyStyle('subheading')}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h2>
                      <span className="text-[12px] text-[#8B949E] font-inter ml-auto"
                           style={getTypographyStyle('accent')}>
                        {categoryLinks.length} {categoryLinks.length === 1 ? 'link' : 'links'}
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
                          className="bg-transparent border-0 shadow-none hover:bg-[#1C2128] rounded-lg transition-colors"
                          isPreviewMode={isPreview} // Pass explicit preview mode prop
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#161B22] border border-[#30363D] rounded-[12px] p-8 text-center">
            <h2 className="text-[16px] font-semibold leading-[20px] font-inter text-[#F0F6FC] mb-2"
                 style={getTypographyStyle('heading')}>
              No repositories yet
            </h2>
            <p className="text-[14px] font-normal leading-[20px] text-[#8B949E] font-inter"
               style={getTypographyStyle('body')}>
              This developer hasn&apos;t added any links to their profile yet.
            </p>
          </div>
        )}

        {/* Powered by Link4Coders Footer */}
        {!user.is_premium && !isPreview && (
          <div className="mt-8 text-center">
            <div className="bg-[#161B22] border border-[#30363D] rounded-[8px] p-3 inline-block">
              <p className="text-[12px] font-normal text-[#8B949E] font-inter"
                 style={getTypographyStyle('accent')}>
                Powered by{' '}
                <a 
                  href="https://link4coders.in?ref=profile" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#58A6FF] hover:text-[#1F6FEB] transition-colors font-medium"
                  style={getTypographyStyle('link')}
                  onClick={() => {
                    // Track branding click for analytics
                    if (typeof window !== 'undefined' && (window as any).gtag) {
                      (window as any).gtag('event', 'branding_click', {
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
              <p className="text-[10px] text-[#8B949E] font-inter mt-1"
                 style={getTypographyStyle('accent')}>
                Create your developer profile for free
              </p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
