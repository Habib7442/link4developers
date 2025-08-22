'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, MouseEvent } from 'react'

interface OptimizedLinkProps {
  href: string
  children: ReactNode
  className?: string
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
  'aria-label'?: string
}

/**
 * Optimized Link component with enhanced router cache management
 * Provides better prefetching and cache control for improved navigation performance
 */
export function OptimizedLink({
  href,
  children,
  className,
  prefetch = true,
  replace = false,
  scroll = true,
  onClick,
  'aria-label': ariaLabel,
  ...props
}: OptimizedLinkProps) {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick handler if provided
    if (onClick) {
      onClick(e)
    }

    // For external links, don't interfere with default behavior
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return
    }

    // For internal navigation, we can add custom logic here if needed
    // The Link component will handle the navigation automatically
  }

  // Determine prefetch strategy based on link type
  const shouldPrefetch = (() => {
    // Don't prefetch external links
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return false
    }

    // Don't prefetch if explicitly disabled
    if (prefetch === false) {
      return false
    }

    // Prefetch dashboard and profile pages
    if (href.startsWith('/dashboard') || href.match(/^\/[a-zA-Z0-9_-]+$/)) {
      return true
    }

    // Default to prefetch for internal links
    return prefetch
  })()

  return (
    <Link
      href={href}
      className={className}
      prefetch={shouldPrefetch}
      replace={replace}
      scroll={scroll}
      onClick={handleClick}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Link>
  )
}

/**
 * Hook for programmatic navigation with cache optimization
 */
export function useOptimizedRouter() {
  const router = useRouter()

  const navigateTo = (href: string, options?: { replace?: boolean; scroll?: boolean }) => {
    const { replace = false, scroll = true } = options || {}

    if (replace) {
      router.replace(href, { scroll })
    } else {
      router.push(href, { scroll })
    }
  }

  const prefetchRoute = (href: string) => {
    // Only prefetch internal routes
    if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      router.prefetch(href)
    }
  }

  const refreshRoute = () => {
    router.refresh()
  }

  return {
    navigateTo,
    prefetchRoute,
    refreshRoute,
    router
  }
}

/**
 * Component for prefetching routes on hover or intersection
 */
interface PrefetchTriggerProps {
  href: string
  children: ReactNode
  triggerOn?: 'hover' | 'intersection'
  className?: string
}

export function PrefetchTrigger({
  href,
  children,
  triggerOn = 'hover',
  className
}: PrefetchTriggerProps) {
  const { prefetchRoute } = useOptimizedRouter()

  const handleMouseEnter = () => {
    if (triggerOn === 'hover') {
      prefetchRoute(href)
    }
  }

  // For intersection-based prefetching, you could use IntersectionObserver
  // This is a simplified version that prefetches on hover

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </div>
  )
}

/**
 * Cache-aware navigation component for dashboard
 */
interface DashboardNavLinkProps {
  href: string
  children: ReactNode
  className?: string
  activeClassName?: string
  isActive?: boolean
}

export function DashboardNavLink({
  href,
  children,
  className = '',
  activeClassName = '',
  isActive = false
}: DashboardNavLinkProps) {
  return (
    <OptimizedLink
      href={href}
      className={`${className} ${isActive ? activeClassName : ''}`}
      prefetch={true} // Always prefetch dashboard routes
    >
      {children}
    </OptimizedLink>
  )
}

/**
 * Profile link component with optimized caching
 */
interface ProfileLinkProps {
  username: string
  children: ReactNode
  className?: string
  preview?: boolean
}

export function ProfileLink({
  username,
  children,
  className,
  preview = false
}: ProfileLinkProps) {
  const href = preview ? `/${username}?preview=true` : `/${username}`

  return (
    <OptimizedLink
      href={href}
      className={className}
      prefetch={true} // Always prefetch profile pages
      aria-label={`View ${username}'s profile`}
    >
      {children}
    </OptimizedLink>
  )
}

/**
 * External link component (no caching/prefetching)
 */
interface ExternalLinkProps {
  href: string
  children: ReactNode
  className?: string
  openInNewTab?: boolean
}

export function ExternalLink({
  href,
  children,
  className,
  openInNewTab = true
}: ExternalLinkProps) {
  const props = openInNewTab
    ? {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    : {}

  return (
    <a
      href={href}
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}
