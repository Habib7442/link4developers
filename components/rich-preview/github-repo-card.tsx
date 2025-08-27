'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Star,
  GitFork,
  ExternalLink,
  Calendar,
  Shield,
  RefreshCw
} from 'lucide-react'
import { GitHubRepoMetadata } from '@/lib/types/rich-preview'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { cn } from '@/lib/utils'

interface GitHubRepoCardProps {
  link: UserLinkWithPreview
  metadata: GitHubRepoMetadata
  onClick?: () => void
  onRefresh?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  theme?: 'dark' | 'light'
  linkHoverColor?: string // Add link hover color prop
}

export function GitHubRepoCard({
  link,
  metadata,
  onClick,
  onRefresh,
  className,
  variant = 'default',
  theme = 'dark',
  linkHoverColor = '#ffc0cb' // Default to pink if not provided
}: GitHubRepoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
    return `${Math.ceil(diffDays / 365)} years ago`
  }

  const getLanguageColor = (language: string | null): string => {
    const colors: Record<string, string> = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C': '#555555',
      'C#': '#239120',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#fa7343',
      'Kotlin': '#A97BFF',
      'Dart': '#00B4AB',
      'HTML': '#e34c26',
      'CSS': '#1572B6',
      'Vue': '#4FC08D',
      'React': '#61DAFB',
    }
    return colors[language || ''] || '#8b949e'
  }

  if (variant === 'compact') {
    const isLight = theme === 'light'

    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative w-full rounded-2xl p-4 transition-all duration-300 text-left shadow-sm",
          isLight
            ? "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            : "glassmorphic shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] hover:shadow-[0px_20px_35px_rgba(0,0,0,0.40)]",
          className
        )}
      >
        <div className="flex items-center gap-3">
          {metadata.owner?.avatar_url && !imageError && (
            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={metadata.owner.avatar_url}
                alt={metadata.owner.login}
                fill
                sizes="32px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-sm font-semibold truncate font-['Sharp_Grotesk']",
              isLight ? "text-gray-900" : "text-white"
            )}>
              {metadata.repo_name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              {metadata.language && (
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getLanguageColor(metadata.language) }}
                  />
                  <span className={cn(
                    "text-xs",
                    isLight ? "text-gray-600" : "text-gray-400"
                  )}>{metadata.language}</span>
                </div>
              )}
              <div className={cn(
                "flex items-center gap-1 text-xs",
                isLight ? "text-gray-600" : "text-gray-400"
              )}>
                <Star className="w-3 h-3" />
                {formatNumber(metadata.stars)}
              </div>
            </div>
            {/* Add Live Project URL for compact view */}
            {link.live_project_url && (
              <div className="mt-1">
                <a 
                  href={link.live_project_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs"
                  style={{
                    color: isLight ? '#2563eb' : '#60a5fa',
                    transition: 'color 0.3s ease',
                    // Override with the user's selected link color if in hover state
                    ...(isHovered && { color: linkHoverColor })
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  Live Demo
                </a>
              </div>
            )}
          </div>
          <ExternalLink 
            className={cn(
              "w-4 h-4 transition-colors flex-shrink-0",
              isLight ? "text-gray-500" : "text-gray-400"
            )}
            style={{
              transition: 'color 0.3s ease',
              color: isHovered ? linkHoverColor : undefined
            }}
          />
        </div>
      </button>
    )
  }

  const isLight = theme === 'light'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative w-full rounded-3xl p-6 transition-all duration-500 text-left overflow-hidden transform hover:scale-[1.02]",
        isLight
          ? "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow-md"
          : "glassmorphic shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] hover:shadow-[0px_20px_40px_rgba(0,0,0,0.40)]",
        className
      )}
    >
      {/* Animated background gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {metadata.owner?.avatar_url && metadata.owner.avatar_url.trim() !== '' && !imageError && (
            <div className={cn(
              "relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0",
              isLight
                ? "border border-gray-200"
                : "ring-2 ring-white/10"
            )}>
              <Image
                src={metadata.owner.avatar_url}
                alt={metadata.owner?.login || 'Repository owner'}
                fill
                sizes="48px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-bold truncate font-['Sharp_Grotesk'] mb-1",
              isLight ? "text-gray-900" : "text-white"
            )}>
              {metadata.repo_name}
            </h3>
            <p className={cn(
              "text-sm font-medium",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>
              by {metadata.owner?.login || 'Unknown'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  onRefresh()
                }}
                className={cn(
                  "p-2 rounded-lg transition-colors cursor-pointer",
                  isLight
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-white/5 hover:bg-white/10"
                )}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onRefresh()
                  }
                }}
              >
                <RefreshCw className={cn(
                  "w-4 h-4",
                  isLight ? "text-gray-600" : "text-gray-400"
                )} />
              </div>
            )}
            <ExternalLink 
              className={cn(
                "w-5 h-5 transition-colors",
                isLight ? "text-gray-500" : "text-gray-400"
              )}
              style={{
                transition: 'color 0.3s ease',
                color: isHovered ? linkHoverColor : undefined
              }}
            />
          </div>
        </div>

        {/* Description */}
        {metadata.description && (
          <p className={cn(
            "text-sm leading-relaxed mb-4 line-clamp-2",
            isLight ? "text-gray-700" : "text-gray-300"
          )}>
            {metadata.description}
          </p>
        )}

        {/* Live Project URL - Add this section */}
        {link.live_project_url && (
          <div className="mb-4">
            <a 
              href={link.live_project_url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{
                color: isLight ? '#2563eb' : '#60a5fa',
                transition: 'color 0.3s ease',
                // Override with the user's selected link color if in hover state
                ...(isHovered && { color: linkHoverColor })
              }}
            >
              <ExternalLink 
                className="w-4 h-4" 
                style={{
                  transition: 'color 0.3s ease',
                  color: isHovered ? linkHoverColor : undefined
                }}
              />
              Live Demo
            </a>
          </div>
        )}

        {/* Topics */}
        {metadata.topics && metadata.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {metadata.topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className={cn(
                  "px-2 py-1 text-xs rounded-lg font-medium",
                  isLight
                    ? "bg-blue-100 text-blue-700"
                    : "bg-blue-500/20 text-blue-300"
                )}
              >
                {topic}
              </span>
            ))}
            {metadata.topics.length > 4 && (
              <span className={cn(
                "px-2 py-1 text-xs rounded-lg",
                isLight
                  ? "bg-gray-100 text-gray-600"
                  : "bg-gray-500/20 text-gray-400"
              )}>
                +{metadata.topics.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {metadata.language && (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getLanguageColor(metadata.language) }}
                />
                <span className={cn(
                  "text-sm font-medium",
                  isLight ? "text-gray-700" : "text-gray-300"
                )}>{metadata.language}</span>
              </div>
            )}
            <div className={cn(
              "flex items-center gap-1 text-sm",
              isLight ? "text-gray-700" : "text-gray-300"
            )}>
              <Star className="w-4 h-4 text-yellow-400" />
              {formatNumber(metadata.stars)}
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm",
              isLight ? "text-gray-700" : "text-gray-300"
            )}>
              <GitFork className={cn(
                "w-4 h-4",
                isLight ? "text-gray-500" : "text-gray-400"
              )} />
              {formatNumber(metadata.forks)}
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs",
            isLight ? "text-gray-600" : "text-gray-400"
          )}>
            <Calendar className="w-3 h-3" />
            {formatDate(metadata.updated_at)}
          </div>
        </div>

        {/* License */}
        {metadata.license && (
          <div className={cn(
            "flex items-center gap-1 mt-3 pt-3 border-t",
            isLight ? "border-gray-200" : "border-white/10"
          )}>
            <Shield className={cn(
              "w-3 h-3",
              isLight ? "text-gray-500" : "text-gray-400"
            )} />
            <span className={cn(
              "text-xs",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>{metadata.license.name}</span>
          </div>
        )}
      </div>
    </button>
  )
}
