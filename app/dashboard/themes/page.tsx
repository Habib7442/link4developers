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
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-[32px] font-normal leading-[40px] tracking-[-1.92px] font-sharp-grotesk gradient-text-primary mb-2">
              Themes
            </h1>
            <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
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
