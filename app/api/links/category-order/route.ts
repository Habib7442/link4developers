import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createProtectedRoute } from '@/lib/security/api-protection'

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Protected GET route for fetching category order
const getCategoryOrderHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('📋 API: Fetching category order for user:', userId)

    const { data, error } = await supabase
      .from('users')
      .select('category_order')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ API: Error fetching category order:', error)
      return NextResponse.json(
        { error: `Failed to fetch category order: ${error.message}` },
        { status: 500 }
      )
    }

    // If no custom order exists, return default order
    const defaultOrder = ['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom']
    const categoryOrder = data?.category_order || defaultOrder

    console.log('✅ API: Category order fetched successfully:', categoryOrder)
    return NextResponse.json({ data: categoryOrder })

  } catch (error) {
    console.error('❌ API: Unexpected error in category order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Protected PUT route for updating category order
const updateCategoryOrderHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('📋 API: Updating category order for user:', userId)

    const body = await request.json()
    const { categoryOrder } = body

    if (!categoryOrder || !Array.isArray(categoryOrder)) {
      console.error('❌ API: Invalid category order data:', { categoryOrder })
      return NextResponse.json(
        { error: 'Invalid category order data' },
        { status: 400 }
      )
    }

    // Validate category order
    const validCategories = ['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom']
    const isValidOrder = categoryOrder.every(cat => validCategories.includes(cat)) && 
                        categoryOrder.length === validCategories.length

    if (!isValidOrder) {
      console.error('❌ API: Invalid category order:', categoryOrder)
      return NextResponse.json(
        { error: 'Invalid category order format' },
        { status: 400 }
      )
    }

    // Update category order in users table
    const { data, error } = await supabase
      .from('users')
      .update({
        category_order: categoryOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('category_order')
      .single()

    if (error) {
      console.error('❌ API: Database error updating category order:', error)
      return NextResponse.json(
        { error: `Failed to update category order: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ API: Category order updated successfully:', categoryOrder)
    return NextResponse.json({ data: { success: true, categoryOrder } })

  } catch (error) {
    console.error('❌ API: Unexpected error updating category order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Protected POST route for resetting category order
const resetCategoryOrderHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('📋 API: Resetting category order for user:', userId)

    const defaultOrder = ['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom']

    // Reset to default order
    const { error: updateError } = await supabase
      .from('users')
      .update({
        category_order: defaultOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ API: Error resetting category order:', updateError)
      return NextResponse.json(
        { error: `Failed to reset category order: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ API: Category order reset successfully to default')
    return NextResponse.json({ data: { success: true, categoryOrder: defaultOrder } })

  } catch (error) {
    console.error('❌ API: Unexpected error resetting category order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected routes
export const GET = createProtectedRoute(getCategoryOrderHandler, {
  requireAuth: true,
  allowedMethods: ['GET']
})

export const PUT = createProtectedRoute(updateCategoryOrderHandler, {
  requireAuth: true,
  rateLimit: 'CATEGORY_ORDER_UPDATE',
  allowedMethods: ['PUT']
})

export const POST = createProtectedRoute(resetCategoryOrderHandler, {
  requireAuth: true,
  rateLimit: 'CATEGORY_ORDER_RESET',
  allowedMethods: ['POST']
})
