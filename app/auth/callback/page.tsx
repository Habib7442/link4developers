'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_error')
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard or home
          router.push('/')
        } else {
          // No session, redirect to home
          router.push('/')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/?error=auth_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-[#18181a] flex items-center justify-center">
      <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#54E0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-2">
            Completing Sign In
          </h2>
          <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
            Please wait while we finish setting up your account...
          </p>
        </div>
      </div>
    </div>
  )
}
