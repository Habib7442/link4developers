'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ExternalLink,
  Globe,
  RefreshCw,
  ImageIcon,
  Github,
  Linkedin,
  Twitter,
  Mail,
  BookOpen,
  Award,
  Link as LinkIcon
} from 'lucide-react'
import { WebpageMetadata } from '@/lib/types/rich-preview'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { cn } from '@/lib/utils'

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
  const defaultIcons = {
    personal: ExternalLink,
    projects: Github,
    blogs: BookOpen,
    achievements: Award,
    contact: Mail,
    social: Globe,
    custom: LinkIcon
  }

  const IconComponent = defaultIcons[link.category as keyof typeof defaultIcons] || Globe
  // Use inline style to force dark color in light theme regardless of appearance settings
  return <IconComponent className="w-4 h-4" style={{ color: '#374151' }} />
}

interface WebpagePreviewCardProps {
  link: UserLinkWithPreview
  metadata: WebpageMetadata
  onClick?: () => void
  onRefresh?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  theme?: 'dark' | 'light'
}

export function WebpagePreviewCard({
  link,
  metadata,
  onClick,
  onRefresh,
  className,
  variant = 'default',
  theme = 'dark'
}: WebpagePreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [faviconError, setFaviconError] = useState(false)

  const displayTitle = metadata.title || link.title || 'Untitled'
  const displayDescription = metadata.description || link.description || ''
  const displayDomain = metadata.domain || new URL(link.url).hostname

  if (variant === 'compact') {
    const isLight = theme === 'light'

    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative w-full rounded-2xl p-4 transition-all duration-300 text-left shadow-sm cursor-pointer",
          isLight
            ? "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            : "glassmorphic shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] hover:shadow-[0px_20px_35px_rgba(0,0,0,0.40)]",
          className
        )}
      >
        <div className="flex items-center gap-3">
          {/* Favicon */}
          <div className={cn(
            "relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0",
            isLight ? "bg-gray-100 border border-gray-200" : "bg-white/5"
          )}>
            {metadata.favicon && !faviconError ? (
              <Image
                src={metadata.favicon}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Globe className={cn(
                  "w-4 h-4",
                  isLight ? "text-gray-500" : "text-gray-400"
                )} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-sm font-semibold truncate font-['Sharp_Grotesk']",
              isLight ? "text-gray-900" : "text-white"
            )}>
              {displayTitle}
            </h3>
            <p className={cn(
              "text-xs truncate mt-1",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>
              {displayDomain}
            </p>
          </div>

          <ExternalLink className={cn(
            "w-4 h-4 group-hover:text-blue-400 transition-colors flex-shrink-0",
            isLight ? "text-gray-500" : "text-gray-400"
          )} />
        </div>
      </div>
    )
  }

  const isLight = theme === 'light'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative w-full rounded-3xl overflow-hidden transition-all duration-500 text-left transform hover:scale-[1.02] cursor-pointer",
        isLight
          ? "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md"
          : "glassmorphic shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] hover:shadow-[0px_20px_40px_rgba(0,0,0,0.40)]",
        className
      )}
    >
      {/* Animated background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      )} />
      
      {/* Preview Image */}
      {metadata.image && !imageError && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={metadata.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-3">
          {/* Favicon */}
          <div className={cn(
            "relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0",
            isLight
              ? "bg-gray-100 border border-gray-200"
              : "bg-white/5 ring-2 ring-white/10"
          )}>
            {metadata.favicon && !faviconError ? (
              <Image
                src={metadata.favicon}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Globe className={cn(
                  "w-5 h-5",
                  isLight ? "text-gray-500" : "text-gray-400"
                )} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-bold line-clamp-2 font-['Sharp_Grotesk'] mb-1",
              isLight ? "text-gray-900" : "text-white"
            )}>
              {displayTitle}
            </h3>
            <p className={cn(
              "text-sm font-medium",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>
              {metadata.site_name || displayDomain}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRefresh()
                }}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isLight
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                <RefreshCw className={cn(
                  "w-4 h-4",
                  isLight ? "text-gray-600" : "text-gray-400"
                )} />
              </button>
            )}
            <ExternalLink className={cn(
              "w-5 h-5 group-hover:text-blue-400 transition-colors",
              isLight ? "text-gray-500" : "text-gray-400"
            )} />
          </div>
        </div>

        {/* Description */}
        {displayDescription && (
          <p className={cn(
            "text-sm leading-relaxed line-clamp-3 mb-4",
            isLight ? "text-gray-700" : "text-gray-300"
          )}>
            {displayDescription}
          </p>
        )}

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-between pt-3 border-t",
          isLight ? "border-gray-200" : "border-white/10"
        )}>
          <div className="flex items-center gap-2">
            <Globe className={cn(
              "w-4 h-4",
              isLight ? "text-gray-500" : "text-gray-400"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>
              {displayDomain}
            </span>
          </div>

          {metadata.site_name && metadata.site_name !== displayDomain && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-lg",
              isLight
                ? "text-gray-600 bg-gray-100"
                : "text-gray-500 bg-white/5"
            )}>
              {metadata.site_name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Fallback component for when preview data is not available
export function BasicLinkCard({
  link,
  onClick,
  className,
  variant = 'default',
  theme = 'dark'
}: {
  link: UserLinkWithPreview
  onClick?: () => void
  className?: string
  variant?: 'default' | 'compact'
  theme?: 'dark' | 'light'
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  const domain = new URL(link.url).hostname

  if (variant === 'compact') {
    const isLight = theme === 'light'

    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative w-full rounded-2xl p-4 transition-all duration-300 text-left shadow-sm cursor-pointer",
          isLight
            ? "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            : "bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:from-white/[0.12] hover:to-white/[0.04] hover:border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)]",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            isLight ? "bg-gray-100 border border-gray-200" : "bg-white/5"
          )}>
            <div className={cn(
              isLight ? "text-gray-500" : "text-gray-400"
            )} style={{ color: isLight ? '#6b7280' : undefined }}>
              {getLinkIcon(link)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-sm font-semibold truncate font-['Sharp_Grotesk']",
              isLight ? "text-gray-900" : "text-white"
            )}>
              {link.title}
            </h3>
            <p className={cn(
              "text-xs truncate mt-1",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>
              {domain}
            </p>
          </div>
          <ExternalLink className={cn(
            "w-4 h-4 group-hover:text-blue-400 transition-colors flex-shrink-0",
            isLight ? "text-gray-500" : "text-gray-400"
          )} />
        </div>
      </div>
    )
  }

  const isLight = theme === 'light'

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative w-full rounded-3xl p-6 transition-all duration-500 text-left transform hover:scale-[1.02] cursor-pointer",
        isLight
          ? "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md"
          : "bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] hover:from-white/[0.12] hover:to-white/[0.04] hover:border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
          isLight
            ? "bg-gray-100 border border-gray-200"
            : "bg-white/5 ring-2 ring-white/10"
        )}>
          <div className={cn(
            "w-6 h-6 flex items-center justify-center",
            isLight ? "text-gray-500" : "text-gray-400"
          )} style={{ color: isLight ? '#6b7280' : undefined }}>
            {getLinkIcon(link)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-lg font-bold truncate font-['Sharp_Grotesk'] mb-1",
            isLight ? "text-gray-900" : "text-white"
          )}>
            {link.title}
          </h3>
          {link.description && (
            <p className={cn(
              "text-sm line-clamp-2 mb-2",
              isLight ? "text-gray-700" : "text-gray-300"
            )}>
              {link.description}
            </p>
          )}
          <p className={cn(
            "text-sm",
            isLight ? "text-gray-600" : "text-gray-400"
          )}>
            {domain}
          </p>
        </div>
        <ExternalLink className={cn(
          "w-5 h-5 group-hover:text-blue-400 transition-colors flex-shrink-0",
          isLight ? "text-gray-500" : "text-gray-400"
        )} />
      </div>
    </div>
  )
}
