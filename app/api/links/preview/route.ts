// API endpoint for rich link preview operations
// Handles fetching, refreshing, and managing link previews

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/security/auth'
import { RichPreviewService } from '@/lib/services/rich-preview-service'
import { supabase } from '@/lib/supabase'

// GET /api/links/preview?linkId=xxx - Get preview for a specific link
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    // Verify user owns the link
    const { data: link, error: linkError } = await supabase
      .from('user_links')
      .select('*')
      .eq('id', linkId)
      .eq('user_id', user.id)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Check if preview needs refresh
    const needsRefresh = await RichPreviewService.needsPreviewRefresh(linkId)
    
    if (needsRefresh) {
      // Fetch new preview
      const result = await RichPreviewService.refreshLinkPreview(linkId, link.url)
      
      return NextResponse.json({
        success: result.success,
        metadata: result.metadata,
        error: result.error,
        refreshed: true
      })
    } else {
      // Return cached preview
      const cachedPreview = await RichPreviewService.getCachedPreview(linkId)
      
      return NextResponse.json({
        success: !!cachedPreview,
        metadata: cachedPreview,
        cached: true
      })
    }

  } catch (error) {
    console.error('Preview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/links/preview - Refresh preview for a specific link
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkId } = body

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    // Verify user owns the link
    const { data: link, error: linkError } = await supabase
      .from('user_links')
      .select('*')
      .eq('id', linkId)
      .eq('user_id', user.id)
      .single()

    if (linkError || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Validate URL
    if (!RichPreviewService.validateUrl(link.url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Force refresh preview
    const result = await RichPreviewService.refreshLinkPreview(linkId, link.url)
    
    return NextResponse.json({
      success: result.success,
      metadata: result.metadata,
      error: result.error,
      refreshed: true
    })

  } catch (error) {
    console.error('Preview refresh API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/links/preview/batch - Batch refresh previews for multiple links
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkIds } = body

    if (!Array.isArray(linkIds) || linkIds.length === 0) {
      return NextResponse.json({ error: 'Link IDs array is required' }, { status: 400 })
    }

    if (linkIds.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 links per batch' }, { status: 400 })
    }

    // Get user's links
    const { data: links, error: linksError } = await supabase
      .from('user_links')
      .select('id, url')
      .eq('user_id', user.id)
      .in('id', linkIds)

    if (linksError) {
      return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
    }

    // Filter valid URLs
    const validLinks = links.filter(link => RichPreviewService.validateUrl(link.url))

    // Batch fetch previews
    const results = await RichPreviewService.batchFetchPreviews(validLinks)

    // Convert Map to object for JSON response
    const resultsObject: Record<string, any> = {}
    results.forEach((result, linkId) => {
      resultsObject[linkId] = result
    })

    return NextResponse.json({
      success: true,
      results: resultsObject,
      processed: validLinks.length,
      total: linkIds.length
    })

  } catch (error) {
    console.error('Batch preview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/links/preview - Clear preview data for a link
export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    // Verify user owns the link and clear preview data
    const { error: updateError } = await supabase
      .from('user_links')
      .update({
        metadata: null,
        preview_status: 'pending',
        preview_fetched_at: null,
        preview_expires_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to clear preview' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Clear preview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
