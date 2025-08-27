// API endpoint for refreshing a specific link's preview
// Handles POST requests to refresh the rich preview metadata for a link

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/security/auth'
import { RichPreviewService } from '@/lib/services/rich-preview-service'
import { supabase } from '@/lib/supabase'

// POST /api/links/[linkId]/refresh-preview - Refresh preview for a specific link
export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { user, error } = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const { linkId } = params

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    // Verify user owns the link
    const { data: link, error: linkError } = await supabase
      .from('user_links')
      .select('id, url, user_id, category')
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

    // Fetch metadata immediately and return updated link data
    const result = await RichPreviewService.fetchMetadataImmediately(linkId, link.url)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        metadata: result.metadata,
        refreshed: true
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Preview refresh API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}