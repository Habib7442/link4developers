'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default function PreviewPage() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="w-full mx-auto">
          
          {/* Page Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-[24px] md:text-[32px] font-normal leading-[30px] md:leading-[40px] tracking-[-0.72px] md:tracking-[-0.96px] font-sharp-grotesk gradient-text-primary mb-1 md:mb-2">
              Profile Preview
            </h1>
            <p className="text-[14px] md:text-[16px] font-light leading-[20px] md:leading-[24px] tracking-[-0.42px] md:tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
              See how your profile looks to visitors in real-time.
            </p>
          </div>

          {/* Coming Soon */}
          <div className="glassmorphic rounded-[14px] md:rounded-[20px] p-4 md:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center">
            <h2 className="text-[18px] md:text-[24px] font-medium leading-[22px] md:leading-[28px] tracking-[-0.54px] md:tracking-[-0.72px] font-sharp-grotesk text-white mb-3 md:mb-4">
              Live Preview Coming Soon
            </h2>
            <p className="text-[14px] md:text-[16px] font-light leading-[20px] md:leading-[24px] tracking-[-0.42px] md:tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
              Preview your profile exactly as visitors will see it, with real-time updates as you make changes.
            </p>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  )
}
