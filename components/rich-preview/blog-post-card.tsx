'use client'

import { useState } from 'react'
import { ExternalLink, RefreshCw, Calendar, Clock, Heart, MessageCircle, User } from 'lucide-react'
import { UserLinkWithPreview, BlogPostMetadata } from '@/lib/types/rich-preview'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface BlogPostCardProps {
  link: UserLinkWithPreview
  metadata: BlogPostMetadata
  onClick?: () => void
  onRefresh?: () => Promise<void>
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  theme?: 'dark' | 'light'
  linkHoverColor?: string // Add link hover color prop
}

export function BlogPostCard({
  link,
  metadata,
  onClick,
  onRefresh,
  className,
  variant = 'default',
  theme = 'dark',
  linkHoverColor = '#ffc0cb' // Default to pink if not provided
}: BlogPostCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onRefresh) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Unknown date'
    }
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      'dev.to': '🔥',
      'hashnode': '📝',
      'medium': '📖',
      'substack': '📧',
      'ghost': '👻',
      'wordpress': '📰'
    }
    return icons[platform] || '📄'
  }

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'dev.to': 'from-purple-500 to-blue-500',
      'hashnode': 'from-blue-500 to-cyan-500',
      'medium': 'from-green-500 to-emerald-500',
      'substack': 'from-orange-500 to-red-500',
      'ghost': 'from-gray-500 to-slate-500',
      'wordpress': 'from-blue-600 to-indigo-600'
    }
    return colors[platform] || 'from-gray-500 to-gray-600'
  }

  const isLight = theme === 'light'

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={cn(
          'group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer',
          'p-4',
          isLight
            ? 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            : 'glassmorphic shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] hover:shadow-[0px_20px_35px_rgba(0,0,0,0.40)]',
          className
        )}
      >
        <div className="flex items-start gap-3">
          {metadata.featured_image && !imageError && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={metadata.featured_image}
                alt={metadata.title}
                fill
                sizes="64px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getPlatformIcon(metadata.platform)}</span>
              <span className={cn(
                "text-xs capitalize",
                isLight ? "text-gray-500" : "text-white/60"
              )}>{metadata.platform}</span>
            </div>

            <h3 className={cn(
              "font-medium text-sm line-clamp-2 mb-1",
              isLight ? "text-gray-900" : "text-white"
            )}>
              {metadata.title}
            </h3>

            <div className={cn(
              "flex items-center gap-3 text-xs",
              isLight ? "text-gray-500" : "text-white/50"
            )}>
              <span>{metadata.author.name}</span>
              <span>•</span>
              <span>{formatDate(metadata.published_at)}</span>
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded",
                isLight ? "hover:bg-gray-100" : "hover:bg-white/10"
              )}
            >
              <RefreshCw className={cn(
                'w-4 h-4',
                isLight ? "text-gray-500" : "text-white/60",
                isRefreshing && 'animate-spin'
              )} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer',
        variant === 'detailed' ? 'p-6' : 'p-4',
        isLight
          ? 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          : 'glassmorphic shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] hover:shadow-[0px_20px_35px_rgba(0,0,0,0.40)]',
        className
      )}
    >
      {/* Featured Image */}
      {metadata.featured_image && !imageError && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
          <Image
            src={metadata.featured_image}
            alt={metadata.title}
            fill
            sizes="100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Platform Badge - positioned on image */}
          <div className="absolute top-3 right-3 z-10">
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium text-white',
              'bg-gradient-to-r',
              getPlatformColor(metadata.platform)
            )}>
              <span className="mr-1">{getPlatformIcon(metadata.platform)}</span>
              {metadata.platform}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {/* Platform Badge - for posts without images */}
        {(!metadata.featured_image || imageError) && (
          <div className="flex justify-end mb-2">
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium text-white',
              'bg-gradient-to-r',
              getPlatformColor(metadata.platform)
            )}>
              <span className="mr-1">{getPlatformIcon(metadata.platform)}</span>
              {metadata.platform}
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className={cn(
          "font-semibold text-lg leading-tight line-clamp-2",
          isLight ? "text-gray-900" : "text-white"
        )}>
          {metadata.title}
        </h3>

        {/* Excerpt */}
        {metadata.excerpt && (
          <p className={cn(
            "text-sm leading-relaxed line-clamp-3",
            isLight ? "text-gray-600" : "text-white/70"
          )}>
            {metadata.excerpt}
          </p>
        )}

        {/* Author Info */}
        <div className="flex items-center gap-3">
          {metadata.author.avatar && (
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={metadata.author.avatar}
                alt={metadata.author.name}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              isLight ? "text-gray-800" : "text-white/80"
            )}>{metadata.author.name}</p>
            {metadata.author.username && (
              <p className={cn(
                "text-xs",
                isLight ? "text-gray-500" : "text-white/50"
              )}>@{metadata.author.username}</p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className={cn(
          "flex items-center gap-4 text-xs",
          isLight ? "text-gray-500" : "text-white/50"
        )}>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(metadata.published_at)}</span>
          </div>
          
          {metadata.reading_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{metadata.reading_time_minutes} min read</span>
            </div>
          )}

          {metadata.reactions_count && metadata.reactions_count > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{metadata.reactions_count}</span>
            </div>
          )}

          {metadata.comments_count && metadata.comments_count > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{metadata.comments_count}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {metadata.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className={cn(
                  "px-2 py-1 text-xs rounded-full",
                  isLight
                    ? "bg-gray-100 text-gray-600"
                    : "bg-white/10 text-white/70"
                )}
              >
                #{tag}
              </span>
            ))}
            {metadata.tags.length > 4 && (
              <span className={cn(
                "px-2 py-1 text-xs rounded-full",
                isLight
                  ? "bg-gray-100 text-gray-600"
                  : "bg-white/10 text-white/70"
              )}>
                +{metadata.tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center justify-between mt-4 pt-3 border-t",
        isLight ? "border-gray-200" : "border-white/10"
      )}>
        <div className={cn(
          "flex items-center gap-1 text-xs",
          isLight ? "text-gray-500" : "text-white/60"
        )}>
          <ExternalLink 
            className="w-3 h-3" 
            style={{
              transition: 'color 0.3s ease'
              // Don't force linkHoverColor - let the parent text color apply naturally
            }}
          />
          <span>Read on {metadata.platform}</span>
        </div>

        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded",
              isLight ? "hover:bg-gray-100" : "hover:bg-white/10"
            )}
          >
            <RefreshCw className={cn(
              'w-4 h-4',
              isLight ? "text-gray-500" : "text-white/60",
              isRefreshing && 'animate-spin'
            )} />
          </button>
        )}
      </div>
    </div>
  )
}
