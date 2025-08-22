// API endpoints for category icon customization
// Handles CRUD operations for user category icon settings

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/security/auth'
import { CategoryIconService, UpdateCategoryIconData } from '@/lib/services/category-icon-service'
import { LinkCategory } from '@/lib/services/link-service'

// GET /api/category-icons - Get all category icons for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as LinkCategory

    if (category) {
      // Get specific category icon
      const iconConfig = await CategoryIconService.getCategoryIcon(user.id, category)
      return NextResponse.json({ iconConfig })
    } else {
      // Get all category icons
      const allIcons = await CategoryIconService.getAllCategoryIcons(user.id)
      return NextResponse.json({ categoryIcons: allIcons })
    }

  } catch (error) {
    console.error('Category icons API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/category-icons - Update category icon
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category, iconData } = body

    if (!category || !iconData) {
      return NextResponse.json(
        { error: 'Category and icon data are required' },
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

    await CategoryIconService.updateCategoryIcon(user.id, category as LinkCategory, iconData as UpdateCategoryIconData)

    return NextResponse.json({
      success: true,
      message: 'Category icon updated successfully'
    })

  } catch (error) {
    console.error('Category icon update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update category icon' },
      { status: 500 }
    )
  }
}

// DELETE /api/category-icons - Reset category icon to default
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    await CategoryIconService.resetCategoryIcon(user.id, category)

    return NextResponse.json({
      success: true,
      message: 'Category icon reset to default'
    })

  } catch (error) {
    console.error('Category icon reset error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset category icon' },
      { status: 500 }
    )
  }
}
