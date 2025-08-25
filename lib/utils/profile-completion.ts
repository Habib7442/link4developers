import { User } from '@/lib/supabase'

export interface ProfileCompletionStatus {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
  canNavigate: boolean
}

/**
 * Check if a user's profile is complete enough to access other dashboard features
 */
export function checkProfileCompletion(user: User | null): ProfileCompletionStatus {
  try {
    if (!user) {
      return {
        isComplete: false,
        missingFields: ['User not loaded'],
        completionPercentage: 0,
        canNavigate: false
      }
    }

    const requiredFields = [
      'full_name',
      'profile_slug'
    ]

    const importantFields = [
      'profile_title',
      'bio',
      'avatar_url'
    ]

    const missingRequired: string[] = []
    const missingImportant: string[] = []

    // Check required fields
    requiredFields.forEach(field => {
      try {
        const value = user[field as keyof User]
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingRequired.push(field)
        }
      } catch (fieldError) {
        console.warn(`Error checking field ${field}:`, fieldError)
        missingRequired.push(field)
      }
    })

    // Check important fields
    importantFields.forEach(field => {
      try {
        const value = user[field as keyof User]
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingImportant.push(field)
        }
      } catch (fieldError) {
        console.warn(`Error checking field ${field}:`, fieldError)
        missingImportant.push(field)
      }
    })

    // Calculate completion percentage
    const totalFields = requiredFields.length + importantFields.length
    const completedFields = totalFields - missingRequired.length - missingImportant.length
    const completionPercentage = Math.round((completedFields / totalFields) * 100)

    // Profile is complete if all required fields are filled
    const isComplete = missingRequired.length === 0

    // Can navigate if profile is complete
    const canNavigate = isComplete

    return {
      isComplete,
      missingFields: [...missingRequired, ...missingImportant],
      completionPercentage,
      canNavigate
    }
  } catch (error) {
    console.error('Error in checkProfileCompletion:', error)
    // Return safe fallback
    return {
      isComplete: false,
      missingFields: ['Error checking profile'],
      completionPercentage: 0,
      canNavigate: false
    }
  }
}

/**
 * Get user-friendly field names for missing fields
 */
export function getFieldDisplayName(field: string): string {
  const fieldNames: Record<string, string> = {
    full_name: 'Full Name',
    profile_slug: 'Profile URL',
    profile_title: 'Profile Title',
    bio: 'Bio',
    avatar_url: 'Profile Picture'
  }

  return fieldNames[field] || field
}

/**
 * Get completion message for the user
 */
export function getCompletionMessage(status: ProfileCompletionStatus): string {
  if (status.isComplete) {
    return 'Profile complete! You can now access all dashboard features.'
  }

  if (status.missingFields.length === 1) {
    const fieldName = getFieldDisplayName(status.missingFields[0])
    return `Please complete your ${fieldName} to continue.`
  }

  const missingFieldNames = status.missingFields
    .slice(0, 3)
    .map(getFieldDisplayName)
    .join(', ')

  if (status.missingFields.length > 3) {
    return `Please complete: ${missingFieldNames} and ${status.missingFields.length - 3} more fields.`
  }

  return `Please complete: ${missingFieldNames}.`
}
