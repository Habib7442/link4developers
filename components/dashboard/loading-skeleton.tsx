'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSkeletonProps {
  type?: 'page' | 'card' | 'list' | 'form'
  className?: string
}

export function LoadingSkeleton({ type = 'page', className = '' }: LoadingSkeletonProps) {
  if (type === 'page') {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 border-2 border-[#54E0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4 text-[#54E0FF]" />
          <h2 className="text-[18px] font-medium text-white mb-2">Loading...</h2>
          <p className="text-[14px] text-[#7a7a83]">Please wait while we load the page</p>
        </div>
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className={`bg-[#28282b] border border-[#33373b] rounded-[16px] p-4 animate-pulse ${className}`}>
        <div className="space-y-3">
          <div className="h-4 bg-[#33373b] rounded w-3/4"></div>
          <div className="h-3 bg-[#33373b] rounded w-1/2"></div>
          <div className="h-3 bg-[#33373b] rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#28282b] border border-[#33373b] rounded-[12px] p-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#33373b] rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#33373b] rounded w-1/3"></div>
                <div className="h-2 bg-[#33373b] rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'form') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="space-y-2">
          <div className="h-4 bg-[#33373b] rounded w-1/4"></div>
          <div className="h-10 bg-[#28282b] border border-[#33373b] rounded-[8px]"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-[#33373b] rounded w-1/3"></div>
          <div className="h-20 bg-[#28282b] border border-[#33373b] rounded-[8px]"></div>
        </div>
        <div className="h-10 bg-[#54E0FF] rounded-[8px] w-1/4"></div>
      </div>
    )
  }

  return null
}
