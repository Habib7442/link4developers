import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
)

export async function POST(request: NextRequest) {
  try {
    // Remove console.log
    
    const body = await request.json()
    const { userId, linkId } = body
    
    // Remove console.log
    
    // Validate required fields
    if (!userId || !linkId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, linkId' },
        { status: 400 }
      )
    }
    
    // First get the current status
    const { data: currentLink, error: fetchError } = await supabase
      .from('user_links')
      .select('is_active')
      .eq('id', linkId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !currentLink) {
      console.error('API: Error fetching current link:', fetchError)
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // Toggle the status
    const newStatus = !currentLink.is_active
    // Remove console.log

    const { data, error } = await supabase
      .from('user_links')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('API: Database error:', error)
      return NextResponse.json(
        { error: `Failed to toggle link status: ${error.message}` },
        { status: 500 }
      )
    }

    // Remove console.log
    return NextResponse.json({ data })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add PUT method to handle requests from frontend that expect PUT
export async function PUT(request: NextRequest) {
  try {
    // Remove console.log
    
    const body = await request.json()
    const { userId, linkId } = body
    
    // Remove console.log
    
    // Validate required fields
    if (!userId || !linkId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, linkId' },
        { status: 400 }
      )
    }
    
    // First get the current status
    const { data: currentLink, error: fetchError } = await supabase
      .from('user_links')
      .select('is_active')
      .eq('id', linkId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !currentLink) {
      console.error('API: Error fetching current link:', fetchError)
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    // Toggle the status
    const newStatus = !currentLink.is_active
    // Remove console.log

    const { data, error } = await supabase
      .from('user_links')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('API: Database error:', error)
      return NextResponse.json(
        { error: `Failed to toggle link status: ${error.message}` },
        { status: 500 }
      )
    }

    // Remove console.log
    return NextResponse.json({ data })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}