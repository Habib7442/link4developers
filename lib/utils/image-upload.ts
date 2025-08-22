import { supabase } from '@/lib/supabase'

// Image validation constants
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MIN_IMAGE_WIDTH = 800
export const MIN_IMAGE_HEIGHT = 600

export interface ImageValidationResult {
  isValid: boolean
  error?: string
  dimensions?: { width: number; height: number }
}

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

/**
 * Validate an image file before upload
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  try {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.'
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size too large. Maximum size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB.`
      }
    }

    // Check image dimensions
    const dimensions = await getImageDimensions(file)
    if (dimensions.width < MIN_IMAGE_WIDTH || dimensions.height < MIN_IMAGE_HEIGHT) {
      return {
        isValid: false,
        error: `Image too small. Minimum dimensions are ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px.`,
        dimensions
      }
    }

    return {
      isValid: true,
      dimensions
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate image file.'
    }
  }
}

/**
 * Get image dimensions from a file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * Generate a unique file path for user uploads
 */
export function generateUploadPath(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = fileName.split('.').pop()
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  return `${userId}/${timestamp}_${randomString}_${cleanFileName}`
}

/**
 * Check if the background-images bucket exists
 * Note: Bucket creation is handled through Supabase dashboard/admin
 */
async function checkBucketExists(): Promise<boolean> {
  try {
    // Simply try to list files in the bucket to check if it exists
    const { error } = await supabase.storage
      .from('background-images')
      .list('', { limit: 1 })

    // If no error, bucket exists and is accessible
    if (!error) {
      return true
    }

    // Log specific error types for debugging
    if (error.message?.includes('Bucket not found')) {
      console.warn('Background images bucket not found. Please create it in Supabase dashboard.')
    } else if (error.message?.includes('row-level security')) {
      console.warn('Storage bucket access denied. Please check RLS policies.')
    } else {
      console.warn('Storage bucket check failed:', error.message)
    }

    return false
  } catch (error) {
    console.warn('Error checking bucket availability:', error)
    return false
  }
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadBackgroundImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<ImageUploadResult> {
  try {
    // Validate the file first
    const validation = await validateImageFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // Check if bucket exists
    const bucketReady = await checkBucketExists()
    if (!bucketReady) {
      return {
        success: false,
        error: 'Storage not available. Please try again later.'
      }
    }

    // Generate unique file path
    const filePath = generateUploadPath(userId, file.name)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('background-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image. Please try again.'
      }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('background-images')
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: 'Failed to get image URL.'
      }
    }

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during upload.'
    }
  }
}

/**
 * Delete an uploaded background image
 */
export async function deleteBackgroundImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('background-images')
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}

/**
 * List user's uploaded background images
 */
export async function listUserBackgroundImages(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from('background-images')
      .list(userId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('Error listing images:', error)
      return []
    }

    return data?.map(file => `${userId}/${file.name}`) || []
  } catch (error) {
    console.error('Error listing images:', error)
    return []
  }
}

/**
 * Get public URL for an uploaded image
 */
export function getBackgroundImageUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('background-images')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}
