// API-based Link Service that uses Next.js API routes instead of direct Supabase calls
import { CreateLinkData, UpdateLinkData, UserLink, LinkCategory, LINK_CATEGORIES } from './link-service'
import { User } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { getAuthHeaders } from '@/lib/utils/auth-headers'

// Create a timeout promise that rejects after specified milliseconds
const createTimeoutPromise = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`))
    }, ms)
  })
}

// Execute fetch request with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    createTimeoutPromise(timeoutMs)
  ]) as Promise<Response>;
}

export class ApiLinkService {
  // Get all links for a user via API with rich preview data
  static async getUserLinks(userId: string): Promise<Record<LinkCategory, UserLinkWithPreview[]>> {
    try {
      console.log('🔍 API Service: Fetching links for user:', userId)

      const headers = await getAuthHeaders()

      const response = await fetch(`/api/links?userId=${userId}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch links')
      }

      const { data } = await response.json()
      console.log('✅ API Service: Links fetched:', data?.length || 0, 'links')

      // Group links by category
      const linksByCategory = (data || []).reduce((acc: Record<LinkCategory, UserLink[]>, link: UserLink) => {
        const category = link.category as LinkCategory
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(link)
        return acc
      }, {} as Record<LinkCategory, UserLink[]>)

      // Ensure all categories exist
      Object.keys(LINK_CATEGORIES).forEach(category => {
        if (!linksByCategory[category as LinkCategory]) {
          linksByCategory[category as LinkCategory] = []
        }
      })

      return linksByCategory
    } catch (error) {
      console.error('❌ API Service: Error fetching links:', error)
      throw error
    }
  }

  // Create a new link via API
  static async createLink(userId: string, linkData: CreateLinkData): Promise<UserLink> {
    try {
      console.log('➕ API Service: Creating link for user:', userId)
      console.log('Link data:', linkData)

      const headers = await getAuthHeaders()

      const response = await fetchWithTimeout('/api/links', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          linkData
        })
      }, 15000) // 15 second timeout

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Service: Server error:', errorData)
        throw new Error(errorData.error || 'Failed to create link')
      }

      const { data } = await response.json()
      console.log('✅ API Service: Link created successfully:', data)
      return data
    } catch (error) {
      console.error('❌ API Service: Error creating link:', error)
      throw error
    }
  }

  // Update an existing link via API
  static async updateLink(userId: string, linkData: UpdateLinkData): Promise<UserLink> {
    try {
      console.log('📝 API Service: Updating link for user:', userId)
      console.log('Update data:', linkData)

      const headers = await getAuthHeaders()

      const response = await fetchWithTimeout('/api/links', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          userId,
          linkData
        })
      }, 15000) // 15 second timeout

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Service: Server error:', errorData)
        throw new Error(errorData.error || 'Failed to update link')
      }

      const { data } = await response.json()
      console.log('✅ API Service: Link updated successfully:', data)
      return data
    } catch (error) {
      console.error('❌ API Service: Error updating link:', error)
      throw error
    }
  }

  // Delete a link via API
  static async deleteLink(userId: string, linkId: string): Promise<void> {
    try {
      console.log('🗑️ API Service: Deleting link:', linkId)

      const headers = await getAuthHeaders()

      const response = await fetch('/api/links', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
          userId,
          linkId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete link')
      }

      console.log('✅ API Service: Link deleted successfully')
    } catch (error) {
      console.error('❌ API Service: Error deleting link:', error)
      throw error
    }
  }

  // Toggle link status via API
  static async toggleLinkStatus(userId: string, linkId: string): Promise<UserLink> {
    try {
      console.log('🔄 API Service: Toggling link status:', linkId)

      const headers = await getAuthHeaders()

      const response = await fetch('/api/links/toggle', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          linkId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to toggle link status')
      }

      const { data } = await response.json()
      console.log('✅ API Service: Link status toggled successfully:', data)
      return data
    } catch (error) {
      console.error('❌ API Service: Error toggling link status:', error)
      throw error
    }
  }

  // Test API connection
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 API Service: Testing connection...')
      
      const response = await fetch('/api/links?userId=test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Even if it returns an error, if we get a response, the API is working
      if (response.status === 400) {
        console.log('✅ API Service: Connection test successful (expected 400 for test userId)')
        return { success: true }
      }

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'API connection failed' }
      }

      console.log('✅ API Service: Connection test successful')
      return { success: true }
    } catch (error) {
      console.error('❌ API Service: Connection test failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Get public profile data by username/slug
  static async getPublicProfile(username: string): Promise<{
    user: User | null
    links: Record<LinkCategory, UserLink[]>
  }> {
    try {
      console.log('🔍 API Service: Fetching public profile for:', username)

      const response = await fetch(`/api/public/profile/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return { user: null, links: {} as Record<LinkCategory, UserLink[]> }
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch public profile')
      }

      const data = await response.json()
      console.log('✅ API Service: Public profile fetched successfully')
      return data
    } catch (error) {
      console.error('❌ API Service: Error fetching public profile:', error)
      throw error
    }
  }

  // Track link click for analytics
  static async trackLinkClick(linkId: string): Promise<void> {
    try {
      console.log('📊 API Service: Tracking click for link:', linkId)

      const response = await fetch(`/api/public/track-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkId })
      })

      if (!response.ok) {
        // Don't throw error for tracking failures, just log
        console.warn('⚠️ API Service: Failed to track click, but continuing...')
        return
      }

      console.log('✅ API Service: Click tracked successfully')
    } catch (error) {
      // Don't throw error for tracking failures, just log
      console.warn('⚠️ API Service: Error tracking click:', error)
    }
  }

  // Rich Preview Operations

  // Refresh preview for a specific link
  static async refreshLinkPreview(userId: string, linkId: string): Promise<any> {
    try {
      console.log('🔄 API Service: Refreshing preview for link:', linkId)

      const headers = await getAuthHeaders()

      const response = await fetch('/api/links/preview', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          linkId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to refresh preview')
      }

      const result = await response.json()
      console.log('✅ API Service: Preview refreshed successfully')

      return result

    } catch (error) {
      console.error('❌ API Service: Error refreshing preview:', error)
      throw new Error(`Failed to refresh preview: ${error.message}`)
    }
  }

  // Get preview for a specific link
  static async getLinkPreview(userId: string, linkId: string): Promise<any> {
    try {
      console.log('🔍 API Service: Getting preview for link:', linkId)

      const headers = await getAuthHeaders()

      const response = await fetch(`/api/links/preview?linkId=${linkId}`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get preview')
      }

      const result = await response.json()
      console.log('✅ API Service: Preview retrieved successfully')

      return result

    } catch (error) {
      console.error('❌ API Service: Error getting preview:', error)
      throw new Error(`Failed to get preview: ${error.message}`)
    }
  }

  // Batch refresh previews for multiple links
  static async batchRefreshPreviews(userId: string, linkIds: string[]): Promise<any> {
    try {
      console.log('🔄 API Service: Batch refreshing previews for links:', linkIds)

      const headers = await getAuthHeaders()

      const response = await fetch('/api/links/preview/batch', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          linkIds
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to batch refresh previews')
      }

      const result = await response.json()
      console.log('✅ API Service: Batch preview refresh completed')

      return result

    } catch (error) {
      console.error('❌ API Service: Error batch refreshing previews:', error)
      throw new Error(`Failed to batch refresh previews: ${error.message}`)
    }
  }

  // Get preview statistics
  static async getPreviewStats(userId: string): Promise<any> {
    try {
      console.log('📊 API Service: Getting preview statistics')

      const headers = await getAuthHeaders()

      const response = await fetch('/api/links/preview/stats', {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get preview stats')
      }

      const result = await response.json()
      console.log('✅ API Service: Preview stats retrieved successfully')

      return result

    } catch (error) {
      console.error('❌ API Service: Error getting preview stats:', error)
      throw new Error(`Failed to get preview stats: ${error.message}`)
    }
  }

  // Clear preview data for a link
  static async clearLinkPreview(userId: string, linkId: string): Promise<void> {
    try {
      console.log('🗑️ API Service: Clearing preview for link:', linkId)

      const headers = await getAuthHeaders()

      const response = await fetch(`/api/links/preview?linkId=${linkId}`, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to clear preview')
      }

      console.log('✅ API Service: Preview cleared successfully')

    } catch (error) {
      console.error('❌ API Service: Error clearing preview:', error)
      throw new Error(`Failed to clear preview: ${error.message}`)
    }
  }
}
