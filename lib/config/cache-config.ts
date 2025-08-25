// Cache Configuration for Link4Coders
// Centralized configuration for all caching strategies

export const CACHE_CONFIG = {
  // Data Cache (fetch with next.revalidate)
  dataCache: {
    // GitHub API caching
    github: {
      repoData: 24 * 60 * 60, // 24 hours in seconds
      rateLimit: 5 * 60, // 5 minutes in seconds
      tags: ['github-api', 'rich-preview']
    },
    
    // Webpage metadata caching
    webpage: {
      metadata: 7 * 24 * 60 * 60, // 7 days in seconds
      tags: ['webpage-metadata', 'rich-preview']
    },
    
    // User profile data
    profile: {
      publicProfile: 60 * 60, // 1 hour in seconds
      userStats: 30 * 60, // 30 minutes in seconds
      tags: ['public-profiles', 'user-stats']
    }
  },

  // Full Route Cache (ISR)
  routeCache: {
    // Public profile pages
    publicProfile: {
      revalidate: 60 * 60, // 1 hour in seconds
      dynamic: 'force-static' as const,
      dynamicParams: true,
      tags: ['public-profiles']
    },
    
    // Dashboard pages
    dashboard: {
      revalidate: false, // No ISR for authenticated pages
      dynamic: 'force-dynamic' as const
    },
    
    // Static pages
    static: {
      revalidate: 24 * 60 * 60, // 24 hours in seconds
      dynamic: 'force-static' as const
    }
  },

  // Persistent Cache (unstable_cache)
  persistentCache: {
    // Popular profiles
    popularProfiles: {
      revalidate: 60 * 60, // 1 hour in seconds
      tags: ['popular-profiles', 'public-profiles']
    },
    
    // Template statistics
    templateStats: {
      revalidate: 2 * 60 * 60, // 2 hours in seconds
      tags: ['template-stats', 'analytics']
    },
    
    // User statistics
    userStats: {
      revalidate: 30 * 60, // 30 minutes in seconds
      tags: ['user-stats']
    },
    
    // Template configurations
    templateConfig: {
      revalidate: 24 * 60 * 60, // 24 hours in seconds
      tags: ['template-config']
    }
  },

  // Router Cache (client-side)
  routerCache: {
    // Prefetch settings
    prefetch: {
      dashboard: true,
      publicProfiles: true,
      external: false
    },
    
    // Stale times (experimental)
    staleTimes: {
      static: 5 * 60, // 5 minutes
      dynamic: 0 // No stale time for dynamic content
    }
  },

  // Cache tags for invalidation
  tags: {
    // User-related tags
    user: {
      profile: (username: string) => `public-profile-${username}`,
      stats: (userId: string) => `user-stats-${userId}`,
      links: (userId: string) => `user-links-${userId}`
    },
    
    // Rich preview tags
    richPreview: {
      github: (owner: string, repo: string) => `github-repo-${owner}-${repo}`,
      webpage: (domain: string) => `webpage-${domain}`,
      general: 'rich-preview'
    },
    
    // Global tags
    global: {
      publicProfiles: 'public-profiles',
      popularProfiles: 'popular-profiles',
      userStats: 'user-stats',
      templateStats: 'template-stats',
      analytics: 'analytics',
      githubApi: 'github-api',
      webpageMetadata: 'webpage-metadata'
    }
  },

  // Cache invalidation strategies
  invalidation: {
    // When to invalidate user profile caches
    userProfile: {
      triggers: ['profile_update', 'privacy_change', 'theme_change'],
      cascades: ['public-profiles', 'popular-profiles']
    },
    
    // When to invalidate user links caches
    userLinks: {
      triggers: ['link_create', 'link_update', 'link_delete', 'link_reorder'],
      cascades: ['user-stats']
    },
    
    // When to invalidate rich preview caches
    richPreview: {
      triggers: ['preview_refresh', 'preview_error'],
      cascades: []
    },
    
    // When to invalidate analytics caches
    analytics: {
      triggers: ['user_signup', 'template_change', 'link_click'],
      cascades: ['template-stats']
    }
  },

  // Performance thresholds
  performance: {
    // Maximum cache sizes (in MB)
    maxCacheSize: {
      dataCache: 100,
      routeCache: 200,
      persistentCache: 50
    },
    
    // Cache hit rate targets
    targetHitRates: {
      dataCache: 0.8, // 80%
      routeCache: 0.9, // 90%
      persistentCache: 0.85 // 85%
    },
    
    // Response time targets (in ms)
    responseTimeTargets: {
      publicProfile: 200,
      richPreview: 500,
      dashboard: 300
    }
  },

  // Development vs Production settings
  environment: {
    development: {
      // Shorter cache times for development
      multiplier: 0.1, // 10% of production cache times
      enableLogging: true,
      enableMetrics: true
    },
    
    production: {
      multiplier: 1.0, // Full cache times
      enableLogging: false,
      enableMetrics: true
    }
  }
} as const

// Helper functions for cache configuration
export function getCacheRevalidateTime(
  category: keyof typeof CACHE_CONFIG.dataCache,
  key: string,
  environment: 'development' | 'production' = 'production'
): number {
  const config = CACHE_CONFIG.dataCache[category]
  if (!config || !(key in config)) {
    return 60 * 60 // Default to 1 hour
  }
  
  const baseTime = config[key as keyof typeof config] as number
  const multiplier = CACHE_CONFIG.environment[environment].multiplier
  
  return Math.max(60, Math.floor(baseTime * multiplier)) // Minimum 1 minute
}

export function getCacheTags(
  category: keyof typeof CACHE_CONFIG.tags,
  ...params: string[]
): string[] {
  const tagConfig = CACHE_CONFIG.tags[category]
  
  if (typeof tagConfig === 'string') {
    return [tagConfig]
  }
  
  if (typeof tagConfig === 'object') {
    const tags: string[] = []
    
    Object.entries(tagConfig).forEach(([key, value]) => {
      if (typeof value === 'function') {
        if (params.length > 0) {
          tags.push(value(...params))
        }
      } else if (typeof value === 'string') {
        tags.push(value)
      }
    })
    
    return tags
  }
  
  return []
}

export function shouldEnableCache(environment: string = process.env.NODE_ENV || 'development'): boolean {
  // Always enable caching in production
  if (environment === 'production') {
    return true
  }
  
  // In development, check if caching is explicitly enabled
  return process.env.ENABLE_CACHE === 'true'
}

export function getCacheMetrics() {
  // This would integrate with your monitoring system
  // For now, return a placeholder
  return {
    hitRate: 0,
    missRate: 0,
    size: 0,
    lastUpdated: new Date().toISOString()
  }
}
