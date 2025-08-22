// API endpoint for uploading category icon files
// Handles file upload to Supabase Storage with validation

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/security/auth'
import { CategoryIconService } from '@/lib/services/category-icon-service'
import { LinkCategory } from '@/lib/services/link-service'

// POST /api/category-icons/upload - Upload category icon file
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as LinkCategory

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

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

    // Upload file and get URL
    const iconUrl = await CategoryIconService.uploadCategoryIcon(user.id, category, file)

    // Update category icon setting
    await CategoryIconService.updateCategoryIcon(user.id, category, {
      icon_type: 'upload',
      custom_icon_url: iconUrl
    })

    return NextResponse.json({
      success: true,
      iconUrl,
      message: 'Category icon uploaded successfully'
    })

  } catch (error) {
    console.error('Category icon upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload category icon' },
      { status: 500 }
    )
  }
}
