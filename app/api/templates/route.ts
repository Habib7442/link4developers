import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TemplateService } from '@/lib/services/template-service'
import { getAllTemplates, getFreeTemplates, isValidTemplateId } from '@/lib/templates/template-config'
import { TemplateId } from '@/lib/supabase'

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
)

// GET /api/templates - Get available templates for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      // Return all free templates if no user ID
      return NextResponse.json({
        templates: getFreeTemplates()
      })
    }

    console.log('📋 Templates API: Fetching available templates for user:', userId)

    // Get user's premium status
    const { data: user, error } = await supabase
      .from('users')
      .select('is_premium, theme_id')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Templates API: Error fetching user:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    const isPremium = user?.is_premium || false
    const currentTheme = user?.theme_id || 'developer-dark'
    
    // Return appropriate templates based on premium status
    const availableTemplates = isPremium ? getAllTemplates() : getFreeTemplates()
    
    console.log('✅ Templates API: Templates fetched successfully')
    
    return NextResponse.json({
      templates: availableTemplates,
      currentTheme,
      isPremium
    })

  } catch (error) {
    console.error('❌ Templates API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Update user's template
export async function POST(request: NextRequest) {
  try {
    const { userId, templateId } = await request.json()
    
    if (!userId || !templateId) {
      return NextResponse.json(
        { error: 'Missing userId or templateId' },
        { status: 400 }
      )
    }

    if (!isValidTemplateId(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      )
    }

    console.log('🎨 Templates API: Updating template for user:', userId, 'to:', templateId)

    // Check if user has access to this template
    const hasAccess = await TemplateService.hasTemplateAccess(userId, templateId as TemplateId)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied: Premium template requires premium subscription' },
        { status: 403 }
      )
    }

    // Update user's template
    const success = await TemplateService.updateUserTemplate(userId, templateId as TemplateId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    console.log('✅ Templates API: Template updated successfully')
    
    return NextResponse.json({
      success: true,
      templateId
    })

  } catch (error) {
    console.error('❌ Templates API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
