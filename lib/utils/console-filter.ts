'use client'

/**
 * Console error filter to suppress harmless browser extension errors
 * These errors are caused by browser extensions trying to connect to pages
 * and are not related to our application functionality
 */

// List of error patterns to suppress (browser extension related)
const SUPPRESSED_ERROR_PATTERNS = [
  /Could not establish connection\. Receiving end does not exist/,
  /Extension context invalidated/,
  /The message port closed before a response was received/,
  /chrome-extension:/,
  /moz-extension:/,
  /safari-extension:/,
  /injectAIMarker/,
  /EmbeddedPDFTouchPointCoachMark/,
  /content-script-utils/,
  /ShowOneChild/,
  /Extension.*does not exist/,
  /chrome\.runtime\.sendMessage/,
  /browser\.runtime\.sendMessage/
]

// List of storage-related errors to provide better messaging for
const STORAGE_ERROR_PATTERNS = [
  /row-level security policy/,
  /StorageApiError/,
  /Bucket not found/,
  /Storage.*not available/
]

/**
 * Initialize console error filtering
 */
export function initializeConsoleFilter() {
  if (typeof window === 'undefined') return // Only run in browser

  // Store original console methods
  const originalError = console.error
  const originalWarn = console.warn

  // Override console.error to filter out extension errors
  console.error = (...args: any[]) => {
    const message = args.join(' ')
    
    // Check if this is a browser extension error
    const isExtensionError = SUPPRESSED_ERROR_PATTERNS.some(pattern => 
      pattern.test(message)
    )
    
    if (isExtensionError) {
      // Suppress browser extension errors
      return
    }
    
    // Check if this is a storage error and provide better messaging
    const isStorageError = STORAGE_ERROR_PATTERNS.some(pattern => 
      pattern.test(message)
    )
    
    if (isStorageError) {
      // Provide more user-friendly storage error messages
      console.warn('Storage operation failed. This may be due to configuration or permissions.')
      return
    }
    
    // Call original console.error for legitimate errors
    originalError.apply(console, args)
  }

  // Override console.warn to filter out extension warnings
  console.warn = (...args: any[]) => {
    const message = args.join(' ')
    
    // Check if this is a browser extension warning
    const isExtensionWarning = SUPPRESSED_ERROR_PATTERNS.some(pattern => 
      pattern.test(message)
    )
    
    if (isExtensionWarning) {
      // Suppress browser extension warnings
      return
    }
    
    // Call original console.warn for legitimate warnings
    originalWarn.apply(console, args)
  }

  // Return cleanup function
  return () => {
    console.error = originalError
    console.warn = originalWarn
  }
}

/**
 * Check if an error should be suppressed
 */
export function shouldSuppressError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : error.message
  
  return SUPPRESSED_ERROR_PATTERNS.some(pattern => pattern.test(message))
}

/**
 * Log filtered error for debugging (only in development)
 */
export function logFilteredError(error: any, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[FILTERED ERROR${context ? ` - ${context}` : ''}]:`, error)
  }
}
