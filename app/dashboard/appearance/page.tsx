'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { LivePreview } from '@/components/dashboard/live-preview'
import { AppearanceCustomizer } from '@/components/dashboard/appearance/appearance-customizer'
import { AppearanceProvider } from '@/contexts/appearance-context'
import { useAuthStore } from '@/stores/auth-store'
import { PremiumAccessService, PremiumAccessStatus } from '@/lib/services/premium-access-service'
import { Button } from '@/components/ui/button'
import { Crown, Palette, Sparkles, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function AppearancePage() {
  const { user } = useAuthStore()
  const [previewRefresh, setPreviewRefresh] = useState(0)
  const [accessStatus, setAccessStatus] = useState<PremiumAccessStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // Check premium access on component mount
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return
      
      try {
        const status = await PremiumAccessService.getPremiumAccessStatus(user.id)
        setAccessStatus(status)
      } catch (error) {
        console.error('Error checking premium access:', error)
        toast.error('Failed to check premium access')
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user])

  // Create preview content
  const previewContent = (
    <LivePreview
      profileData={user || undefined}
      refreshTrigger={previewRefresh}
    />
  )

  // Loading state
  if (loading) {
    return (
      <DashboardLayout showPreview={true} previewContent={previewContent}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="w-[88%] sm:w-[90%] md:w-[94%] lg:w-full max-w-4xl mx-auto dashboard-form-container mobile-safe-area">
            <div className="glassmorphic rounded-[14px] sm:rounded-[16px] md:rounded-[20px] p-3 sm:p-4 md:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center mobile-form-card">
              <div className="animate-pulse">
                <div className="h-5 sm:h-6 md:h-8 bg-[#33373b] rounded mb-2 sm:mb-3 md:mb-4"></div>
                <div className="h-3 sm:h-3 md:h-4 bg-[#33373b] rounded mb-2"></div>
                <div className="h-3 sm:h-3 md:h-4 bg-[#33373b] rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // No access - show premium feature message
  if (!accessStatus?.hasAccess) {
    const message = accessStatus ? PremiumAccessService.getPremiumFeatureMessage(accessStatus) : {
      title: 'Premium Feature',
      description: 'Appearance customization requires premium access.',
      actionText: 'Upgrade to Pro',
      variant: 'no-access' as const
    }

    return (
      <DashboardLayout showPreview={true} previewContent={previewContent}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="w-[88%] sm:w-[90%] md:w-[94%] lg:w-full max-w-4xl mx-auto dashboard-form-container mobile-safe-area">

            {/* Page Header */}
            <div className="mb-3 sm:mb-4 md:mb-8">
              <h1 className="text-[20px] sm:text-[24px] md:text-[32px] font-medium leading-[24px] sm:leading-[30px] md:leading-[40px] tracking-[-0.6px] sm:tracking-[-0.72px] md:tracking-[-0.96px] font-sharp-grotesk gradient-text-primary mb-1 sm:mb-2">
                Appearance
              </h1>
              <p className="text-[12px] sm:text-[14px] font-light leading-[16px] sm:leading-[20px] tracking-[-0.36px] sm:tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
                Customize every aspect of your profile's visual appearance.
              </p>
            </div>

            {/* Premium Feature Card */}
            <div className="glassmorphic rounded-[14px] sm:rounded-[16px] md:rounded-[20px] p-3 sm:p-4 md:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center mobile-form-card">
              <div className="mb-3 sm:mb-4 md:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                  {message.variant === 'trial' ? (
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#18181a]" />
                  ) : message.variant === 'premium' ? (
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#18181a]" />
                  ) : (
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#18181a]" />
                  )}
                </div>
                <h2 className="text-[18px] sm:text-[20px] md:text-[24px] font-medium leading-[22px] sm:leading-[24px] md:leading-[28px] tracking-[-0.54px] sm:tracking-[-0.6px] md:tracking-[-0.72px] font-sharp-grotesk text-white mb-1 sm:mb-2">
                  {message.title}
                </h2>
                <p className="text-[12px] sm:text-[14px] md:text-[16px] font-light leading-[16px] sm:leading-[20px] md:leading-[24px] tracking-[-0.36px] sm:tracking-[-0.42px] md:tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
                  {message.description}
                </p>
              </div>

              {/* Feature Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
                <div className="bg-[#28282b] border border-[#33373b] rounded-[8px] sm:rounded-[12px] p-2 sm:p-3 md:p-4">
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-[#54E0FF] mb-1 sm:mb-2" />
                  <h3 className="text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-0.5 sm:mb-1">
                    Colors & Themes
                  </h3>
                  <p className="text-[10px] sm:text-[12px] text-[#7a7a83] font-sharp-grotesk">
                    Custom color schemes and gradients
                  </p>
                </div>
                <div className="bg-[#28282b] border border-[#33373b] rounded-[8px] sm:rounded-[12px] p-2 sm:p-3 md:p-4">
                  <span className="text-[#54E0FF] text-[16px] sm:text-[20px] font-bold mb-1 sm:mb-2 block">Aa</span>
                  <h3 className="text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-0.5 sm:mb-1">
                    Typography
                  </h3>
                  <p className="text-[10px] sm:text-[12px] text-[#7a7a83] font-sharp-grotesk">
                    Fonts, sizes, and text styling
                  </p>
                </div>
                <div className="bg-[#28282b] border border-[#33373b] rounded-[8px] sm:rounded-[12px] p-2 sm:p-3 md:p-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#54E0FF] rounded mb-1 sm:mb-2"></div>
                  <h3 className="text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-0.5 sm:mb-1">
                    Layout & Cards
                  </h3>
                  <p className="text-[10px] sm:text-[12px] text-[#7a7a83] font-sharp-grotesk">
                    Spacing, borders, and card styles
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => {
                  // TODO: Implement upgrade/trial logic
                  toast.info('Upgrade functionality coming soon!')
                }}
                className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:from-[#29ADFF] hover:to-[#54E0FF] font-medium text-[12px] sm:text-[14px] md:text-[16px] tracking-[-0.36px] sm:tracking-[-0.42px] md:tracking-[-0.48px] font-sharp-grotesk rounded-[8px] sm:rounded-[12px] px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3"
              >
                {message.actionText}
              </Button>

              {/* Trial Status */}
              {accessStatus && (
                <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-[#33373b]">
                  <p className="text-[12px] sm:text-[14px] text-[#7a7a83] font-sharp-grotesk">
                    Status: {PremiumAccessService.formatTrialStatus(accessStatus)}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Has access - show appearance customization interface
  return (
    <AppearanceProvider>
      <DashboardLayout showPreview={true} previewContent={previewContent}>
        <div className="p-4 md:p-6">
          <div className="w-full mx-auto dashboard-form-container mobile-safe-area">

            {/* Page Header */}
            <div className="mb-4 md:mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                <h1 className="text-[20px] md:text-[24px] lg:text-[32px] font-medium leading-[24px] md:leading-[30px] lg:leading-[40px] tracking-[-0.6px] md:tracking-[-0.72px] lg:tracking-[-0.96px] font-sharp-grotesk gradient-text-primary">
                  Appearance
                </h1>
                {accessStatus?.isInTrial && (
                  <div className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] px-2 py-0.5 rounded-full text-[10px] md:text-[12px] font-medium font-sharp-grotesk flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    Trial: {accessStatus.trialDaysRemaining} days
                  </div>
                )}
                {accessStatus?.isPremium && (
                  <div className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] px-2 py-0.5 rounded-full text-[10px] md:text-[12px] font-medium font-sharp-grotesk flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    Pro
                  </div>
                )}
              </div>
              <p className="text-[12px] md:text-[14px] font-light leading-[16px] md:leading-[20px] tracking-[-0.36px] md:tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
                Customize every aspect of your profile's visual appearance with real-time preview.
              </p>
            </div>

            {/* Appearance Customization Interface */}
            <AppearanceCustomizer onPreviewUpdate={() => setPreviewRefresh(prev => prev + 1)} />

          </div>
        </div>
      </DashboardLayout>
    </AppearanceProvider>
  )
}
