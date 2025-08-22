'use server'

import { revalidateTag } from 'next/cache'
import { supabase } from '@/lib/supabase'

/**
 * Server action to invalidate public profile cache for a user
 */
export async function invalidateUserProfileCache(userId: string) {
  try {
    // Get user's profile slug and github username to invalidate cache
    const { data: userData } = await supabase
      .from('users')
      .select('profile_slug, github_username')
      .eq('id', userId)
      .single()

    if (userData) {
      // Invalidate cache for both profile_slug and github_username
      if (userData.profile_slug) {
        revalidateTag(`public-profile-${userData.profile_slug}`)
      }
      if (userData.github_username) {
        revalidateTag(`public-profile-${userData.github_username}`)
      }
      // Also invalidate the general public profiles tag
      revalidateTag('public-profiles')
    }
  } catch (error) {
    console.error('Error invalidating user profile cache:', error)
    // Don't throw error to avoid breaking the main operation
  }
}
