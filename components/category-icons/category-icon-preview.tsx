'use client'

import { useState } from 'react'
import Image from 'next/image'
import { HelpCircle } from 'lucide-react'
import { CategoryIconConfig } from '@/lib/services/category-icon-service'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'

interface CategoryIconPreviewProps {
  config: CategoryIconConfig
  size?: number
  className?: string
  fallbackToDefault?: boolean
}

export function CategoryIconPreview({ 
  config, 
  size = 20, 
  className,
  fallbackToDefault = true 
}: CategoryIconPreviewProps) {
  const [imageError, setImageError] = useState(false)

  const renderDefaultIcon = (iconName: string) => {
    // Get the icon component from Lucide
    const IconComponent = (LucideIcons as any)[iconName]
    
    if (!IconComponent) {
      // Fallback to a default icon if not found
      const FallbackIcon = LucideIcons.HelpCircle
      return <FallbackIcon size={size} style={{ color: config.color }} />
    }
    
    return <IconComponent size={size} style={{ color: config.color }} />
  }

  const renderLibraryIcon = (iconId: string) => {
    // Map library icon IDs to Lucide icon names
    const iconMap: Record<string, string> = {
      // Personal icons
      'user': 'User',
      'person': 'UserCircle',
      'profile': 'UserCheck',
      'id-card': 'CreditCard',
      'briefcase': 'Briefcase',
      
      // Projects icons
      'github': 'Github',
      'code': 'Code',
      'terminal': 'Terminal',
      'folder': 'Folder',
      'git-branch': 'GitBranch',
      
      // Blogs icons
      'book-open': 'BookOpen',
      'edit': 'Edit',
      'file-text': 'FileText',
      'pen-tool': 'PenTool',
      'newspaper': 'Newspaper',
      
      // Achievements icons
      'award': 'Award',
      'trophy': 'Trophy',
      'medal': 'Medal',
      'star': 'Star',
      'target': 'Target',
      
      // Contact icons
      'mail': 'Mail',
      'phone': 'Phone',
      'map-pin': 'MapPin',
      'message-circle': 'MessageCircle',
      'calendar': 'Calendar',
      
      // Social icons
      'share-2': 'Share2',
      'users': 'Users',
      'heart': 'Heart',
      'thumbs-up': 'ThumbsUp',
      'link': 'Link',
      
      // Custom icons
      'external-link': 'ExternalLink',
      'globe': 'Globe',
      'bookmark': 'Bookmark',
      'tag': 'Tag'
    }

    const iconName = iconMap[iconId] || 'HelpCircle'
    return renderDefaultIcon(iconName)
  }

  const renderImageIcon = (url: string) => {
    if (imageError && fallbackToDefault) {
      // Fallback to default icon if image fails to load
      return renderDefaultIcon('HelpCircle')
    }

    return (
      <div 
        className={cn("relative overflow-hidden", className)}
        style={{ width: size, height: size }}
      >
        <Image
          src={url}
          alt="Category icon"
          fill
          className="object-contain"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      </div>
    )
  }

  // Render based on icon type
  switch (config.type) {
    case 'url':
    case 'upload':
      if (config.icon && !imageError) {
        return renderImageIcon(config.icon)
      }
      // Fallback to default if URL/upload fails
      return fallbackToDefault ? renderDefaultIcon('HelpCircle') : null

    case 'library':
      if (config.icon) {
        return renderLibraryIcon(config.icon)
      }
      // Fallback to default if library icon not found
      return fallbackToDefault ? renderDefaultIcon('HelpCircle') : null

    case 'default':
    default:
      return renderDefaultIcon(config.icon || 'HelpCircle')
  }
}
