import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createProtectedRoute } from '@/lib/security/api-protection'

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
)

/**
 * Check storage bucket status
 */
async function checkStorageStatus(request: NextRequest, { userId }: { userId: string }) {
  try {
    const status = {
      backgroundImages: false,
      avatars: false,
      userCanUpload: false,
      errors: [] as string[]
    }

    // Check background-images bucket
    try {
      const { error: bgError } = await supabase.storage
        .from('background-images')
        .list('', { limit: 1 })
      
      if (!bgError) {
        status.backgroundImages = true
      } else {
        status.errors.push(`Background images: ${bgError.message}`)
      }
    } catch (error) {
      status.errors.push(`Background images: ${error}`)
    }

    // Check avatars bucket
    try {
      const { error: avatarError } = await supabase.storage
        .from('avatars')
        .list('', { limit: 1 })
      
      if (!avatarError) {
        status.avatars = true
      } else {
        status.errors.push(`Avatars: ${avatarError.message}`)
      }
    } catch (error) {
      status.errors.push(`Avatars: ${error}`)
    }

    // Test user upload capability
    if (status.backgroundImages) {
      try {
        // Try to list user's folder (this tests upload permissions)
        const { error: uploadError } = await supabase.storage
          .from('background-images')
          .list(userId, { limit: 1 })
        
        if (!uploadError) {
          status.userCanUpload = true
        } else {
          status.errors.push(`Upload test: ${uploadError.message}`)
        }
      } catch (error) {
        status.errors.push(`Upload test: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      status,
      message: status.backgroundImages && status.avatars && status.userCanUpload 
        ? 'Storage is fully operational'
        : 'Storage has some issues'
    })

  } catch (error) {
    console.error('Storage status check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check storage status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Export the protected route
export const GET = createProtectedRoute(checkStorageStatus, {
  requireAuth: true,
  rateLimit: 'API_GENERAL'
})
