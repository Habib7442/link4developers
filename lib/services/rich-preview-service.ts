// Rich Preview Service - Main orchestrator for fetching and caching link previews
// Handles GitHub repositories, webpages, and caching strategies

import {
  RichPreviewMetadata,
  PreviewFetchResult,
  PreviewFetchError,
  isGitHubUrl,
  isBlogUrl,
  PREVIEW_CACHE_CONFIG
} from '@/lib/types/rich-preview'
import { GitHubApiService } from './github-api-service'
import { MetaScraperService } from './meta-scraper-service'
import { BlogApiService } from './blog-api-service'
import { createClient } from '@supabase/supabase-js'
import { CacheInvalidationService } from './cache-invalidation-service'
import { unstable_cache } from 'next/cache'
import { UserLink } from './link-service'

// Create a server-side Supabase client for RPC operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
)

export class RichPreviewService {
  /**
   * Check if a link should have rich preview (exclude social media links)
   */
  private static shouldHaveRichPreview(link: { category: string; url: string }): boolean {
    // Exclude social media links from rich preview
    if (link.category === 'social') {
      return false
    }

    // Include GitHub repositories
    if (isGitHubUrl(link.url)) {
      return true
    }

    // Include blog posts from supported platforms
    const blogCheck = isBlogUrl(link.url)
    if (blogCheck.isBlog) {
      return true
    }

    // Exclude other social media URLs
    return !this.isSocialMediaUrl(link.url)
  }

  /**
   * Check if URL is a social media platform
   */
  private static isSocialMediaUrl(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.toLowerCase()
      const socialDomains = [
        'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 'linkedin.com',
        'youtube.com', 'tiktok.com', 'snapchat.com', 'discord.com', 'telegram.org',
        'whatsapp.com', 'reddit.com', 'pinterest.com', 'tumblr.com'
      ]
      return socialDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`))
    } catch {
      return false
    }
  }

  /**
   * Fetch rich preview metadata for a URL
   */
  static async fetchPreviewMetadata(url: string): Promise<PreviewFetchResult> {
    try {
      console.log('🔍 Rich Preview: Fetching metadata for:', url)

      // Determine preview type and fetch accordingly
      let metadata: RichPreviewMetadata

      if (isGitHubUrl(url)) {
        console.log('🔍 Rich Preview: Detected GitHub URL')
        metadata = await GitHubApiService.fetchRepoMetadata(url)
      } else {
        const blogCheck = isBlogUrl(url)
        if (blogCheck.isBlog && blogCheck.platform) {
          console.log(`🔍 Rich Preview: Detected ${blogCheck.platform} blog URL`)
          try {
            metadata = await BlogApiService.fetchBlogMetadata(url, blogCheck.platform)
          } catch (error) {
            console.warn(`🔍 Rich Preview: Blog API failed for ${blogCheck.platform}, falling back to basic webpage metadata:`, error)
            // Graceful fallback to basic webpage scraping
            metadata = await MetaScraperService.fetchWebpageMetadata(url)
          }
        } else {
          console.log('🔍 Rich Preview: Detected webpage URL')
          metadata = await MetaScraperService.fetchWebpageMetadata(url)
        }
      }

      console.log('✅ Rich Preview: Successfully fetched metadata:', metadata.type)
      
      return {
        success: true,
        metadata,
        cached: false
      }

    } catch (error) {
      console.error('❌ Rich Preview: Error fetching metadata:', error)
      
      return {
        success: false,
        error: error instanceof PreviewFetchError ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Update link preview metadata in database
   */
  static async updateLinkPreview(
    linkId: string,
    metadata: RichPreviewMetadata
  ): Promise<void> {
    try {
      console.log('💾 Rich Preview: Updating database for link:', linkId)
      console.log('💾 Rich Preview: Metadata to save:', JSON.stringify(metadata, null, 2))

      // First, get the current link data to preserve custom icon information
      const { data: currentLink, error: fetchError } = await supabase
        .from('user_links')
        .select('custom_icon_url, uploaded_icon_url, icon_variant, use_custom_icon, icon_selection_type, platform_detected')
        .eq('id', linkId)
        .single()

      if (fetchError) {
        console.error('❌ Rich Preview: Error fetching current link data:', fetchError)
        throw new Error(`Failed to fetch current link data: ${fetchError.message}`)
      }

      const { error } = await supabase
        .rpc('update_link_preview', {
          p_link_id: linkId,
          p_metadata: metadata,
          p_status: 'success',
          p_custom_icon_url: currentLink?.custom_icon_url || null,
          p_uploaded_icon_url: currentLink?.uploaded_icon_url || null,
          p_icon_variant: currentLink?.icon_variant || 'default',
          p_use_custom_icon: currentLink?.use_custom_icon || false,
          p_icon_selection_type: currentLink?.icon_selection_type || 'default',
          p_platform_detected: currentLink?.platform_detected || null
        })

      if (error) {
        console.error('❌ Rich Preview: RPC error:', error)
        throw new Error(`Database update failed: ${error.message}`)
      }

      console.log('✅ Rich Preview: Database updated successfully')

    } catch (error) {
      console.error('❌ Rich Preview: Database update error:', error)
      throw error
    }
  }

  /**
   * Mark link preview as failed in database
   */
  static async markPreviewFailed(
    linkId: string, 
    errorMessage: string
  ): Promise<void> {
    try {
      console.log('❌ Rich Preview: Marking preview as failed for link:', linkId)

      // First, get the current link data to check its type
      const { data: currentLink, error: fetchError } = await supabase
        .from('user_links')
        .select('metadata')
        .eq('id', linkId)
        .single()

      if (fetchError) {
        console.error('❌ Rich Preview: Error fetching current link data:', fetchError)
        throw new Error(`Failed to fetch current link data: ${fetchError.message}`)
      }

      // Create error metadata that complies with constraints
      let errorMetadata = {}
      
      if (currentLink?.metadata?.type) {
        // Preserve the type but add error information
        errorMetadata = {
          ...currentLink.metadata,
          error: errorMessage,
          fetched_at: new Date().toISOString()
        }
      } else {
        // For links without metadata or type, create a basic error structure
        errorMetadata = {
          type: 'webpage',
          title: 'Preview Failed',
          description: errorMessage,
          error: errorMessage,
          fetched_at: new Date().toISOString()
        }
      }

      const { error } = await supabase
        .rpc('mark_preview_failed', {
          p_link_id: linkId,
          p_error_message: errorMessage
        })

      if (error) {
        throw new Error(`Database update failed: ${error.message}`)
      }

      console.log('✅ Rich Preview: Failure status updated in database')

    } catch (error) {
      console.error('❌ Rich Preview: Failed to update failure status:', error)
      throw error
    }
  }

  /**
   * Check if a link needs preview refresh
   */
  static async needsPreviewRefresh(linkId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('needs_preview_refresh', { link_id: linkId })

      if (error) {
        console.error('❌ Rich Preview: Error checking refresh status:', error)
        return true // Default to refresh on error
      }

      return data || false

    } catch (error) {
      console.error('❌ Rich Preview: Error checking refresh status:', error)
      return true // Default to refresh on error
    }
  }

  /**
   * Fetch and update preview for a single link
   */
  static async refreshLinkPreview(linkId: string, url: string): Promise<PreviewFetchResult> {
    try {
      console.log('🔄 Rich Preview: Refreshing preview for link:', linkId)

      // Check if this link should have rich preview
      const linkData = await this.getLinkData(linkId)
      if (linkData && !this.shouldHaveRichPreview({ category: linkData.category, url: linkData.url })) {
        console.log('🔄 Rich Preview: Skipping social media link:', linkId)
        return {
          success: false,
          error: 'Social media links do not support rich previews'
        }
      }

      // Fetch new metadata
      const result = await this.fetchPreviewMetadata(url)

      if (result.success && result.metadata) {
        // Update database with new metadata
        await this.updateLinkPreview(linkId, result.metadata)

        // Invalidate related caches
        try {
          const linkData = await this.getLinkData(linkId)
          if (linkData) {
            let type = 'webpage'
            if (isGitHubUrl(linkData.url)) {
              type = 'github'
            } else {
              const blogCheck = isBlogUrl(linkData.url)
              if (blogCheck.isBlog) {
                type = 'blog'
              }
            }
            await CacheInvalidationService.invalidateRichPreview(linkData.url, type)
          }
        } catch (cacheError) {
          console.warn('Rich Preview: Cache invalidation failed:', cacheError)
        }

        return {
          ...result,
          cached: false
        }
      } else {
        // Mark as failed in database
        await this.markPreviewFailed(linkId, result.error || 'Unknown error')
        
        return result
      }

    } catch (error) {
      console.error('❌ Rich Preview: Error refreshing preview:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.markPreviewFailed(linkId, errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * Batch fetch previews for multiple links
   */
  static async batchFetchPreviews(
    links: Array<{ id: string; url: string }>
  ): Promise<Map<string, PreviewFetchResult>> {
    const results = new Map<string, PreviewFetchResult>()
    
    console.log(`🔄 Rich Preview: Batch fetching ${links.length} previews`)

    // Process links in batches to avoid overwhelming APIs
    const batchSize = 5
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (link) => {
        try {
          const result = await this.refreshLinkPreview(link.id, link.url)
          results.set(link.id, result)
        } catch (error) {
          console.error(`❌ Rich Preview: Batch error for link ${link.id}:`, error)
          results.set(link.id, {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      })

      await Promise.allSettled(batchPromises)
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < links.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`✅ Rich Preview: Batch completed. ${results.size} results`)
    return results
  }

  /**
   * Get link data for cache invalidation
   */
  private static async getLinkData(linkId: string): Promise<{ url: string; user_id: string; category: string } | null> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .select('url, user_id, category')
        .eq('id', linkId)
        .single()

      if (error || !data) {
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Rich Preview: Error getting link data:', error)
      return null
    }
  }

  /**
   * Get cached preview metadata from database
   */
  static async getCachedPreview(linkId: string): Promise<RichPreviewMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .select('metadata, preview_status, preview_expires_at')
        .eq('id', linkId)
        .single()

      if (error || !data) {
        return null
      }

      // Check if preview is still valid
      if (data.preview_status !== 'success' || !data.metadata) {
        return null
      }

      // Check expiration
      if (data.preview_expires_at) {
        const expiresAt = new Date(data.preview_expires_at)
        if (expiresAt < new Date()) {
          return null
        }
      }

      return data.metadata as RichPreviewMetadata

    } catch (error) {
      console.error('❌ Rich Preview: Error getting cached preview:', error)
      return null
    }
  }

  /**
   * Validate URL before processing
   */
  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      
      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false
      }

      // Block localhost and private IPs for security
      const hostname = urlObj.hostname.toLowerCase()
      if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
      ) {
        return false
      }

      return true

    } catch {
      return false
    }
  }

  /**
   * Get preview statistics
   */
  static async getPreviewStats(): Promise<{
    total: number
    success: number
    failed: number
    pending: number
    github: number
    webpage: number
  }> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .select('preview_status, metadata')

      if (error || !data) {
        throw new Error('Failed to fetch preview stats')
      }

      const stats = {
        total: data.length,
        success: 0,
        failed: 0,
        pending: 0,
        github: 0,
        webpage: 0
      }

      data.forEach((link) => {
        switch (link.preview_status) {
          case 'success':
            stats.success++
            if (link.metadata?.type === 'github_repo') stats.github++
            if (link.metadata?.type === 'webpage') stats.webpage++
            break
          case 'failed':
            stats.failed++
            break
          case 'pending':
            stats.pending++
            break
        }
      })

      return stats

    } catch (error) {
      console.error('❌ Rich Preview: Error getting stats:', error)
      throw error
    }
  }

  /**
   * Fetch metadata immediately and return updated link data
   */
  static async fetchMetadataImmediately(linkId: string, url: string): Promise<any> {
    try {
      console.log('🔄 Rich Preview: Fetching metadata immediately for link:', linkId)

      // Check if this link should have rich preview
      const linkData = await this.getLinkData(linkId)
      if (linkData && !this.shouldHaveRichPreview({ category: linkData.category, url: linkData.url })) {
        console.log('🔄 Rich Preview: Skipping social media link:', linkId)
        throw new Error('Social media links do not support rich previews')
      }

      // Fetch new metadata
      const result = await this.fetchPreviewMetadata(url)

      if (result.success && result.metadata) {
        // Update database with new metadata
        await this.updateLinkPreview(linkId, result.metadata)

        // Get the updated link data
        const { data: updatedLink, error: fetchError } = await supabase
          .from('user_links')
          .select('*')
          .eq('id', linkId)
          .single()

        if (fetchError) {
          console.error('❌ Rich Preview: Error fetching updated link data:', fetchError)
          throw new Error(`Failed to fetch updated link data: ${fetchError.message}`)
        }

        // Invalidate related caches
        try {
          if (linkData) {
            let type = 'webpage'
            if (isGitHubUrl(linkData.url)) {
              type = 'github'
            } else {
              const blogCheck = isBlogUrl(linkData.url)
              if (blogCheck.isBlog) {
                type = 'blog'
              }
            }
            await CacheInvalidationService.invalidateRichPreview(linkData.url, type)
          }
        } catch (cacheError) {
          console.warn('Rich Preview: Cache invalidation failed:', cacheError)
        }

        return {
          success: true,
          data: updatedLink,
          metadata: result.metadata
        }
      } else {
        // Mark as failed in database
        await this.markPreviewFailed(linkId, result.error || 'Unknown error')
        
        return {
          success: false,
          error: result.error
        }
      }

    } catch (error) {
      console.error('❌ Rich Preview: Error fetching metadata immediately:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.markPreviewFailed(linkId, errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}

export { PreviewFetchError }
