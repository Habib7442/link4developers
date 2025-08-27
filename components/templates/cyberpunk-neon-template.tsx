'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User, UserAppearanceSettings } from '@/lib/supabase'
import { LinkCategory } from '@/lib/domain/entities'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { Button } from '@/components/ui/button'
import { RichLinkPreview } from '@/components/rich-preview/rich-link-preview'
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
  User as UserIcon,
  Link
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryIconService, CategoryIconConfig } from '@/lib/services/category-icon-service'
import { CategoryIconPreview } from '@/components/category-icons/category-icon-preview'

// Separate component for social media icons with proper error handling
function SocialMediaIcon({ link, onClick }: { link: UserLinkWithPreview; onClick: () => void }) {
  const [imageError, setImageError] = useState(false);
  
  // Added for debugging - log the link properties to console
  useEffect(() => {
    if (link.title === 'Linkedin' || link.title === 'LinkedIn') {
      console.log('LinkedIn link properties:', {
        title: link.title,
        icon_selection_type: link.icon_selection_type,
        uploaded_icon_url: link.uploaded_icon_url,
        custom_icon_url: link.custom_icon_url,
        platform_detected: link.platform_detected
      });
    }
  }, [link]);
  
  const handleImageError = () => {
    console.log(`Image error for ${link.title}`, link.uploaded_icon_url);
    setImageError(true);
  };

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center transition-all duration-300 hover:scale-105 hover:opacity-80"
      aria-label={`Visit ${link.title}`}
    >
      {/* Icon Container */}
      <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 shadow-lg bg-gradient-to-br from-white/20 to-white/10 border-2 border-white/30 backdrop-blur-sm">
        {link.icon_selection_type === 'upload' && link.uploaded_icon_url && !imageError ? (
          <Image
            src={link.uploaded_icon_url}
            alt={`${link.title} icon`}
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-200"
            onError={handleImageError}
            unoptimized={true}
          />
        ) : link.icon_selection_type === 'url' && link.custom_icon_url && !imageError ? (
          <Image
            src={link.custom_icon_url}
            alt={`${link.title} icon`}
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-200"
            onError={handleImageError}
            unoptimized={true}
          />
        ) : link.platform_detected === 'linkedin' ? (
          // Special handling for LinkedIn
          <Image
            src="/icons/linkedin/linkedin1.png"
            alt="LinkedIn icon"
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-200"
            unoptimized={true}
          />
        ) : (
          <Share2
            className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-200 transition-colors"
            style={{ color: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#00F5FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'white';
            }}
          />
        )}
      </div>

      {/* Platform Name */}
      <span className="mt-2 md:mt-3 text-xs font-medium text-center leading-tight font-orbitron"
        style={{
          color: '#FF00FF',
          textShadow: '0 0 5px rgba(255, 0, 255, 0.6)'
        }}
      >
        {link.title}
      </span>
    </button>
  );
}

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
    const CustomIconComponent = () => <CategoryIconPreview config={customIcon} size={20} />;
    CustomIconComponent.displayName = `CustomIconComponent-${category}`;
    return CustomIconComponent;
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
        heading: { fontFamily: 'Orbitron, sans-serif', fontSize: '28px', color: '#00F5FF', lineHeight: '1.2', textShadow: '0 0 10px #00F5FF, 0 0 20px #00F5FF' }, // Bright cyan with glow
        subheading: { fontFamily: 'Orbitron, sans-serif', fontSize: '16px', color: '#39FF14', lineHeight: '1.4', textShadow: '0 0 5px #39FF14' }, // Neon green with glow
        body: { fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#D1D5DB', lineHeight: '1.5' }, // Light gray
        accent: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#9CA3AF', lineHeight: '1.3' }, // Muted gray
        link: { fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#FF00FF', lineHeight: '1.5', textShadow: '0 0 5px #FF00FF' } // Magenta neon with glow
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
        style.fontSize = `${appearanceSettings.font_size_heading ? appearanceSettings.font_size_heading * 0.8 : 28}px`
        style.lineHeight = `${appearanceSettings.line_height_heading || 1.2}`
        break
      case 'subheading':
        style.fontSize = `${appearanceSettings.font_size_subheading ? appearanceSettings.font_size_subheading * 0.85 : 16}px`
        style.lineHeight = `${appearanceSettings.line_height_base || 1.4}`
        break
      case 'body':
      case 'accent':
      case 'link':
        style.fontSize = `${appearanceSettings.font_size_base ? appearanceSettings.font_size_base * 0.9 : 16}px`
        style.lineHeight = `${appearanceSettings.line_height_base ? appearanceSettings.line_height_base * 0.95 : 1.5}`
        break
    }

    // Apply colors - Respect user-selected appearance settings
    switch (type) {
      case 'heading':
        style.color = appearanceSettings.text_primary_color || '#00F5FF' // Use user-selected primary text color
        style.textShadow = appearanceSettings.text_primary_color 
          ? `0 0 10px ${appearanceSettings.text_primary_color}, 0 0 20px ${appearanceSettings.text_primary_color}` 
          : '0 0 10px #00F5FF, 0 0 20px #00F5FF' // Apply glow effect based on text color
        break
      case 'subheading':
        style.color = appearanceSettings.text_accent_color || '#39FF14' // Use user-selected accent color
        style.textShadow = appearanceSettings.text_accent_color 
          ? `0 0 5px ${appearanceSettings.text_accent_color}` 
          : '0 0 5px #39FF14' // Apply glow effect based on accent color
        break
      case 'body':
        style.color = appearanceSettings.text_secondary_color || '#D1D5DB' // Use user-selected secondary text color
        break
      case 'accent':
        style.color = appearanceSettings.text_accent_color || '#9CA3AF' // Use user-selected accent color
        break
      case 'link':
        if (isHover) {
          style.color = appearanceSettings.link_hover_color || '#00F5FF' // Use user-selected link hover color
          style.textShadow = appearanceSettings.link_hover_color 
            ? `0 0 8px ${appearanceSettings.link_hover_color}` 
            : '0 0 8px #00F5FF' // Apply glow effect based on hover color
        } else {
          style.color = appearanceSettings.link_color || '#FF00FF' // Use user-selected link color
          style.textShadow = appearanceSettings.link_color 
            ? `0 0 5px ${appearanceSettings.link_color}` 
            : '0 0 5px #FF00FF' // Apply glow effect based on link color
        }
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

    // For now, just open the link (analytics will be handled by the new clean architecture)
    window.open(link.url, '_blank', 'noopener,noreferrer');
  }

  // Wrapper function for social media link clicks
  const handleSocialLinkClick = (link: UserLinkWithPreview) => {
    handleLinkClick(link);
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
      {/* Cyberpunk Neon effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,245,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,255,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(255,0,255,0.02)_2px,transparent_2px)] bg-[size:40px_40px] opacity-50"></div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-6 relative z-10 space-y-6">
        
        {/* Profile Header - Separated from other sections */}
        <div 
          className="bg-[#1E1E1E] border-2 border-[#FF00FF]/30 rounded-2xl overflow-hidden relative shadow-[0_0_20px_rgba(255,0,255,0.3)]"
          style={{ 
            ...getSectionStyles('profile', appearanceSettings),
            boxShadow: '0 0 15px rgba(255, 0, 255, 0.2), 0 0 30px rgba(255, 0, 255, 0.1)' 
          }}
        >
          {/* Category Header */}
          <div 
            className="bg-gradient-to-r from-[#FF00FF]/10 to-[#FF00FF]/10 border-b-2 px-5 py-3 relative overflow-hidden"
            style={{ borderColor: getSectionStyles('profile', appearanceSettings).borderColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF00FF]/5 to-[#FF00FF]/5"></div>
            <div className="relative z-10 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#FF00FF]/20 border"
                   style={{ 
                     borderColor: getSectionStyles('profile', appearanceSettings).borderColor,
                     boxShadow: `0 0 10px ${appearanceSettings?.link_color ? appearanceSettings.link_color + '33' : 'rgba(255, 0, 255, 0.3)'}` 
                   }}>
                <UserIcon className="w-4 h-4" style={{ color: 'white' }} />
              </div>
              <h2 className="text-[18px] font-bold leading-[1.3] font-orbitron"
                  style={{
                    color: appearanceSettings?.link_color || '#FF00FF',
                    textShadow: appearanceSettings?.link_color 
                      ? `0 0 8px ${appearanceSettings.link_color}66` 
                      : '0 0 8px rgba(255, 0, 255, 0.6)'
                  }}>
                Profile
              </h2>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="p-3 md:p-5">
            <div className="flex flex-col md:flex-row gap-5 relative z-10">
            
            {/* Left Side - Avatar and Basic Info */}
            <div className="flex-shrink-0 w-full md:w-auto flex md:block justify-start">
              {user.avatar_url && user.avatar_url.trim() !== '' ? (
                <div className="relative">
                  <Image
                    src={user.avatar_url}
                    alt={`${user.full_name || user.github_username}'s avatar`}
                    width={80}
                    height={80}
                    className="w-[80px] h-[80px] rounded-full object-cover border-2 border-[#FF00FF]"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-[#FF00FF] animate-pulse" 
                       style={{ boxShadow: '0 0 15px rgba(255, 0, 255, 0.6)' }}></div>
                </div>
              ) : (
                <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-r from-[#00F5FF] to-[#FF00FF] flex items-center justify-center border-2 border-[#FF00FF]"
                     style={{ boxShadow: '0 0 20px rgba(255, 0, 255, 0.6)' }}>
                  <span className="text-[32px] font-bold text-white font-orbitron">
                    {(user.full_name || user.github_username || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side - Profile Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-[28px] font-bold leading-[1.2] tracking-[-0.5px] mb-2"
                      style={getTypographyStyle('heading')}>
                    {user.full_name || user.github_username || 'Developer'}
                  </h1>
                  
                  {user.github_username && (
                    <p className="text-[14px] font-medium leading-[1.4] mb-2"
                       style={getTypographyStyle('subheading')}>
                      @{user.github_username}
                    </p>
                  )}

                  {user.profile_title && (
                    <p className="text-[14px] font-semibold leading-[1.4] mb-2"
                       style={getTypographyStyle('subheading')}>
                      {user.profile_title}
                    </p>
                  )}

                  {/* Meta Information - MOVED UP as requested */}
                  <div className="flex flex-wrap items-center gap-3 text-[12px] mb-3"
                      style={getTypographyStyle('body')}>
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" style={{ color: appearanceSettings?.text_secondary_color || '#D1D5DB' }} />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.company && (
                      <div className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" style={{ color: appearanceSettings?.text_secondary_color || '#D1D5DB' }} />
                        <span>{user.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" style={{ color: appearanceSettings?.text_secondary_color || '#D1D5DB' }} />
                      <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-[14px] leading-[1.5] mb-3"
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
                </div>

                {/* Share Button - Cyberpunk Neon Gradient */}
                <Button
                  onClick={handleShare}
                  className="w-full md:w-auto bg-gradient-to-r from-[#00F5FF] to-[#FF00FF] hover:from-[#FF00FF] hover:to-[#00F5FF] text-white border-0 px-5 py-2.5 rounded-xl font-bold text-[14px] relative overflow-hidden group font-orbitron"
                  style={{ boxShadow: '0 0 20px rgba(0, 245, 255, 0.4), 0 0 40px rgba(255, 0, 255, 0.2)' }}
                >
                  <span className="relative z-10 flex items-center">
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
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* All Categories Section - Respecting Category Order - Each section now separate */}
        {hasLinks ? (
          <div className="space-y-6">
            {categoryOrder.map((category) => {
              const categoryLinks = links[category] || []
              if (categoryLinks.length === 0) return null

              // Handle social media category specially
              if (category === 'social') {
                return (
                  <div 
                    key={category} 
                    className="bg-[#1E1E1E] border-2 border-[#FF00FF]/30 rounded-2xl overflow-hidden relative shadow-[0_0_20px_rgba(255,0,255,0.3)]"
                    style={{ 
                      ...getSectionStyles(category, appearanceSettings),
                      boxShadow: '0 0 15px rgba(0, 245, 255, 0.2), 0 0 30px rgba(0, 245, 255, 0.1)' 
                    }}
                  >
                    {/* Category Header */}
                    <div 
                      className="bg-gradient-to-r from-[#FF00FF]/10 to-[#FF00FF]/10 border-b-2 px-5 py-3 relative overflow-hidden"
                      style={{ borderColor: getSectionStyles(category, appearanceSettings).borderColor }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FF00FF]/5 to-[#FF00FF]/5"></div>
                      <div className="relative z-10 flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#FF00FF]/20 border"
                             style={{ 
                               borderColor: getSectionStyles(category, appearanceSettings).borderColor,
                               boxShadow: `0 0 10px ${appearanceSettings?.link_color ? appearanceSettings.link_color + '33' : 'rgba(255, 0, 255, 0.3)'}` 
                             }}>
                          <Share2 className="w-4 h-4" style={{ color: 'white' }} />
                        </div>
                        <h2 className="text-[18px] font-bold leading-[1.3] font-orbitron"
                            style={{
                              color: appearanceSettings?.link_color || '#FF00FF',
                              textShadow: appearanceSettings?.link_color 
                                ? `0 0 8px ${appearanceSettings.link_color}66` 
                                : '0 0 8px rgba(255, 0, 255, 0.6)'
                            }}>
                          Social Media
                        </h2>
                        <span className="text-[12px] font-inter font-medium"
                             style={{ 
                               color: appearanceSettings?.text_accent_color || '#39FF14',
                               textShadow: appearanceSettings?.text_accent_color
                                 ? `0 0 5px ${appearanceSettings.text_accent_color}66`
                                 : '0 0 5px rgba(57, 255, 20, 0.6)'
                             }}>
                          {categoryLinks.length} {categoryLinks.length === 1 ? 'link' : 'links'}
                        </span>
                      </div>
                    </div>

                    {/* Social Icons Grid - Direct implementation to match other sections */}
                    <div className="p-3 md:p-5">
                      <div className="flex flex-wrap gap-3 sm:gap-6 justify-start">
                        {categoryLinks.map((link) => (
                          <SocialMediaIcon
                            key={link.id}
                            link={link}
                            onClick={() => handleLinkClick(link)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              const CategoryIcon = getCategoryIcon(category, categoryIcons);
              
              return (
                <div 
                  key={category} 
                  className="bg-[#1E1E1E] border-2 border-[#FF00FF]/30 rounded-2xl overflow-hidden relative shadow-[0_0_20px_rgba(255,0,255,0.3)]"
                  style={{ 
                    ...getSectionStyles(category, appearanceSettings),
                    boxShadow: '0 0 15px rgba(255, 0, 255, 0.2), 0 0 30px rgba(255, 0, 255, 0.1)' 
                  }}
                >
                  {/* Category Header */}
                  <div 
                    className="bg-gradient-to-r from-[#FF00FF]/10 to-[#FF00FF]/10 border-b-2 px-5 py-3 relative overflow-hidden"
                    style={{ borderColor: getSectionStyles(category, appearanceSettings).borderColor }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF00FF]/5 to-[#FF00FF]/5"></div>
                    <div className="relative z-10 flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#FF00FF]/20 border"
                           style={{ 
                             borderColor: getSectionStyles(category, appearanceSettings).borderColor,
                             boxShadow: `0 0 10px ${appearanceSettings?.link_color ? appearanceSettings.link_color + '33' : 'rgba(255, 0, 255, 0.3)'}` 
                           }}>
                        {(() => {
                          // For projects category, always show GitHub icon
                          if (category === 'projects') {
                            return <Github className="w-4 h-4" style={{ color: 'white' }} />;
                          }
                          
                          // For blogs category, always show BookOpen icon
                          if (category === 'blogs') {
                            return <BookOpen className="w-4 h-4" style={{ color: 'white' }} />;
                          }
                          
                          // For other categories, use the mapped icon
                          const IconComponent = CategoryIcon;
                          if (IconComponent && typeof IconComponent === 'function') {
                            return <IconComponent className="w-4 h-4" style={{ color: 'white' }} />;
                          }
                          
                          // Fallback
                          return <ExternalLink className="w-4 h-4" style={{ color: 'white' }} />;
                        })()}
                      </div>
                      <h2 className="text-[18px] font-bold leading-[1.3] font-orbitron"
                          style={{
                            color: appearanceSettings?.link_color || '#FF00FF',
                            textShadow: appearanceSettings?.link_color 
                              ? `0 0 8px ${appearanceSettings.link_color}66` 
                              : '0 0 8px rgba(255, 0, 255, 0.6)'
                          }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </h2>
                      <span className="text-[12px] font-inter font-medium"
                           style={{ 
                             color: appearanceSettings?.text_accent_color || '#39FF14',
                             textShadow: appearanceSettings?.text_accent_color
                               ? `0 0 5px ${appearanceSettings.text_accent_color}66`
                               : '0 0 5px rgba(57, 255, 20, 0.6)'
                           }}>
                        {categoryLinks.length} {categoryLinks.length === 1 ? 'link' : 'links'}
                      </span>
                    </div>
                  </div>

                  {/* Links Grid */}
                  <div className="p-3 md:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryLinks.map((link) => (
                        <div key={link.id} className="group">
                          <RichLinkPreview
                            link={link}
                            onClick={() => handleLinkClick(link)}
                            onRefresh={handleRefreshPreview}
                            variant="compact"
                            showRefreshButton={true}
                            className={`bg-[#1A1A1A] border rounded-xl transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] hover:scale-[1.02] ${appearanceSettings?.link_color ? '' : 'border-[#FF00FF]/20 hover:border-[#FF00FF]/50'}`}
                            isPreviewMode={isPreview}
                            linkHoverColor={appearanceSettings?.link_hover_color}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div 
            className="bg-[#1A1A1A] border-2 border-[#FF00FF]/30 rounded-2xl p-6 text-center relative overflow-hidden shadow-[0_0_20px_rgba(255,0,255,0.3)]"
            style={{ 
              borderColor: appearanceSettings?.border_color || 'rgba(255, 0, 255, 0.3)',
              boxShadow: '0 0 15px rgba(255, 0, 255, 0.2), 0 0 30px rgba(255, 0, 255, 0.1)' 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF00FF]/5 to-[#FF00FF]/5"></div>
            <div className="relative z-10">
              <h2 className="text-[20px] font-bold leading-[1.3] mb-2 font-orbitron"
                  style={{ 
                    color: appearanceSettings?.text_primary_color || '#FF00FF', 
                    textShadow: appearanceSettings?.text_primary_color
                      ? `0 0 10px ${appearanceSettings.text_primary_color}66`
                      : '0 0 10px rgba(255, 0, 255, 0.6)'
                  }}>
                No Links Yet
              </h2>
              <p className="text-[16px] leading-[1.5] text-[#D1D5DB] font-inter"
                 style={getTypographyStyle('body')}>
                This developer hasn&apos;t added any links to their profile yet.
              </p>
            </div>
          </div>
        )}

        {/* Powered by Link4Coders Footer */}
          <div className="mt-6 text-center">
          <div className="bg-[#1A1A1A] border-2 border-[#FF00FF]/30 rounded-xl p-3 inline-block relative overflow-hidden shadow-[0_0_15px_rgba(255,0,255,0.2)]"
               style={{ boxShadow: '0 0 10px rgba(255, 0, 255, 0.2), 0 0 20px rgba(255, 0, 255, 0.1)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF00FF]/5 to-[#FF00FF]/5"></div>
            <div className="relative z-10">
              <p className="text-[12px] font-medium text-[#D1D5DB] font-inter">
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
              <p className="text-[10px] text-[#9CA3AF] font-inter mt-1">
                Create your developer profile for free
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}