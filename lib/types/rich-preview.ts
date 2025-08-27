// Rich Preview Types for Link4Coders
// Defines the structure for GitHub and Open Graph metadata

export type PreviewType = 'github_repo' | 'webpage' | 'blog_post' | 'unknown'
export type PreviewStatus = 'pending' | 'success' | 'failed' | 'expired'

// Base interface for all preview metadata
export interface BasePreviewMetadata {
  type: PreviewType
  fetched_at?: string
  expires_at?: string
  error?: string
}

// GitHub Repository Metadata
export interface GitHubRepoMetadata extends BasePreviewMetadata {
  type: 'github_repo'
  repo_name: string // e.g., "vercel/next.js"
  description: string | null
  language: string | null
  topics: string[]
  stars: number
  forks: number
  updated_at: string
  avatar_url: string | null
  is_private: boolean
  default_branch: string
  homepage?: string | null
  license?: {
    name: string
    spdx_id: string
  } | null
  owner: {
    login: string
    avatar_url: string
    type: 'User' | 'Organization'
  }
}

// Open Graph / Webpage Metadata
export interface WebpageMetadata extends BasePreviewMetadata {
  type: 'webpage'
  title: string | null
  description: string | null
  image: string | null
  favicon: string | null
  site_name: string | null
  domain: string
  url: string
  // Add icon_data field for custom icons in preview mode
  icon_data?: {
    icon_selection_type?: 'default' | 'platform' | 'upload' | 'url'
    custom_icon_url?: string
    uploaded_icon_url?: string
    use_custom_icon?: boolean
    icon_variant?: string
    platform_detected?: string
    category?: string
  }
}

// Blog platform metadata interfaces
export interface BlogPostMetadata extends BasePreviewMetadata {
  type: 'blog_post'
  title: string
  description: string | null
  excerpt: string | null
  featured_image: string | null
  author: {
    name: string
    username?: string
    avatar?: string
    profile_url?: string
  }
  published_at: string
  reading_time_minutes?: number
  tags?: string[]
  platform: 'medium' | 'hashnode' | 'dev.to' | 'substack' | 'ghost' | 'wordpress' | 'other'
  platform_logo?: string
  reactions_count?: number
  comments_count?: number
  canonical_url?: string
}

// Union type for all metadata
export type RichPreviewMetadata = GitHubRepoMetadata | WebpageMetadata | BlogPostMetadata | BasePreviewMetadata

// Extended UserLink interface with rich preview data
export interface UserLinkWithPreview {
  id: string
  user_id: string
  title: string
  url: string
  description?: string
  icon_type: string
  category: string
  position: number
  is_active: boolean
  click_count: number
  created_at: string
  updated_at: string
  metadata: RichPreviewMetadata
  preview_fetched_at?: string
  preview_expires_at?: string
  preview_status: PreviewStatus
  // Universal icon fields
  custom_icon_url?: string
  uploaded_icon_url?: string
  icon_variant?: string
  use_custom_icon?: boolean
  icon_selection_type?: 'default' | 'platform' | 'upload' | 'url'
  platform_detected?: string
  // GitHub Projects specific field
  live_project_url?: string
}

// GitHub API Response Types
export interface GitHubRepoResponse {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  default_branch: string
  topics: string[]
  license: {
    key: string
    name: string
    spdx_id: string
  } | null
  owner: {
    login: string
    avatar_url: string
    type: 'User' | 'Organization'
  }
}

// Open Graph Meta Tags
export interface OpenGraphData {
  title?: string
  description?: string
  image?: string
  url?: string
  site_name?: string
  type?: string
}

// HTML Meta Tags
export interface HtmlMetaData {
  title?: string
  description?: string
  favicon?: string
  canonical?: string
}

// Combined webpage data
export interface WebpageData {
  url: string
  domain: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  site_name?: string
  og: OpenGraphData
  meta: HtmlMetaData
}

// Preview fetch result
export interface PreviewFetchResult {
  success: boolean
  metadata?: RichPreviewMetadata
  error?: string
  cached?: boolean
}

// GitHub URL patterns for detection
export const GITHUB_URL_PATTERNS = [
  /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/,
  /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/?$/,
  /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/,
] as const

// Utility functions for URL detection
export function isGitHubUrl(url: string): boolean {
  return GITHUB_URL_PATTERNS.some(pattern => pattern.test(url))
}

export function isBlogUrl(url: string): { isBlog: boolean; platform?: string } {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    // Medium
    if (hostname === 'medium.com' || hostname.endsWith('.medium.com')) {
      return { isBlog: true, platform: 'medium' }
    }

    // Hashnode
    if (hostname === 'hashnode.dev' || hostname.endsWith('.hashnode.dev') ||
        hostname === 'hashnode.com' || hostname.endsWith('.hashnode.com')) {
      return { isBlog: true, platform: 'hashnode' }
    }

    // Check for Hashnode custom domains by looking for common Hashnode patterns in the URL
    // Many Hashnode blogs use custom domains but have specific URL structures
    if (url.includes('/hashnode') || url.includes('hashnode.dev') ||
        (hostname.includes('blog') && !hostname.includes('medium') && !hostname.includes('wordpress'))) {
      // This is a heuristic - we could also check the HTML for Hashnode-specific meta tags
      return { isBlog: true, platform: 'hashnode' }
    }

    // Dev.to
    if (hostname === 'dev.to') {
      return { isBlog: true, platform: 'dev.to' }
    }

    // Substack
    if (hostname.endsWith('.substack.com')) {
      return { isBlog: true, platform: 'substack' }
    }

    // Ghost blogs (common patterns)
    if (hostname.includes('ghost.') || urlObj.pathname.includes('/ghost/')) {
      return { isBlog: true, platform: 'ghost' }
    }

    // WordPress (common patterns)
    if (hostname.includes('wordpress.') || urlObj.pathname.includes('/wp-content/')) {
      return { isBlog: true, platform: 'wordpress' }
    }

    return { isBlog: false }
  } catch {
    return { isBlog: false }
  }
}

export function extractGitHubRepo(url: string): { owner: string; repo: string } | null {
  for (const pattern of GITHUB_URL_PATTERNS) {
    const match = url.match(pattern)
    if (match) {
      return {
        owner: match[1],
        repo: match[2]
      }
    }
  }
  return null
}

// Cache configuration
export const PREVIEW_CACHE_CONFIG = {
  github: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    staleWhileRevalidate: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  webpage: {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    staleWhileRevalidate: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  retry: {
    maxAttempts: 3,
    backoffMs: 1000,
    failureCooldown: 60 * 60 * 1000, // 1 hour
  }
} as const

// Error types for preview fetching
export class PreviewFetchError extends Error {
  constructor(
    message: string,
    public code: 'NETWORK_ERROR' | 'RATE_LIMITED' | 'NOT_FOUND' | 'PRIVATE_REPO' | 'INVALID_URL' | 'PARSE_ERROR',
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'PreviewFetchError'
  }
}
