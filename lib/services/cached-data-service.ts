// Cached Data Service for Link4Coders
// Implements React cache function for request memoization and unstable_cache for persistent caching

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/supabase'
import { UserLink, LinkCategory, LINK_CATEGORIES } from './link-service'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'

// ============================================================================
// REQUEST MEMOIZATION (React cache)
// ============================================================================

/**
 * Get user by ID with request memoization
 * Multiple calls within the same request will return cached result
 */
export const getUserById = cache(async (userId: string): Promise<User | null> => {
  console.log('🔍 Cache: Fetching user by ID:', userId)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Cache: Error fetching user by ID:', error)
    return null
  }

  return data
})

/**
 * Get user by username/slug with request memoization
 */
export const getUserByUsername = cache(async (username: string): Promise<User | null> => {
  console.log('🔍 Cache: Fetching user by username:', username)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`profile_slug.eq.${username},github_username.eq.${username}`)
    .eq('is_public', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No rows returned
    }
    console.error('Cache: Error fetching user by username:', error)
    return null
  }

  return data
})

/**
 * Get user links with request memoization
 */
export const getUserLinks = cache(async (userId: string): Promise<UserLink[]> => {
  console.log('🔍 Cache: Fetching links for user:', userId)
  
  const { data, error } = await supabase
    .from('user_links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('category')
    .order('position')
    .order('created_at')

  if (error) {
    console.error('Cache: Error fetching user links:', error)
    return []
  }

  return data || []
})

/**
 * Get user links with rich preview data and request memoization
 */
export const getUserLinksWithPreview = cache(async (userId: string): Promise<UserLinkWithPreview[]> => {
  console.log('🔍 Cache: Fetching links with preview for user:', userId)
  
  const { data, error } = await supabase
    .from('user_links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('category')
    .order('position')
    .order('created_at')

  if (error) {
    console.error('Cache: Error fetching user links with preview:', error)
    return []
  }

  return (data || []) as UserLinkWithPreview[]
})

/**
 * Get template configuration with request memoization
 */
export const getTemplateConfig = cache(async (templateId: string) => {
  console.log('🔍 Cache: Fetching template config:', templateId)
  
  // This would typically come from a database or config file
  // For now, return a simple config object
  const configs = {
    'developer-dark': {
      id: 'developer-dark',
      name: 'Developer Dark',
      description: 'A dark theme optimized for developers',
      isPremium: false
    },
    'minimalist-light': {
      id: 'minimalist-light',
      name: 'Minimalist Light',
      description: 'A clean, light theme for professionals',
      isPremium: false
    },
    'github-focus': {
      id: 'github-focus',
      name: 'GitHub Focus',
      description: 'A GitHub-inspired theme for open source developers',
      isPremium: true
    },
    'gta-vice-city': {
      id: 'gta-vice-city',
      name: 'Miami Nights',
      description: 'Experience the neon-soaked streets of Miami with vibrant sunset gradients',
      isPremium: false
    }
  }
  
  return configs[templateId as keyof typeof configs] || configs['developer-dark']
})

// ============================================================================
// PERSISTENT CACHING (unstable_cache)
// ============================================================================

/**
 * Get popular profiles with persistent caching
 */
export const getPopularProfiles = unstable_cache(
  async (): Promise<User[]> => {
    console.log('🔍 Cache: Fetching popular profiles')
    
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, profile_title, bio, avatar_url, github_username, profile_slug, theme_id, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Cache: Error fetching popular profiles:', error)
      return []
    }

    return data || []
  },
  ['popular-profiles'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['popular-profiles', 'public-profiles']
  }
)

/**
 * Get user profile stats with persistent caching
 */
export const getUserProfileStats = unstable_cache(
  async (userId: string): Promise<{
    totalLinks: number
    totalClicks: number
    profileViews: number
    lastUpdated: string
  }> => {
    console.log('🔍 Cache: Fetching profile stats for user:', userId)
    
    // Get total links
    const { count: totalLinks } = await supabase
      .from('user_links')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    // Get total clicks
    const { data: linksData } = await supabase
      .from('user_links')
      .select('click_count')
      .eq('user_id', userId)
      .eq('is_active', true)

    const totalClicks = linksData?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0

    // Get user updated timestamp
    const { data: userData } = await supabase
      .from('users')
      .select('updated_at')
      .eq('id', userId)
      .single()

    return {
      totalLinks: totalLinks || 0,
      totalClicks,
      profileViews: 0, // TODO: Implement profile view tracking
      lastUpdated: userData?.updated_at || new Date().toISOString()
    }
  },
  ['user-stats'],
  {
    revalidate: 1800, // Cache for 30 minutes
    tags: (userId: string) => [`user-stats-${userId}`, 'user-stats']
  }
)

/**
 * Get template usage statistics with persistent caching
 */
export const getTemplateStats = unstable_cache(
  async (): Promise<Record<string, number>> => {
    console.log('🔍 Cache: Fetching template usage stats')
    
    const { data, error } = await supabase
      .from('users')
      .select('theme_id')
      .eq('is_public', true)

    if (error) {
      console.error('Cache: Error fetching template stats:', error)
      return {}
    }

    // Count usage by template
    const stats: Record<string, number> = {}
    data?.forEach(user => {
      const themeId = user.theme_id || 'developer-dark'
      stats[themeId] = (stats[themeId] || 0) + 1
    })

    return stats
  },
  ['template-stats'],
  {
    revalidate: 7200, // Cache for 2 hours
    tags: ['template-stats', 'analytics']
  }
)

// ============================================================================
// GROUPED DATA FUNCTIONS
// ============================================================================

/**
 * Group links by category with memoization
 */
export const groupLinksByCategory = cache((links: UserLink[]): Record<LinkCategory, UserLink[]> => {
  console.log('🔍 Cache: Grouping links by category')
  
  const grouped: Record<LinkCategory, UserLink[]> = {} as Record<LinkCategory, UserLink[]>
  
  // Initialize all categories
  LINK_CATEGORIES.forEach(category => {
    grouped[category] = []
  })
  
  // Group links
  links.forEach(link => {
    if (grouped[link.category]) {
      grouped[link.category].push(link)
    }
  })
  
  return grouped
})

/**
 * Group links with preview by category with memoization
 */
export const groupLinksWithPreviewByCategory = cache((links: UserLinkWithPreview[]): Record<LinkCategory, UserLinkWithPreview[]> => {
  console.log('🔍 Cache: Grouping links with preview by category')
  
  const grouped: Record<LinkCategory, UserLinkWithPreview[]> = {} as Record<LinkCategory, UserLinkWithPreview[]>
  
  // Initialize all categories
  LINK_CATEGORIES.forEach(category => {
    grouped[category] = []
  })
  
  // Group links
  links.forEach(link => {
    if (grouped[link.category]) {
      grouped[link.category].push(link)
    }
  })
  
  return grouped
})
