'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LinkCategory } from '@/lib/domain/entities'
import { Button } from '../ui/button'
import { RichLinkPreview } from '../rich-preview/rich-link-preview'
import { UserLinkWithPreview } from '../../lib/types/rich-preview'
import { SocialMediaSection } from '../social-media/social-media-section'
import { TechStackDisplay } from '@/components/dashboard/tech-stack-display'
import { getFontFamilyWithFallbacks, loadGoogleFont } from '../../lib/utils/font-loader'
import { getSectionStyles, getSectionTypographyStyle } from '../../lib/utils/section-styling'
import { ApiLinkService } from '../../lib/services/api-link-service'
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
  Link,
  User
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryIconService, CategoryIconConfig } from '../../lib/services/category-icon-service'
import { CategoryOrderService } from '../../lib/services/category-order-service'
import { LINK_CATEGORIES } from '../../lib/services/link-constants'
import { CategoryIconPreview } from '../category-icons/category-icon-preview'
import React from 'react'
import { User as SupabaseUser, UserAppearanceSettings as SupabaseUserAppearanceSettings } from '@/lib/types/supabase-types'

interface SunsetGradientTemplateProps {
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

export function SunsetGradientTemplate({ user, links, appearanceSettings, categoryOrder: propCategoryOrder, isPreview = false }: SunsetGradientTemplateProps) {
  const [copied, setCopied] = useState(false)
  const [categoryIcons, setCategoryIcons] = useState<Record<LinkCategory, CategoryIconConfig>>({} as Record<LinkCategory, CategoryIconConfig>)
  const [categoryOrder, setCategoryOrder] = useState<LinkCategory[]>(propCategoryOrder || CategoryOrderService.DEFAULT_ORDER)

  // Load fonts when appearance settings change
  useEffect(() => {
    if (!appearanceSettings) return

    const fontsToLoad = []
    if (appearanceSettings.primary_font && appearanceSettings.primary_font !== 'Poppins') {
      fontsToLoad.push(appearanceSettings.primary_font)
    }
    if (appearanceSettings.secondary_font && appearanceSettings.secondary_font !== 'Open Sans' && appearanceSettings.secondary_font !== appearanceSettings.primary_font) {
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
        background: 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)', // True sunset gradient
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
        // Image is set, use it
        style.backgroundImage = `url(${appearanceSettings.background_image_url})`
        style.backgroundPosition = appearanceSettings.background_image_position || 'center'
        style.backgroundSize = appearanceSettings.background_image_size || 'cover'
        style.backgroundRepeat = 'no-repeat'
        // Set a fallback background color in case image fails to load
        style.backgroundColor = appearanceSettings.background_color || 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)'
      } else {
        // No image set yet, show a neutral background instead of falling back to solid color
        style.background = 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)' // Use sunset gradient as default
      }
    } else {
      // Default to sunset gradient
      style.background = appearanceSettings.background_color || 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)'
    }

    return style
  }

  // Generate typography styles from appearance settings
  const getTypographyStyle = (type: 'heading' | 'subheading' | 'body' | 'accent' | 'link', isHover = false): React.CSSProperties => {
    if (!appearanceSettings) {
      // Default styles for Sunset Gradient theme based on user specifications
      const defaults = {
        heading: { fontFamily: 'Poppins, sans-serif', fontSize: '26px', color: '#2C2C2C', lineHeight: '1.2', fontWeight: '700' }, // Deep charcoal
        subheading: { fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#FF6F61', lineHeight: '1.3', fontWeight: '600' }, // Coral
        body: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#444444', lineHeight: '1.5' }, // Dark warm gray
        accent: { fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6E6E6E', lineHeight: '1.3' }, // Muted/subtext
        link: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#FF6F61', lineHeight: '1.5' } // Bright coral
      }
      return defaults[type]
    }

    const style: React.CSSProperties = {}

    // Apply font family
    if (type === 'heading' || type === 'subheading') {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.primary_font || 'Poppins')
    } else {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.secondary_font || 'Inter')
    }

    // Apply font size and weight
    switch (type) {
      case 'heading':
        style.fontSize = `${appearanceSettings.font_size_heading ? appearanceSettings.font_size_heading * 0.8 : 26}px`
        style.lineHeight = `${appearanceSettings.line_height_heading || 1.2}`
        style.fontWeight = '700'
        break
      case 'subheading':
        style.fontSize = `${appearanceSettings.font_size_subheading ? appearanceSettings.font_size_subheading * 0.85 : 16}px`
        style.lineHeight = `${appearanceSettings.line_height_base ? appearanceSettings.line_height_base * 0.95 : 1.3}`
        style.fontWeight = '600'
        break
      case 'body':
      case 'accent':
      case 'link':
        style.fontSize = `${appearanceSettings.font_size_base ? appearanceSettings.font_size_base * 0.85 : 14}px`
        style.lineHeight = `${appearanceSettings.line_height_base ? appearanceSettings.line_height_base * 0.95 : 1.5}`
        break
    }

    // Apply colors
    switch (type) {
      case 'heading':
        style.color = appearanceSettings.text_primary_color || '#2C2C2C' // Deep charcoal
        break
      case 'subheading':
        style.color = appearanceSettings.text_accent_color || '#FF6F61' // Bright coral
        break
      case 'body':
        style.color = appearanceSettings.text_secondary_color || '#444444' // Dark warm gray
        break
      case 'accent':
        style.color = appearanceSettings.text_secondary_color || '#6E6E6E' // Muted/subtext
        break
      case 'link':
        style.color = isHover
          ? (appearanceSettings.link_hover_color || '#E55B50') // Darker coral for hover
          : (appearanceSettings.link_color || '#FF6F61') // Bright coral
        break
    }

    return style
  }

  const handleLinkClick = async (link: UserLinkWithPreview) => {
    try {
      // Track the click for analytics
      const response = await fetch('/api/public/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkId: link.id }),
      });

      if (!response.ok) {
        console.error('Failed to track click:', response.statusText);
      }
      
      // Get the response data
      const result = await response.json();
      console.log('Template link click tracked:', result);
    } catch (error) {
      console.error('Error tracking link click:', error);
    }

    // Open the link
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

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
    <div className="min-h-screen relative" style={getBackgroundStyle()}>
      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        
        {/* Profile Header */}
        <div className="bg-[#FFE9DC] rounded-2xl p-6 mb-6 shadow-[0_8px_30px_rgba(255,100,70,0.2)] border border-white/60 relative overflow-hidden">
          {/* Soft shadow effect */}
          <div className="absolute inset-0 rounded-2xl shadow-[0_10px_30px_rgba(255,100,70,0.2)]"></div>
          
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
                    className="w-[100px] h-[100px] rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
              ) : (
                <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-r from-[#FF7E5F] to-[#FEB47B] flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-[40px] font-bold text-white font-poppins">
                    {(user.full_name || user.github_username || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side - Profile Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div className="flex-1 min-w-0">
                  <h1 className="text-[26px] font-bold leading-[1.2] tracking-[-0.5px] mb-2 text-[#2C2C2C]"
                      style={getTypographyStyle('heading')}>
                    {user.full_name || user.github_username || 'Developer'}
                  </h1>
                  
                  {user.github_username && (
                    <p className="text-[16px] font-semibold leading-[1.3] mb-2.5 text-[#FF6F61]"
                       style={getTypographyStyle('subheading')}>
                      @{user.github_username}
                    </p>
                  )}

                  {user.profile_title && (
                    <p className="text-[16px] font-semibold leading-[1.3] mb-3 text-[#FF6F61]"
                       style={getTypographyStyle('subheading')}>
                      {user.profile_title}
                    </p>
                  )}

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-[14px] leading-[1.5] mb-4 text-[#444444]"
                       style={getTypographyStyle('body')}>
                      {user.bio}
                    </p>
                  )}

                  {/* Tech Stacks */}
                  {user.tech_stacks && user.tech_stacks.length > 0 && (
                    <div className="mb-4 flex justify-start">
                      <div className="flex flex-wrap justify-start gap-1.5">
                        <TechStackDisplay techStackIds={user.tech_stacks} align="left" />
                      </div>
                    </div>
                  )}

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#6E6E6E] font-medium"
                       style={getTypographyStyle('accent')}>
                    {user.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6F61]" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#FF6F61]" />
                        <span>{user.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FF6F61]" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <Button
                  onClick={handleShare}
                  className="bg-gradient-to-r from-[#FF5E62] to-[#FF9966] hover:from-[#FF9966] hover:to-[#FF5E62] text-white border-0 px-5 py-2.5 rounded-xl font-bold text-[14px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-1.5" />
                        Share Profile
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* All Categories Section - Respecting Category Order */}
        {hasLinks ? (
          <div className="space-y-6">
            {categoryOrder.map((category, index) => {
              const categoryLinks = links[category] || []
              if (categoryLinks.length === 0) return null

              // Handle social media category specially
              if (category === 'social') {
                return (
                  <SocialMediaSection
                    key={category}
                    socialLinks={categoryLinks}
                    onLinkClick={handleLinkClick}
                    variant="sunset"
                    appearanceSettings={appearanceSettings}
                    getTypographyStyle={getTypographyStyle}
                  />
                )
              }

              const categoryConfig = LINK_CATEGORIES[category]
              const CategoryIcon = getCategoryIcon(category, categoryIcons)
              
              return (
                <div 
                  key={category} 
                  className="bg-[#FFE9DC] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(255,100,70,0.2)] border border-white/60 relative"
                >
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-[#FF7E5F]/10 to-[#FEB47B]/10 border-b border-white/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white shadow-sm">
                        {(() => {
                          // Always show the correct icon based on category
                          switch (category) {
                            case 'projects': return <Github className="w-5 h-5 text-[#FF6F61]" />
                            case 'blogs': return <BookOpen className="w-5 h-5 text-[#FF6F61]" />
                            case 'personal': return <User className="w-5 h-5 text-[#FF6F61]" />
                            case 'achievements': return <Award className="w-5 h-5 text-[#FF6F61]" />
                            case 'contact': return <Mail className="w-5 h-5 text-[#FF6F61]" />
                            case 'custom': return <Link className="w-5 h-5 text-[#FF6F61]" />
                            case 'social': return <Share2 className="w-5 h-5 text-[#FF6F61]" />
                            default: return <ExternalLink className="w-5 h-5 text-[#FF6F61]" />
                          }
                        })()}
                      </div>
                      <div>
                        <h2 className="text-[20px] font-bold leading-[1.3] text-[#2C2C2C]"
                            style={getTypographyStyle('heading')}>
                          {categoryConfig?.label || category}
                        </h2>
                        <p className="text-[12px] text-[#6E6E6E] font-medium mt-1"
                           style={getTypographyStyle('accent')}>
                          {categoryLinks.length} {categoryLinks.length === 1 ? 'link' : 'links'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Links Grid */}
                  <div className="p-5 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryLinks.map((link) => (
                        <div key={link.id} className="group">
                          <RichLinkPreview
                            link={link}
                            onClick={() => handleLinkClick(link)}
                            onRefresh={handleRefreshPreview}
                            variant="compact"
                            showRefreshButton={true}
                            className="bg-white border border-gray-200 hover:border-[#FF6F61] rounded-2xl transition-all duration-300 hover:shadow-[0_5px_15px_rgba(255,100,70,0.2)]"
                            isPreviewMode={isPreview} // Pass explicit preview mode prop
                            linkHoverColor={appearanceSettings?.link_hover_color} // Pass link hover color from appearance settings
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
          <div className="bg-[#FFE9DC] rounded-2xl p-8 text-center shadow-[0_8px_30px_rgba(255,100,70,0.2)] border border-white/60">
            <h2 className="text-[22px] font-bold leading-[1.3] mb-3 text-[#2C2C2C]"
                style={getTypographyStyle('heading')}>
              No Links Yet
            </h2>
            <p className="text-[16px] font-medium leading-[1.5] text-[#444444]"
               style={getTypographyStyle('body')}>
              This developer hasn&apos;t added any links to their profile yet.
            </p>
          </div>
        )}

        {/* Powered by Link4Coders Footer */}
        {!user.is_premium && !isPreview && (
          <div className="mt-8 text-center">
            <div className="bg-[#FFE9DC] rounded-2xl p-4 inline-block shadow-[0_5px_15px_rgba(255,100,70,0.2)] border border-white/60">
              <p className="text-[13px] font-semibold text-[#444444] font-inter">
                Powered by{' '}
                <a 
                  href="https://link4coders.in?ref=profile" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#FF6F61] hover:text-[#E55B50] transition-colors font-bold"
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
              <p className="text-[11px] text-[#6E6E6E] font-medium font-inter mt-1.5">
                Create your developer profile for free
              </p>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}