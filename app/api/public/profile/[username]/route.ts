import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { LINK_CATEGORIES, LinkCategory } from '@/lib/services/link-service'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { createPublicRoute } from '@/lib/security/api-protection'
import { sanitizeText } from '@/lib/security/validation'

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
)

// Protected GET route for public profiles
const getPublicProfileHandler = async (
  request: NextRequest,
  { params }: { params: { username: string } }
) => {
  try {
    const { username } = params

    // Validate and sanitize username
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Valid username is required' },
        { status: 400 }
      )
    }

    const sanitizedUsername = sanitizeText(username.trim(), 50)

    console.log('🔍 Public API: Fetching profile for username:', sanitizedUsername)

    // First, get the user profile by slug or github_username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`profile_slug.eq.${sanitizedUsername},github_username.eq.${sanitizedUsername}`)
      .eq('is_public', true)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      console.error('Public API: Error fetching user:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get user's active links with rich preview data
    const { data: links, error: linksError } = await supabase
      .from('user_links')
      .select(`
        *,
        preview_status,
        preview_fetched_at,
        preview_expires_at
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('category')
      .order('position')
      .order('created_at')

    if (linksError) {
      console.error('Public API: Error fetching links:', linksError)
      return NextResponse.json(
        { error: 'Failed to fetch profile links' },
        { status: 500 }
      )
    }

    // Group links by category
    const groupedLinks: Record<LinkCategory, UserLinkWithPreview[]> = {} as Record<LinkCategory, UserLinkWithPreview[]>
    
    // Initialize all categories
    Object.keys(LINK_CATEGORIES).forEach(category => {
      groupedLinks[category as LinkCategory] = []
    })

    // Group the links
    links?.forEach(link => {
      if (link.category && groupedLinks[link.category as LinkCategory]) {
        groupedLinks[link.category as LinkCategory].push(link as UserLinkWithPreview)
      }
    })

    // Remove sensitive information from user object
    const publicUser = {
      id: user.id,
      full_name: user.full_name,
      profile_title: user.profile_title,
      bio: user.bio,
      avatar_url: user.avatar_url,
      github_username: user.github_username,
      github_url: user.github_url,
      website_url: user.website_url,
      location: user.location,
      company: user.company,
      twitter_username: user.twitter_username,
      linkedin_url: user.linkedin_url,
      profile_slug: user.profile_slug,
      theme_id: user.theme_id,
      is_premium: user.is_premium,
      tech_stacks: user.tech_stacks, // Include tech stacks in the public response
      created_at: user.created_at
    }

    console.log('✅ Public API: Profile fetched successfully for:', sanitizedUsername)

    return NextResponse.json({
      user: publicUser,
      links: groupedLinks
    })

  } catch (error) {
    console.error('❌ Public API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected GET route
export const GET = createPublicRoute(getPublicProfileHandler, {
  rateLimit: 'PUBLIC_PROFILE',
  allowedMethods: ['GET']
})