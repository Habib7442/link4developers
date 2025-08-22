import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPublicRoute } from '@/lib/security/api-protection'
import { sanitizeText } from '@/lib/security/validation'

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
)

// Protected POST route for tracking clicks
const trackClickHandler = async (request: NextRequest) => {
  try {
    const { linkId } = await request.json()

    // Validate and sanitize linkId
    if (!linkId || typeof linkId !== 'string') {
      return NextResponse.json(
        { error: 'Valid Link ID is required' },
        { status: 400 }
      )
    }

    const sanitizedLinkId = sanitizeText(linkId.trim(), 50)

    console.log('📊 Track Click API: Incrementing click count for link:', sanitizedLinkId)

    // First get the current click count
    const { data: currentLink, error: fetchError } = await supabase
      .from('user_links')
      .select('click_count')
      .eq('id', sanitizedLinkId)
      .single()

    if (fetchError) {
      console.error('Track Click API: Error fetching current link:', fetchError)
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // Increment the click count for the link
    const { data, error } = await supabase
      .from('user_links')
      .update({
        click_count: (currentLink.click_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', sanitizedLinkId)
      .select('click_count')
      .single()

    if (error) {
      console.error('Track Click API: Error updating click count:', error)
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      )
    }

    console.log('✅ Track Click API: Click tracked successfully, new count:', data?.click_count)
    
    return NextResponse.json({
      success: true,
      click_count: data?.click_count
    })

  } catch (error) {
    console.error('❌ Track Click API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected POST route
export const POST = createPublicRoute(trackClickHandler, {
  rateLimit: 'LINK_CLICK',
  allowedMethods: ['POST']
})
