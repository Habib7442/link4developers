'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { UserLinkWithPreview, RichPreviewMetadata, PreviewStatus, GitHubRepoMetadata, WebpageMetadata, BlogPostMetadata } from '@/lib/types/rich-preview'
import { GitHubRepoCard } from './github-repo-card'
import { WebpagePreviewCard, BasicLinkCard } from './webpage-preview-card'
import { BlogPostCard } from './blog-post-card'
import { cn } from '@/lib/utils'
import { ApiLinkService } from '@/lib/services/api-link-service'
import { useAuthStore } from '@/stores/auth-store'

interface RichLinkPreviewProps {
  link: UserLinkWithPreview
  onClick?: () => void
  onRefresh?: (linkId: string) => Promise<void>
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  showRefreshButton?: boolean
  theme?: 'dark' | 'light'
  isPreviewMode?: boolean // Add explicit preview mode prop
  linkHoverColor?: string // Add link hover color prop
}

export function RichLinkPreview({
  link,
  onClick,
  onRefresh,
  className,
  variant = 'default',
  showRefreshButton = false,
  theme = 'dark',
  isPreviewMode: explicitPreviewMode, // Accept explicit preview mode prop
  linkHoverColor = '#ffc0cb' // Default to pink if not provided
}: RichLinkPreviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const handleClick = async () => {
    try {
      // Track the click before opening the link
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
      console.log('Click tracked:', result);
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Open the link regardless of tracking success
    if (onClick) {
      onClick();
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // For preview mode detection, use the prop directly to avoid hydration mismatches
  // Server-side rendering will always use the explicitPreviewMode prop
  // Avoid client-side detection with window.location to prevent hydration errors
  const isPreviewMode = explicitPreviewMode;
  
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

  // Immediately fetch metadata for new links that don't have metadata yet
  useEffect(() => {
    const fetchMetadataImmediately = async () => {
      // Only fetch for links without metadata in preview mode
      if (isPreviewMode && (!link.metadata || Object.keys(link.metadata).length === 0)) {
        try {
          console.log('🔄 Immediately fetching metadata for link:', link.id)
          // Use a slight delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (user?.id) {
            await ApiLinkService.refreshRichPreview(user.id, link.id)
            
            // If there's an onRefresh callback, call it to update the parent component
            if (onRefresh) {
              await onRefresh(link.id)
            }
          }
        } catch (error) {
          console.warn('Failed to immediately fetch metadata:', error)
          // Don't show error to user as this is a background operation
        }
      }
    }

    fetchMetadataImmediately()
  }, [link.id, link.metadata, isPreviewMode, user?.id, onRefresh])

  // Loading state - only show loading in non-preview mode when there's no metadata
  // In preview mode, prioritize showing cards over loading indicators
  if (!isPreviewMode && (link.preview_status === 'pending' || isRefreshing) && (!link.metadata || Object.keys(link.metadata).length === 0)) {
    // Only show loading state in non-preview modes for links with no metadata
    // For links with metadata, we'll show a preview card even if status is pending
    
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

  // Error state - only show error card in non-preview mode
  // In preview mode, show a basic card instead of error state
  if (!isPreviewMode && link.preview_status === 'failed' && (!link.metadata || Object.keys(link.metadata).length === 0)) {
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
  // Show rich preview for links with metadata, regardless of preview status
  // This ensures links with metadata show as rich cards even if status is pending or failed
  if (link.metadata && typeof link.metadata === 'object' && Object.keys(link.metadata).length > 0) {
    const metadata = link.metadata as RichPreviewMetadata

    // Always try to use rich previews for better user experience
    // Instead of limiting to specific types, use WebpagePreviewCard as default
    // Only fallback to BasicLinkCard for truly unknown types with no usable metadata

    // GitHub repository preview
    if (metadata.type === 'github_repo') {
      const githubMetadata = metadata as GitHubRepoMetadata;
      return (
        <GitHubRepoCard
          link={link}
          metadata={githubMetadata}
          onClick={handleClick}
          onRefresh={showRefreshButton ? handleRefresh : undefined}
          className={className}
          variant={variant}
          theme={theme}
          linkHoverColor={linkHoverColor} // Pass link hover color
        />
      )
    }

    // Blog post preview
    if (metadata.type === 'blog_post') {
      const blogMetadata = metadata as BlogPostMetadata;
      return (
        <BlogPostCard
          link={link}
          metadata={blogMetadata}
          onClick={handleClick}
          onRefresh={showRefreshButton ? handleRefresh : undefined}
          className={className}
          variant={variant}
          theme={theme}
          linkHoverColor={linkHoverColor} // Pass link hover color
        />
      )
    }

    // Webpage preview - this will handle most generic links
    // including personal, custom and projects links that don't match other types
    const webpageMetadata = metadata as WebpageMetadata;
    return (
      <WebpagePreviewCard
        link={link}
        metadata={webpageMetadata}
        onClick={handleClick}
        onRefresh={showRefreshButton ? handleRefresh : undefined}
        className={className}
        variant={variant}
        theme={theme}
        linkHoverColor={linkHoverColor} // Pass link hover color
      />
    )
  }

  // In preview mode, always try to show a rich card even without metadata
  // Create minimal metadata for display
  if (isPreviewMode) {
    // Extract domain from URL
    let domain = '';
    try {
      const urlObj = new URL(link.url);
      domain = urlObj.hostname;
    } catch (e) {
      domain = link.url;
    }
    
    // Always create a minimal metadata object for preview mode
    // This ensures we don't show loading states in preview mode
    // Use a static timestamp to avoid hydration mismatches
    const minimalMetadata: WebpageMetadata = {
      type: 'webpage',
      title: link.title || 'Untitled Link',
      description: link.description || 'No description available',
      image: null,
      url: link.url,
      site_name: '',
      favicon: '',
      domain: domain,
      fetched_at: '2023-01-01T00:00:00.000Z', // Use static timestamp to avoid hydration mismatches
      // Add custom icon data to ensure it's always visible
      icon_data: {
        icon_selection_type: link.icon_selection_type,
        custom_icon_url: link.custom_icon_url,
        uploaded_icon_url: link.uploaded_icon_url,
        use_custom_icon: link.use_custom_icon,
        icon_variant: link.icon_variant,
        platform_detected: link.platform_detected,
        category: link.category
      }
    };
    
    return (
      <WebpagePreviewCard
        link={link}
        metadata={minimalMetadata}
        onClick={handleClick}
        onRefresh={showRefreshButton ? handleRefresh : undefined}
        className={className}
        variant={variant}
        theme={theme}
        linkHoverColor={linkHoverColor} // Pass link hover color
      />
    )
  }

  // Fallback to basic link card when not in preview mode and no metadata is available
  // In preview mode, we should never reach this point as we create minimal metadata above
  return (
    <BasicLinkCard
      link={link}
      onClick={handleClick}
      className={className}
      variant={variant === 'detailed' ? 'default' : variant}
      theme={theme}
      linkHoverColor={linkHoverColor} // Pass link hover color
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
