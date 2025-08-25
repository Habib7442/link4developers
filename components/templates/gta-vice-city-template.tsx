'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User, UserAppearanceSettings } from '@/lib/supabase'
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
  Check,
  Heart,
  User as UserIcon,
  Link
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryIconService, CategoryIconConfig } from '@/lib/services/category-icon-service'
import { LINK_CATEGORIES } from '@/lib/services/link-constants'
import { CategoryIconPreview } from '@/components/category-icons/category-icon-preview'

interface GTAViceCityTemplateProps {
  user: User
  links: Record<LinkCategory, UserLinkWithPreview[]>
  appearanceSettings?: UserAppearanceSettings | null
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
        width={20}
        height={20}
        className="w-5 h-5 object-contain"
      />
    )
  }

  // Check for custom URL icon
  if (link.icon_selection_type === 'url' && link.custom_icon_url) {
    return (
      <Image
        src={link.custom_icon_url}
        alt={`${link.title} icon`}
        width={20}
        height={20}
        className="w-5 h-5 object-contain"
      />
    )
  }

  // Check for platform icon (social media)
  if (link.icon_selection_type === 'platform' && link.category === 'social' && link.platform_detected) {
    return (
      <Image
        src={`/icons/${link.platform_detected}/${link.icon_variant || 'default'}.png`}
        alt={`${link.platform_detected} icon`}
        width={20}
        height={20}
        className="w-5 h-5 object-contain"
      />
    )
  }

  // Default icons based on category with neon styling
  switch (link.category) {
    case 'personal': return <ExternalLink className="w-5 h-5 text-white" />
    case 'projects': return <Github className="w-5 h-5 text-white" />
    case 'blogs': return <BookOpen className="w-5 h-5 text-white" />
    case 'achievements': return <Award className="w-5 h-5 text-white" />
    case 'contact': return <Mail className="w-5 h-5 text-white" />
    case 'social': return <Globe className="w-5 h-5 text-white" />
    case 'custom': return <Link className="w-5 h-5 text-white" />
    default: return <ExternalLink className="w-5 h-5 text-white" />
  }
}

// Category icon mapping
const getCategoryIcon = (category: LinkCategory, customIcons: Record<LinkCategory, CategoryIconConfig>) => {
  // Check if user has custom icon for this category
  const customIcon = customIcons[category]
  if (customIcon) {
    const CategoryIconComponent = () => <CategoryIconPreview config={customIcon} size={24} />
    CategoryIconComponent.displayName = `CategoryIcon-${category}`
    return CategoryIconComponent
  }

  // Fallback to default icon with neon styling - map categories to icon components
  switch (category) {
    case 'projects': return Github
    case 'blogs': return BookOpen
    case 'achievements': return Award
    case 'contact': return Mail
    case 'personal': return UserIcon
    case 'social': return Share2
    case 'custom': return Link
    default: return ExternalLink
  }
}

export function GTAViceCityTemplate({ user, links, appearanceSettings, categoryOrder: propCategoryOrder, isPreview = false }: GTAViceCityTemplateProps) {
  const [copied, setCopied] = useState(false)
  const [categoryIcons, setCategoryIcons] = useState<Record<LinkCategory, CategoryIconConfig>>({} as Record<LinkCategory, CategoryIconConfig>)
  const [categoryOrder, setCategoryOrder] = useState<LinkCategory[]>(propCategoryOrder || ['personal', 'projects', 'blogs', 'achievements', 'contact', 'custom', 'social'])

  // Load fonts when component mounts or appearance settings change
  useEffect(() => {
    const fontsToLoad = []
    
    // Load custom fonts from appearance settings
    if (appearanceSettings?.primary_font && appearanceSettings.primary_font !== 'Sharp Grotesk') {
      fontsToLoad.push(appearanceSettings.primary_font)
    } else {
      // Load GTA Vice City themed fonts as default
      fontsToLoad.push('Orbitron')
    }
    
    if (appearanceSettings?.secondary_font && appearanceSettings.secondary_font !== 'Sharp Grotesk' && appearanceSettings.secondary_font !== appearanceSettings.primary_font) {
      fontsToLoad.push(appearanceSettings.secondary_font)
    } else {
      fontsToLoad.push('Rajdhani')
    }

    // Load fonts
    fontsToLoad.forEach(font => {
      loadGoogleFont(font).catch(error => {
        console.error(`Failed to load font ${font}:`, error)
      })
    })
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

  const handleCopyProfile = async () => {
    const profileUrl = `${window.location.origin}/${user.profile_slug || user.github_username}`
    
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast.success('Profile URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
      toast.error('Failed to copy URL')
    }
  }

  // Generate background style from appearance settings
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!appearanceSettings) {
      return { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #e94560 75%, #f38ba8 100%)' } // Default GTA background
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
        style.backgroundColor = appearanceSettings.background_color || '#1a1a2e'
      } else {
        // No image set yet, use default GTA background
        style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #e94560 75%, #f38ba8 100%)'
      }
    } else {
      // Default to solid color
      style.backgroundColor = appearanceSettings.background_color || '#1a1a2e'
    }

    return style
  }

  // Generate typography styles from appearance settings with GTA theme defaults
  const getTypographyStyle = (type: 'heading' | 'subheading' | 'body' | 'accent' | 'link', isHover = false): React.CSSProperties => {
    if (!appearanceSettings) {
      // Default styles for GTA theme
      const defaults = {
        heading: { fontFamily: 'Orbitron, monospace', fontSize: '36px', color: '#ffffff', lineHeight: '1.2', fontWeight: 'bold', textShadow: '0 0 20px rgba(243, 139, 168, 0.8), 0 0 40px rgba(243, 139, 168, 0.4)' },
        subheading: { fontFamily: 'Rajdhani, sans-serif', fontSize: '20px', color: '#ffc0cb', lineHeight: '1.4', fontWeight: '600' },
        body: { fontFamily: 'Rajdhani, sans-serif', fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.5', fontWeight: 'normal' },
        accent: { fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.4', fontWeight: 'medium' },
        link: { fontFamily: 'Rajdhani, sans-serif', fontSize: '18px', color: '#ffffff', lineHeight: '1.5', fontWeight: '600' }
      }
      return defaults[type]
    }

    const style: React.CSSProperties = {}

    // Apply font family
    if (type === 'heading' || type === 'subheading') {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.primary_font || 'Orbitron')
    } else {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.secondary_font || 'Rajdhani')
    }

    // Apply font size
    switch (type) {
      case 'heading':
        style.fontSize = `${appearanceSettings.font_size_heading || 36}px`
        style.lineHeight = `${appearanceSettings.line_height_heading || 1.2}`
        break
      case 'subheading':
        style.fontSize = `${appearanceSettings.font_size_subheading || 20}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.5}`
        break
      case 'body':
      case 'accent':
      case 'link':
        style.fontSize = `${appearanceSettings.font_size_base || 18}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.5}`
        break
    }

    // Apply colors with GTA theme safe defaults
    switch (type) {
      case 'heading':
        style.color = appearanceSettings.text_primary_color || '#ffffff'
        // Add neon glow effect for headings if using default colors
        if (!appearanceSettings.text_primary_color || appearanceSettings.text_primary_color === '#ffffff') {
          style.textShadow = '0 0 20px rgba(243, 139, 168, 0.8), 0 0 40px rgba(243, 139, 168, 0.4)'
        }
        break
      case 'subheading':
        style.color = appearanceSettings.text_accent_color || '#ffc0cb'
        break
      case 'body':
      case 'accent':
        style.color = appearanceSettings.text_secondary_color || 'rgba(255, 255, 255, 0.9)'
        break
      case 'link':
        style.color = isHover
          ? (appearanceSettings.link_hover_color || '#ffc0cb')
          : (appearanceSettings.link_color || '#ffffff')
        break
    }

    return style
  }

  const handleLinkClick = (link: UserLinkWithPreview) => {
    // Open link
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }) : ''

  // Filter out empty categories and apply custom order
  const orderedCategories = categoryOrder.filter(category => {
    const categoryLinks = links[category]
    return categoryLinks && categoryLinks.length > 0
  })

  return (
    <div 
      className="min-h-screen relative"
      style={getBackgroundStyle()}
    >
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-12 max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* Avatar */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 blur-lg opacity-60 scale-110"></div>
            <Image
              src={user.avatar_url && user.avatar_url.trim() !== '' ? user.avatar_url : '/default-avatar.png'}
              alt={user.full_name || user.github_username || 'User'}
              width={appearanceSettings?.profile_avatar_size || 140}
              height={appearanceSettings?.profile_avatar_size || 140}
              className="relative rounded-full border-4 border-white/20 shadow-2xl backdrop-blur-sm"
            />
          </div>

          {/* Name */}
          <h1 
            className="text-4xl font-bold mb-3"
            style={getTypographyStyle('heading')}
          >
            {user.full_name || user.github_username}
          </h1>

          {/* Title */}
          {user.profile_title && (
            <p 
              className="text-xl font-semibold mb-4"
              style={getTypographyStyle('subheading')}
            >
              {user.profile_title}
            </p>
          )}

          {/* Bio */}
          {user.bio && (
            <p 
              className="text-lg mb-6 leading-relaxed max-w-lg mx-auto"
              style={getTypographyStyle('body')}
            >
              {user.bio}
            </p>
          )}

          {/* Location, Company, Join Date */}
          <div 
            className="flex flex-wrap justify-center items-center gap-6 mb-8"
            style={getTypographyStyle('accent')}
          >
            {user.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: appearanceSettings?.text_accent_color || '#ffc0cb' }} />
                <span className="text-sm">{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" style={{ color: appearanceSettings?.text_accent_color || '#00ffff' }} />
                <span className="text-sm">{user.company}</span>
              </div>
            )}
            {joinedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: appearanceSettings?.text_accent_color || '#c084fc' }} />
                <span className="text-sm">Joined {joinedDate}</span>
              </div>
            )}
          </div>

          {/* Share Button */}
          <Button
            onClick={handleCopyProfile}
            className="font-semibold px-8 py-3 rounded-full hover:scale-105 transition-all duration-300 shadow-lg mb-8"
            style={{
              backgroundColor: appearanceSettings?.link_color || '#e94560',
              color: appearanceSettings?.text_primary_color || '#ffffff',
              backgroundImage: !appearanceSettings?.link_color ? 'linear-gradient(45deg, #e94560, #f38ba8, #00ffff)' : undefined,
              boxShadow: '0 0 30px rgba(243, 139, 168, 0.4)'
            }}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 mr-2" />
                Share Profile
              </>
            )}
          </Button>
        </div>

        {/* Links Section */}
        <div className="space-y-10">
          {orderedCategories.map((category) => {
            const categoryLinks = links[category]
            const config = LINK_CATEGORIES[category]
            const IconComponent = getCategoryIcon(category, categoryIcons)

            // Special handling for social media category
            if (category === 'social') {
              return (
                <SocialMediaSection
                  key={category}
                  links={categoryLinks}
                  appearanceSettings={appearanceSettings}
                  variant="gta-vice-city"
                  customIcons={categoryIcons}
                  getTypographyStyle={getTypographyStyle}
                />
              )
            }

            return (
              <div key={category} className="mb-12">
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="p-3 rounded-xl backdrop-blur-sm border"
                    style={{
                      ...getSectionStyles(category, appearanceSettings),
                      borderColor: getSectionStyles(category, appearanceSettings).sectionColors.card_border_color
                    }}
                  >
                    <IconComponent 
                      className="w-6 h-6" 
                      style={{ 
                        color: getSectionStyles(category, appearanceSettings).sectionColors.accent_color || '#ffffff' 
                      }} 
                    />
                  </div>
                  <h2 
                    className="text-2xl font-bold"
                    style={{
                      ...getSectionTypographyStyle(category, 'subheading', appearanceSettings),
                      textShadow: !appearanceSettings?.text_accent_color ? '0 0 15px rgba(255, 255, 255, 0.3)' : undefined
                    }}
                  >
                    {config.label}
                  </h2>
                </div>

                {/* Category Links */}
                <div className="space-y-4">
                  {categoryLinks.map((link) => (
                    <div key={link.id}>
                      {link.metadata?.type === 'github_repo' || link.metadata?.type === 'webpage' || link.metadata?.type === 'blog_post' ? (
                        <div className="group">
                          <div
                            className="backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
                            style={{
                              ...getSectionStyles(category, appearanceSettings),
                              borderRadius: `${getSectionStyles(category, appearanceSettings).sectionColors.card_border_radius || 20}px`
                            }}
                          >
                            <div style={{ ...getSectionStyles(category, appearanceSettings) }}>
                              <RichLinkPreview 
                                link={link} 
                                onClick={() => handleLinkClick(link)}
                                isPreviewMode={isPreview} // Pass explicit preview mode prop
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleLinkClick(link)}
                          className="w-full group"
                        >
                          <div 
                            className="backdrop-blur-md border rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
                            style={{
                              ...getSectionStyles(category, appearanceSettings),
                              borderRadius: `${getSectionStyles(category, appearanceSettings).sectionColors.card_border_radius || 20}px`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = getSectionStyles(category, appearanceSettings).sectionColors.link_hover_color || 'rgba(255, 255, 255, 0.3)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = getSectionStyles(category, appearanceSettings).sectionColors.card_border_color || 'rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className="flex-shrink-0 p-3 rounded-xl border"
                                style={{
                                  backgroundColor: getSectionStyles(category, appearanceSettings).sectionColors.card_background_color || 'rgba(243, 139, 168, 0.2)',
                                  borderColor: getSectionStyles(category, appearanceSettings).sectionColors.card_border_color || 'rgba(255, 255, 255, 0.1)'
                                }}
                              >
                                {getLinkIcon(link)}
                              </div>
                              <div className="flex-grow min-w-0">
                                <h3 
                                  className="text-lg font-semibold mb-1 group-hover:transition-colors"
                                  style={getSectionTypographyStyle(category, 'link', appearanceSettings)}
                                >
                                  {link.title}
                                </h3>
                                {link.description && (
                                  <p 
                                    className="text-sm line-clamp-2"
                                    style={getSectionTypographyStyle(category, 'body', appearanceSettings)}
                                  >
                                    {link.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <ExternalLink 
                                  className="w-5 h-5 group-hover:transition-colors" 
                                  style={{ color: getSectionStyles(category, appearanceSettings).sectionColors.text_color || 'rgba(255, 255, 255, 0.6)' }}
                                />
                              </div>
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        {!user.is_premium && !isPreview && (
          <div className="text-center mt-16 pt-8" style={{ borderTop: `1px solid ${appearanceSettings?.border_color || 'rgba(255, 255, 255, 0.2)'}` }}>
            <div className="flex items-center justify-center gap-2" style={getTypographyStyle('accent')}>
              <Heart className="w-4 h-4" style={{ color: appearanceSettings?.text_accent_color || '#ffc0cb' }} />
              <span className="text-sm">Powered by</span>
              <span 
                className="text-sm font-bold"
                style={{
                  ...getTypographyStyle('accent'),
                  fontWeight: 'bold'
                }}
              >
                Link4Coders
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}