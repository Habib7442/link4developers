'use client'

import { useEffect } from 'react'
import { initializeConsoleFilter } from '@/lib/utils/console-filter'

interface ConsoleFilterProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that initializes console error filtering
 * to suppress harmless browser extension errors
 */
export function ConsoleFilterProvider({ children }: ConsoleFilterProviderProps) {
  useEffect(() => {
    // Initialize console filtering on mount
    const cleanup = initializeConsoleFilter()
    
    // Cleanup on unmount
    return cleanup
  }, [])

  return <>{children}</>
}
