import { revalidateTag } from 'next/cache'

/**
 * Revalidate public profile cache for a specific username
 * @param username The username (profile_slug or github_username) to revalidate
 */
export async function revalidatePublicProfile(username: string) {
  try {
    // Revalidate using Next.js cache revalidation
    revalidateTag(`public-profile-${username}`)
    
    // Also trigger API revalidation for immediate effect
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate?tag=public-profile-${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.warn('Warning: Failed to trigger API revalidation for profile:', username)
    }
    
    console.log('✅ Cache revalidated for profile:', username)
  } catch (error) {
    console.warn('Warning: Failed to revalidate cache for profile:', username, error)
  }
}

/**
 * Revalidate all user-related data
 * @param userId The user ID to revalidate
 * @param username The username to revalidate (optional)
 */
export async function revalidateUser(userId: string, username?: string) {
  try {
    // Trigger API revalidation for all user-related tags
    const tagsToRevalidate = [
      `user-${userId}`,
      `user-profile-${userId}`,
      `user-links-${userId}`,
      `user-appearance-${userId}`,
      `user-theme-${userId}`
    ]
    
    // Add username-based revalidation if provided
    if (username) {
      tagsToRevalidate.push(`public-profile-${username}`)
    }
    
    // Revalidate all tags
    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag)
        
        // Also trigger API revalidation for immediate effect
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate?tag=${tag}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          console.warn('Warning: Failed to trigger API revalidation for tag:', tag)
        }
      } catch (error) {
        console.warn('Warning: Failed to revalidate tag:', tag, error)
      }
    }
    
    console.log('✅ All user data revalidated for user:', userId)
  } catch (error) {
    console.warn('Warning: Failed to revalidate user data for user:', userId, error)
  }
}