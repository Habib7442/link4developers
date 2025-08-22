import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/security'
import { AppearanceService, AppearanceUpdateData } from '@/lib/services/appearance-service'
import { PremiumAccessService } from '@/lib/services/premium-access-service'

// ============================================================================
// APPEARANCE SETTINGS API ROUTES
// ============================================================================

// GET - Fetch user's appearance settings
const getAppearanceHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('📖 API: Fetching appearance settings for user:', userId)

    // Check premium access
    const accessCheck = await PremiumAccessService.requireAppearanceAccess(userId)
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        { 
          error: accessCheck.error,
          accessStatus: accessCheck.status
        },
        { status: 403 }
      )
    }

    const settings = await AppearanceService.getUserAppearanceSettings(userId)

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await AppearanceService.createDefaultSettings(userId)
      if (!defaultSettings) {
        return NextResponse.json(
          { error: 'Failed to create default appearance settings' },
          { status: 500 }
        )
      }
      
      console.log('✅ API: Created default appearance settings for user:', userId)
      return NextResponse.json({ 
        data: defaultSettings,
        accessStatus: accessCheck.status
      })
    }

    console.log('✅ API: Appearance settings fetched successfully for user:', userId)
    return NextResponse.json({ 
      data: settings,
      accessStatus: accessCheck.status
    })

  } catch (error) {
    console.error('API: Error fetching appearance settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appearance settings' },
      { status: 500 }
    )
  }
}

// PUT - Update user's appearance settings
const updateAppearanceHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('📝 API: Updating appearance settings for user:', userId)

    // Check premium access
    const accessCheck = await PremiumAccessService.requireAppearanceAccess(userId)
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        { 
          error: accessCheck.error,
          accessStatus: accessCheck.status
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { updates } = body as { updates: AppearanceUpdateData }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid updates data' },
        { status: 400 }
      )
    }

    const updatedSettings = await AppearanceService.updateAppearanceSettings(userId, updates)

    if (!updatedSettings) {
      return NextResponse.json(
        { error: 'Failed to update appearance settings' },
        { status: 500 }
      )
    }

    console.log('✅ API: Appearance settings updated successfully for user:', userId)
    return NextResponse.json({ 
      data: updatedSettings,
      accessStatus: accessCheck.status
    })

  } catch (error) {
    console.error('API: Error updating appearance settings:', error)
    
    if (error instanceof Error && error.message.includes('Premium access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update appearance settings' },
      { status: 500 }
    )
  }
}

// POST - Reset appearance settings to defaults
const resetAppearanceHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('🔄 API: Resetting appearance settings for user:', userId)

    // Check premium access
    const accessCheck = await PremiumAccessService.requireAppearanceAccess(userId)
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        { 
          error: accessCheck.error,
          accessStatus: accessCheck.status
        },
        { status: 403 }
      )
    }

    const resetSettings = await AppearanceService.resetToDefaults(userId)

    if (!resetSettings) {
      return NextResponse.json(
        { error: 'Failed to reset appearance settings' },
        { status: 500 }
      )
    }

    console.log('✅ API: Appearance settings reset successfully for user:', userId)
    return NextResponse.json({ 
      data: resetSettings,
      accessStatus: accessCheck.status
    })

  } catch (error) {
    console.error('API: Error resetting appearance settings:', error)
    
    if (error instanceof Error && error.message.includes('Premium access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to reset appearance settings' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user's appearance settings
const deleteAppearanceHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('🗑️ API: Deleting appearance settings for user:', userId)

    const success = await AppearanceService.deleteAppearanceSettings(userId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete appearance settings' },
        { status: 500 }
      )
    }

    console.log('✅ API: Appearance settings deleted successfully for user:', userId)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API: Error deleting appearance settings:', error)
    return NextResponse.json(
      { error: 'Failed to delete appearance settings' },
      { status: 500 }
    )
  }
}

// Export protected routes
export const GET = createProtectedRoute(getAppearanceHandler, {
  requireAuth: true,
  rateLimit: 'API_GENERAL',
  allowedMethods: ['GET']
})

export const PUT = createProtectedRoute(updateAppearanceHandler, {
  requireAuth: true,
  rateLimit: 'API_GENERAL',
  allowedMethods: ['PUT']
})

export const POST = createProtectedRoute(resetAppearanceHandler, {
  requireAuth: true,
  rateLimit: 'API_GENERAL',
  allowedMethods: ['POST']
})

export const DELETE = createProtectedRoute(deleteAppearanceHandler, {
  requireAuth: true,
  rateLimit: 'API_GENERAL',
  allowedMethods: ['DELETE']
})
