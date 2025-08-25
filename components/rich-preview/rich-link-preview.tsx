'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { UserLinkWithPreview, RichPreviewMetadata, PreviewStatus } from '@/lib/types/rich-preview'
import { GitHubRepoCard } from './github-repo-card'
import { WebpagePreviewCard, BasicLinkCard } from './webpage-preview-card'
import { BlogPostCard } from './blog-post-card'
import { cn } from '@/lib/utils'

interface RichLinkPreviewProps {
  link: UserLinkWithPreview
  onClick?: () => void
  onRefresh?: (linkId: string) => Promise<void>
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  showRefreshButton?: boolean
  theme?: 'dark' | 'light'
  isPreviewMode?: boolean // Add explicit preview mode prop
}

export function RichLinkPreview({
  link,
  onClick,
  onRefresh,
  className,
  variant = 'default',
  showRefreshButton = false,
  theme = 'dark',
  isPreviewMode: explicitPreviewMode // Accept explicit preview mode prop
}: RichLinkPreviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    }
  }

  // For preview mode, if we're inside a LivePreview component, 
  // we should still show rich previews if the data is available
  // Only fall back to BasicLinkCard if we don't have rich preview data
  const isPreviewMode = explicitPreviewMode || (typeof window !== 'undefined' && 
    (window.location.pathname.includes('/dashboard/preview') || 
     window.location.pathname.includes('/dashboard/links')));
  
  // In preview mode, check if we have rich preview data
  if (isPreviewMode) {
    // If we have rich preview metadata, show the rich preview
    if (link.metadata && Object.keys(link.metadata).length > 0) {
      // Continue with normal rich preview rendering
    } else {
      // Fall back to BasicLinkCard only if no rich preview data
      return (
        <BasicLinkCard
          link={link}
          onClick={handleClick}
          className={className}
          variant={variant}
          theme={theme}
        />
      );
    }
  }

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return

    setIsRefreshing(true)
    setRefreshError(null)

    try {
      await onRefresh(link.id)
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : 'Failed to refresh preview')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Loading state
  if (link.preview_status === 'pending' || isRefreshing) {
    // For all links in the preview, use BasicLinkCard instead of showing loading state
    // Special handling only for GitHub repos, blogs and projects that actually need rich previews
    const needsRichPreview = link.url.includes('github.com') && link.category === 'projects';
    
    if (!needsRichPreview) {
      return (
        <BasicLinkCard
          link={link}
          onClick={handleClick}
          className={className}
          variant={variant}
          theme={theme}
        />
      );
    }
    
    const isLight = theme === 'light'

    return (
      <div className={cn(
        "relative w-full rounded-3xl p-6 shadow-sm",
        variant === 'compact' && "rounded-2xl p-4",
        isLight
          ? "bg-white border border-gray-200"
          : "glassmorphic shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]",
        className
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            isLight
              ? "bg-gray-100 border border-gray-200"
              : "bg-white/5 ring-2 ring-white/10"
          )}>
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-bold truncate font-['Sharp_Grotesk'] mb-1",
              isLight ? "text-gray-900" : "text-white"
            )}>
              {link.title}
            </h3>
            <p className={cn(
              "text-sm",
              isLight ? "text-gray-600" : "text-gray-400"
            )}>
              {isRefreshing ? 'Refreshing preview...' : 'Loading preview...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (link.preview_status === 'failed' && !link.metadata) {
    const isLight = theme === 'light'

    return (
      <div className={cn(
        "relative w-full rounded-3xl p-6 shadow-sm",
        variant === 'compact' && "rounded-2xl p-4",
        isLight
          ? "bg-white border border-red-200"
          : "glassmorphic shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] border-red-500/20",
        className
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            isLight
              ? "bg-red-50 border border-red-200"
              : "bg-red-500/10 ring-2 ring-red-500/20"
          )}>
            <AlertCircle className={cn(
              "w-6 h-6",
              isLight ? "text-red-500" : "text-red-400"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-bold truncate font-['Sharp_Grotesk'] mb-1",
              isLight ? "text-gray-900" : "text-white"
            )}>
              {link.title}
            </h3>
            <p className={cn(
              "text-sm",
              isLight ? "text-red-600" : "text-red-400"
            )}>
              Failed to load preview
            </p>
            {refreshError && (
              <p className={cn(
                "text-xs mt-1",
                isLight ? "text-red-500" : "text-red-400"
              )}>
                {refreshError}
              </p>
            )}
          </div>
          {showRefreshButton && onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "p-2 rounded-lg transition-colors disabled:opacity-50",
                isLight
                  ? "bg-red-50 hover:bg-red-100"
                  : "bg-white/5 hover:bg-white/10"
              )}
            >
              <RefreshCw className={cn(
                "w-4 h-4",
                isLight ? "text-red-500" : "text-gray-400",
                isRefreshing && "animate-spin"
              )} />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Rich preview with metadata
  if (link.metadata && link.preview_status === 'success') {
    const metadata = link.metadata as RichPreviewMetadata

    // For links in preview context, prioritize immediate display over rich previews
    // Only use rich preview components for specific types that need them
    if (metadata.type === 'unknown') {
      return (
        <BasicLinkCard
          link={link}
          onClick={handleClick}
          className={className}
          variant={variant}
          theme={theme}
        />
      );
    }

    // GitHub repository preview
    if (metadata.type === 'github_repo') {
      return (
        <GitHubRepoCard
          link={link}
          metadata={metadata}
          onClick={handleClick}
          onRefresh={showRefreshButton ? handleRefresh : undefined}
          className={className}
          variant={variant}
          theme={theme}
        />
      )
    }

    // Blog post preview
    if (metadata.type === 'blog_post') {
      return (
        <BlogPostCard
          link={link}
          metadata={metadata}
          onClick={handleClick}
          onRefresh={showRefreshButton ? handleRefresh : undefined}
          className={className}
          variant={variant}
          theme={theme}
        />
      )
    }

    // Webpage preview
    if (metadata.type === 'webpage') {
      return (
        <WebpagePreviewCard
          link={link}
          metadata={metadata}
          onClick={handleClick}
          onRefresh={showRefreshButton ? handleRefresh : undefined}
          className={className}
          variant={variant}
          theme={theme}
        />
      )
    }
  }

  // Fallback to basic link card
  return (
    <BasicLinkCard
      link={link}
      onClick={handleClick}
      className={className}
      variant={variant}
      theme={theme}
    />
  )
}

// Loading skeleton component
export function RichLinkPreviewSkeleton({ 
  variant = 'default',
  className 
}: { 
  variant?: 'default' | 'compact'
  className?: string 
}) {
  return (
    <div className={cn(
      "relative w-full bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
      "backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6",
      "shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-pulse",
      variant === 'compact' && "rounded-2xl p-4",
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 bg-white/10 rounded-lg w-3/4" />
          <div className="h-4 bg-white/5 rounded-lg w-1/2" />
        </div>
      </div>
      {variant !== 'compact' && (
        <>
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-white/5 rounded-lg w-full" />
            <div className="h-4 bg-white/5 rounded-lg w-2/3" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-6 bg-white/5 rounded-lg w-16" />
            <div className="h-6 bg-white/5 rounded-lg w-12" />
            <div className="h-6 bg-white/5 rounded-lg w-14" />
          </div>
        </>
      )}
    </div>
  )
}

// Error boundary component
export function RichLinkPreviewError({ 
  error, 
  onRetry,
  className 
}: { 
  error: string
  onRetry?: () => void
  className?: string 
}) {
  return (
    <div className={cn(
      "relative w-full bg-gradient-to-br from-red-500/10 to-red-500/5",
      "backdrop-blur-xl border border-red-500/20 rounded-3xl p-6",
      "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white font-['Sharp_Grotesk'] mb-1">
            Preview Error
          </h3>
          <p className="text-sm text-red-400">
            {error}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
