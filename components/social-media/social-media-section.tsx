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

interface SocialMediaSectionProps {
  socialLinks: UserLinkWithPreview[]
  onLinkClick?: (link: UserLinkWithPreview) => void
  variant?: 'default' | 'light' | 'github'
  className?: string
  appearanceSettings?: UserAppearanceSettings | null
}

interface SocialIconProps {
  link: UserLinkWithPreview
  onClick: () => void
  variant: 'default' | 'light' | 'github'
  appearanceSettings?: UserAppearanceSettings | null
}

function SocialIcon({ link, onClick, variant, appearanceSettings }: SocialIconProps) {
  const [imageError, setImageError] = useState(false)
  
  // Detect platform from URL
  const detectedPlatform = detectPlatformFromUrl(link.url)
  const platformConfig = detectedPlatform ? SOCIAL_PLATFORMS[detectedPlatform] : null
  
  // Determine icon source
  const useCustomIcon = link.metadata?.use_custom_icon && link.metadata?.custom_icon_url
  const iconVariant = link.metadata?.icon_variant || (platformConfig?.defaultIcon) || 'default'
  
  // Get display name
  const displayName = platformConfig?.displayName || link.title
  
  // Get platform color - use appearance settings if available, otherwise use platform default
  const platformColor = appearanceSettings?.link_color || platformConfig?.color || '#666666'
  const hoverColor = appearanceSettings?.link_hover_color || platformColor
  
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
      default:
        return {
          container: 'hover:bg-[#28282b]/50 border-[#33373b]',
          text: 'text-white',
          icon: 'bg-[#1a1a1c] border-[#33373b]'
        }
    }
  }
  
  const themeStyles = getThemeStyles()

  // Get typography styles from appearance settings
  const getTypographyStyle = (): React.CSSProperties => {
    if (!appearanceSettings) {
      return { fontFamily: 'Sharp Grotesk, system-ui, sans-serif' }
    }

    const fontFamily = getFontFamilyWithFallbacks(appearanceSettings.secondary_font || 'Sharp Grotesk')
    return {
      fontFamily,
      color: appearanceSettings.secondary_text_color || undefined
    }
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
        ${detectedPlatform ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-gradient-to-br from-gray-800 to-gray-900'}
      `}>
        {useCustomIcon && !imageError ? (
          <Image
            src={link.metadata.custom_icon_url}
            alt={`${displayName} icon`}
            width={48}
            height={48}
            className="w-12 h-12 object-cover rounded-full"
            onError={handleImageError}
          />
        ) : detectedPlatform && !imageError ? (
          (() => {
            const iconContent = getIconContent(detectedPlatform, iconVariant)
            if (isIconSVG(iconContent)) {
              return (
                <div
                  className="w-12 h-12 transition-transform duration-200 transition-colors"
                  style={{
                    color: platformColor,
                    '--hover-color': hoverColor
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = hoverColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = platformColor
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
            style={{ color: platformColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = hoverColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = platformColor
            }}
          />
        )}
      </div>

      {/* Platform Name */}
      <span
        className="mt-3 text-xs font-medium text-center leading-tight"
        style={getTypographyStyle()}
      >
        {displayName}
      </span>
    </button>
  )
}

export function SocialMediaSection({
  socialLinks,
  onLinkClick,
  variant = 'default',
  className = '',
  appearanceSettings
}: SocialMediaSectionProps) {
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
  if (!socialLinks || socialLinks.length === 0) {
    return null
  }
  
  // Theme-specific container styles
  const getContainerStyles = () => {
    switch (variant) {
      case 'light':
        return 'bg-white border-gray-200 shadow-sm'
      case 'github':
        return 'bg-[#0d1117] border-[#30363d] shadow-[0px_8px_24px_rgba(0,0,0,0.4)]'
      default:
        return 'glassmorphic shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]'
    }
  }
  
  const containerStyles = getContainerStyles()
  
  // Theme-specific header styles
  const getHeaderStyles = () => {
    switch (variant) {
      case 'light':
        return {
          icon: 'text-blue-600',
          title: 'text-gray-900',
          description: 'text-gray-600'
        }
      case 'github':
        return {
          icon: 'text-[#58a6ff]',
          title: 'text-[#f0f6fc]',
          description: 'text-[#8b949e]'
        }
      default:
        return {
          icon: 'text-[#54E0FF]',
          title: 'text-white',
          description: 'text-[#7a7a83]'
        }
    }
  }
  
  const headerStyles = getHeaderStyles()

  // Get typography styles from appearance settings
  const getTitleStyle = (): React.CSSProperties => {
    if (!appearanceSettings) {
      return { fontFamily: 'Sharp Grotesk, system-ui, sans-serif' }
    }

    const fontFamily = getFontFamilyWithFallbacks(appearanceSettings.primary_font || 'Sharp Grotesk')
    return {
      fontFamily,
      color: appearanceSettings.primary_text_color || undefined
    }
  }

  const getDescriptionStyle = (): React.CSSProperties => {
    if (!appearanceSettings) {
      return { fontFamily: 'Sharp Grotesk, system-ui, sans-serif' }
    }

    const fontFamily = getFontFamilyWithFallbacks(appearanceSettings.secondary_font || 'Sharp Grotesk')
    return {
      fontFamily,
      color: appearanceSettings.secondary_text_color || undefined
    }
  }

  return (
    <div className={`rounded-[20px] p-6 border ${containerStyles} ${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <Share2 className={`w-5 h-5 ${headerStyles.icon}`} />
        <div>
          <h2
            className="text-[20px] font-medium leading-[24px] tracking-[-0.6px]"
            style={getTitleStyle()}
          >
            Social Media
          </h2>
          <p
            className="text-[14px] font-light leading-[20px] tracking-[-0.42px] mt-1"
            style={getDescriptionStyle()}
          >
            Connect with me on social platforms
          </p>
        </div>
      </div>
      
      {/* Social Icons Grid - Instagram Story Style */}
      <div className="flex flex-wrap gap-6 justify-start">
        {socialLinks.map((link) => (
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
      {socialLinks.length > 8 && (
        <div className={`mt-4 text-center text-xs ${headerStyles.description}`}>
          {socialLinks.length} social platforms
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
