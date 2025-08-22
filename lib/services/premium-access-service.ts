import { supabase, User } from '@/lib/supabase'

// ============================================================================
// PREMIUM ACCESS UTILITIES
// ============================================================================

export interface PremiumAccessStatus {
  hasAccess: boolean
  isPremium: boolean
  isInTrial: boolean
  trialDaysRemaining: number
  trialExpired: boolean
  registrationDate: string
}

export interface TrialInfo {
  isInTrial: boolean
  daysRemaining: number
  expired: boolean
  startDate: string
  endDate: string
}

/**
 * Check if user has access to premium features (appearance customization)
 * Users get 30 days free trial from registration date
 */
export class PremiumAccessService {
  
  /**
   * Get comprehensive premium access status for a user
   */
  static async getPremiumAccessStatus(userId: string): Promise<PremiumAccessStatus> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('is_premium, created_at')
        .eq('id', userId)
        .single()

      if (error || !user) {
        console.error('Error fetching user premium status:', error)
        return {
          hasAccess: false,
          isPremium: false,
          isInTrial: false,
          trialDaysRemaining: 0,
          trialExpired: true,
          registrationDate: new Date().toISOString()
        }
      }

      const isPremium = user.is_premium || false
      const registrationDate = user.created_at
      const trialInfo = this.calculateTrialStatus(registrationDate)

      const hasAccess = isPremium || trialInfo.isInTrial

      return {
        hasAccess,
        isPremium,
        isInTrial: trialInfo.isInTrial,
        trialDaysRemaining: trialInfo.daysRemaining,
        trialExpired: trialInfo.expired,
        registrationDate
      }
    } catch (error) {
      console.error('Error in getPremiumAccessStatus:', error)
      return {
        hasAccess: false,
        isPremium: false,
        isInTrial: false,
        trialDaysRemaining: 0,
        trialExpired: true,
        registrationDate: new Date().toISOString()
      }
    }
  }

  /**
   * Simple check if user has access to appearance customization
   */
  static async hasAppearanceAccess(userId: string): Promise<boolean> {
    const status = await this.getPremiumAccessStatus(userId)
    return status.hasAccess
  }

  /**
   * Check if user has access to appearance customization (for auth store)
   */
  static async hasAppearanceAccessForUser(user: User | null): Promise<boolean> {
    if (!user) return false
    return this.hasAppearanceAccess(user.id)
  }

  /**
   * Calculate trial status based on registration date
   */
  static calculateTrialStatus(registrationDate: string): TrialInfo {
    const TRIAL_DAYS = 30
    const now = new Date()
    const regDate = new Date(registrationDate)
    const trialEndDate = new Date(regDate.getTime() + (TRIAL_DAYS * 24 * 60 * 60 * 1000))
    
    const timeDiff = trialEndDate.getTime() - now.getTime()
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / (24 * 60 * 60 * 1000)))
    
    const isInTrial = daysRemaining > 0
    const expired = !isInTrial

    return {
      isInTrial,
      daysRemaining,
      expired,
      startDate: registrationDate,
      endDate: trialEndDate.toISOString()
    }
  }

  /**
   * Get trial information for a user
   */
  static async getTrialInfo(userId: string): Promise<TrialInfo | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .single()

      if (error || !user) {
        console.error('Error fetching user for trial info:', error)
        return null
      }

      return this.calculateTrialStatus(user.created_at)
    } catch (error) {
      console.error('Error in getTrialInfo:', error)
      return null
    }
  }

  /**
   * Check if user is currently in trial period
   */
  static async isUserInTrial(userId: string): Promise<boolean> {
    const trialInfo = await this.getTrialInfo(userId)
    return trialInfo?.isInTrial || false
  }

  /**
   * Get days remaining in trial
   */
  static async getTrialDaysRemaining(userId: string): Promise<number> {
    const trialInfo = await this.getTrialInfo(userId)
    return trialInfo?.daysRemaining || 0
  }

  /**
   * Format trial status for UI display
   */
  static formatTrialStatus(status: PremiumAccessStatus): string {
    if (status.isPremium) {
      return 'Premium Member'
    }
    
    if (status.isInTrial) {
      const days = status.trialDaysRemaining
      if (days === 1) {
        return '1 day remaining in trial'
      }
      return `${days} days remaining in trial`
    }
    
    if (status.trialExpired) {
      return 'Trial expired - Upgrade to Pro'
    }
    
    return 'No access'
  }

  /**
   * Get appropriate message for premium feature access
   */
  static getPremiumFeatureMessage(status: PremiumAccessStatus): {
    title: string
    description: string
    actionText: string
    variant: 'trial' | 'expired' | 'premium' | 'no-access'
  } {
    if (status.isPremium) {
      return {
        title: 'Premium Feature',
        description: 'Customize every aspect of your profile appearance.',
        actionText: 'Customize Appearance',
        variant: 'premium'
      }
    }

    if (status.isInTrial) {
      const days = status.trialDaysRemaining
      return {
        title: 'Free Trial Active',
        description: `You have ${days} day${days !== 1 ? 's' : ''} remaining to try premium features.`,
        actionText: 'Customize Appearance',
        variant: 'trial'
      }
    }

    if (status.trialExpired) {
      return {
        title: 'Trial Expired',
        description: 'Your 30-day free trial has ended. Upgrade to Pro to continue customizing your appearance.',
        actionText: 'Upgrade to Pro',
        variant: 'expired'
      }
    }

    return {
      title: 'Premium Feature',
      description: 'Appearance customization is available with Pro. Start your free 30-day trial.',
      actionText: 'Start Free Trial',
      variant: 'no-access'
    }
  }

  /**
   * Middleware function to check premium access for API routes
   */
  static async requireAppearanceAccess(userId: string): Promise<{
    hasAccess: boolean
    status: PremiumAccessStatus
    error?: string
  }> {
    const status = await this.getPremiumAccessStatus(userId)
    
    if (!status.hasAccess) {
      return {
        hasAccess: false,
        status,
        error: status.trialExpired 
          ? 'Premium subscription required. Your trial has expired.'
          : 'Premium subscription or trial required.'
      }
    }

    return {
      hasAccess: true,
      status
    }
  }

  /**
   * Check if user can access a specific premium feature
   */
  static async canAccessFeature(userId: string, feature: 'appearance' | 'analytics' | 'custom-domain'): Promise<boolean> {
    // For now, all premium features use the same access logic
    // In the future, different features might have different requirements
    switch (feature) {
      case 'appearance':
        return this.hasAppearanceAccess(userId)
      case 'analytics':
      case 'custom-domain':
        // These might require full premium (no trial)
        const status = await this.getPremiumAccessStatus(userId)
        return status.isPremium
      default:
        return false
    }
  }
}
