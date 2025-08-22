'use client'

import { Button } from '@/components/ui/button'
import { PremiumAccessStatus } from '@/lib/services/premium-access-service'
import { Crown, Sparkles, Lock, Zap, Star } from 'lucide-react'

interface PremiumFeatureBannerProps {
  accessStatus: PremiumAccessStatus
  featureName: string
  description: string
  onUpgradeClick?: () => void
  className?: string
}

export function PremiumFeatureBanner({ 
  accessStatus, 
  featureName, 
  description, 
  onUpgradeClick,
  className = ""
}: PremiumFeatureBannerProps) {
  
  // Don't show banner if user has access
  if (accessStatus.hasAccess) {
    return null
  }

  const getIcon = () => {
    if (accessStatus.trialExpired) {
      return <Lock className="w-6 h-6 text-[#18181a]" />
    }
    return <Crown className="w-6 h-6 text-[#18181a]" />
  }

  const getTitle = () => {
    if (accessStatus.trialExpired) {
      return 'Premium Feature - Trial Expired'
    }
    return `Premium Feature - ${featureName}`
  }

  const getMessage = () => {
    if (accessStatus.trialExpired) {
      return 'Your 30-day free trial has ended. Upgrade to Pro to continue using premium features.'
    }
    return description
  }

  const getActionText = () => {
    if (accessStatus.trialExpired) {
      return 'Upgrade to Pro'
    }
    return 'Start Free Trial'
  }

  return (
    <div className={`glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] border border-[#54E0FF]/20 ${className}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] rounded-full flex items-center justify-center flex-shrink-0">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[18px] font-medium text-white font-sharp-grotesk mb-2">
            {getTitle()}
          </h3>
          <p className="text-[14px] text-[#7a7a83] font-sharp-grotesk mb-4 leading-relaxed">
            {getMessage()}
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2 text-[12px] text-[#7a7a83] font-sharp-grotesk">
              <Star className="w-3 h-3 text-[#54E0FF]" />
              <span>Advanced customization</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#7a7a83] font-sharp-grotesk">
              <Star className="w-3 h-3 text-[#54E0FF]" />
              <span>Real-time preview</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#7a7a83] font-sharp-grotesk">
              <Star className="w-3 h-3 text-[#54E0FF]" />
              <span>Custom CSS support</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-[#7a7a83] font-sharp-grotesk">
              <Star className="w-3 h-3 text-[#54E0FF]" />
              <span>Priority support</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={onUpgradeClick}
            className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:from-[#29ADFF] hover:to-[#54E0FF] font-medium text-[14px] tracking-[-0.42px] font-sharp-grotesk rounded-[8px] px-6 py-2"
          >
            <Zap className="w-4 h-4 mr-2" />
            {getActionText()}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface TrialStatusBadgeProps {
  accessStatus: PremiumAccessStatus
  className?: string
}

export function TrialStatusBadge({ accessStatus, className = "" }: TrialStatusBadgeProps) {
  if (accessStatus.isPremium) {
    return (
      <div className={`bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] px-3 py-1 rounded-full text-[12px] font-medium font-sharp-grotesk flex items-center gap-1 ${className}`}>
        <Crown className="w-3 h-3" />
        Pro Member
      </div>
    )
  }

  if (accessStatus.isInTrial) {
    const days = accessStatus.trialDaysRemaining
    const isUrgent = days <= 3
    
    return (
      <div className={`${isUrgent ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-[#54E0FF] to-[#29ADFF]'} text-[#18181a] px-3 py-1 rounded-full text-[12px] font-medium font-sharp-grotesk flex items-center gap-1 ${className}`}>
        <Sparkles className="w-3 h-3" />
        Trial: {days} day{days !== 1 ? 's' : ''} left
      </div>
    )
  }

  if (accessStatus.trialExpired) {
    return (
      <div className={`bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-1 rounded-full text-[12px] font-medium font-sharp-grotesk flex items-center gap-1 ${className}`}>
        <Lock className="w-3 h-3" />
        Trial Expired
      </div>
    )
  }

  return null
}

interface PremiumFeatureTooltipProps {
  children: React.ReactNode
  featureName: string
  accessStatus: PremiumAccessStatus
}

export function PremiumFeatureTooltip({ children, featureName, accessStatus }: PremiumFeatureTooltipProps) {
  if (accessStatus.hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#28282b] border border-[#33373b] rounded-lg text-[12px] text-white font-sharp-grotesk opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        <div className="flex items-center gap-2">
          <Crown className="w-3 h-3 text-[#54E0FF]" />
          <span>{featureName} requires Pro</span>
        </div>
        
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#28282b]"></div>
      </div>
    </div>
  )
}
