import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createProtectedRoute } from '@/lib/security/api-protection'
import { validateLink, sanitizeUrl, sanitizeText } from '@/lib/security/validation'
import { CacheInvalidationService } from '@/lib/services/cache-invalidation-service'
import { SocialMediaValidator } from '@/lib/validation/social-media-validation'
import { RichPreviewService } from '@/lib/services/rich-preview-service'
import { isGitHubUrl, isBlogUrl } from '@/lib/types/rich-preview'


// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side operations
)

// Protected POST route for creating links
const createLinkHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('📝 API: Creating new link...')

    const body = await request.json()
    const { linkData } = body

    console.log('API: Received data:', { userId, linkData })

    // Special validation for social media links
    let sanitizedData: any;
    let validationSuccess = true;
    
    if (linkData.category === 'social') {
      try {
        const socialValidation = SocialMediaValidator.validateSocialMediaLink({
          url: linkData.url,
          title: linkData.title,
          category: linkData.category,
          custom_icon_url: linkData.custom_icon_url,
          uploaded_icon_url: linkData.uploaded_icon_url,
          icon_variant: linkData.icon_variant,
          use_custom_icon: linkData.use_custom_icon,
          icon_selection_type: linkData.icon_selection_type,
          platform_detected: linkData.platform_detected
        })

        if (!socialValidation.isValid) {
          console.error('❌ API: Social media validation failed:', socialValidation.errors)
          return NextResponse.json(
            { error: 'Social media validation failed', details: socialValidation.errors },
            { status: 400 }
          )
        }

        sanitizedData = socialValidation.sanitizedData!
      } catch (validationError) {
        console.error('❌ API: Exception during social media validation:', validationError)
        return NextResponse.json(
          { error: 'Social media validation error', details: validationError instanceof Error ? validationError.message : 'Unknown validation error' },
          { status: 400 }
        )
      }
    } else {
      // Regular validation for non-social links
      const validation = validateLink(linkData)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.errors },
          { status: 400 }
        )
      }

      sanitizedData = validation.data
      validationSuccess = validation.success
    }
    
    // Log validation results for debugging
    console.log('API: Validation results:', { 
      success: linkData.category === 'social' ? true : validationSuccess, 
      sanitizedData
    })
    
    if (linkData.category !== 'social' && !validationSuccess) {
      console.error('API: Validation failed')
      // Error already handled above
      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      )
    }
    
    // Get next position for the category
    const { data: existingLinks, error: fetchError } = await supabase
      .from('user_links')
      .select('position')
      .eq('user_id', userId)
      .eq('category', sanitizedData.category)
      .order('position', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('API: Error fetching existing links:', fetchError)
      return NextResponse.json(
        { error: `Failed to fetch existing links: ${fetchError.message}` },
        { status: 500 }
      )
    }

    const nextPosition = existingLinks?.[0]?.position ? existingLinks[0].position + 1 : 0
    console.log('API: Next position will be:', nextPosition)

    // Prepare insert data with sanitized values
    const insertData = {
      user_id: userId,
      title: sanitizeText(sanitizedData.title, 100),
      url: sanitizeUrl(sanitizedData.url),
      description: sanitizedData.description ? sanitizeText(sanitizedData.description, 200) : null,
      icon_type: sanitizedData.icon_type,
      category: sanitizedData.category,
      position: nextPosition,
      is_active: true,
      metadata: {},
      // Universal icon fields
      custom_icon_url: sanitizedData.custom_icon_url,
      uploaded_icon_url: sanitizedData.uploaded_icon_url,
      icon_variant: sanitizedData.icon_variant,
      use_custom_icon: sanitizedData.use_custom_icon,
      icon_selection_type: sanitizedData.icon_selection_type || 'default',
      platform_detected: sanitizedData.platform_detected,
      // GitHub Projects specific field
      live_project_url: sanitizedData.live_project_url && sanitizedData.live_project_url.trim() ? sanitizeUrl(sanitizedData.live_project_url) : null
    }

    // Additional URL validation
    if (!insertData.url) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      )
    }

    console.log('API: Insert data:', insertData)

    // Insert the link
    const { data, error } = await supabase
      .from('user_links')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('API: Database error:', error)
      console.error('API: Insert data that caused error:', JSON.stringify(insertData, null, 2))
      
      // Provide more specific error messages based on error codes
      let errorMessage = `Failed to create link: ${error.message}`
      let statusCode = 500
      
      if (error.code === '23505') {
        errorMessage = 'A link with this URL already exists in this category'
        statusCode = 409 // Conflict
      } else if (error.code === '23502') {
        errorMessage = 'Missing required fields'
        statusCode = 400 // Bad Request
      } else if (error.code === '23503') {
        errorMessage = 'Referenced record does not exist'
        statusCode = 400 // Bad Request
      } else if (error.code === '42703') {
        errorMessage = 'Database schema mismatch. Please contact support.'
        statusCode = 500 // Server Error
      }
      
      // Log the specific fields that might be causing issues
      const problematicFields = Object.keys(insertData).filter(key => {
        const value = insertData[key as keyof typeof insertData]
        return value !== null && value !== undefined && String(value).length > 0
      })
      
      console.error('API: Fields being inserted:', problematicFields)
      
      return NextResponse.json(
        { error: errorMessage, code: error.code, fields: problematicFields },
        { status: statusCode }
      )
    }

    console.log('API: Link created successfully:', data)

    // Invalidate caches after successful link creation
    try {
      // Get user data to find username for cache invalidation
      const { data: userData } = await supabase
        .from('users')
        .select('profile_slug, github_username')
        .eq('id', userId)
        .single()

      const username = userData?.profile_slug || userData?.github_username
      await CacheInvalidationService.invalidateUserLinks(userId, username)
    } catch (cacheError) {
      console.warn('API: Cache invalidation failed:', cacheError)
      // Don't fail the request if cache invalidation fails
    }

    // Trigger rich preview fetching for supported URLs
    try {
      const shouldFetchPreview = (insertData.category !== 'social') &&
                              (isGitHubUrl(insertData.url) || isBlogUrl(insertData.url).isBlog)

      if (shouldFetchPreview) {
        console.log('🔍 API: Triggering rich preview fetch for:', insertData.url)
        // Start the preview process but don't block the response
        // This allows the UI to show a placeholder while the preview is being generated
        RichPreviewService.refreshLinkPreview(data.id, insertData.url).catch(error => {
          console.warn('API: Rich preview fetch failed:', error)
        })
      }
    } catch (previewError) {
      console.warn('API: Rich preview trigger failed:', previewError)
      // Don't fail the request if preview trigger fails
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected POST route
export const POST = createProtectedRoute(createLinkHandler, {
  requireAuth: true,
  rateLimit: 'LINK_CREATE',
  allowedMethods: ['POST']
})

// Protected PUT route for updating links
const updateLinkHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    console.log('📝 API: Updating link...')

    const body = await request.json()
    const { linkData } = body

    console.log('API: Received update data:', { userId, linkData })

    // Validate required fields
    if (!linkData?.id || linkData.id.trim() === '') {
      console.error('API: Validation failed:', { linkDataId: linkData?.id })
      return NextResponse.json(
        { error: 'Missing required field: linkData.id' },
        { status: 400 }
      )
    }
    
    const { id, display_order, ...updateData } = linkData

    // Special validation for social media links
    let sanitizedData: any;
    
    if (updateData.category === 'social') {
      const socialValidation = SocialMediaValidator.validateSocialMediaLink({
        url: updateData.url,
        title: updateData.title,
        category: updateData.category,
        custom_icon_url: updateData.custom_icon_url,
        uploaded_icon_url: updateData.uploaded_icon_url,
        icon_variant: updateData.icon_variant,
        use_custom_icon: updateData.use_custom_icon,
        icon_selection_type: updateData.icon_selection_type,
        platform_detected: updateData.platform_detected
      })

      if (!socialValidation.isValid) {
        return NextResponse.json(
          { error: 'Social media validation failed', details: socialValidation.errors },
          { status: 400 }
        )
      }

      sanitizedData = socialValidation.sanitizedData!
    } else {
      // Regular validation for non-social links
      const validation = validateLink(updateData)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.errors },
          { status: 400 }
        )
      }

      sanitizedData = validation.data
    }

    const updatePayload: any = {
      title: sanitizeText(sanitizedData.title, 100),
      url: sanitizeUrl(sanitizedData.url),
      description: sanitizedData.description ? sanitizeText(sanitizedData.description, 200) : null,
      icon_type: sanitizedData.icon_type,
      category: sanitizedData.category,
      updated_at: new Date().toISOString(),
      // Include universal icon fields
      custom_icon_url: sanitizedData.custom_icon_url || null,
      uploaded_icon_url: sanitizedData.uploaded_icon_url || null,
      icon_variant: sanitizedData.icon_variant || 'default',
      use_custom_icon: sanitizedData.use_custom_icon || false,
      icon_selection_type: sanitizedData.icon_selection_type || 'default',
      platform_detected: sanitizedData.platform_detected || null,
      // GitHub Projects specific field
      live_project_url: sanitizedData.live_project_url && sanitizedData.live_project_url.trim() ? sanitizeUrl(sanitizedData.live_project_url) : null
    }

    // Additional URL validation
    if (updatePayload.url === null) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      )
    }

    // Map display_order to position if provided
    if (display_order !== undefined) {
      updatePayload.position = display_order
    }

    console.log('API: Update payload:', updatePayload)

    // Update the link
    const { data, error } = await supabase
      .from('user_links')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('API: Database error:', error)
      console.error('API: Update payload that caused error:', JSON.stringify(updatePayload, null, 2))
      
      // Provide more specific error messages based on error codes
      let errorMessage = `Failed to update link: ${error.message}`
      let statusCode = 500
      
      if (error.code === '23505') {
        errorMessage = 'A link with this URL already exists in this category'
        statusCode = 409 // Conflict
      } else if (error.code === '23502') {
        errorMessage = 'Missing required fields'
        statusCode = 400 // Bad Request
      } else if (error.code === '23503') {
        errorMessage = 'Referenced record does not exist'
        statusCode = 400 // Bad Request
      } else if (error.code === '42703') {
        errorMessage = 'Database schema mismatch. Please contact support.'
        statusCode = 500 // Server Error
      } else if (error.code === '22P02') {
        errorMessage = 'Invalid input format. Please check your data.'
        statusCode = 400 // Bad Request
      }
      
      return NextResponse.json(
        { error: errorMessage, code: error.code },
        { status: statusCode }
      )
    }

    console.log('API: Link updated successfully:', data)

    // Invalidate caches after successful link update
    try {
      // Get user data to find username for cache invalidation
      const { data: userData } = await supabase
        .from('users')
        .select('profile_slug, github_username')
        .eq('id', userId)
        .single()

      const username = userData?.profile_slug || userData?.github_username
      await CacheInvalidationService.invalidateUserLinks(userId, username)
    } catch (cacheError) {
      console.warn('API: Cache invalidation failed:', cacheError)
      // Don't fail the request if cache invalidation fails
    }

    // Trigger rich preview refresh if URL was updated
    try {
      if (updateData.url) {
        const shouldFetchPreview = (data.category !== 'social') &&
                                  (isGitHubUrl(updateData.url) || isBlogUrl(updateData.url).isBlog)

        if (shouldFetchPreview) {
          console.log('🔍 API: Triggering rich preview refresh for updated URL:', updateData.url)
          // Start the preview process but don't block the response
          // This allows the UI to show a placeholder while the preview is being generated
          RichPreviewService.refreshLinkPreview(data.id, updateData.url).catch(error => {
            console.warn('API: Rich preview refresh failed:', error)
          })
        }
      }
    } catch (previewError) {
      console.warn('API: Rich preview trigger failed:', previewError)
      // Don't fail the request if preview trigger fails
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected PUT route
export const PUT = createProtectedRoute(updateLinkHandler, {
  requireAuth: true,
  rateLimit: 'LINK_UPDATE',
  allowedMethods: ['PUT']
})

// Protected GET route for fetching links
const getLinksHandler = async (request: NextRequest, { userId }: { userId: string }) => {
  try {
    // Check if this is a request for the live preview
    const url = new URL(request.url)
    const isPreviewRequest = url.searchParams.get('preview') === 'true'

    // For preview requests, only get active links
    let query = supabase
      .from('user_links')
      .select('*')
      .eq('user_id', userId)
    
    // Filter by is_active for preview requests
    if (isPreviewRequest) {
      query = query.eq('is_active', true)
    }
    
    // Complete the query with ordering
    const { data, error } = await query
      .order('category')
      .order('position')
      .order('created_at')

    if (error) {
      console.error('API: Error fetching links:', error)
      return NextResponse.json(
        { error: `Failed to fetch links: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('API: Links fetched successfully:', data?.length || 0, 'links')
    
    // Group links by category to match frontend expectations
    const groupedLinks = {
      personal: [],
      projects: [],
      blogs: [],
      achievements: [],
      contact: [],
      custom: [],
      social: []
    } as Record<string, any[]>
    
    if (data) {
      data.forEach((link: any) => {
        const category = link.category
        if (groupedLinks[category]) {
          groupedLinks[category].push(link)
        }
      })
    }
    
    return NextResponse.json(groupedLinks)

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export the protected GET route
export const GET = createProtectedRoute(getLinksHandler, {
  requireAuth: true,
  allowedMethods: ['GET']
})


