'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User, UserAppearanceSettings } from '@/lib/supabase'
import { UserLink, LinkCategory, LINK_CATEGORIES } from '@/lib/services/link-service'
import { Button } from '@/components/ui/button'
import { RichLinkPreview } from '@/components/rich-preview/rich-link-preview'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { SocialMediaSection } from '@/components/social-media/social-media-section'
import { getFontFamilyWithFallbacks } from '@/lib/utils/font-loader'
import { getSectionStyles, getSectionTypographyStyle } from '@/lib/utils/section-styling'
import { useLinksStore } from '@/stores/links-store'
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
  Heart
} from 'lucide-react'
import { toast } from 'sonner'
import { CategoryIconService, CategoryIconConfig } from '@/lib/services/category-icon-service'
import { CategoryIconPreview } from '@/components/category-icons/category-icon-preview'

interface MinimalistLightTemplateProps {
  user: User
  links: Record<LinkCategory, UserLinkWithPreview[]>
  appearanceSettings?: UserAppearanceSettings | null
  categoryOrder?: LinkCategory[]
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
  const defaultIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    personal: ExternalLink,
    projects: Github,
    blogs: BookOpen,
    achievements: Award,
    contact: Mail,
    social: Globe,
    custom: ExternalLink
  }

  const IconComponent = defaultIcons[link.category] || ExternalLink
  return <IconComponent className="w-5 h-5 text-gray-700" />
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

  // Fallback to default icon with light theme styling
  const config = LINK_CATEGORIES[category]
  switch (config?.icon) {
    case 'Github': return Github
    case 'BookOpen': return BookOpen
    case 'Award': return Award
    case 'Mail': return Mail
    default: return ExternalLink
  }
}

export function MinimalistLightTemplate({ user, links, appearanceSettings, categoryOrder: propCategoryOrder }: MinimalistLightTemplateProps) {
  const [copied, setCopied] = useState(false)
  
  // Use Zustand store for state management
  const { categoryIcons, categoryOrder, loadCategoryIcons } = useLinksStore()
  
  // Load category icons when component mounts
  useEffect(() => {
    if (user?.id) {
      loadCategoryIcons(user.id)
    }
  }, [user?.id, loadCategoryIcons])

  const handleLinkClick = (link: UserLinkWithPreview) => {
    // Open link
    window.open(link.url, '_blank', 'noopener,noreferrer')
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
      return { backgroundColor: '#ffffff' } // Default background for light theme
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
        style.backgroundColor = appearanceSettings.background_color || '#ffffff'
      } else {
        // No image set yet, show a neutral background instead of falling back to solid color
        style.backgroundColor = '#ffffff' // Use default light background
      }
    } else {
      // Default to solid color
      style.backgroundColor = appearanceSettings.background_color || '#ffffff'
    }

    return style
  }

  // Generate typography styles from appearance settings with light theme defaults
  const getTypographyStyle = (type: 'heading' | 'subheading' | 'body' | 'accent' | 'link', isHover = false): React.CSSProperties => {
    // Always use light theme safe colors to ensure visibility
    return getSectionTypographyStyle('profile', type, appearanceSettings, isHover, 'light')
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
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 py-12 max-w-2xl">
        {/* Header Section */}
        <div 
          className="text-center mb-12 bg-white border border-gray-200 rounded-xl p-8 shadow-sm"
        >
          {/* Avatar */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 blur-lg opacity-20 scale-110"></div>
            <Image
              src={user.avatar_url || '/default-avatar.png'}
              alt={user.full_name || user.github_username || 'User'}
              width={appearanceSettings?.profile_avatar_size || 120}
              height={appearanceSettings?.profile_avatar_size || 120}
              className="relative rounded-full border-4 border-white shadow-xl backdrop-blur-sm"
            />
          </div>

          {/* Name */}
          <h1 
            className="text-3xl font-bold mb-3"
            style={getTypographyStyle('heading')}
          >
            {user.full_name || user.github_username}
          </h1>

          {/* Title */}
          {user.profile_title && (
            <p 
              className="text-lg font-medium mb-4"
              style={getTypographyStyle('subheading')}
            >
              {user.profile_title}
            </p>
          )}

          {/* Bio */}
          {user.bio && (
            <p 
              className="text-base mb-6 leading-relaxed max-w-lg mx-auto"
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
                <MapPin className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium">{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium">{user.company}</span>
              </div>
            )}
            {joinedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium">Joined {joinedDate}</span>
              </div>
            )}
          </div>

          {/* Share Button */}
          <Button
            onClick={handleShare}
            className="font-medium px-8 py-3 rounded-full hover:scale-105 transition-all duration-300 shadow-lg mb-8"
            style={{
              backgroundColor: appearanceSettings?.link_color || '#3b82f6',
              color: appearanceSettings?.text_primary_color || '#ffffff',
              backgroundImage: !appearanceSettings?.link_color ? 'linear-gradient(45deg, #3b82f6, #8b5cf6)' : undefined,
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
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
        <div className="space-y-8">
          {orderedCategories.map((category) => {
            const categoryLinks = links[category]
            const config = LINK_CATEGORIES[category]
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
                />
              )
            }

            return (
              <div key={category} className="mb-10">
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <IconComponent 
                      className="w-6 h-6 text-gray-700" 
                      style={{ color: '#374151' }}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {config.label}
                  </h2>
                </div>

                {/* Category Links */}
                <div className="space-y-4">
                  {categoryLinks.map((link) => (
                    <div key={link.id}>
                      {link.metadata?.type === 'github_repo' || link.metadata?.type === 'webpage' || link.metadata?.type === 'blog_post' ? (
                        <div className="group">
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                            <RichLinkPreview 
                              link={link} 
                              onClick={() => handleLinkClick(link)}
                              theme="light"
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleLinkClick(link)}
                          className="w-full group"
                        >
                          <div 
                            className="bg-white border border-gray-200 rounded-xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:border-blue-300"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                <div style={{ color: '#374151' }}>
                                  {getLinkIcon(link)}
                                </div>
                              </div>
                              <div className="flex-grow min-w-0">
                                <h3 className="text-lg font-semibold mb-1 text-gray-900 transition-colors group-hover:text-blue-600">
                                  {link.title}
                                </h3>
                                {link.description && (
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {link.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <ExternalLink 
                                  className="w-5 h-5 text-gray-700 transition-colors"
                                  style={{ color: '#374151' }}
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

        {/* No Links Message */}
        {!hasLinks && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              No Links Yet
            </h2>
            <p className="text-gray-600">
              This developer hasn&apos;t added any links to their profile yet.
            </p>
          </div>
        )}

        {/* Footer */}
        {!user.is_premium && (
          <div className="text-center mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Powered by</span>
              <a 
                href="https://link4coders.com?ref=profile" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
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
