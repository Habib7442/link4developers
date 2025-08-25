// Cache Invalidation Service for Link4Coders
// Handles cache invalidation when users update profiles, links, or other data

import { revalidateTag, revalidatePath } from 'next/cache'

export class CacheInvalidationService {
  
  /**
   * Invalidate all caches related to a user profile
   */
  static async invalidateUserProfile(userId: string, username?: string) {
    console.log('🔄 Cache Invalidation: Invalidating user profile caches for:', userId)
    
    try {
      // Invalidate user-specific caches
      revalidateTag(`public-profile-${username}`)
      revalidateTag(`user-stats-${userId}`)
      
      // Invalidate general caches that might include this user
      revalidateTag('public-profiles')
      revalidateTag('popular-profiles')
      revalidateTag('user-stats')
      
      // Invalidate the public profile page if username is provided
      if (username) {
        revalidatePath(`/${username}`)
        console.log(`🔄 Cache Invalidation: Revalidated path /${username}`)
      }
      
      console.log('✅ Cache Invalidation: User profile caches invalidated successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error invalidating user profile caches:', error)
    }
  }
  
  /**
   * Invalidate caches when user links are updated
   */
  static async invalidateUserLinks(userId: string, username?: string) {
    console.log('🔄 Cache Invalidation: Invalidating user links caches for:', userId)
    
    try {
      // Invalidate user-specific caches
      revalidateTag(`public-profile-${username}`)
      revalidateTag(`user-stats-${userId}`)
      
      // Invalidate rich preview caches if needed
      revalidateTag('rich-preview')
      
      // Invalidate the public profile page
      if (username) {
        revalidatePath(`/${username}`)
        console.log(`🔄 Cache Invalidation: Revalidated path /${username}`)
      }
      
      console.log('✅ Cache Invalidation: User links caches invalidated successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error invalidating user links caches:', error)
    }
  }
  
  /**
   * Invalidate rich preview caches for a specific URL or domain
   */
  static async invalidateRichPreview(url: string, type: 'github' | 'webpage') {
    console.log('🔄 Cache Invalidation: Invalidating rich preview caches for:', url)
    
    try {
      if (type === 'github') {
        // Extract owner/repo from GitHub URL
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (match) {
          const [, owner, repo] = match
          revalidateTag(`github-repo-${owner}-${repo}`)
        }
        revalidateTag('github-api')
      } else {
        // Extract domain from webpage URL
        try {
          const domain = new URL(url).hostname
          revalidateTag(`webpage-${domain}`)
        } catch {
          // Invalid URL, skip domain-specific invalidation
        }
        revalidateTag('webpage-metadata')
      }
      
      revalidateTag('rich-preview')
      
      console.log('✅ Cache Invalidation: Rich preview caches invalidated successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error invalidating rich preview caches:', error)
    }
  }
  
  /**
   * Invalidate template-related caches
   */
  static async invalidateTemplateData() {
    console.log('🔄 Cache Invalidation: Invalidating template caches')
    
    try {
      revalidateTag('template-stats')
      revalidateTag('analytics')
      
      console.log('✅ Cache Invalidation: Template caches invalidated successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error invalidating template caches:', error)
    }
  }
  
  /**
   * Invalidate all public profile related caches
   */
  static async invalidateAllPublicProfiles() {
    console.log('🔄 Cache Invalidation: Invalidating all public profile caches')
    
    try {
      revalidateTag('public-profiles')
      revalidateTag('popular-profiles')
      revalidateTag('user-stats')
      
      // Revalidate the main public profiles listing page if it exists
      revalidatePath('/profiles')
      
      console.log('✅ Cache Invalidation: All public profile caches invalidated successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error invalidating all public profile caches:', error)
    }
  }
  
  /**
   * Invalidate analytics and statistics caches
   */
  static async invalidateAnalytics() {
    console.log('🔄 Cache Invalidation: Invalidating analytics caches')
    
    try {
      revalidateTag('analytics')
      revalidateTag('template-stats')
      revalidateTag('user-stats')
      
      console.log('✅ Cache Invalidation: Analytics caches invalidated successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error invalidating analytics caches:', error)
    }
  }
  
  /**
   * Emergency cache clear - invalidate all caches
   */
  static async invalidateAllCaches() {
    console.log('🔄 Cache Invalidation: EMERGENCY - Invalidating ALL caches')
    
    try {
      // Invalidate all major cache tags
      const allTags = [
        'public-profiles',
        'popular-profiles',
        'user-stats',
        'template-stats',
        'analytics',
        'rich-preview',
        'github-api',
        'webpage-metadata'
      ]
      
      allTags.forEach(tag => {
        revalidateTag(tag)
      })
      
      // Revalidate common paths
      revalidatePath('/')
      revalidatePath('/profiles')
      
      console.log('✅ Cache Invalidation: ALL caches invalidated successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error invalidating all caches:', error)
    }
  }
  
  /**
   * Scheduled cache maintenance - refresh stale caches
   */
  static async performCacheMaintenance() {
    console.log('🔄 Cache Invalidation: Performing scheduled cache maintenance')
    
    try {
      // Refresh popular profiles cache
      revalidateTag('popular-profiles')
      
      // Refresh template statistics
      revalidateTag('template-stats')
      
      // Refresh analytics data
      revalidateTag('analytics')
      
      console.log('✅ Cache Invalidation: Cache maintenance completed successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error during cache maintenance:', error)
    }
  }
  
  /**
   * Invalidate caches when a user's theme changes
   */
  static async invalidateUserTheme(userId: string, username?: string) {
    console.log('🔄 Cache Invalidation: Invalidating theme caches for user:', userId)

    try {
      // Invalidate user profile cache
      if (username) {
        revalidateTag(`public-profile-${username}`)
        revalidatePath(`/${username}`)
      }

      // Invalidate general public profile caches
      revalidateTag('public-profiles')

      // Invalidate template statistics
      revalidateTag('template-stats')
      revalidateTag('analytics')

      console.log('✅ Cache Invalidation: Theme caches invalidated successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error invalidating theme caches:', error)
    }
  }
  
  /**
   * Invalidate caches when user privacy settings change
   */
  static async invalidateUserPrivacy(userId: string, username?: string, isNowPublic: boolean) {
    console.log('🔄 Cache Invalidation: Invalidating privacy caches for user:', userId)
    
    try {
      // Always invalidate user-specific caches
      if (username) {
        revalidateTag(`public-profile-${username}`)
        revalidatePath(`/${username}`)
      }
      
      // If user is now public or was public, refresh public profile lists
      revalidateTag('public-profiles')
      revalidateTag('popular-profiles')
      
      console.log('✅ Cache Invalidation: Privacy caches invalidated successfully')
    } catch (error) {
      console.error('❌ Cache Invalidation: Error invalidating privacy caches:', error)
    }
  }
}
