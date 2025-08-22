# Link4Coders Caching Strategy

This document outlines the comprehensive caching implementation for the Link4Coders project, designed to improve performance and reduce costs while maintaining data freshness.

## Overview

The caching strategy implements all four Next.js caching mechanisms:

1. **Request Memoization** - Deduplicates requests within the same render pass
2. **Data Cache** - Caches external API calls and database queries
3. **Full Route Cache** - Implements ISR for public profile pages
4. **Router Cache** - Optimizes client-side navigation

## Implementation Details

### 1. Data Cache (External APIs)

#### GitHub API Caching
- **Duration**: 24 hours
- **Tags**: `github-repo-{owner}-{repo}`, `github-api`, `rich-preview`
- **Revalidation**: Time-based with on-demand invalidation
- **Location**: `lib/services/github-api-service.ts`

```typescript
const response = await fetch(url, {
  headers,
  next: { 
    revalidate: 24 * 60 * 60, // 24 hours
    tags: [`github-repo-${owner}-${repo}`, 'github-api', 'rich-preview']
  }
})
```

#### Webpage Metadata Caching
- **Duration**: 7 days
- **Tags**: `webpage-{domain}`, `webpage-metadata`, `rich-preview`
- **Revalidation**: Time-based with on-demand invalidation
- **Location**: `lib/services/meta-scraper-service.ts`

```typescript
const response = await fetch(url, {
  headers,
  next: { 
    revalidate: 7 * 24 * 60 * 60, // 7 days
    tags: [`webpage-${domain}`, 'webpage-metadata', 'rich-preview']
  }
})
```

### 2. Full Route Cache (ISR)

#### Public Profile Pages
- **Duration**: 1 hour
- **Strategy**: ISR with `generateStaticParams` for popular profiles
- **Tags**: `profile-{username}`, `public-profiles`
- **Location**: `app/[username]/page.tsx`

```typescript
export const revalidate = 3600 // 1 hour
export const dynamic = 'force-static'
export const dynamicParams = true

export async function generateStaticParams() {
  // Pre-generate popular profiles at build time
  return popularUsernames.map(username => ({ username }))
}
```

### 3. Request Memoization (React cache)

#### Database Queries
- **Functions**: `getUserById`, `getUserByUsername`, `getUserLinks`
- **Scope**: Per-request lifecycle
- **Location**: `lib/services/cached-data-service.ts`

```typescript
export const getUserById = cache(async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  return error ? null : data
})
```

### 4. Persistent Cache (unstable_cache)

#### User Profile Data
- **Duration**: 1 hour
- **Tags**: `profile-{username}`, `public-profiles`
- **Location**: `lib/services/public-profile-service.ts`

```typescript
static getPublicProfile = unstable_cache(
  async (username: string) => {
    // Fetch user and links data
  },
  ['public-profile'],
  {
    revalidate: 3600,
    tags: (username: string) => [`profile-${username}`, 'public-profiles']
  }
)
```

## Cache Invalidation Strategy

### Automatic Invalidation

#### User Profile Updates
- **Triggers**: Profile edits, privacy changes, theme changes
- **Invalidates**: `profile-{username}`, `public-profiles`, `user-stats-{userId}`
- **Path Revalidation**: `/{username}`

#### User Links Updates
- **Triggers**: Link creation, updates, deletion, reordering
- **Invalidates**: `profile-{username}`, `user-stats-{userId}`, `rich-preview`
- **Path Revalidation**: `/{username}`

#### Rich Preview Updates
- **Triggers**: Preview refresh, preview errors
- **Invalidates**: `github-repo-{owner}-{repo}` or `webpage-{domain}`, `rich-preview`

### Manual Invalidation

The `CacheInvalidationService` provides methods for manual cache invalidation:

```typescript
// Invalidate user profile caches
await CacheInvalidationService.invalidateUserProfile(userId, username)

// Invalidate user links caches
await CacheInvalidationService.invalidateUserLinks(userId, username)

// Invalidate rich preview caches
await CacheInvalidationService.invalidateRichPreview(url, type)

// Emergency cache clear
await CacheInvalidationService.invalidateAllCaches()
```

## Router Cache Optimization

### Prefetching Strategy
- **Dashboard Routes**: Always prefetch (`prefetch={true}`)
- **Public Profiles**: Always prefetch (`prefetch={true}`)
- **External Links**: Never prefetch (`prefetch={false}`)

### Optimized Components
- `OptimizedLink` - Smart prefetching based on link type
- `DashboardNavLink` - Always prefetches dashboard routes
- `ProfileLink` - Always prefetches profile pages
- `ExternalLink` - No prefetching for external URLs

## Performance Targets

### Response Time Targets
- **Public Profiles**: < 200ms (cached)
- **Rich Previews**: < 500ms (cached)
- **Dashboard Pages**: < 300ms

### Cache Hit Rate Targets
- **Data Cache**: 80%
- **Route Cache**: 90%
- **Persistent Cache**: 85%

## Configuration

### Environment-Based Settings
- **Development**: 10% of production cache times for faster iteration
- **Production**: Full cache times for optimal performance

### Cache Configuration
All cache settings are centralized in `lib/config/cache-config.ts`:

```typescript
export const CACHE_CONFIG = {
  dataCache: {
    github: { repoData: 24 * 60 * 60 }, // 24 hours
    webpage: { metadata: 7 * 24 * 60 * 60 } // 7 days
  },
  routeCache: {
    publicProfile: { revalidate: 60 * 60 } // 1 hour
  }
  // ... more configuration
}
```

## Testing and Validation

### Cache Testing
The `CacheTestingService` provides comprehensive testing:

```typescript
// Run all cache tests
const results = await CacheTestingService.runAllTests()

// Test specific cache types
const dataCacheResults = await CacheTestingService.testDataCache()
const routeCacheResults = await CacheTestingService.testRouteCache()
const invalidationResults = await CacheTestingService.testCacheInvalidation()
```

### Monitoring
- Cache hit rates are monitored via `getCacheMetrics()`
- Performance metrics are tracked per cache type
- Automatic alerts for cache performance degradation

## Best Practices

### Do's
- ✅ Use appropriate cache tags for selective invalidation
- ✅ Set reasonable cache durations based on data freshness requirements
- ✅ Implement proper error handling for cache misses
- ✅ Test cache invalidation thoroughly
- ✅ Monitor cache performance metrics

### Don'ts
- ❌ Don't cache sensitive user data in public caches
- ❌ Don't set cache times too long for frequently changing data
- ❌ Don't forget to invalidate caches when data changes
- ❌ Don't cache authenticated user data in ISR
- ❌ Don't rely solely on time-based revalidation for critical data

## Troubleshooting

### Common Issues

1. **Stale Data**: Check cache invalidation triggers
2. **Poor Performance**: Verify cache hit rates and response times
3. **Memory Usage**: Monitor cache sizes and implement cleanup
4. **Cache Misses**: Review cache configuration and tags

### Debug Tools

```typescript
// Check cache configuration
import { CACHE_CONFIG } from '@/lib/config/cache-config'

// Run cache tests
import { CacheTestingService } from '@/lib/utils/cache-testing'

// Manual cache invalidation
import { CacheInvalidationService } from '@/lib/services/cache-invalidation-service'
```

## Future Improvements

1. **Edge Caching**: Implement CDN caching for static assets
2. **Database Query Caching**: Add Redis for database query caching
3. **Real-time Updates**: Implement WebSocket-based cache invalidation
4. **Advanced Analytics**: Detailed cache performance analytics
5. **A/B Testing**: Cache strategy optimization through testing
