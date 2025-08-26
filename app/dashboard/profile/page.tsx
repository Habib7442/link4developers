'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ProfileEditor } from '@/components/dashboard/profile-editor'
import { LivePreview } from '@/components/dashboard/live-preview'
import { useAuthStore } from '@/stores/auth-store'
import '../mobile-fixes.css'

export default function ProfilePage() {
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
      <div className="p-4 md:p-6">
        <div className="w-full mx-auto dashboard-form-container mobile-safe-area">

          {/* Page Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-[20px] md:text-[24px] lg:text-[32px] font-medium leading-[24px] md:leading-[30px] lg:leading-[40px] tracking-[-0.6px] md:tracking-[-0.72px] lg:tracking-[-0.96px] font-sharp-grotesk gradient-text-primary mb-1 md:mb-2">
              Profile Editor
            </h1>
            <p className="text-[12px] md:text-[14px] font-light leading-[16px] md:leading-[20px] tracking-[-0.36px] md:tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
              Customize your developer profile and make it stand out to recruiters and fellow developers.
            </p>
          </div>

          {/* Profile Editor Component */}
          <ProfileEditor />

        </div>
      </div>
    </DashboardLayout>
  )
}
