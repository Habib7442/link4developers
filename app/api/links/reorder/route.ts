import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createProtectedRoute } from '@/lib/security/api-protection'

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Protected PUT route for reordering links within a category
const reorderLinksHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('🔄 API: Reordering links for user:', userId)

    const body = await request.json()
    const { category, linkIds } = body

    if (!category || !linkIds || !Array.isArray(linkIds)) {
      console.error('❌ API: Invalid reorder data:', { category, linkIds })
      return NextResponse.json(
        { error: 'Invalid reorder data. Category and linkIds array are required.' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom']
    if (!validCategories.includes(category)) {
      console.error('❌ API: Invalid category:', category)
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate that all link IDs belong to the user and category
    const { data: existingLinks, error: validationError } = await supabase
      .from('user_links')
      .select('id, category')
      .eq('user_id', userId)
      .eq('category', category)
      .in('id', linkIds)

    if (validationError) {
      console.error('❌ API: Error validating links:', validationError)
      return NextResponse.json(
        { error: `Failed to validate links: ${validationError.message}` },
        { status: 500 }
      )
    }

    if (existingLinks.length !== linkIds.length) {
      console.error('❌ API: Some links not found or don\'t belong to user/category:', {
        requested: linkIds.length,
        found: existingLinks.length
      })
      return NextResponse.json(
        { error: 'Some links not found or don\'t belong to the specified category' },
        { status: 400 }
      )
    }

    // Update positions for all links in the category
    const updatePromises = linkIds.map((linkId, index) => {
      return supabase
        .from('user_links')
        .update({ position: index, updated_at: new Date().toISOString() })
        .eq('id', linkId)
        .eq('user_id', userId)
        .eq('category', category)
    })

    const updateResults = await Promise.all(updatePromises)
    
    // Check for any errors
    const errors = updateResults.filter(result => result.error)
    if (errors.length > 0) {
      console.error('❌ API: Errors updating link positions:', errors)
      return NextResponse.json(
        { error: 'Failed to update some link positions' },
        { status: 500 }
      )
    }

    console.log('✅ API: Links reordered successfully:', {
      category,
      linkCount: linkIds.length,
      newOrder: linkIds
    })

    return NextResponse.json({ 
      data: { 
        success: true, 
        category, 
        linkCount: linkIds.length 
      } 
    })

  } catch (error) {
    console.error('❌ API: Unexpected error reordering links:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected PUT route
export const PUT = createProtectedRoute(reorderLinksHandler, {
  requireAuth: true,
  rateLimit: 'LINK_REORDER',
  allowedMethods: ['PUT']
})
