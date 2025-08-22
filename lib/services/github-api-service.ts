// GitHub API Service for fetching repository metadata
// Supports both REST API v3 and GraphQL v4 with rate limiting and caching

import { 
  GitHubRepoResponse, 
  GitHubRepoMetadata, 
  PreviewFetchError,
  extractGitHubRepo,
  PREVIEW_CACHE_CONFIG 
} from '@/lib/types/rich-preview'

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN

// Rate limiting configuration
interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  used: number
}

class GitHubApiService {
  private static rateLimitInfo: RateLimitInfo | null = null
  private static lastRateLimitCheck = 0

  /**
   * Fetch repository metadata from GitHub API
   */
  static async fetchRepoMetadata(url: string): Promise<GitHubRepoMetadata> {
    const repoInfo = extractGitHubRepo(url)
    if (!repoInfo) {
      throw new PreviewFetchError('Invalid GitHub URL', 'INVALID_URL', false)
    }

    const { owner, repo } = repoInfo

    try {
      // Check rate limits before making request
      await this.checkRateLimit()

      // Fetch repository data
      const repoData = await this.fetchRepository(owner, repo)
      
      // Transform to our metadata format
      const metadata: GitHubRepoMetadata = {
        type: 'github_repo',
        repo_name: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        topics: repoData.topics || [],
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        updated_at: repoData.updated_at,
        avatar_url: repoData.owner.avatar_url,
        is_private: repoData.private,
        default_branch: repoData.default_branch,
        homepage: repoData.homepage,
        license: repoData.license ? {
          name: repoData.license.name,
          spdx_id: repoData.license.spdx_id
        } : null,
        owner: {
          login: repoData.owner.login,
          avatar_url: repoData.owner.avatar_url,
          type: repoData.owner.type
        },
        fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + PREVIEW_CACHE_CONFIG.github.ttl).toISOString()
      }

      console.log('🔍 GitHub API: Generated metadata:', JSON.stringify(metadata, null, 2))
      return metadata

    } catch (error) {
      console.error('GitHub API error:', error)
      
      if (error instanceof PreviewFetchError) {
        throw error
      }

      // Handle specific GitHub API errors
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new PreviewFetchError('Repository not found', 'NOT_FOUND', false)
        }
        if (error.message.includes('403')) {
          throw new PreviewFetchError('Repository is private or rate limited', 'PRIVATE_REPO', true)
        }
        if (error.message.includes('rate limit')) {
          throw new PreviewFetchError('GitHub API rate limit exceeded', 'RATE_LIMITED', true)
        }
      }

      throw new PreviewFetchError('Failed to fetch GitHub repository data', 'NETWORK_ERROR', true)
    }
  }

  /**
   * Fetch repository data from GitHub REST API
   */
  private static async fetchRepository(owner: string, repo: string): Promise<GitHubRepoResponse> {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Link4Coders/1.0'
    }

    // Add authentication if token is available
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`
    }

    const response = await fetch(url, {
      headers,
      next: {
        revalidate: PREVIEW_CACHE_CONFIG.github.ttl / 1000, // Cache for 24 hours
        tags: [`github-repo-${owner}-${repo}`, 'github-api', 'rich-preview']
      }
    })

    // Update rate limit info from response headers
    this.updateRateLimitInfo(response)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Check current rate limit status
   */
  private static async checkRateLimit(): Promise<void> {
    // Only check rate limit every 5 minutes to avoid unnecessary requests
    const now = Date.now()
    if (now - this.lastRateLimitCheck < 5 * 60 * 1000 && this.rateLimitInfo) {
      if (this.rateLimitInfo.remaining <= 0) {
        const resetTime = this.rateLimitInfo.reset * 1000
        if (now < resetTime) {
          throw new PreviewFetchError(
            `GitHub API rate limit exceeded. Resets at ${new Date(resetTime).toISOString()}`,
            'RATE_LIMITED',
            true
          )
        }
      }
      return
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Link4Coders/1.0'
      }

      if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`
      }

      const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
        headers,
        next: {
          revalidate: 300, // Cache for 5 minutes
          tags: ['github-rate-limit', 'github-api']
        }
      })

      if (response.ok) {
        const data = await response.json()
        this.rateLimitInfo = data.rate
        this.lastRateLimitCheck = now
        
        if (this.rateLimitInfo && this.rateLimitInfo.remaining <= 0) {
          const resetTime = this.rateLimitInfo.reset * 1000
          if (now < resetTime) {
            throw new PreviewFetchError(
              `GitHub API rate limit exceeded. Resets at ${new Date(resetTime).toISOString()}`,
              'RATE_LIMITED',
              true
            )
          }
        }
      }
    } catch (error) {
      console.warn('Failed to check GitHub rate limit:', error)
      // Continue anyway if rate limit check fails
    }
  }

  /**
   * Update rate limit info from response headers
   */
  private static updateRateLimitInfo(response: Response): void {
    const limit = response.headers.get('x-ratelimit-limit')
    const remaining = response.headers.get('x-ratelimit-remaining')
    const reset = response.headers.get('x-ratelimit-reset')
    const used = response.headers.get('x-ratelimit-used')

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        used: used ? parseInt(used) : 0
      }
      this.lastRateLimitCheck = Date.now()
    }
  }

  /**
   * Get current rate limit status
   */
  static getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo
  }

  /**
   * Check if a URL is a GitHub repository URL
   */
  static isGitHubRepoUrl(url: string): boolean {
    const repoInfo = extractGitHubRepo(url)
    return repoInfo !== null
  }

  /**
   * Extract repository information from URL
   */
  static extractRepoInfo(url: string): { owner: string; repo: string } | null {
    return extractGitHubRepo(url)
  }
}

export { GitHubApiService }
