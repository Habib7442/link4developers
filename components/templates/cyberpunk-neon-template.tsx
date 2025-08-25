'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User, UserAppearanceSettings } from '@/lib/supabase'
import { LinkCategory } from '@/lib/domain/entities'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { Button } from '@/components/ui/button'
import { RichLinkPreview } from '@/components/rich-preview/rich-link-preview'
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
  User as UserIcon,
  Link
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryIconService, CategoryIconConfig } from '@/lib/services/category-icon-service'
import { CategoryIconPreview } from '@/components/category-icons/category-icon-preview'

interface CyberpunkNeonTemplateProps {
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
    case 'personal': return UserIcon
    case 'social': return Share2
    case 'custom': return Link
    default: return ExternalLink
  }
}

export function CyberpunkNeonTemplate({ user, links, appearanceSettings, categoryOrder: propCategoryOrder, isPreview = false }: CyberpunkNeonTemplateProps) {
  const [copied, setCopied] = useState(false)
  const [categoryIcons, setCategoryIcons] = useState<Record<LinkCategory, CategoryIconConfig>>({} as Record<LinkCategory, CategoryIconConfig>)
  const [categoryOrder, setCategoryOrder] = useState<LinkCategory[]>(propCategoryOrder || ['personal', 'projects', 'blogs', 'achievements', 'contact', 'custom', 'social'])

  // Load fonts when appearance settings change
  useEffect(() => {
    if (!appearanceSettings) return

    const fontsToLoad = []
    if (appearanceSettings.primary_font && appearanceSettings.primary_font !== 'Orbitron') {
      fontsToLoad.push(appearanceSettings.primary_font)
    }
    if (appearanceSettings.secondary_font && appearanceSettings.secondary_font !== 'Rajdhani' && appearanceSettings.secondary_font !== appearanceSettings.primary_font) {
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
      return { 
        background: '#0D0D0D', // Deep dark background as specified
        position: 'relative',
        overflow: 'hidden'
      }
    }

    const style: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden'
    }

    if (appearanceSettings.background_type === 'gradient' && appearanceSettings.background_gradient) {
      const { type, colors, direction } = appearanceSettings.background_gradient
      if (type === 'linear') {
        style.background = `linear-gradient(${direction || '135deg'}, ${colors.join(', ')})`
      } else if (type === 'radial') {
        style.background = `radial-gradient(${appearanceSettings.background_gradient.position || 'center'}, ${colors.join(', ')})`
      }
    } else if (appearanceSettings.background_type === 'image') {
      if (appearanceSettings.background_image_url) {
        style.backgroundImage = `url(${appearanceSettings.background_image_url})`
        style.backgroundPosition = appearanceSettings.background_image_position || 'center'
        style.backgroundSize = appearanceSettings.background_image_size || 'cover'
        style.backgroundRepeat = 'no-repeat'
        style.backgroundColor = appearanceSettings.background_color || '#0D0D0D'
      } else {
        style.background = '#0D0D0D' // Deep dark as default
      }
    } else {
      style.background = appearanceSettings.background_color || '#0D0D0D'
    }

    return style
  }

  // Generate typography styles from appearance settings
  const getTypographyStyle = (type: 'heading' | 'subheading' | 'body' | 'accent' | 'link', isHover = false): React.CSSProperties => {
    if (!appearanceSettings) {
      // Default styles for Cyberpunk Neon theme - EXACT specifications
      const defaults = {
        heading: { fontFamily: 'Orbitron, sans-serif', fontSize: '36px', color: '#00F5FF', lineHeight: '1.2', textShadow: '0 0 10px #00F5FF, 0 0 20px #00F5FF' }, // Bright cyan with glow
        subheading: { fontFamily: 'Orbitron, sans-serif', fontSize: '18px', color: '#39FF14', lineHeight: '1.4', textShadow: '0 0 5px #39FF14' }, // Neon green with glow
        body: { fontFamily: 'Inter, sans-serif', fontSize: '18px', color: '#D1D5DB', lineHeight: '1.6' }, // Light gray
        accent: { fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#9CA3AF', lineHeight: '1.4' }, // Muted gray
        link: { fontFamily: 'Inter, sans-serif', fontSize: '18px', color: '#FF00FF', lineHeight: '1.6', textShadow: '0 0 5px #FF00FF' } // Magenta neon with glow
      }
      return defaults[type]
    }

    const style: React.CSSProperties = {}

    // Apply font family
    if (type === 'heading' || type === 'subheading') {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.primary_font || 'Orbitron')
    } else {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.secondary_font || 'Inter')
    }

    // Apply font size and weight
    switch (type) {
      case 'heading':
        style.fontSize = `${appearanceSettings.font_size_heading || 36}px`
        style.lineHeight = `${appearanceSettings.line_height_heading || 1.2}`
        style.textShadow = '0 0 10px #00F5FF, 0 0 20px #00F5FF' // Cyan glow
        break
      case 'subheading':
        style.fontSize = `${appearanceSettings.font_size_subheading || 18}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.4}`
        style.textShadow = '0 0 5px #39FF14' // Green glow
        break
      case 'body':
      case 'accent':
      case 'link':
        style.fontSize = `${appearanceSettings.font_size_base || 18}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.6}`
        break
    }

    // Apply colors - EXACT cyberpunk neon specifications
    switch (type) {
      case 'heading':
        style.color = appearanceSettings.text_primary_color || '#00F5FF' // Bright cyan
        break
      case 'subheading':
        style.color = appearanceSettings.text_accent_color || '#39FF14' // Neon green
        break
      case 'body':
        style.color = appearanceSettings.text_secondary_color || '#D1D5DB' // Light gray
        break
      case 'accent':
        style.color = appearanceSettings.text_secondary_color || '#9CA3AF' // Muted gray
        break
      case 'link':
        style.color = isHover
          ? (appearanceSettings.link_hover_color || '#00F5FF') // Cyan glow on hover
          : (appearanceSettings.link_color || '#FF00FF') // Magenta neon
        if (isHover) {
          style.textShadow = '0 0 8px #00F5FF' // Cyan glow on hover
        } else {
          style.textShadow = '0 0 5px #FF00FF' // Magenta glow
        }
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
    <div className="min-h-screen relative" style={getBackgroundStyle()}>
      {/* Cyberpunk Neon effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,255,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(255,0,255,0.02)_2px,transparent_2px)] bg-[size:40px_40px] opacity-50"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        
        {/* Profile Header */}
        <div className="bg-[#1A1A1A] border border-[#00F5FF]/30 rounded-2xl p-6 mb-8 relative overflow-hidden" 
             style={{ boxShadow: '0 0 20px rgba(0, 245, 255, 0.3), 0 0 40px rgba(0, 245, 255, 0.1)' }}>
          {/* Neon glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00F5FF]/5 to-[#FF00FF]/5"></div>
          
          <div className="flex flex-col md:flex-row gap-6 relative z-10">
            
            {/* Left Side - Avatar and Basic Info */}
            <div className="flex-shrink-0">
              {user.avatar_url && user.avatar_url.trim() !== '' ? (
                <div className="relative">
                  <Image
                    src={user.avatar_url}
                    alt={`${user.full_name || user.github_username}'s avatar`}
                    width={100}
                    height={100}
                    className="w-[100px] h-[100px] rounded-full object-cover border-2 border-[#00F5FF]"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-[#00F5FF] animate-pulse" 
                       style={{ boxShadow: '0 0 15px rgba(0, 245, 255, 0.6)' }}></div>
                </div>
              ) : (
                <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-r from-[#00F5FF] to-[#FF00FF] flex items-center justify-center border-2 border-[#00F5FF]"
                     style={{ boxShadow: '0 0 20px rgba(0, 245, 255, 0.6)' }}>
                  <span className="text-[40px] font-bold text-white font-orbitron">
                    {(user.full_name || user.github_username || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side - Profile Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-[32px] font-bold leading-[1.2] tracking-[-0.5px] mb-2"
                      style={getTypographyStyle('heading')}>
                    {user.full_name || user.github_username || 'Developer'}
                  </h1>
                  
                  {user.github_username && (
                    <p className="text-[16px] font-medium leading-[1.4] mb-3"
                       style={getTypographyStyle('subheading')}>
                      @{user.github_username}
                    </p>
                  )}

                  {user.profile_title && (
                    <p className="text-[16px] font-semibold leading-[1.4] mb-3"
                       style={getTypographyStyle('subheading')}>
                      {user.profile_title}
                    </p>
                  )}

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-[16px] leading-[1.6] mb-4"
                       style={getTypographyStyle('body')}>
                      {user.bio}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-[14px]"
                       style={getTypographyStyle('accent')}>
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#00F5FF]" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4 text-[#00F5FF]" />
                        <span>{user.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#00F5FF]" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Share Button - Cyberpunk Neon Gradient */}
                <Button
                  onClick={handleShare}
                  className="bg-gradient-to-r from-[#00F5FF] to-[#FF00FF] hover:from-[#FF00FF] hover:to-[#00F5FF] text-white border-0 px-6 py-3 rounded-xl font-bold text-[16px] relative overflow-hidden group font-orbitron"
                  style={{ boxShadow: '0 0 20px rgba(0, 245, 255, 0.4), 0 0 40px rgba(255, 0, 255, 0.2)' }}
                >
                  <span className="relative z-10 flex items-center">
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
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* All Categories Section - Respecting Category Order */}
        {hasLinks ? (
          <div className="space-y-6">
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
                    variant="cyberpunk"
                    appearanceSettings={appearanceSettings}
                    getTypographyStyle={getTypographyStyle}
                  />
                )
              }

              const CategoryIcon = getCategoryIcon(category, categoryIcons)
              
              return (
                <div 
                  key={category} 
                  className="bg-[#1E1E1E] border border-[#00F5FF]/30 rounded-2xl overflow-hidden relative"
                  style={{ boxShadow: '0 0 15px rgba(0, 245, 255, 0.2), 0 0 30px rgba(0, 245, 255, 0.1)' }}
                >
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-[#00F5FF]/10 to-[#FF00FF]/10 border-b border-[#00F5FF]/30 px-6 py-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00F5FF]/5 to-[#FF00FF]/5"></div>
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#00F5FF]/20 border border-[#00F5FF]/30"
                           style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.3)' }}>
                        {(() => {
                          // For projects category, always show GitHub icon
                          if (category === 'projects') {
                            return <Github className="w-5 h-5 text-[#00F5FF]" />
                          }
                          
                          // For blogs category, always show BookOpen icon
                          if (category === 'blogs') {
                            return <BookOpen className="w-5 h-5 text-[#00F5FF]" />
                          }
                          
                          // For other categories, use the mapped icon
                          const IconComponent = CategoryIcon
                          if (IconComponent && typeof IconComponent === 'function') {
                            return <IconComponent className="w-5 h-5 text-[#00F5FF]" />
                          }
                          
                          // Fallback
                          return <ExternalLink className="w-5 h-5 text-[#00F5FF]" />
                        })()}
                      </div>
                      <h2 className="text-[20px] font-bold leading-[1.3] font-orbitron text-[#00F5FF]"
                          style={{ textShadow: '0 0 8px rgba(0, 245, 255, 0.6)' }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h2>
                      <span className="text-[14px] text-[#39FF14] font-inter font-medium"
                           style={{ textShadow: '0 0 5px rgba(57, 255, 20, 0.6)' }}>
                        {categoryLinks.length} {categoryLinks.length === 1 ? 'link' : 'links'}
                      </span>
                    </div>
                  </div>

                  {/* Links Grid */}
                  <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryLinks.map((link) => (
                        <div key={link.id} className="group">
                          <RichLinkPreview
                            link={link}
                            onClick={() => handleLinkClick(link)}
                            onRefresh={handleRefreshPreview}
                            variant="default"
                            showRefreshButton={true}
                            className="bg-[#1A1A1A] border border-[#00F5FF]/20 hover:border-[#00F5FF]/50 rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:scale-[1.02]"
                            isPreviewMode={isPreview} // Pass explicit preview mode prop
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-[#1A1A1A] border border-[#00F5FF]/30 rounded-2xl p-8 text-center relative overflow-hidden"
               style={{ boxShadow: '0 0 15px rgba(0, 245, 255, 0.2), 0 0 30px rgba(0, 245, 255, 0.1)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F5FF]/5 to-[#FF00FF]/5"></div>
            <div className="relative z-10">
              <h2 className="text-[24px] font-bold leading-[1.3] mb-2 font-orbitron text-[#00F5FF]"
                  style={{ textShadow: '0 0 10px rgba(0, 245, 255, 0.6)' }}>
                No Links Yet
              </h2>
              <p className="text-[18px] leading-[1.6] text-[#D1D5DB] font-inter"
                 style={getTypographyStyle('body')}>
                This developer hasn&apos;t added any links to their profile yet.
              </p>
            </div>
          </div>
        )}

        {/* Powered by Link4Coders Footer */}
        {!user.is_premium && !isPreview && (
          <div className="mt-8 text-center">
            <div className="bg-[#1A1A1A] border border-[#00F5FF]/30 rounded-xl p-4 inline-block relative overflow-hidden"
                 style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.2), 0 0 20px rgba(0, 245, 255, 0.1)' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F5FF]/5 to-[#FF00FF]/5"></div>
              <div className="relative z-10">
                <p className="text-[14px] font-medium text-[#D1D5DB] font-inter">
                  Powered by{' '}
                  <a 
                    href="https://link4coders.in?ref=profile" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#FF00FF] hover:text-[#00F5FF] transition-colors font-bold"
                    style={{ textShadow: '0 0 5px rgba(255, 0, 255, 0.6)' }}
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
                <p className="text-[12px] text-[#9CA3AF] font-inter mt-1">
                  Create your developer profile for free
                </p>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}