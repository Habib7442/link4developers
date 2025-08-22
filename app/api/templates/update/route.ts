import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/security/api-protection'
import { supabase } from '@/lib/supabase'
import { TemplateId } from '@/lib/supabase'
import { isValidTemplateId } from '@/lib/templates/template-config'
import { CacheInvalidationService } from '@/lib/services/cache-invalidation-service'

// Protected POST route for updating user templates
const updateTemplateHandler = async (
  request: NextRequest,
  { userId }: { userId: string }
) => {
  try {
    console.log('🎨 Template Update API: Updating template for user:', userId)

    const body = await request.json()
    const { templateId } = body

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    if (!isValidTemplateId(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      )
    }

    // Get user data first to get username for cache invalidation
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('profile_slug, github_username, is_premium')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('Template Update API: Error fetching user data:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // Check if user has access to this template (basic check for premium templates)
    // Note: You might want to implement more sophisticated template access control here
    const templateConfig = await import('@/lib/templates/template-config').then(m => m.getTemplateConfig(templateId as TemplateId))
    if (templateConfig.category === 'premium' && !userData.is_premium) {
      return NextResponse.json(
        { error: 'Premium template requires premium subscription' },
        { status: 403 }
      )
    }

    // Update user's template
    const { error } = await supabase
      .from('users')
      .update({ 
        theme_id: templateId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Template Update API: Error updating user template:', error)
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    // Invalidate caches after successful theme update
    try {
      const username = userData.profile_slug || userData.github_username
      await CacheInvalidationService.invalidateUserTheme(userId, username)
      console.log('✅ Template Update API: Theme caches invalidated for user:', username)
    } catch (cacheError) {
      console.warn('⚠️ Template Update API: Cache invalidation failed:', cacheError)
      // Don't fail the request if cache invalidation fails
    }

    console.log('✅ Template Update API: Template updated successfully:', templateId)
    
    return NextResponse.json({
      success: true,
      templateId
    })

  } catch (error) {
    console.error('❌ Template Update API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected POST route
export const POST = createProtectedRoute(updateTemplateHandler, {
  requireAuth: true,
  rateLimit: 'TEMPLATE_UPDATE',
  allowedMethods: ['POST']
})
