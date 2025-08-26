'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="w-full mx-auto dashboard-form-container mobile-safe-area">
          
          {/* Page Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-[20px] md:text-[24px] lg:text-[32px] font-medium leading-[24px] md:leading-[30px] lg:leading-[40px] tracking-[-0.6px] md:tracking-[-0.72px] lg:tracking-[-0.96px] font-sharp-grotesk gradient-text-primary mb-1 md:mb-2">
              Analytics
            </h1>
            <p className="text-[12px] md:text-[14px] font-light leading-[16px] md:leading-[20px] tracking-[-0.36px] md:tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
              Track your profile views, link clicks, and engagement metrics.
            </p>
          </div>

          {/* Coming Soon */}
          <div className="glassmorphic rounded-[14px] md:rounded-[20px] p-4 md:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center mobile-form-card">
            <h2 className="text-[18px] md:text-[24px] font-medium leading-[22px] md:leading-[28px] tracking-[-0.54px] md:tracking-[-0.72px] font-sharp-grotesk text-white mb-3 md:mb-4">
              Analytics Dashboard Coming Soon
            </h2>
            <p className="text-[12px] md:text-[16px] font-light leading-[16px] md:leading-[24px] tracking-[-0.36px] md:tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
              Get insights into your profile performance with detailed analytics and visitor statistics.
            </p>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  )
}
