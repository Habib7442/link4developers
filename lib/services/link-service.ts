import { supabase } from '@/lib/supabase'
import { getAuthHeaders } from '@/lib/utils/auth-headers'

export interface UserLink {
  id: string
  user_id: string
  title: string
  url: string
  description?: string
  icon_type: string
  category: LinkCategory
  metadata: Record<string, any>
  position: number
  display_order?: number // For backward compatibility
  is_active: boolean
  click_count: number
  created_at: string
  updated_at: string
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

export type LinkCategory = 'personal' | 'projects' | 'blogs' | 'achievements' | 'contact' | 'social' | 'custom'

export interface CreateLinkData {
  title: string
  url: string
  description?: string
  icon_type: string
  category: LinkCategory
  metadata?: Record<string, any>
  display_order?: number
  is_active?: boolean
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

export interface UpdateLinkData extends Partial<CreateLinkData> {
  id: string
}

// PRD Section 4.1 - Profile Section Categories
export const LINK_CATEGORIES = {
  personal: {
    label: 'Personal',
    description: 'Personal website, resume, CV, portfolio, bio page',
    icon: 'User',
    maxLinks: 5
  },
  projects: {
    label: 'GitHub Projects',
    description: 'Repository links, portfolio projects, open source contributions',
    icon: 'Github',
    maxLinks: 10
  },
  blogs: {
    label: 'Blogs & Articles',
    description: 'dev.to, Medium, Hashnode, personal blog posts',
    icon: 'BookOpen',
    maxLinks: 8
  },
  achievements: {
    label: 'Achievements',
    description: 'Certifications, awards, hackathon wins, recognitions',
    icon: 'Award',
    maxLinks: 6
  },
  contact: {
    label: 'Contact',
    description: 'Email, phone, location, availability',
    icon: 'Mail',
    maxLinks: 4
  },
  social: {
    label: 'Social Media',
    description: 'Twitter, LinkedIn, Instagram, Discord, etc.',
    icon: 'Share2',
    maxLinks: 8
  },
  custom: {
    label: 'Custom Links',
    description: 'Any other links you want to share',
    icon: 'Link',
    maxLinks: 5
  }
} as const

// Popular platform configurations
export const PLATFORM_CONFIGS = {
  github: { icon: 'Github', category: 'projects', baseUrl: 'https://github.com/' },
  linkedin: { icon: 'Linkedin', category: 'social', baseUrl: 'https://linkedin.com/in/' },
  twitter: { icon: 'Twitter', category: 'social', baseUrl: 'https://twitter.com/' },
  'dev-to': { icon: 'BookOpen', category: 'blogs', baseUrl: 'https://dev.to/' },
  medium: { icon: 'BookOpen', category: 'blogs', baseUrl: 'https://medium.com/@' },
  hashnode: { icon: 'BookOpen', category: 'blogs', baseUrl: 'https://hashnode.com/@' },
  stackoverflow: { icon: 'MessageSquare', category: 'achievements', baseUrl: 'https://stackoverflow.com/users/' },
  leetcode: { icon: 'Code', category: 'achievements', baseUrl: 'https://leetcode.com/' },
  portfolio: { icon: 'Globe', category: 'projects', baseUrl: '' },
  email: { icon: 'Mail', category: 'contact', baseUrl: 'mailto:' },
  website: { icon: 'Globe', category: 'contact', baseUrl: '' }
} as const

export class LinkService {
  // Test database connection and authentication
  static async testConnection(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      console.log('🔍 Testing database connection and authentication...')

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('❌ Authentication error:', authError)
        return { success: false, error: `Authentication failed: ${authError.message}` }
      }

      if (!user) {
        console.error('❌ No authenticated user')
        return { success: false, error: 'User not authenticated' }
      }

      console.log('✅ User authenticated:', user.id)

      // Test database query
      const { data, error: dbError } = await supabase
        .from('user_links')
        .select('count')
        .eq('user_id', user.id)
        .limit(1)

      if (dbError) {
        console.error('❌ Database error:', dbError)
        return { success: false, error: `Database query failed: ${dbError.message}`, user }
      }

      console.log('✅ Database connection successful')
      return { success: true, user }
    } catch (error) {
      console.error('❌ Connection test failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  // Get all links for a user, organized by category
  static async getUserLinks(userId: string): Promise<Record<LinkCategory, UserLink[]>> {
    const { data, error } = await supabase
      .from('user_links')
      .select('*')
      .eq('user_id', userId)
      .order('category')
      .order('position')
      .order('created_at')

    if (error) {
      console.error('Error fetching user links:', error)
      throw error
    }

    // Group links by category
    const linksByCategory = (data || []).reduce((acc, link) => {
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
  }

  // Create a new link
  static async createLink(userId: string, linkData: CreateLinkData): Promise<UserLink> {
    try {
      console.log('Creating link with data:', { userId, linkData })

      // Check current session and ensure Supabase client is authenticated
      console.log('Creating link for user:', userId)

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Current session:', session?.user?.id)

      if (sessionError || !session || !session.user) {
        console.error('No active session:', sessionError)
        throw new Error('No active session. Please log in again.')
      }

      if (session.user.id !== userId) {
        console.error('Session user ID mismatch:', { sessionUserId: session.user.id, providedUserId: userId })
        throw new Error('User ID mismatch. Please refresh the page.')
      }

      console.log('✅ Session verified for user:', session.user.id)

      // Get next position for the category
      const { data: existingLinks, error: fetchError } = await supabase
        .from('user_links')
        .select('position')
        .eq('user_id', userId)
        .eq('category', linkData.category)
        .order('position', { ascending: false })
        .limit(1)

      if (fetchError) {
        console.error('Error fetching existing links:', fetchError)
        throw new Error(`Failed to fetch existing links: ${fetchError.message}`)
      }

      const nextPosition = existingLinks?.[0]?.position ? existingLinks[0].position + 1 : 0
      console.log('Next position will be:', nextPosition)

      // Prepare insert data with all required fields
      const insertData = {
        user_id: userId,
        title: linkData.title,
        url: linkData.url,
        description: linkData.description || null,
        icon_type: linkData.icon_type || 'link',
        category: linkData.category || 'contact',
        position: nextPosition, // This is required (NOT NULL)
        is_active: linkData.is_active ?? true,
        metadata: linkData.metadata || {},
        // Universal icon fields
        custom_icon_url: linkData.custom_icon_url || null,
        uploaded_icon_url: linkData.uploaded_icon_url || null,
        icon_variant: linkData.icon_variant || 'default',
        use_custom_icon: linkData.use_custom_icon || false,
        icon_selection_type: linkData.icon_selection_type || 'default',
        platform_detected: linkData.platform_detected || null,
        // GitHub Projects specific field
        live_project_url: linkData.live_project_url || null
      }

      console.log('Insert data:', insertData)
      console.log('Insert data JSON:', JSON.stringify(insertData, null, 2))

      const { data, error } = await supabase
        .from('user_links')
        .insert(insertData)
        .select()
        .single()

      console.log('Database response:', { data, error })

      if (error) {
        console.error('❌ Database error creating link:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        throw new Error(`Failed to create link: ${error.message}`)
      }

      console.log('Link created successfully:', data)
      return data
    } catch (error) {
      console.error('CreateLink error:', error)
      throw error
    }
  }

  // Update an existing link
  static async updateLink(userId: string, linkData: UpdateLinkData): Promise<UserLink> {
    try {
      console.log('Updating link with data:', { userId, linkData })

      // Skip auth check for now to avoid hanging
      console.log('Updating link for user:', userId)

      const { id, display_order, ...updateData } = linkData

      const updatePayload: any = {
        ...updateData,
        updated_at: new Date().toISOString()
      }

      // Map display_order to position if provided
      if (display_order !== undefined) {
        updatePayload.position = display_order
        updatePayload.display_order = display_order // Keep both for compatibility
      }

      console.log('Update payload:', updatePayload)

      const { data, error } = await supabase
        .from('user_links')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId) // Ensure user can only update their own links
        .select()
        .single()

      if (error) {
        console.error('❌ Database error updating link:', error)
        throw new Error(`Failed to update link: ${error.message}`)
      }

      console.log('Link updated successfully:', data)
      return data
    } catch (error) {
      console.error('UpdateLink error:', error)
      throw error
    }
  }

  // Delete a link
  static async deleteLink(userId: string, linkId: string): Promise<void> {
    const { error } = await supabase
      .from('user_links')
      .delete()
      .eq('id', linkId)
      .eq('user_id', userId) // Ensure user can only delete their own links

    if (error) {
      console.error('Error deleting link:', error)
      throw error
    }
  }

  // Reorder links within a category
  static async reorderLinks(userId: string, category: LinkCategory, linkIds: string[]): Promise<void> {
    try {
      console.log('🔄 Reordering links via API...')
      
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/links/reorder', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ category, linkIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error reordering links:', errorData)
        throw new Error(`Failed to reorder links: ${errorData.error}`)
      }

      const result = await response.json()
      console.log('✅ Links reordered successfully via API')
    } catch (error) {
      console.error('❌ Error in reorderLinks:', error)
      throw error
    }
  }

  // Toggle link active status
  static async toggleLinkStatus(userId: string, linkId: string): Promise<UserLink> {
    // First get current status
    const { data: currentLink } = await supabase
      .from('user_links')
      .select('is_active')
      .eq('id', linkId)
      .eq('user_id', userId)
      .single()

    if (!currentLink) {
      throw new Error('Link not found')
    }

    const { data, error } = await supabase
      .from('user_links')
      .update({ 
        is_active: !currentLink.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error toggling link status:', error)
      throw error
    }

    return data
  }

  // Increment click count (for analytics)
  static async incrementClickCount(linkId: string): Promise<void> {
    const { error } = await supabase
      .from('user_links')
      .update({ 
        click_count: supabase.raw('click_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId)

    if (error) {
      console.error('Error incrementing click count:', error)
      // Don't throw error for analytics failures
    }
  }

  // Get link analytics for user
  static async getLinkAnalytics(userId: string): Promise<{
    totalClicks: number
    linksByCategory: Record<LinkCategory, number>
    topLinks: Array<{ title: string; clicks: number; url: string }>
  }> {
    try {
      console.log('🔄 Fetching link analytics from API...')
      
      const headers = await getAuthHeaders()
      
      const response = await fetch('/api/links/analytics', {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error fetching analytics:', errorData)
        throw new Error(`Failed to fetch analytics: ${errorData.error}`)
      }

      const result = await response.json()
      const analytics = result.data

      if (!analytics) {
        console.warn('⚠️ No analytics data from API')
        return {
          totalClicks: 0,
          linksByCategory: {} as Record<LinkCategory, number>,
          topLinks: []
        }
      }

      console.log('✅ Analytics fetched successfully via API')
      return {
        totalClicks: analytics.totalClicks || 0,
        linksByCategory: analytics.linksByCategory || {},
        topLinks: analytics.topLinks || []
      }
    } catch (error) {
      console.error('❌ Error in getLinkAnalytics:', error)
      throw error
    }
  }
}
