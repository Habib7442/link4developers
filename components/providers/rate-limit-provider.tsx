'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { RateLimitAlertDialog } from '@/lib/utils/rate-limit-handler'

interface RateLimitErrorData {
  error: string;
  retryAfter?: number;
  resetTime?: number;
}

const RateLimitContext = createContext<{
  showRateLimitError: (errorData: RateLimitErrorData) => void;
}>({
  showRateLimitError: () => {},
})

export const useRateLimitContext = () => useContext(RateLimitContext)

export function RateLimitErrorProvider({ children }: { children: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [errorData, setErrorData] = useState<RateLimitErrorData | null>(null)

  const showRateLimitError = (data: RateLimitErrorData) => {
    setErrorData(data)
    setIsDialogOpen(true)
  }

  const handleClose = () => {
    setIsDialogOpen(false)
  }

  // Listen for global events to show rate limit errors
  useEffect(() => {
    const handleEvent = (event: Event) => {
      const customEvent = event as CustomEvent<RateLimitErrorData>
      if (customEvent.detail) {
        showRateLimitError(customEvent.detail)
      }
    }

    window.addEventListener('show-rate-limit-error', handleEvent)
    return () => {
      window.removeEventListener('show-rate-limit-error', handleEvent)
    }
  }, [])

  return (
    <RateLimitContext.Provider value={{ showRateLimitError }}>
      {children}
      {errorData && (
        <RateLimitAlertDialog 
          isOpen={isDialogOpen} 
          onClose={handleClose} 
          errorData={errorData} 
        />
      )}
    </RateLimitContext.Provider>
  )
}