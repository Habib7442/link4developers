import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createProtectedRoute } from '@/lib/security/api-protection'

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Protected GET route for fetching link analytics
const getAnalyticsHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('📊 API: Fetching analytics for user:', userId)

    // Get total clicks across all links
    const { data: clicksData, error: clicksError } = await supabase
      .from('user_links')
      .select('click_count')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (clicksError) {
      console.error('❌ API: Error fetching click data:', clicksError)
      return NextResponse.json(
        { error: `Failed to fetch click data: ${clicksError.message}` },
        { status: 500 }
      )
    }

    // Get links by category
    const { data: categoryData, error: categoryError } = await supabase
      .from('user_links')
      .select('category, is_active')
      .eq('user_id', userId)

    if (categoryError) {
      console.error('❌ API: Error fetching category data:', categoryError)
      return NextResponse.json(
        { error: `Failed to fetch category data: ${categoryError.message}` },
        { status: 500 }
      )
    }

    // Get top performing links
    const { data: topLinksData, error: topLinksError } = await supabase
      .from('user_links')
      .select('title, click_count, url')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('click_count', { ascending: false })
      .limit(5)

    if (topLinksError) {
      console.error('❌ API: Error fetching top links:', topLinksError)
      return NextResponse.json(
        { error: `Failed to fetch top links: ${topLinksError.message}` },
        { status: 500 }
      )
    }

    // Calculate analytics
    const totalClicks = clicksData?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0
    
    const linksByCategory: Record<string, number> = {}
    categoryData?.forEach(link => {
      linksByCategory[link.category] = (linksByCategory[link.category] || 0) + 1
    })

    const topLinks = topLinksData?.map(link => ({
      title: link.title,
      clicks: link.click_count || 0,
      url: link.url
    })) || []

    const analytics = {
      totalClicks,
      linksByCategory,
      topLinks
    }

    console.log('✅ API: Analytics fetched successfully:', {
      totalClicks,
      categories: Object.keys(linksByCategory).length,
      topLinksCount: topLinks.length
    })

    return NextResponse.json({ data: analytics })

  } catch (error) {
    console.error('❌ API: Unexpected error in analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected GET route
export const GET = createProtectedRoute(getAnalyticsHandler, {
  requireAuth: true,
  allowedMethods: ['GET']
})
