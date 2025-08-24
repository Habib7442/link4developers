'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ThemeSelector } from '@/components/dashboard/theme-selector'
import { LivePreview } from '@/components/dashboard/live-preview'
import { useAuthStore } from '@/stores/auth-store'

export default function ThemesPage() {
  const { user } = useAuthStore()
  const [previewRefresh, setPreviewRefresh] = useState(0)

  // Create preview content
  const previewContent = (
    <LivePreview
      profileData={user || undefined}
      refreshTrigger={previewRefresh}
    />
  )

  return (
    <DashboardLayout showPreview={true} previewContent={previewContent}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="w-[88%] sm:w-[90%] md:w-[94%] lg:w-full max-w-4xl mx-auto dashboard-form-container mobile-safe-area">

          {/* Page Header */}
          <div className="mb-3 sm:mb-4 md:mb-8">
            <h1 className="text-[20px] sm:text-[24px] md:text-[32px] font-medium leading-[24px] sm:leading-[30px] md:leading-[40px] tracking-[-0.6px] sm:tracking-[-0.72px] md:tracking-[-0.96px] font-sharp-grotesk gradient-text-primary mb-1 sm:mb-2">
              Themes
            </h1>
            <p className="text-[12px] sm:text-[14px] font-light leading-[16px] sm:leading-[20px] tracking-[-0.36px] sm:tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
              Customize the look and feel of your developer profile with our beautiful templates.
            </p>
          </div>

          {/* Theme Selector Component */}
          <ThemeSelector onThemeChange={() => setPreviewRefresh(prev => prev + 1)} />

        </div>
      </div>
    </DashboardLayout>
  )
}
