// API endpoint for uploading category icon files
// Handles file upload to Supabase Storage with validation and improved error handling

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/security/auth'
import { CategoryIconService } from '@/lib/services/category-icon-service'
import { LinkCategory } from '@/lib/services/link-service'

// POST /api/category-icons/upload - Upload category icon file
export async function POST(request: NextRequest) {
  try {
    console.log('📤 API: Starting category icon upload...')
    
    const user = await getUserFromRequest(request)
    if (!user) {
      console.error('❌ API: Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ API: User authenticated:', user.id)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as LinkCategory

    console.log('📋 API: Received upload data:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      category
    })

    if (!file) {
      console.error('❌ API: No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!category) {
      console.error('❌ API: Category is required')
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom']
    if (!validCategories.includes(category)) {
      console.error('❌ API: Invalid category:', category)
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate file before upload
    try {
      console.log('🔍 API: Validating file...')
      CategoryIconService.validateIconFile(file)
      console.log('✅ API: File validation passed')
    } catch (validationError) {
      console.error('❌ API: File validation failed:', validationError)
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'File validation failed' },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    console.log('☁️ API: Uploading file to storage...')
    let iconUrl: string
    try {
      iconUrl = await CategoryIconService.uploadCategoryIcon(user.id, category, file)
      console.log('✅ API: File uploaded successfully:', iconUrl)
    } catch (uploadError) {
      console.error('❌ API: File upload failed:', uploadError)
      return NextResponse.json(
        { error: `File upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Update category icon setting in database
    console.log('💾 API: Updating category icon setting...')
    try {
      await CategoryIconService.updateCategoryIcon(user.id, category, {
        icon_type: 'upload',
        custom_icon_url: iconUrl
      })
      console.log('✅ API: Category icon setting updated successfully')
    } catch (updateError) {
      console.error('❌ API: Failed to update category icon setting:', updateError)
      
      // Try to clean up the uploaded file if database update fails
      try {
        console.log('🧹 API: Cleaning up uploaded file due to database update failure...')
        await CategoryIconService.deleteCategoryIcon(iconUrl)
        console.log('✅ API: Uploaded file cleaned up successfully')
      } catch (cleanupError) {
        console.warn('⚠️ API: Failed to clean up uploaded file:', cleanupError)
      }
      
      return NextResponse.json(
        { error: `Failed to save icon settings: ${updateError instanceof Error ? updateError.message : 'Database error'}` },
        { status: 500 }
      )
    }

    console.log('🎉 API: Category icon upload completed successfully')
    return NextResponse.json({
      success: true,
      iconUrl,
      message: 'Category icon uploaded successfully'
    })

  } catch (error) {
    console.error('💥 API: Unexpected error in category icon upload:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload category icon'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('File size')) {
        errorMessage = error.message
        statusCode = 400
      } else if (error.message.includes('File type')) {
        errorMessage = error.message
        statusCode = 400
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Authentication required'
        statusCode = 401
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
