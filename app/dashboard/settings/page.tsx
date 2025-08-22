'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-[32px] font-normal leading-[40px] tracking-[-1.92px] font-sharp-grotesk gradient-text-primary mb-2">
              Settings
            </h1>
            <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
              Manage your account settings, privacy, and preferences.
            </p>
          </div>

          {/* Coming Soon */}
          <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center">
            <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-4">
              Settings Panel Coming Soon
            </h2>
            <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
              Configure your account settings, privacy options, and notification preferences.
            </p>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  )
}
