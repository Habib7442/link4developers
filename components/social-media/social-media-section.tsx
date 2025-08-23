'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { UserAppearanceSettings } from '@/lib/supabase'
import {
  SOCIAL_PLATFORMS,
  getSVGIcon,
  detectPlatformFromUrl,
  getPlatformColor,
  getIconContent,
  isIconSVG
} from '@/lib/config/social-icons'
import { ExternalLink, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { getFontFamilyWithFallbacks } from '@/lib/utils/font-loader'
import { getSectionStyles, getSectionTypographyStyle } from '@/lib/utils/section-styling'

interface SocialMediaSectionProps {
  links?: UserLinkWithPreview[]
  socialLinks?: UserLinkWithPreview[]
  onLinkClick?: (link: UserLinkWithPreview) => void
  variant?: 'default' | 'light' | 'github' | 'gta-vice-city'
  className?: string
  appearanceSettings?: UserAppearanceSettings | null
  customIcons?: Record<string, unknown>
}

interface SocialIconProps {
  link: UserLinkWithPreview
  onClick: () => void
  variant: 'default' | 'light' | 'github' | 'gta-vice-city'
  appearanceSettings?: UserAppearanceSettings | null
}

function SocialIcon({ link, onClick, variant, appearanceSettings }: SocialIconProps) {
  const [imageError, setImageError] = useState(false)
  
  // Detect platform from URL
  const detectedPlatform = detectPlatformFromUrl(link.url)
  const platformConfig = detectedPlatform ? SOCIAL_PLATFORMS[detectedPlatform] : null
  
  // Simplified icon handling for social media
  const useCustomIcon = false // Simplified for now
  const iconVariant = platformConfig?.defaultIcon || 'default'
  
  // Get display name
  const displayName = platformConfig?.displayName || link.title
  
  // Get platform color - prioritize consistent dark colors for light theme
  const getPlatformColors = () => {
    if (variant === 'light') {
      // For light theme, use consistent dark colors for all platforms to ensure visibility and consistency
      return {
        platformColor: '#374151', // Dark gray for all icons
        hoverColor: '#1f2937' // Darker gray for hover
      }
    }
    
    if (variant === 'gta-vice-city') {
      // For GTA Vice City theme, use consistent neon colors
      return {
        platformColor: '#ffffff', // White for all icons
        hoverColor: '#ffc0cb' // Pink for hover
      }
    }
    
    // For other themes, use appearance settings if available
    const platformColor = appearanceSettings?.link_color || platformConfig?.color || '#666666'
    const hoverColor = appearanceSettings?.link_hover_color || platformColor
    return { platformColor, hoverColor }
  }
  
  const { platformColor, hoverColor } = getPlatformColors()
  
  // Theme-specific styles
  const getThemeStyles = () => {
    switch (variant) {
      case 'light':
        return {
          container: 'hover:bg-gray-50 border-gray-200',
          text: 'text-gray-700',
          icon: 'bg-white border-gray-200 shadow-sm'
        }
      case 'github':
        return {
          container: 'hover:bg-[#21262d] border-[#30363d]',
          text: 'text-[#e6edf3]',
          icon: 'bg-[#21262d] border-[#30363d]'
        }
      case 'gta-vice-city':
        return {
          container: 'hover:bg-white/10 border-white/20',
          text: 'text-white',
          icon: 'bg-white/10 border-white/20'
        }
      default:
        return {
          container: 'hover:bg-[#28282b]/50 border-[#33373b]',
          text: 'text-white',
          icon: 'bg-[#1a1a1c] border-[#33373b]'
        }
    }
  }
  
  const themeStyles = getThemeStyles()

  // Get typography styles from section-specific styling system
  const getTypographyStyle = (): React.CSSProperties => {
    if (variant === 'light') {
      // For light theme, ensure text is dark and visible regardless of appearance settings
      return { 
        fontFamily: 'Sharp Grotesk, system-ui, sans-serif',
        color: '#374151' // Dark gray for good contrast on light background
      }
    }
    
    if (variant === 'gta-vice-city') {
      // For GTA Vice City theme, use theme-specific fonts and colors
      return {
        fontFamily: 'Rajdhani, sans-serif',
        color: '#ffffff'
      }
    }
    
    // Use section-specific styling for consistency
    const themeMode = variant === 'light' ? 'light' as const : null
    return getSectionTypographyStyle('social', 'body', appearanceSettings, false, themeMode)
  }

  const handleImageError = () => {
    setImageError(true)
  }
  
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center transition-all duration-300 hover:scale-105 hover:opacity-80"
      aria-label={`Visit ${displayName}`}
    >
      {/* Icon Container - Instagram Story Style */}
      <div className={`
        relative w-16 h-16 rounded-full flex items-center justify-center
        transition-all duration-200 group-hover:scale-110 shadow-lg
        ${
          variant === 'light' 
            ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300' 
            : variant === 'github'
              ? 'bg-gradient-to-br from-[#21262d] to-[#161b22] border-2 border-[#30363d]'
              : variant === 'gta-vice-city'
                ? 'bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30 backdrop-blur-sm'
                : detectedPlatform 
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                  : 'bg-gradient-to-br from-gray-800 to-gray-900'
        }
      `}>
        {detectedPlatform && !imageError ? (
          (() => {
            const iconContent = getIconContent(detectedPlatform, iconVariant)
            if (isIconSVG(iconContent)) {
              return (
                <div
                  className="w-12 h-12 transition-transform duration-200 transition-colors"
                  style={{
                    color: variant === 'light' ? '#374151' : 
                           variant === 'github' ? '#e6edf3' : 
                           variant === 'gta-vice-city' ? '#ffffff' : platformColor,
                    '--hover-color': variant === 'light' ? '#1f2937' : 
                                   variant === 'github' ? '#58a6ff' : 
                                   variant === 'gta-vice-city' ? '#ffc0cb' : hoverColor
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = variant === 'light' ? '#1f2937' : 
                                                 variant === 'github' ? '#58a6ff' : 
                                                 variant === 'gta-vice-city' ? '#ffc0cb' : hoverColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = variant === 'light' ? '#374151' : 
                                                 variant === 'github' ? '#e6edf3' : 
                                                 variant === 'gta-vice-city' ? '#ffffff' : platformColor
                  }}
                  dangerouslySetInnerHTML={{ __html: iconContent }}
                />
              )
            } else {
              return (
                <Image
                  src={iconContent}
                  alt={`${displayName} icon`}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain transition-transform duration-200"
                />
              )
            }
          })()
        ) : (
          // Fallback icon
          <Share2
            className="w-10 h-10 transition-transform duration-200 transition-colors"
            style={{ 
              color: variant === 'light' ? '#374151' : 
                     variant === 'github' ? '#e6edf3' : 
                     variant === 'gta-vice-city' ? '#ffffff' : platformColor
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = variant === 'light' ? '#1f2937' : 
                                          variant === 'github' ? '#58a6ff' : 
                                          variant === 'gta-vice-city' ? '#ffc0cb' : hoverColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = variant === 'light' ? '#374151' : 
                                         variant === 'github' ? '#e6edf3' : 
                                         variant === 'gta-vice-city' ? '#ffffff' : platformColor
            }}
          />
        )}
      </div>

      {/* Platform Name */}
      <span
        className="mt-3 text-xs font-medium text-center leading-tight"
        style={{
          ...getTypographyStyle(),
          color: variant === 'light' ? '#374151' : 
                 variant === 'github' ? '#e6edf3' : 
                 variant === 'gta-vice-city' ? '#ffffff' : getTypographyStyle().color
        }}
      >
        {displayName}
      </span>
    </button>
  )
}

export function SocialMediaSection({
  socialLinks,
  links,
  onLinkClick,
  variant = 'default',
  className = '',
  appearanceSettings,
  customIcons
}: SocialMediaSectionProps) {
  // Support both socialLinks and links props for backward compatibility
  const actualLinks = socialLinks || links || []
  const handleLinkClick = async (link: UserLinkWithPreview) => {
    try {
      // Call the provided click handler if available
      if (onLinkClick) {
        await onLinkClick(link)
      }
      
      // Open the link
      window.open(link.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error handling social link click:', error)
      toast.error('Failed to open link')
    }
  }
  
  // Don't render if no social links
  if (!actualLinks || actualLinks.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      {/* Category Header - consistent with other sections */}
      {variant === 'github' ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-[12px] overflow-hidden">
          <div className="bg-[#21262d] border-b border-[#30363d] px-4 py-3">
            <div className="flex items-center gap-2">
              <Share2 
                className="w-4 h-4"
                style={{ color: '#2ea043' }}
              />
              <h2 className="text-[14px] font-semibold leading-[18px] font-sharp-grotesk text-[#f0f6fc]">
                Social Media
              </h2>
              <span className="text-[12px] text-[#8b949e] font-sharp-grotesk">
                {actualLinks.length}
              </span>
            </div>
          </div>
          {/* Social Icons Grid */}
          <div className="p-6">
            <div className="flex flex-wrap gap-6 justify-start">
              {actualLinks.map((link) => (
                <SocialIcon
                  key={link.id}
                  link={link}
                  onClick={() => handleLinkClick(link)}
                  variant={variant}
                  appearanceSettings={appearanceSettings}
                />
              ))}
            </div>
            
            {/* Optional: Show count if many links */}
            {actualLinks.length > 8 && (
              <div className="mt-4 text-center text-xs text-[#8b949e]">
                {actualLinks.length} social platforms
              </div>
            )}
          </div>
        </div>
      ) : variant === 'default' ? (
        <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
          <div className="flex items-center gap-3 mb-4">
            <Share2
              className="w-5 h-5"
              style={{ color: '#54E0FF' }}
            />
            <h2
              className="font-medium tracking-[-0.6px] text-white"
              style={{
                fontSize: `${(appearanceSettings?.font_size_heading || 32) * 0.625}px` // 20px when base is 32px
              }}
            >
              Social Media
            </h2>
          </div>
          <div className="flex flex-wrap gap-6 justify-start">
            {actualLinks.map((link) => (
              <SocialIcon
                key={link.id}
                link={link}
                onClick={() => handleLinkClick(link)}
                variant={variant}
                appearanceSettings={appearanceSettings}
              />
            ))}
          </div>
          
          {/* Optional: Show count if many links */}
          {actualLinks.length > 8 && (
            <div className="mt-4 text-center text-xs text-[#7a7a83]">
              {actualLinks.length} social platforms
            </div>
          )}
        </div>
      ) : variant === 'gta-vice-city' ? (
        <>
          {/* Category Header - Outside the card like other sections */}
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-105"
              style={{
                ...getSectionStyles('social', appearanceSettings),
                borderColor: getSectionStyles('social', appearanceSettings).sectionColors.card_border_color,
                backdropFilter: 'blur(8px)', // Slightly less blur for header icon
                WebkitBackdropFilter: 'blur(8px)', // Safari support
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)' // Subtle shadow for depth
              }}
            >
              <Share2 
                className="w-6 h-6" 
                style={{ 
                  color: '#ffffff'  // Force white color to match other category icons
                }} 
              />
            </div>
            <h2 
              className="text-2xl font-bold"
              style={{
                ...getSectionTypographyStyle('social', 'subheading', appearanceSettings),
                textShadow: !appearanceSettings?.text_accent_color ? '0 0 15px rgba(255, 255, 255, 0.3)' : undefined
              }}
            >
              Social Media
            </h2>
          </div>
          
          {/* Social Icons Card - Independent social media section styling */}
          <div 
            className="backdrop-blur-md border rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl"
            style={{
              ...getSectionStyles('social', appearanceSettings),
              borderRadius: `${getSectionStyles('social', appearanceSettings).sectionColors.card_border_radius || 20}px`,
              backdropFilter: 'blur(10px)', // Ensure consistent backdrop blur
              WebkitBackdropFilter: 'blur(10px)', // Safari support
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)' // Enhanced shadow for better depth
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = getSectionStyles('social', appearanceSettings).sectionColors.link_hover_color || 'rgba(255, 255, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = getSectionStyles('social', appearanceSettings).sectionColors.card_border_color || 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex flex-wrap gap-6 justify-start">
              {actualLinks.map((link) => (
                <SocialIcon
                  key={link.id}
                  link={link}
                  onClick={() => handleLinkClick(link)}
                  variant={variant}
                  appearanceSettings={appearanceSettings}
                />
              ))}
            </div>
            
            {/* Optional: Show count if many links */}
            {actualLinks.length > 8 && (
              <div className="mt-4 text-center text-xs text-white/70">
                {actualLinks.length} social platforms
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <Share2 
                className="w-6 h-6"
                style={{ color: '#374151' }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Social Media
              </h2>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap gap-6 justify-start">
              {actualLinks.map((link) => (
                <SocialIcon
                  key={link.id}
                  link={link}
                  onClick={() => handleLinkClick(link)}
                  variant={variant}
                  appearanceSettings={appearanceSettings}
                />
              ))}
            </div>
            
            {/* Optional: Show count if many links */}
            {actualLinks.length > 8 && (
              <div className="mt-4 text-center text-xs text-gray-600">
                {actualLinks.length} social platforms
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Utility component for individual social icon (can be used standalone)
export function SocialMediaIcon({ 
  link, 
  onClick, 
  size = 'md',
  variant = 'default' 
}: {
  link: UserLinkWithPreview
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'light' | 'github'
}) {
  const sizeClasses = {
    sm: { container: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-xs' },
    md: { container: 'w-12 h-12', icon: 'w-8 h-8', text: 'text-xs' },
    lg: { container: 'w-16 h-16', icon: 'w-10 h-10', text: 'text-sm' }
  }
  
  const sizes = sizeClasses[size]
  
  return (
    <SocialIcon 
      link={link} 
      onClick={onClick} 
      variant={variant}
    />
  )
}
