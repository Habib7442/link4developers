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
import { ApiLinkService } from '@/lib/services/api-link-service'

interface SocialMediaSectionProps {
  links?: UserLinkWithPreview[]
  socialLinks?: UserLinkWithPreview[]
  onLinkClick?: (link: UserLinkWithPreview) => void
  variant?: 'default' | 'light' | 'github' | 'gta-vice-city' | 'cyberpunk' | 'sunset' | 'dark'
  className?: string
  appearanceSettings?: UserAppearanceSettings | null
  customIcons?: Record<string, unknown>
  getTypographyStyle?: (type: 'heading' | 'subheading' | 'body' | 'accent' | 'link') => React.CSSProperties
}

interface SocialIconProps {
  link: UserLinkWithPreview
  onClick: () => void
  variant: 'default' | 'light' | 'github' | 'gta-vice-city' | 'cyberpunk' | 'sunset' | 'dark'
  appearanceSettings?: UserAppearanceSettings | null
}

function SocialIcon({ link, onClick, variant, appearanceSettings }: SocialIconProps) {
  const [imageError, setImageError] = useState(false)
  
  // Detect platform from URL
  const detectedPlatform = detectPlatformFromUrl(link.url)
  const platformConfig = detectedPlatform ? SOCIAL_PLATFORMS[detectedPlatform] : null
  
  // Check for custom icon settings
  const useCustomIcon = link.use_custom_icon || link.icon_selection_type === 'upload' || link.icon_selection_type === 'url'
  const iconVariant = link.icon_variant || (platformConfig?.defaultIcon || 'default')
  
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
    
    if (variant === 'github') {
      // For GitHub Focus theme, use white icon color to match other section icons
      return {
        platformColor: '#ffffff', // White icon color to match other section icons
        hoverColor: appearanceSettings?.link_hover_color || '#58A6FF' // Use appearance setting or default GitHub hover blue
      }
    }
    
    if (variant === 'gta-vice-city') {
      // For GTA Vice City theme, use consistent neon colors
      return {
        platformColor: '#ffffff', // White for all icons to match other section icons
        hoverColor: '#ffc0cb' // Pink for hover to match theme
      }
    }
    
    if (variant === 'cyberpunk') {
      // For Cyberpunk theme, use neon colors
      return {
        platformColor: '#FF00FF', // Neon magenta for all icons (matches other section icons)
        hoverColor: '#00F5FF' // Neon cyan for hover (swapped colors)
      }
    }
    
    if (variant === 'sunset') {
      // For Sunset theme, use warm colors per user specifications
      return {
        platformColor: '#FF6F61', // Coral for icons
        hoverColor: '#E55B50', // Darker coral for hover
        backgroundColor: 'bg-white/90', // Increased opacity for better contrast
        textColor: 'text-[#2C2C2C] font-medium' // Dark charcoal text with medium font weight
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
          container: 'hover:bg-gray-50 border-[#E5E7EB]',
          text: 'text-[#374151] font-inter',
          icon: 'bg-white border-[#E5E7EB] shadow-[0_2px_6px_rgba(0,0,0,0.08)]'
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
          text: 'text-white text-xs', // Ensure small text size to match other sections
          icon: 'bg-white/10 border-white/20'
        }
      case 'cyberpunk':
        return {
          container: 'hover:bg-[#00F5FF]/20 border-[#00F5FF]/30',
          text: 'text-[#00F5FF] font-orbitron text-xs', // Ensure small text size and consistent font/color
          icon: 'bg-[#1A1A1A] border-[#00F5FF]/30'
        }
      case 'sunset':
        return {
          container: 'hover:bg-orange-50 border-orange-200',
          text: 'text-[#2C2C2C] font-medium',
          icon: 'bg-white/90 border-orange-200 shadow-[0_4px_15px_rgba(255,100,70,0.15)]'
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
  const getTypographyStyle = (type: 'heading' | 'body' | 'subheading' = 'body'): React.CSSProperties => {
    // If appearance settings are provided, use them for consistent styling
    if (appearanceSettings) {
      return getSectionTypographyStyle('social', type, appearanceSettings);
    }

    // Theme-specific fallbacks
    if (variant === 'light') {
      // For Minimalist Light theme, ensure text is dark and visible
      if (type === 'heading') {
        return { 
          fontFamily: 'Roboto Mono, monospace',
          color: '#374151' // Neutral gray for good contrast on light background
        }
      }
      return { 
        fontFamily: 'Inter, sans-serif',
        color: '#374151' // Neutral gray for good contrast on light background
      }
    }
    
    if (variant === 'gta-vice-city') {
      // For GTA Vice City theme, use theme-specific fonts and colors
      if (type === 'heading') {
        return {
          fontFamily: 'Rajdhani, sans-serif',
          color: '#ffffff',
          fontSize: '13px' // Small text size to match other sections
        }
      }
      return {
        fontFamily: 'Rajdhani, sans-serif',
        color: '#ffffff',
        fontSize: '13px' // Small text size to match other sections
      }
    }
    
    if (variant === 'cyberpunk') {
      // For Cyberpunk theme, use futuristic fonts and neon colors with consistent sizing
      if (type === 'heading' || type === 'body') {
        return {
          fontFamily: 'Orbitron, sans-serif',
          color: '#FF00FF', // Neon magenta to match section headers
          fontSize: '13px', // Small text size to match other sections
          textShadow: '0 0 5px rgba(255, 0, 255, 0.6)' // Neon glow
        }
      }
      return {
        fontFamily: 'Orbitron, sans-serif',
        color: '#FF00FF', // Neon magenta to match section headers
        fontSize: '13px', // Small text size to match other sections
        textShadow: '0 0 5px rgba(255, 0, 255, 0.6)' // Neon glow
      }
    }
    
    if (variant === 'sunset') {
      // For Sunset theme, use elegant fonts per user specifications
      if (type === 'heading') {
        return {
          fontFamily: 'Poppins, sans-serif',
          color: '#FF6F61' // Bright coral for text
        }
      }
      return {
        fontFamily: 'Poppins, sans-serif',
        color: '#FF6F61' // Bright coral for text
      }
    }
    
    // Use section-specific styling for consistency
    return getSectionTypographyStyle('social', 'body', appearanceSettings)
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
        relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
        transition-all duration-200 group-hover:scale-110 shadow-lg
        ${
          variant === 'light' 
            ? 'bg-white border-2 border-[#E5E7EB] shadow-[0_2px_6px_rgba(0,0,0,0.08)]' 
            : variant === 'github'
              ? 'bg-gradient-to-br from-[#21262d] to-[#161b22] border-2 border-[#30363d]'
              : variant === 'gta-vice-city'
                ? 'bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30 backdrop-blur-sm'
                : variant === 'cyberpunk'
                  ? 'bg-gradient-to-br from-[#00F5FF]/20 to-[#00F5FF]/10 border-2 border-[#00F5FF]/30 backdrop-blur-sm'
                  : variant === 'sunset'
                    ? 'bg-gradient-to-br from-white to-white border-2 border-[#FF6F61]'
                    : detectedPlatform 
                      ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                      : 'bg-gradient-to-br from-gray-800 to-gray-900'
        }
      `}>
        {/* Render custom uploaded icon */}
        {link.icon_selection_type === 'upload' && link.uploaded_icon_url && !imageError ? (
          <Image
            src={link.uploaded_icon_url}
            alt={`${link.title} icon`}
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-200"
            onError={handleImageError}
          />
        ) : link.icon_selection_type === 'url' && link.custom_icon_url && !imageError ? (
          <Image
            src={link.custom_icon_url}
            alt={`${link.title} icon`}
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-200"
            onError={handleImageError}
          />
        ) : detectedPlatform && !imageError ? (
          (() => {
            const iconContent = getIconContent(detectedPlatform, iconVariant)
            if (isIconSVG(iconContent)) {
              return (
                <div
                  className="w-10 h-10 md:w-12 md:h-12 transition-transform duration-200 transition-colors"
                  style={{
                    color: variant === 'light' ? '#374151' : 
                           variant === 'github' ? platformColor : 
                           variant === 'gta-vice-city' ? '#ffffff' : 
                           variant === 'cyberpunk' ? '#FF00FF' : 
                           variant === 'sunset' ? '#FF6F61' : platformColor,
                    '--hover-color': variant === 'light' ? '#1f2937' : 
                                   variant === 'github' ? hoverColor : 
                                   variant === 'gta-vice-city' ? '#ffc0cb' : 
                                   variant === 'cyberpunk' ? '#FF00FF' : 
                                   variant === 'sunset' ? '#E55B50' : hoverColor
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = variant === 'light' ? '#1f2937' : 
                                                 variant === 'github' ? hoverColor : 
                                                 variant === 'gta-vice-city' ? '#ffc0cb' : 
                                                 variant === 'cyberpunk' ? '#FF00FF' : 
                                                 variant === 'sunset' ? '#E55B50' : hoverColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = variant === 'light' ? '#374151' : 
                                                 variant === 'github' ? platformColor : 
                                                 variant === 'gta-vice-city' ? '#ffffff' : 
                                                 variant === 'cyberpunk' ? '#00F5FF' : 
                                                 variant === 'sunset' ? '#FF6F61' : platformColor
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
                  className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-200"
                />
              )
            }
          })()
        ) : (
          // Fallback icon
          <Share2
            className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-200 transition-colors"
            style={{ 
              color: variant === 'light' ? '#374151' : 
                     variant === 'github' ? platformColor : 
                     variant === 'gta-vice-city' ? '#ffffff' : 
                     variant === 'cyberpunk' ? '#FF00FF' : 
                     variant === 'sunset' ? '#FF6F61' : platformColor
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = variant === 'light' ? '#1f2937' : 
                                          variant === 'github' ? hoverColor : 
                                          variant === 'gta-vice-city' ? '#ffc0cb' : 
                                          variant === 'cyberpunk' ? '#FF00FF' : 
                                          variant === 'sunset' ? '#E55B50' : hoverColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = variant === 'light' ? '#374151' : 
                                         variant === 'github' ? platformColor : 
                                         variant === 'gta-vice-city' ? '#ffffff' : 
                                         variant === 'cyberpunk' ? '#00F5FF' : 
                                         variant === 'sunset' ? '#FF6F61' : platformColor
            }}
          />
        )}
      </div>

      {/* Platform Name */}
      <span
        className={`mt-2 md:mt-3 text-xs font-medium text-center leading-tight ${variant === 'cyberpunk' ? 'font-orbitron' : ''}`}
        style={{
          ...getTypographyStyle('body'),
          ...(variant === 'cyberpunk' && {
            color: '#FF00FF', // Force magenta color for cyberpunk theme
            textShadow: '0 0 5px rgba(255, 0, 255, 0.6)'
          })
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
  customIcons,
  getTypographyStyle
}: SocialMediaSectionProps) {
  // Support both socialLinks and links props for backward compatibility
  const actualLinks = socialLinks || links || []
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
      console.log('Social link click tracked:', result);
    } catch (error) {
      console.error('Error tracking social link click:', error);
    }

    // Call the provided click handler if available
    if (onLinkClick) {
      await onLinkClick(link);
    }
    
    // Open the link
    window.open(link.url, '_blank', 'noopener,noreferrer');
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
              <div className="p-1 rounded bg-[#238636]/20 border border-[#238636]/30">
                <Share2 
                  className="w-3.5 h-3.5" 
                  style={{ color: '#ffffff' }}
                />
              </div>
              <h2 className="text-[13px] font-semibold leading-[16px] font-inter" style={getTypographyStyle ? getTypographyStyle('subheading') : getSectionTypographyStyle('social', 'subheading', appearanceSettings)}>
                Social Media
              </h2>
              <span className="text-[11px] font-inter ml-auto" style={getTypographyStyle ? getTypographyStyle('accent') : getSectionTypographyStyle('social', 'accent', appearanceSettings)}>
                {actualLinks.length}
              </span>
            </div>
          </div>
          {/* Social Icons Grid */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
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
              <div className="mt-4 text-center text-xs"
                   style={getTypographyStyle ? getTypographyStyle('accent') : getSectionTypographyStyle('social', 'accent', appearanceSettings)}>
                {actualLinks.length} social platforms
              </div>
            )}
          </div>
        </div>
      ) : variant === 'default' ? (
        <div className="glassmorphic rounded-[20px] p-4 sm:p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
          <div className="flex items-center gap-3 mb-4">
            <Share2
              className="w-5 h-5"
              style={{ color: '#54E0FF' }}
            />
            <h2
              className="font-medium tracking-[-0.6px]"
              style={{
                ...getSectionTypographyStyle('social', 'heading', appearanceSettings),
                fontSize: `${(appearanceSettings?.font_size_heading || 32) * 0.625}px` // 20px when base is 32px
              }}
            >
              Social Media
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
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
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div 
              className="p-2 sm:p-3 rounded-xl backdrop-blur-sm border"
              style={{
                // Use the same background styling as other category headers
                backgroundColor: appearanceSettings?.card_background_color || 'rgba(0, 0, 0, 0.20)',
                borderColor: getSectionStyles('social', appearanceSettings).sectionColors.card_border_color,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Share2 
                className="w-5 h-5 sm:w-6 sm:h-6" 
                style={{ 
                  color: '#ffffff'  // Force white color to match other category icons
                }} 
              />
            </div>
            <h2 
              className="text-xl sm:text-2xl font-bold"
              style={{
                ...getSectionTypographyStyle('social', 'subheading', appearanceSettings),
                textShadow: !appearanceSettings?.text_accent_color ? '0 0 15px rgba(255, 255, 255, 0.3)' : undefined
              }}
            >
              Social Media
            </h2>
          </div>
          
          {/* Social Icons Card - Consistent dark background with other sections */}
          <div 
            className="backdrop-blur-md border rounded-2xl p-4 sm:p-6 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl"
            style={{
              // Extract styles explicitly to ensure proper dark background consistency
              backgroundColor: appearanceSettings?.card_background_color || 'rgba(0, 0, 0, 0.20)',
              borderColor: getSectionStyles('social', appearanceSettings).sectionColors.card_border_color,
              borderRadius: `${getSectionStyles('social', appearanceSettings).sectionColors.card_border_radius || 20}px`,
              borderWidth: `${getSectionStyles('social', appearanceSettings).sectionColors.card_border_width || 1}px`,
              color: appearanceSettings?.text_primary_color || '#ffffff',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = getSectionStyles('social', appearanceSettings).sectionColors.link_hover_color || 'rgba(255, 255, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = getSectionStyles('social', appearanceSettings).sectionColors.card_border_color || 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
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
              <div 
                className="mt-4 text-center text-xs"
                style={getSectionTypographyStyle('social', 'accent', appearanceSettings)}
              >
                {actualLinks.length} social platforms
              </div>
            )}
          </div>
        </>
      ) : variant === 'sunset' ? (
        <>
          {/* Category Header - Outside the card like other sections */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div 
              className="p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-orange-200"
            >
              <Share2 
                className="w-5 h-5 sm:w-6 sm:h-6" 
                style={{ 
                  color: '#FF6F61'  // Coral color to match sunset theme
                }} 
              />
            </div>
            <h2 
              className="text-xl sm:text-2xl font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-orange-200"
              style={getTypographyStyle ? getTypographyStyle('heading') : getSectionTypographyStyle('social', 'heading', appearanceSettings)}
            >
              Social Media
            </h2>
          </div>
          
          {/* Social Icons Card - Consistent with other section cards */}
          <div 
            className="bg-[#FFE9DC] border border-white/60 rounded-3xl p-4 sm:p-6 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(255,100,70,0.2)] shadow-[0_8px_30px_rgba(255,100,70,0.2)]"
          >
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
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
              <div className="mt-4 text-center text-xs font-medium"
                   style={getTypographyStyle ? getTypographyStyle('accent') : getSectionTypographyStyle('social', 'accent', appearanceSettings)}>
                {actualLinks.length} social platforms
              </div>
            )}
          </div>
        </>
      ) : variant === 'light' ? (
        <>
          {/* Category Header - Outside the card like other sections */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div 
              className="p-2 sm:p-3 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
            >
              <Share2 
                className="w-5 h-5 sm:w-6 sm:h-6" 
                style={{ 
                  color: '#374151'  // Neutral gray to match Minimalist Light theme
                }} 
              />
            </div>
            <h2 
              className="text-xl sm:text-2xl font-semibold"
              style={getTypographyStyle ? getTypographyStyle('heading') : getSectionTypographyStyle('social', 'heading', appearanceSettings)}
            >
              Social Media
            </h2>
          </div>
          
          {/* Social Icons Card - Consistent with Minimalist Light theme */}
          <div 
            className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
          >
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
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
              <div className="mt-4 text-center text-xs font-inter font-medium"
                   style={getTypographyStyle ? getTypographyStyle('accent') : getSectionTypographyStyle('social', 'accent', appearanceSettings)}>
                {actualLinks.length} social platforms
              </div>
            )}
          </div>
        </>
      ) : variant === 'cyberpunk' ? (
        <>
          {/* Category Header - Outside the card like other sections */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div 
              className="p-2 sm:p-3 rounded-xl bg-[#FF00FF]/20 border border-[#FF00FF]/30"
              style={{ boxShadow: '0 0 10px rgba(255, 0, 255, 0.3)' }}
            >
              <Share2 
                className="w-5 h-5 sm:w-6 sm:h-6" 
                style={{ 
                  color: '#FF00FF'  // Neon magenta to match cyberpunk theme header
                }} 
              />
            </div>
            <h2 
              className="text-xl sm:text-2xl font-bold font-orbitron"
              style={{ 
                color: '#FF00FF', // Override to ensure magenta color matching other sections
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 8px rgba(255, 0, 255, 0.6)' 
              }}
            >
              Social Media
            </h2>
          </div>
          
          {/* Social Icons Card - Consistent with cyberpunk neon theme */}
          <div 
            className="bg-[#1A1A1A] border border-[#00F5FF]/30 rounded-2xl p-4 sm:p-6 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(0,245,255,0.3)]"
            style={{ boxShadow: '0 0 15px rgba(0, 245, 255, 0.2), 0 0 30px rgba(0, 245, 255, 0.1)' }}
          >
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
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
              <div 
                className="mt-4 text-center text-xs font-orbitron"
                style={{ 
                  color: '#00F5FF',
                  textShadow: '0 0 5px rgba(0, 245, 255, 0.6)' 
                }}
              >
                {actualLinks.length} social platforms
              </div>
            )}
          </div>
        </>
      ) : variant === 'dark' ? (
        <>
          {/* Category Header - Outside the card like other sections */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div 
              className="p-2 sm:p-3 rounded-xl backdrop-blur-sm border"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.20)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px'
              }}
            >
              <Share2 
                className="w-5 h-5 sm:w-6 sm:h-6" 
                style={{ 
                  color: '#54E0FF'  // Developer Dark theme accent color
                }} 
              />
            </div>
            <h2 
              className="font-medium tracking-[-0.6px]"
              style={getTypographyStyle ? getTypographyStyle('heading') : getSectionTypographyStyle('social', 'heading', appearanceSettings)}
            >
              Social Media
            </h2>
          </div>
          
          {/* Social Icons Card - Consistent with Developer Dark theme */}
          <div 
            className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.20)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '20px'
            }}
          >
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
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
              <div className="mt-4 text-center text-xs font-light tracking-[-0.48px]"
                   style={getTypographyStyle ? getTypographyStyle('accent') : getSectionTypographyStyle('social', 'accent', appearanceSettings)}>
                {actualLinks.length} social platforms
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mb-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div className="p-2 sm:p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <Share2 
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: '#374151' }}
              />
            </div>
            <div>
              <h2 
                className="text-lg sm:text-xl font-bold"
                style={getTypographyStyle ? getTypographyStyle('heading') : getSectionTypographyStyle('social', 'heading', appearanceSettings)}
              >
                Social Media
              </h2>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
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
              <div className="mt-4 text-center text-xs"
                   style={getTypographyStyle ? getTypographyStyle('accent') : getSectionTypographyStyle('social', 'accent', appearanceSettings)}>
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
