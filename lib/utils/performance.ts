'use client'

interface PerformanceMetrics {
  navigationStart: number
  pageLoadTime: number
  domContentLoaded: number
  firstContentfulPaint?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    navigationStart: 0,
    pageLoadTime: 0,
    domContentLoaded: 0,
  }

  startNavigation() {
    this.metrics.navigationStart = performance.now()
    
    // Track navigation performance
    if (typeof window !== 'undefined') {
      // Preload critical resources
      this.preloadCriticalResources()
    }
  }

  endNavigation() {
    const navigationTime = performance.now() - this.metrics.navigationStart
    
    // Log performance metrics
    console.log(`🚀 Navigation completed in ${navigationTime.toFixed(2)}ms`)
    
    // Track in analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'navigation_performance', {
        event_category: 'performance',
        event_label: 'dashboard_navigation',
        value: Math.round(navigationTime),
      })
    }
  }

  private preloadCriticalResources() {
    // Preload critical dashboard components
    const criticalRoutes = [
      '/dashboard/profile',
      '/dashboard/links',
      '/dashboard/themes',
      '/dashboard/appearance',
    ]

    criticalRoutes.forEach(route => {
      // Use Next.js router prefetch
      if (typeof window !== 'undefined' && (window as any).__NEXT_ROUTER_BASEPATH) {
        // This will be handled by the router.prefetch in the layout
      }
    })
  }

  trackPageLoad() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.metrics.pageLoadTime = performance.now()
        console.log(`📊 Page fully loaded in ${this.metrics.pageLoadTime.toFixed(2)}ms`)
      })

      document.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoaded = performance.now()
        console.log(`⚡ DOM ready in ${this.metrics.domContentLoaded.toFixed(2)}ms`)
      })
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Performance optimization utilities
export const optimizeImages = () => {
  if (typeof window !== 'undefined') {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src!
          img.classList.remove('lazy')
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  }
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
