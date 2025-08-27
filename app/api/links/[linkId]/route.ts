// API endpoint for individual link operations
// Handles DELETE, PUT, GET for specific links

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromRequest } from '@/lib/security/auth'

// Create a server-side Supabase client with service role key for full permissions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
)

// DELETE /api/links/[linkId] - Delete a specific link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    console.log('🗑️ API: DELETE request received', { 
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll()
    });

    const { user, error } = await getUserFromRequest(request)
    console.log('🗑️ API: Authentication result', { user: user?.id, error });
    
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { linkId } = params

    console.log('🗑️ API: Deleting link...', { userId: user.id, linkId })

    // Validate required fields
    if (!linkId || typeof linkId !== 'string' || linkId.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or invalid linkId' },
        { status: 400 }
      )
    }

    // Delete the link (with user_id check for security)
    const { error: deleteError } = await supabase
      .from('user_links')
      .delete()
      .eq('id', linkId.trim())
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('API: Database error:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete link: ${deleteError.message}` },
        { status: 500 }
      )
    }

    console.log('API: Link deleted successfully')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/links/[linkId] - Update a specific link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> | { linkId: string } }
) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    // Fix: Properly await params if it's a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const { linkId } = resolvedParams;
    const body = await request.json()

    console.log('✏️ API: Updating link...', { userId: user.id, linkId, body })

    // Validate required fields
    if (!linkId || typeof linkId !== 'string' || linkId.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or invalid linkId' },
        { status: 400 }
      )
    }

    // Extract only the fields that should be updated
    let fieldsToUpdate = {}
    
    // Handle different body structures
    if (body.updates) {
      // If body has updates field (from ApiLinkService.updateLink)
      fieldsToUpdate = body.updates
    } else if (body.userId && Object.keys(body).length > 1) {
      // If body has userId and other fields, extract the other fields
      const { userId, id, user_id, created_at, updated_at, ...rest } = body
      fieldsToUpdate = rest
    } else {
      // Direct fields
      fieldsToUpdate = body
    }

    // Remove any fields that shouldn't be updated
    const sanitizedUpdates: Record<string, any> = {}
    const disallowedFields = ['id', 'user_id', 'userId', 'created_at', 'updated_at']
    
    for (const [key, value] of Object.entries(fieldsToUpdate)) {
      // Only include fields that exist in the user_links table and are not disallowed
      if (!disallowedFields.includes(key)) {
        sanitizedUpdates[key] = value
      }
    }

    console.log('✏️ API: Sanitized updates...', sanitizedUpdates)

    // Update the link (with user_id check for security)
    const { data, error: updateError } = await supabase
      .from('user_links')
      .update(sanitizedUpdates)
      .eq('id', linkId.trim())
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('API: Database error:', updateError)
      return NextResponse.json(
        { error: `Failed to update link: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('API: Link updated successfully')
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/links/[linkId] - Get a specific link
export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { linkId } = params

    console.log('🔍 API: Getting link...', { userId: user.id, linkId })

    // Validate required fields
    if (!linkId || typeof linkId !== 'string' || linkId.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or invalid linkId' },
        { status: 400 }
      )
    }

    // Get the link (with user_id check for security)
    const { data, error: fetchError } = await supabase
      .from('user_links')
      .select('*')
      .eq('id', linkId.trim())
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('API: Database error:', fetchError)
      return NextResponse.json(
        { error: `Failed to fetch link: ${fetchError.message}` },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }

    console.log('API: Link fetched successfully')
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
