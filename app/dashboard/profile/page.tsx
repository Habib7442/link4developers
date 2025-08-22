'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ProfileEditor } from '@/components/dashboard/profile-editor'
import { LivePreview } from '@/components/dashboard/live-preview'
import { useAuthStore } from '@/stores/auth-store'

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
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-[32px] font-normal leading-[40px] tracking-[-1.92px] font-sharp-grotesk gradient-text-primary mb-2">
              Profile Editor
            </h1>
            <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
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
