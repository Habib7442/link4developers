import { LinkWithPreview, LinkCategory } from '@/lib/domain/entities'
import { supabase } from '@/lib/supabase'

/**
 * ApiLinkService - API-based implementation of link service
 * This service directly calls the API endpoints for link operations,
 * bypassing the repository layer for client-side usage
 */
export class ApiLinkService {
  /**
   * Get authentication headers
   */
  private static getAuthHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    })
    
    // Add auth token if available
    const accessToken = supabase.auth.getSession()
      .then(({ data }) => data.session?.access_token)
      .catch(() => null)

    // For client-side requests, the cookie is automatically included
    // But we also add the token to the Authorization header if available
    if (accessToken) {
      headers.append('Authorization', `Bearer ${accessToken}`)
    }
    
    return headers
  }

  /**
   * Reorder links within a category
   */
  static async reorderLinks(userId: string, category: LinkCategory, linkIds: string[]): Promise<boolean> {
    try {
      // Get auth session
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      
      if (!accessToken) {
        console.error('Authentication required for reordering links');
        throw new Error('Authentication required');
      }
      
      const response = await fetch('/api/links/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ category, linkIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error reordering links:', errorData);
        throw new Error(errorData.error || 'Failed to reorder links');
      }

      const result = await response.json();
      return result.data?.success || false;
    } catch (error) {
      console.error('API client error reordering links:', error);
      throw error;
    }
  }
  
  /**
   * Get all links for a user grouped by category
   */
  static async getUserLinks(userId: string, isPreview: boolean = false): Promise<Record<LinkCategory, LinkWithPreview[]>> {
    try {
      // Get auth session
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      
      // Add preview parameter for preview requests
      const previewParam = isPreview ? '&preview=true' : ''
      
      const response = await fetch(`/api/links?userId=${userId}${previewParam}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
      })
  
      if (!response.ok) {
        console.error('Error fetching links:', await response.text())
        throw new Error(`Failed to fetch links (${response.status})`)
      }
  
      return response.json()
    } catch (error) {
      console.error('API client error fetching links:', error)
      throw error
    }
  }

  /**
   * Create a new link for a user
   */
  static async createLink(userId: string, linkData: Omit<LinkWithPreview, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'preview_status' | 'metadata'>): Promise<LinkWithPreview> {
    try {
      // Get auth session
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ userId, linkData }),
      })
  
      if (!response.ok) {
        console.error('Error creating link:', await response.text())
        throw new Error(`Failed to create link (${response.status})`)
      }
  
      return response.json()
    } catch (error) {
      console.error('API client error creating link:', error)
      throw error
    }
  }

  /**
   * Update an existing link
   */
  static async updateLink(userId: string, linkId: string, updates: Partial<LinkWithPreview>): Promise<LinkWithPreview> {
    try {
      // Get auth session
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ userId, updates }),
      })
  
      if (!response.ok) {
        console.error('Error updating link:', await response.text())
        throw new Error(`Failed to update link (${response.status})`)
      }
  
      return response.json()
    } catch (error) {
      console.error('API client error updating link:', error)
      throw error
    }
  }

  /**
   * Delete a link
   */
  static async deleteLink(userId: string, linkId: string): Promise<boolean> {
    try {
      // Get auth session
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ userId }),
      })
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error deleting link:', errorText);
        throw new Error(`Failed to delete link (${response.status}): ${errorText}`)
      }
  
      return true
    } catch (error) {
      console.error('API client error deleting link:', error)
      throw error
    }
  }

  /**
   * Toggle the active status of a link
   */
  static async toggleLinkStatus(userId: string, linkId: string): Promise<LinkWithPreview> {
    try {
      // Get auth session
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      
      // Fix: Call the correct endpoint with POST method and include both userId and linkId in the body
      const response = await fetch(`/api/links/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ userId, linkId }),
      })
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error toggling link status:', errorText)
        
        // Try to parse the error as JSON to get details
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error && (errorData.retryAfter || errorData.resetTime)) {
            // This is a rate limit error
            throw new Error(errorText)
          }
        } catch (parseError) {
          // Not JSON or parse error, continue with normal error handling
        }
        
        throw new Error(`Failed to toggle link status (${response.status}): ${errorText}`)
      }
  
      return response.json()
    } catch (error) {
      console.error('API client error toggling link status:', error)
      throw error
    }
  }

  /**
   * Refresh a link's rich preview
   */
  static async refreshRichPreview(userId: string, linkId: string): Promise<LinkWithPreview> {
    try {
      // Get auth session
      const { data } = await supabase.auth.getSession()
      const accessToken = data.session?.access_token
      
      const response = await fetch(`/api/links/${linkId}/refresh-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
        },
        body: JSON.stringify({ userId }),
      })
  
      if (!response.ok) {
        console.error('Error refreshing rich preview:', await response.text())
        throw new Error(`Failed to refresh rich preview (${response.status})`)
      }
  
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('API client error refreshing rich preview:', error)
      throw error
    }
  }

  /**
   * Track a link click for analytics
   */
  static async trackLinkClick(linkId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/public/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkId }),
      });

      if (!response.ok) {
        console.error('Error tracking link click:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('API client error tracking link click:', error);
      return false;
    }
  }
}