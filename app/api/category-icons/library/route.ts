// API endpoint for getting library icons
// Returns available default icons organized by category

import { NextRequest, NextResponse } from 'next/server'
import { CategoryIconService } from '@/lib/services/category-icon-service'
import { LinkCategory } from '@/lib/services/link-service'

// GET /api/category-icons/library - Get library icons for a category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as LinkCategory

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const libraryIcons = CategoryIconService.getLibraryIcons(category)

    return NextResponse.json({
      category,
      icons: libraryIcons
    })

  } catch (error) {
    console.error('Library icons API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
