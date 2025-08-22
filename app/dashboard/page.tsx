'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export default function Dashboard() {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    } else if (!loading && user) {
      // Redirect to profile editor as the default dashboard page
      router.push('/dashboard/profile')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181a] flex items-center justify-center">
        <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#54E0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-2">
              Loading Dashboard
            </h2>
            <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
              Please wait while we load your profile...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null // Will redirect
}
