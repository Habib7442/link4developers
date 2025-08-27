'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User as SupabaseUser, UserAppearanceSettings as SupabaseUserAppearanceSettings } from '@/lib/types/supabase-types'
import { LinkCategory } from '@/lib/domain/entities'
import { Button } from '@/components/ui/button'
import { RichLinkPreview } from '@/components/rich-preview/rich-link-preview'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { SocialMediaSection } from '@/components/social-media/social-media-section'
import { TechStackDisplay } from '@/components/dashboard/tech-stack-display'
import { getFontFamilyWithFallbacks, loadGoogleFont } from '@/lib/utils/font-loader'
import { getSectionStyles, getSectionTypographyStyle } from '@/lib/utils/section-styling'
import { ApiLinkService } from '@/lib/services/api-link-service'
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
  User,
  Link
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryIconService, CategoryIconConfig } from '@/lib/services/category-icon-service'
import { CategoryIconPreview } from '@/components/category-icons/category-icon-preview'

interface DeveloperDarkTemplateProps {
  user: SupabaseUser
  links: Record<LinkCategory, UserLinkWithPreview[]>
  appearanceSettings?: SupabaseUserAppearanceSettings | null
  categoryOrder?: LinkCategory[]
  isPreview?: boolean
}

// Function to get the appropriate icon for a link
const getLinkIcon = (link: UserLinkWithPreview) => {
  // Check for uploaded icon
  if (link.icon_selection_type === 'upload' && link.uploaded_icon_url) {
    return (
      <Image
        src={link.uploaded_icon_url}
        alt={`${link.title} icon`}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    )
  }

  // Check for custom URL icon
  if (link.icon_selection_type === 'url' && link.custom_icon_url) {
    return (
      <Image
        src={link.custom_icon_url}
        alt={`${link.title} icon`}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    )
  }

  // Check for platform icon (social media)
  if (link.icon_selection_type === 'platform' && link.category === 'social' && link.platform_detected) {
    return (
      <Image
        src={`/icons/${link.platform_detected}/${link.icon_variant || 'default'}.png`}
        alt={`${link.platform_detected} icon`}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    )
  }

  // Default icons based on category
  switch (link.category) {
    case 'personal': return <ExternalLink className="w-4 h-4" />
    case 'projects': return <Github className="w-4 h-4" />
    case 'blogs': return <BookOpen className="w-4 h-4" />
    case 'achievements': return <Award className="w-4 h-4" />
    case 'contact': return <Mail className="w-4 h-4" />
    case 'social': return <Globe className="w-4 h-4" />
    case 'custom': return <Link className="w-4 h-4" />
    default: return <ExternalLink className="w-4 h-4" />
  }
}

// Category icon mapping
const getCategoryIcon = (category: LinkCategory, customIcons: Record<LinkCategory, CategoryIconConfig>) => {
  // Check if user has custom icon for this category
  const customIcon = customIcons[category]
  if (customIcon) {
    return () => <CategoryIconPreview config={customIcon} size={20} />
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

export function DeveloperDarkTemplate({ user, links, appearanceSettings, categoryOrder: propCategoryOrder, isPreview = false }: DeveloperDarkTemplateProps) {
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
      return { backgroundColor: '#18181a' } // Default background
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
        style.backgroundColor = appearanceSettings.background_color || '#18181a'
      } else {
        // No image set yet, show a neutral background instead of falling back to solid color
        style.backgroundColor = '#18181a' // Use default dark background
      }
    } else {
      // Default to solid color
      style.backgroundColor = appearanceSettings.background_color || '#18181a'
    }

    return style
  }

  // Generate typography styles from appearance settings
  const getTypographyStyle = (type: 'heading' | 'subheading' | 'body' | 'accent' | 'link', isHover = false): React.CSSProperties => {
    if (!appearanceSettings) {
      // Default styles with reduced sizes
      const defaults = {
        heading: { fontFamily: 'Sharp Grotesk', fontSize: '24px', color: '#ffffff', lineHeight: '30px' },
        subheading: { fontFamily: 'Sharp Grotesk', fontSize: '16px', color: '#54E0FF', lineHeight: '22px' },
        body: { fontFamily: 'Sharp Grotesk', fontSize: '14px', color: '#7a7a83', lineHeight: '20px' },
        accent: { fontFamily: 'Sharp Grotesk', fontSize: '12px', color: '#7a7a83', lineHeight: '18px' },
        link: { fontFamily: 'Sharp Grotesk', fontSize: '14px', color: '#54E0FF', lineHeight: '20px' }
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

    // Apply font size with reduction
    switch (type) {
      case 'heading':
        style.fontSize = `${(appearanceSettings.font_size_heading || 32) * 0.75}px`
        style.lineHeight = `${appearanceSettings.line_height_heading || 1.2}`
        break
      case 'subheading':
        style.fontSize = `${(appearanceSettings.font_size_subheading || 18) * 0.85}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.4}`
        break
      case 'body':
      case 'accent':
      case 'link':
        style.fontSize = `${(appearanceSettings.font_size_base || 16) * 0.85}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.5}`
        break
    }

    // Apply colors
    switch (type) {
      case 'heading':
        style.color = appearanceSettings.text_primary_color || '#ffffff'
        break
      case 'subheading':
        style.color = appearanceSettings.text_accent_color || '#54E0FF'
        break
      case 'body':
      case 'accent':
        style.color = appearanceSettings.text_secondary_color || '#7a7a83'
        break
      case 'link':
        style.color = isHover
          ? (appearanceSettings.link_hover_color || '#29ADFF')
          : (appearanceSettings.link_color || '#54E0FF')
        break
    }

    return style
  }

  const handleLinkClick = async (link: UserLinkWithPreview) => {
    // Track the click for analytics
    await ApiLinkService.trackLinkClick(link.id);

    // For now, just open the link (analytics will be handled by the new clean architecture)
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleRefreshPreview = async (linkId: string) => {
    try {
      // Use API service to refresh preview data
      await ApiLinkService.refreshRichPreview(user.id, linkId);
      toast.success('Preview refreshed successfully');
      
      // Use toast to inform user instead of reloading the whole page
      // Will be properly handled through state management in the future
      if (!isPreview) {
        toast.info('Reload the page to see the updated preview', {
          action: {
            label: 'Reload',
            onClick: () => window.location.reload()
          },
        });
      }
    } catch (error) {
      console.error('Failed to refresh preview:', error);
      toast.error('Failed to refresh preview');
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
      <div className="max-w-xl mx-auto px-4 py-6">
        
        {/* Profile Header */}
        <div 
          className="glassmorphic rounded-[16px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] mb-6 text-center"
          style={{
            ...getSectionStyles('profile', appearanceSettings),
            borderRadius: `${getSectionStyles('profile', appearanceSettings).sectionColors.card_border_radius || 16}px`
          }}
        >
          
          {/* Avatar */}
          <div className="mb-4">
            {user.avatar_url && user.avatar_url.trim() !== '' ? (
              <Image
                src={user.avatar_url}
                alt={`${user.full_name || user.github_username}'s avatar`}
                width={appearanceSettings?.profile_avatar_size || 100}
                height={appearanceSettings?.profile_avatar_size || 100}
                className="rounded-full mx-auto object-cover border-2"
                style={{
                  width: `${(appearanceSettings?.profile_avatar_size || 100) * 0.85}px`,
                  height: `${(appearanceSettings?.profile_avatar_size || 100) * 0.85}px`,
                  borderColor: appearanceSettings?.border_color || '#33373b'
                }}
              />
            ) : (
              <div 
                className="rounded-full mx-auto bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center"
                style={{
                  width: `${(appearanceSettings?.profile_avatar_size || 100) * 0.85}px`,
                  height: `${(appearanceSettings?.profile_avatar_size || 100) * 0.85}px`
                }}
              >
                <span 
                  className="font-bold text-[#18181a] font-sharp-grotesk"
                  style={{
                    fontSize: `${Math.floor((appearanceSettings?.profile_avatar_size || 100) * 0.85 * 0.4)}px`
                  }}
                >
                  {(user.full_name || user.github_username || 'U')[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name and Title */}
          <h1
            className="font-medium tracking-[-0.75px] mb-1"
            style={getTypographyStyle('heading')}
          >
            {user.full_name || user.github_username || 'Developer'}
          </h1>

          {user.profile_title && (
            <p
              className="font-light tracking-[-0.42px] mb-3"
              style={getTypographyStyle('subheading')}
            >
              {user.profile_title}
            </p>
          )}

          {/* Meta Information */}
          <div
            className="flex flex-wrap items-center justify-center gap-3 mb-4"
            style={getTypographyStyle('accent')}
          >
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                <span>{user.company}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p
              className="font-light tracking-[-0.36px] mb-4 max-w-md mx-auto"
              style={getTypographyStyle('body')}
            >
              {user.bio}
            </p>
          )}

          {/* Tech Stacks */}
          {user.tech_stacks && user.tech_stacks.length > 0 && (
            <div className="mb-4 flex justify-center">
              <div className="flex flex-wrap justify-center gap-1.5">
                <TechStackDisplay techStackIds={user.tech_stacks} />
              </div>
            </div>
          )}

          {/* Share Button */}
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="border-[#33373b] text-white hover:bg-[#28282b] text-xs h-8 px-4"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                Share Profile
              </>
            )}
          </Button>
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
                    variant="dark"
                    appearanceSettings={appearanceSettings}
                    getTypographyStyle={getTypographyStyle}
                  />
                )
              }

              const CategoryIcon = getCategoryIcon(category, categoryIcons)
              
              return (
                <div 
                  key={category} 
                  className="glassmorphic rounded-[16px] p-4 shadow-[0px_12px_24px_rgba(0,0,0,0.25)]"
                  style={{
                    ...getSectionStyles(category, appearanceSettings),
                    borderRadius: `${getSectionStyles(category, appearanceSettings).sectionColors.card_border_radius || 16}px`
                  }}
                >
                  
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon
                      className="w-4 h-4"
                      style={{ color: getSectionStyles(category, appearanceSettings).sectionColors.accent_color || '#54E0FF' }}
                    />
                    <h2
                      className="font-medium tracking-[-0.5px]"
                      style={{
                        ...getSectionTypographyStyle(category, 'heading', appearanceSettings),
                        fontSize: `${(appearanceSettings?.font_size_heading || 32) * 0.5}px` // 16px when base is 32px
                      }}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h2>
                  </div>

                  {/* Rich Link Previews */}
                  <div className="space-y-3">
                    {categoryLinks.map((link) => (
                      <div
                        key={link.id}
                        style={{
                          ...getSectionStyles(category, appearanceSettings),
                          borderRadius: `${getSectionStyles(category, appearanceSettings).sectionColors.card_border_radius || 10}px`
                        }}
                      >
                        <RichLinkPreview
                          link={link}
                          onClick={() => handleLinkClick(link)}
                          onRefresh={handleRefreshPreview}
                          variant="default"
                          showRefreshButton={true}
                          isPreviewMode={isPreview} // Pass explicit preview mode prop
                          linkHoverColor={appearanceSettings?.link_hover_color} // Pass link hover color from appearance settings
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div 
            className="glassmorphic rounded-[16px] p-6 shadow-[0px_12px_24px_rgba(0,0,0,0.25)] text-center"
            style={{
              ...getSectionStyles('profile', appearanceSettings),
              borderRadius: `${getSectionStyles('profile', appearanceSettings).sectionColors.card_border_radius || 16}px`
            }}
          >
            <h2
              className="font-medium tracking-[-0.6px] mb-3"
              style={{
                ...getTypographyStyle('heading'),
                fontSize: `${(appearanceSettings?.font_size_heading || 32) * 0.625}px` // 20px when base is 32px
              }}
            >
              No Links Yet
            </h2>
            <p
              className="font-light tracking-[-0.36px]"
              style={getTypographyStyle('body')}
            >
              This developer hasn't added any links to their profile yet.
            </p>
          </div>
        )}

        {/* Powered by Link4Coders Footer - only shown for non-premium users in actual public profile (not in preview) */}
        {!user.is_premium && !isPreview && (
          <div className="mt-6 text-center">
            <div 
              className="glassmorphic rounded-[10px] p-3 shadow-[0px_8px_15px_rgba(0,0,0,0.20)] inline-block"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.20)',
                borderColor: 'rgba(51, 55, 59, 0.5)',
                borderRadius: '10px'
              }}
            >
              <p
                className="font-light"
                style={{
                  ...getTypographyStyle('accent'),
                  fontSize: `${(appearanceSettings?.font_size_base || 16) * 0.75}px` // 12px when base is 16px
                }}
              >
                Powered by{' '}
                <a
                  href="https://link4coders.in?ref=profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors font-medium hover:opacity-80"
                  style={{ color: appearanceSettings?.link_color || '#54E0FF' }}
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
                {' '}✨
              </p>
              <p
                className="mt-0.5"
                style={{
                  ...getTypographyStyle('accent'),
                  fontSize: `${(appearanceSettings?.font_size_base || 16) * 0.625}px` // 10px when base is 16px
                }}
              >
                Create your developer profile for free
              </p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}
