import { createClient } from '@supabase/supabase-js'
import { User, UserAppearanceSettings } from '@/lib/supabase'
import { UserLink } from './link-service'
import { LinkCategory } from '@/lib/domain/entities'
import { LINK_CATEGORIES } from './link-constants'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { CategoryOrderService } from './category-order-service'
import { AppearanceService } from './appearance-service'
// Removed cache import since we're removing caching

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
)

// Removed the getProfileCache function that was using React's cache

export class PublicProfileService {
  // Get public profile data by username/slug (server-side) without caching
  static async getPublicProfile(username: string): Promise<{
    user: User | null
    links: Record<LinkCategory, UserLinkWithPreview[]>
    appearanceSettings: UserAppearanceSettings | null
    categoryOrder: LinkCategory[]
  }> {
    try {
      console.log('🔍 Server Service: Fetching profile for username:', username)
      console.log('🔍 Server Service: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('🔍 Server Service: Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

      // Test Supabase connection first
      console.log('🔍 Server Service: Testing Supabase connection...')

      // Simple connection test
      try {
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        console.log('🔍 Server Service: Connection test result:', { testData, testError })
      } catch (testError) {
        const errorMessage = testError instanceof Error ? testError.message : 'Unknown error';
        console.error('🔍 Server Service: Connection test failed:', testError)
        throw new Error(`Supabase connection failed: ${errorMessage}`)
      }

      // First, get the user profile by slug or github_username
      console.log('🔍 Server Service: Executing user query for username:', username)
      let user, userError
      try {
        const result = await supabase
          .from('users')
          .select('*, theme_id') // Explicitly include theme_id
          .or(`profile_slug.eq.${username},github_username.eq.${username}`)
          .eq('is_public', true)
          .single()
        user = result.data
        userError = result.error
        
        // Add theme debugging
        if (user) {
          console.log('🔍 Server Service: Found user with theme_id:', user.theme_id)
        }
      } catch (networkError) {
        const errorMessage = networkError instanceof Error ? networkError.message : 'Unknown error';
        console.error('🔍 Server Service: Network error during user query:', networkError)
        throw new Error(`Network error: ${errorMessage}`)
      }

      console.log('🔍 Server Service: User query completed. Error:', userError, 'Data:', !!user)

      if (userError) {
        if (userError.code === 'PGRST116') {
          // No rows returned
          console.log('🔍 Server Service: No user found for username:', username)
          return { 
            user: null, 
            links: {} as Record<LinkCategory, UserLinkWithPreview[]>, 
            appearanceSettings: null, 
            categoryOrder: CategoryOrderService.DEFAULT_ORDER 
          }
        }
        console.error('Server Service: Error fetching user:', {
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code
        })
        throw new Error('Failed to fetch profile')
      }

      if (!user) {
        return { 
          user: null, 
          links: {} as Record<LinkCategory, UserLinkWithPreview[]>, 
          appearanceSettings: null, 
          categoryOrder: CategoryOrderService.DEFAULT_ORDER 
        }
      }

      // Try to get category order first so we can sort the links correctly
      let categoryOrder: LinkCategory[] = CategoryOrderService.DEFAULT_ORDER;
      try {
        // Get user's category order from users table (not user_category_order table)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('category_order')
          .eq('id', user.id)
          .single();
          
        if (!userError && userData && userData.category_order) {
          categoryOrder = userData.category_order as LinkCategory[];
          console.log('✅ Server Service: Category order loaded from users table:', categoryOrder);
        } else {
          console.log('Server Service: No custom category order found, using default:', CategoryOrderService.DEFAULT_ORDER);
          if (userError) {
            console.log('Server Service: Database error:', userError);
          }
          if (userData) {
            console.log('Server Service: User data found but no category_order:', userData);
          }
        }
      } catch (orderError) {
        console.log('Server Service: Error loading category order, using default:', orderError);
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
        .order('position')
        .order('created_at')

      if (linksError) {
        console.error('Server Service: Error fetching links:', linksError)
        throw new Error('Failed to fetch profile links')
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

      // Public user includes all fields needed for rendering
      const publicUser: User = user

      // Get appearance settings
      let appearanceSettings: UserAppearanceSettings | null = null;
      try {
        const domainAppearanceSettings = await AppearanceService.getPublicAppearanceSettings(user.id);
        // Type cast to the expected type
        appearanceSettings = domainAppearanceSettings as unknown as UserAppearanceSettings;
      } catch (error) {
        console.log('Error loading appearance settings for user:', user.id, error);
        // This is fine, user may not have custom settings
      }

      console.log('✅ Server Service: Profile fetched successfully for:', username)

      return {
        user: publicUser,
        links: groupedLinks,
        appearanceSettings,
        categoryOrder
      }

    } catch (error) {
      console.error('❌ Server Service: Error fetching public profile:', error)

      // If it's a network error, return a more user-friendly response
      if (error instanceof Error && error.message.includes('fetch failed')) {
        console.error('❌ Server Service: Network connectivity issue detected')
        // Return empty profile instead of throwing to prevent 500 errors
        return { 
          user: null, 
          links: {} as Record<LinkCategory, UserLinkWithPreview[]>, 
          appearanceSettings: null, 
          categoryOrder: CategoryOrderService.DEFAULT_ORDER 
        }
      }

      throw error
    }
  }
}