import { supabase, type User, type UserLink } from './supabase'

// Profile Management Functions
export class ProfileService {
  
  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Get user profile by slug for public pages
  static async getUserProfileBySlug(slug: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('profile_slug', slug)
        .eq('is_public', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile by slug:', error)
      return null
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  // Check if profile slug is available
  static async isSlugAvailable(slug: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('profile_slug', slug)

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data, error } = await query

      if (error) throw error
      return data.length === 0
    } catch (error) {
      console.error('Error checking slug availability:', error)
      return false
    }
  }
}

// Link Management Functions
export class LinkService {
  
  // Get all links for a user
  static async getUserLinks(userId: string): Promise<UserLink[]> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user links:', error)
      return []
    }
  }

  // Get active links for public profile
  static async getActiveUserLinks(userId: string): Promise<UserLink[]> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('position', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching active user links:', error)
      return []
    }
  }

  // Create a new link
  static async createLink(userId: string, linkData: Omit<UserLink, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'click_count'>): Promise<UserLink | null> {
    try {
      // Get the next position
      const { data: existingLinks } = await supabase
        .from('user_links')
        .select('position')
        .eq('user_id', userId)
        .order('position', { ascending: false })
        .limit(1)

      const nextPosition = existingLinks && existingLinks.length > 0 
        ? existingLinks[0].position + 1 
        : 0

      const { data, error } = await supabase
        .from('user_links')
        .insert([{
          ...linkData,
          user_id: userId,
          position: nextPosition,
          click_count: 0
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating link:', error)
      throw error
    }
  }

  // Update a link
  static async updateLink(linkId: string, updates: Partial<UserLink>): Promise<UserLink | null> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating link:', error)
      throw error
    }
  }

  // Delete a link
  static async deleteLink(linkId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_links')
        .delete()
        .eq('id', linkId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting link:', error)
      return false
    }
  }

  // Reorder links
  static async reorderLinks(userId: string, linkIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('reorder_user_links', {
        p_user_id: userId,
        p_link_ids: linkIds
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error reordering links:', error)
      return false
    }
  }

  // Increment click count
  static async incrementClickCount(linkId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_link_clicks', {
        p_link_id: linkId
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error incrementing click count:', error)
      return false
    }
  }

  // Toggle link active status
  static async toggleLinkStatus(linkId: string, isActive: boolean): Promise<UserLink | null> {
    try {
      const { data, error } = await supabase
        .from('user_links')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error toggling link status:', error)
      throw error
    }
  }
}

// Analytics Functions
export class AnalyticsService {
  
  // Get link analytics for a user
  static async getLinkAnalytics(userId: string): Promise<{
    totalClicks: number
    totalLinks: number
    activeLinks: number
    topLinks: Array<{ title: string; clicks: number; url: string }>
  }> {
    try {
      const { data: links, error } = await supabase
        .from('user_links')
        .select('title, url, click_count, is_active, category')
        .eq('user_id', userId)

      if (error) throw error

      const totalClicks = links?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0
      const totalLinks = links?.length || 0
      const activeLinks = links?.filter(link => link.is_active).length || 0
      const topLinks = links
        ?.sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
        .slice(0, 5)
        .map(link => ({
          title: link.title,
          clicks: link.click_count || 0,
          url: link.url
        })) || []

      return {
        totalClicks,
        totalLinks,
        activeLinks,
        topLinks
      }
    } catch (error) {
      console.error('Error fetching link analytics:', error)
      return {
        totalClicks: 0,
        totalLinks: 0,
        activeLinks: 0,
        topLinks: []
      }
    }
  }
}
