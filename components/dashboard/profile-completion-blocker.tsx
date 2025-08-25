'use client'

import { useAuthStore } from '@/stores/auth-store'
import { checkProfileCompletion, getCompletionMessage, getFieldDisplayName } from '@/lib/utils/profile-completion'
import { User, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ProfileCompletionBlockerProps {
  children: React.ReactNode
  currentPath: string
}

export function ProfileCompletionBlocker({ children, currentPath }: ProfileCompletionBlockerProps) {
  const { user } = useAuthStore()
  const router = useRouter()
  
  // Add error boundary to prevent crashes
  try {
    const profileStatus = checkProfileCompletion(user)
  
  // If profile is complete, render children normally
  if (profileStatus.canNavigate) {
    return <>{children}</>
  }

  // If we're already on the profile page, don't block
  if (currentPath === '/dashboard/profile') {
    return <>{children}</>
  }

  // Block access and show completion requirement
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center p-4">
      <div className="glassmorphic rounded-2xl p-8 max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-[#54E0FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-[#54E0FF]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Complete Your Profile First
        </h1>

        {/* Message */}
        <p className="text-[#7a7a83] text-lg mb-6">
          {getCompletionMessage(profileStatus)}
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-[#7a7a83] mb-2">
            <span>Profile Completion</span>
            <span>{profileStatus.completionPercentage}%</span>
          </div>
          <div className="w-full bg-[#28282b] rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-[#54E0FF] to-[#54E0FF]/80 h-3 rounded-full transition-all duration-500"
              style={{ width: `${profileStatus.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Missing Fields */}
        {profileStatus.missingFields.length > 0 && (
          <div className="mb-8 text-left">
            <h3 className="text-white font-medium mb-3">Required Fields:</h3>
            <div className="space-y-2">
              {profileStatus.missingFields.map((field) => (
                <div key={field} className="flex items-center gap-3 text-[#7a7a83]">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span>{getFieldDisplayName(field)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/dashboard/profile')}
            className="bg-[#54E0FF] text-black hover:bg-[#54E0FF]/80 px-8 py-3 text-lg font-medium"
          >
            <User className="w-5 h-5 mr-2" />
            Complete Profile
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF]/50 px-8 py-3 text-lg"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Tip */}
        <div className="mt-8 p-4 bg-[#54E0FF]/5 rounded-lg border border-[#54E0FF]/20">
          <p className="text-[#54E0FF] text-sm">
            💡 <strong>Tip:</strong> A complete profile helps visitors understand who you are and what you do. 
            It also enables features like link management and analytics.
          </p>
        </div>
      </div>
    </div>
  )
  } catch (error) {
    console.error('Error in ProfileCompletionBlocker:', error)
    // Fallback: render children without blocking
    return <>{children}</>
  }
}
