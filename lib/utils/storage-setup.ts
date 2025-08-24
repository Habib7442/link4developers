import { supabase } from '@/lib/supabase'

/**
 * Check if the background-images storage bucket exists
 * Note: Bucket creation should be done through Supabase dashboard or admin API
 */
export async function checkBackgroundImagesBucket() {
  try {
    // Simply try to list files in the bucket to check if it exists and is accessible
    const { error } = await supabase.storage
      .from('background-images')
      .list('', { limit: 1 })

    if (error) {
      console.error('Background images bucket not accessible:', error)
      return false
    }

    console.log('Background images bucket is accessible')
    return true
  } catch (error) {
    console.error('Error checking background images bucket:', error)
    return false
  }
}

/**
 * Check if the user-uploads storage bucket exists
 */
export async function checkUserUploadsBucket() {
  try {
    // Try to list files in the bucket to check if it exists and is accessible
    const { error } = await supabase.storage
      .from('user-uploads')
      .list('', { limit: 1 })

    if (error) {
      console.error('User uploads bucket not accessible:', error)
      return false
    }

    console.log('User uploads bucket is accessible')
    return true
  } catch (error) {
    console.error('Error checking user uploads bucket:', error)
    return false
  }
}

/**
 * Set up storage policies for the background-images bucket
 */
export async function setupBackgroundImagesPolicy() {
  try {
    // Note: Storage policies are typically set up through the Supabase dashboard
    // or through SQL commands. For now, we'll rely on the bucket being public
    // and implement access control at the application level.
    
    console.log('Background images bucket policies should be configured in Supabase dashboard')
    return true
  } catch (error) {
    console.error('Error setting up storage policies:', error)
    return false
  }
}
