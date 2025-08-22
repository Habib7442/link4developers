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
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-[#33373b] rounded mb-4"></div>
                <div className="h-4 bg-[#33373b] rounded mb-2"></div>
                <div className="h-4 bg-[#33373b] rounded w-3/4 mx-auto"></div>
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
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">

            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-[32px] font-normal leading-[40px] tracking-[-1.92px] font-sharp-grotesk gradient-text-primary mb-2">
                Appearance Customization
              </h1>
              <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
                Customize every aspect of your profile's visual appearance.
              </p>
            </div>

            {/* Premium Feature Card */}
            <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] rounded-full flex items-center justify-center mx-auto mb-4">
                  {message.variant === 'trial' ? (
                    <Sparkles className="w-8 h-8 text-[#18181a]" />
                  ) : message.variant === 'premium' ? (
                    <Crown className="w-8 h-8 text-[#18181a]" />
                  ) : (
                    <Lock className="w-8 h-8 text-[#18181a]" />
                  )}
                </div>
                <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-2">
                  {message.title}
                </h2>
                <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
                  {message.description}
                </p>
              </div>

              {/* Feature Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#28282b] border border-[#33373b] rounded-[12px] p-4">
                  <Palette className="w-6 h-6 text-[#54E0FF] mb-2" />
                  <h3 className="text-[14px] font-medium text-white font-sharp-grotesk mb-1">
                    Colors & Themes
                  </h3>
                  <p className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
                    Custom color schemes and gradients
                  </p>
                </div>
                <div className="bg-[#28282b] border border-[#33373b] rounded-[12px] p-4">
                  <span className="text-[#54E0FF] text-[20px] font-bold mb-2 block">Aa</span>
                  <h3 className="text-[14px] font-medium text-white font-sharp-grotesk mb-1">
                    Typography
                  </h3>
                  <p className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
                    Fonts, sizes, and text styling
                  </p>
                </div>
                <div className="bg-[#28282b] border border-[#33373b] rounded-[12px] p-4">
                  <div className="w-6 h-6 bg-[#54E0FF] rounded mb-2"></div>
                  <h3 className="text-[14px] font-medium text-white font-sharp-grotesk mb-1">
                    Layout & Cards
                  </h3>
                  <p className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
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
                className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:from-[#29ADFF] hover:to-[#54E0FF] font-medium text-[16px] tracking-[-0.48px] font-sharp-grotesk rounded-[12px] px-8 py-3"
              >
                {message.actionText}
              </Button>

              {/* Trial Status */}
              {accessStatus && (
                <div className="mt-6 pt-6 border-t border-[#33373b]">
                  <p className="text-[14px] text-[#7a7a83] font-sharp-grotesk">
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
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">

            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[32px] font-normal leading-[40px] tracking-[-1.92px] font-sharp-grotesk gradient-text-primary">
                  Appearance Customization
                </h1>
                {accessStatus?.isInTrial && (
                  <div className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] px-3 py-1 rounded-full text-[12px] font-medium font-sharp-grotesk flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Trial: {accessStatus.trialDaysRemaining} days left
                  </div>
                )}
                {accessStatus?.isPremium && (
                  <div className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] px-3 py-1 rounded-full text-[12px] font-medium font-sharp-grotesk flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Pro
                  </div>
                )}
              </div>
              <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
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
