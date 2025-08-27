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
import { getFontFamilyWithFallbacks } from '@/lib/utils/font-loader'
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
  Heart,
  User,
  Link
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryIconService, CategoryIconConfig } from '@/lib/services/category-icon-service'
import { CategoryIconPreview } from '@/components/category-icons/category-icon-preview'

interface MinimalistLightTemplateProps {
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

  // Default icons based on category with light theme styling
  switch (link.category) {
    case 'personal': return <ExternalLink className="w-5 h-5 text-gray-700" />
    case 'projects': return <Github className="w-5 h-5 text-gray-700" />
    case 'blogs': return <BookOpen className="w-5 h-5 text-gray-700" />
    case 'achievements': return <Award className="w-5 h-5 text-gray-700" />
    case 'contact': return <Mail className="w-5 h-5 text-gray-700" />
    case 'social': return <Globe className="w-5 h-5 text-gray-700" />
    case 'custom': return <Link className="w-5 h-5 text-gray-700" />
    default: return <ExternalLink className="w-5 h-5 text-gray-700" />
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

  // Fallback to default icon with light theme styling - map categories to icon components
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

export function MinimalistLightTemplate({ user, links, appearanceSettings, categoryOrder: propCategoryOrder, isPreview = false }: MinimalistLightTemplateProps) {
  const [copied, setCopied] = useState(false)
  const [categoryIcons, setCategoryIcons] = useState<Record<LinkCategory, CategoryIconConfig>>({} as Record<LinkCategory, CategoryIconConfig>)
  const [categoryOrder, setCategoryOrder] = useState<LinkCategory[]>(propCategoryOrder || ['personal', 'projects', 'blogs', 'achievements', 'contact', 'custom', 'social'])
  
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

    // Open link
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
      return { 
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)' // Default Minimalist Light gradient
      }
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
        style.backgroundColor = appearanceSettings.background_color || '#FFFFFF'
      } else {
        // No image set yet, show the default Minimalist Light gradient
        style.background = 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)'
      }
    } else {
      // Default to solid color or Minimalist Light gradient
      style.backgroundColor = appearanceSettings.background_color || '#FFFFFF'
      if (!appearanceSettings.background_color) {
        style.background = 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)'
      }
    }

    return style
  }

  // Generate typography styles from appearance settings with Minimalist Light theme defaults
  const getTypographyStyle = (type: 'heading' | 'subheading' | 'body' | 'accent' | 'link', isHover = false): React.CSSProperties => {
    if (!appearanceSettings) {
      // Default styles for Minimalist Light theme - EXACT specifications with better contrast but smaller sizes
      const defaults = {
        heading: { fontFamily: 'Roboto Mono, monospace', fontSize: '24px', color: '#111827', lineHeight: '1.2', fontWeight: '600' }, // Dark gray headings with Roboto Mono
        subheading: { fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#111827', lineHeight: '1.4', fontWeight: '500' }, // Dark gray subheadings for better visibility
        body: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#111827', lineHeight: '1.5', fontWeight: '400' }, // Dark gray body for better visibility
        accent: { fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#374151', lineHeight: '1.4', fontWeight: '500' }, // Medium gray for better visibility
        link: { fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#2563EB', lineHeight: '1.5', fontWeight: '500' } // Blue links
      }
      return defaults[type]
    }

    const style: React.CSSProperties = {}

    // Apply font family - Minimalist Light uses Roboto Mono for headings, Inter for other text
    if (type === 'heading') {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.primary_font || 'Roboto Mono')
    } else if (type === 'subheading') {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.primary_font || 'Inter')
    } else {
      style.fontFamily = getFontFamilyWithFallbacks(appearanceSettings.secondary_font || 'Inter')
    }

    // Apply font size (reduced from original)
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

    // Apply colors - EXACT Minimalist Light specifications with better contrast
    switch (type) {
      case 'heading':
        style.color = appearanceSettings.text_primary_color || '#111827' // Dark gray
        break
      case 'subheading':
        style.color = appearanceSettings.text_primary_color || '#111827' // Dark gray for better visibility
        break
      case 'body':
        style.color = appearanceSettings.text_secondary_color || '#111827' // Dark gray for better visibility
        break
      case 'accent':
        style.color = appearanceSettings.text_secondary_color || '#374151' // Medium gray for better visibility
        break
      case 'link':
        style.color = isHover
          ? (appearanceSettings.link_hover_color || '#1E40AF') // Darker blue on hover
          : (appearanceSettings.link_color || '#2563EB') // Blue
        break
    }

    return style
  }



  // Get active links for display
  const hasLinks = Object.values(links).some(categoryLinks => categoryLinks.length > 0)

  const joinedDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }) : ''

  // Filter out empty categories and apply custom order
  const orderedCategories = (propCategoryOrder || categoryOrder).filter(category => {
    const categoryLinks = links[category]
    return categoryLinks && categoryLinks.length > 0
  })

  return (
    <div 
      className="min-h-screen relative"
      style={getBackgroundStyle()}
    >
      {/* Subtle overlay pattern - removed for better visibility */}
      {/* <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
      </div> */}
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-xl">
        {/* Header Section */}
        <div 
          className="text-center mb-8 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
        >
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 blur-lg opacity-20 scale-110"></div>
            <Image
              src={user.avatar_url && user.avatar_url.trim() !== '' ? user.avatar_url : '/default-avatar.png'}
              alt={user.full_name || user.github_username || 'User'}
              width={appearanceSettings?.profile_avatar_size || 100}
              height={appearanceSettings?.profile_avatar_size || 100}
              className="relative rounded-full border-4 border-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] backdrop-blur-sm"
            />
          </div>

          {/* Name */}
          <h1 
            className="text-2xl font-semibold mb-2 text-[#111827] font-inter"
          >
            {user.full_name || user.github_username}
          </h1>

          {/* Title */}
          {user.profile_title && (
            <p 
              className="text-base font-medium mb-3 text-[#111827] font-inter"
            >
              {user.profile_title}
            </p>
          )}

          {/* Bio */}
          {user.bio && (
            <p 
              className="text-sm mb-4 leading-relaxed max-w-lg mx-auto text-[#111827] font-medium font-inter"
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

          {/* Location, Company, Join Date */}
          <div 
            className="flex flex-wrap justify-center items-center gap-4 mb-5 text-[#374151]"
            style={getTypographyStyle('accent')}
          >
            {user.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className="text-xs font-medium text-[#374151]">{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className="text-xs font-medium text-[#374151]">{user.company}</span>
              </div>
            )}
            {joinedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className="text-xs font-medium text-[#374151]">Joined {joinedDate}</span>
              </div>
            )}
          </div>

          {/* Share Button - Minimalist Light Style */}
          <Button
            onClick={handleShare}
            className="font-medium px-6 py-2 text-sm rounded-full hover:scale-105 transition-all duration-300 shadow-[0_2px_6px_rgba(0,0,0,0.08)] bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-0"
          >
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
          </Button>
        </div>

        {/* Links Section */}
        <div className="space-y-6">
          {orderedCategories.map((category) => {
            const categoryLinks = links[category]
            const IconComponent = getCategoryIcon(category, categoryIcons)

            // Handle social media category specially
            if (category === 'social') {
              return (
                <SocialMediaSection
                  key={category}
                  socialLinks={categoryLinks}
                  onLinkClick={handleLinkClick}
                  variant="light"
                  appearanceSettings={appearanceSettings}
                  getTypographyStyle={getTypographyStyle}
                />
              )
            }

            return (
              <div key={category} className="mb-6">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white border border-[#E5E7EB] rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
                    {(() => {
                      // For projects category, always show GitHub icon
                      if (category === 'projects') {
                        return <Github className="w-5 h-5 text-[#374151]" />
                      }
                      
                      // For blogs category, always show BookOpen icon
                      if (category === 'blogs') {
                        return <BookOpen className="w-5 h-5 text-[#374151]" />
                      }
                      
                      // For other categories, use the mapped icon
                      if (IconComponent && typeof IconComponent === 'function') {
                        return <IconComponent className="w-5 h-5 text-[#374151]" />
                      }
                      
                      // Fallback
                      return <ExternalLink className="w-5 h-5 text-[#374151]" />
                    })()}
                  </div>
                  <h2 className="text-lg font-semibold text-[#111827]"
                      style={getTypographyStyle('heading')}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                </div>

                {/* Category Links */}
                <div className="space-y-3">
                  {categoryLinks.map((link) => (
                    <div key={link.id} className="group">
                      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
                        <RichLinkPreview 
                          link={link} 
                          onClick={() => handleLinkClick(link)}
                          onRefresh={handleRefreshPreview}
                          theme="light"
                          isPreviewMode={isPreview}
                          variant="compact"
                          linkHoverColor={appearanceSettings?.link_hover_color} // Pass link hover color from appearance settings
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* No Links Message */}
        {!hasLinks && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 shadow-[0_2px_6px_rgba(0,0,0,0.08)] text-center">
            <h2 className="text-lg font-semibold mb-2 text-[#111827]"
                 style={getTypographyStyle('heading')}>
              No Links Yet
            </h2>
            <p className="text-sm text-[#6B7280]"
               style={getTypographyStyle('body')}>
              This developer hasn&apos;t added any links to their profile yet.
            </p>
          </div>
        )}

        {/* Footer */}
        {!user.is_premium && !isPreview && (
          <div className="text-center mt-10 pt-6 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-center gap-1.5 text-[#6B7280]"
                 style={getTypographyStyle('accent')}>
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-medium">Powered by</span>
              <a 
                href="https://link4coders.in?ref=profile" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#2563EB] hover:text-[#1E40AF] transition-colors"
                style={getTypographyStyle('link')}
              >
                Link4Coders
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
