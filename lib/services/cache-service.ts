import { unstable_cache } from 'next/cache';

export interface CacheConfig {
  revalidate: number;
  tags: string[];
}

export class CacheService {
  // Dashboard page cache configurations
  static readonly DASHBOARD_CACHE_CONFIG: CacheConfig = {
    revalidate: 300, // 5 minutes
    tags: ['dashboard', 'user-data']
  };

  static readonly LINKS_CACHE_CONFIG: CacheConfig = {
    revalidate: 60, // 1 minute
    tags: ['links', 'user-links', 'dashboard']
  };

  static readonly ANALYTICS_CACHE_CONFIG: CacheConfig = {
    revalidate: 300, // 5 minutes
    tags: ['analytics', 'user-stats', 'dashboard']
  };

  static readonly APPEARANCE_CACHE_CONFIG: CacheConfig = {
    revalidate: 600, // 10 minutes
    tags: ['appearance', 'user-settings', 'dashboard']
  };

  static readonly THEMES_CACHE_CONFIG: CacheConfig = {
    revalidate: 3600, // 1 hour
    tags: ['themes', 'templates', 'dashboard']
  };

  static readonly PROFILE_CACHE_CONFIG: CacheConfig = {
    revalidate: 300, // 5 minutes
    tags: ['profile', 'user-profile', 'dashboard']
  };

  // Cache key generators
  static getDashboardKey(userId: string): string {
    return `dashboard-${userId}`;
  }

  static getLinksKey(userId: string): string {
    return `links-${userId}`;
  }

  static getAnalyticsKey(userId: string): string {
    return `analytics-${userId}`;
  }

  static getAppearanceKey(userId: string): string {
    return `appearance-${userId}`;
  }

  static getThemesKey(userId: string): string {
    return `themes-${userId}`;
  }

  static getProfileKey(userId: string): string {
    return `profile-${userId}`;
  }

  // Wrapper for unstable_cache with proper typing
  static async cache<T>(
    key: string,
    fn: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    return unstable_cache(
      fn,
      [key],
      {
        revalidate: config.revalidate,
        tags: config.tags
      }
    )();
  }

  // Cache invalidation helpers
  static async invalidateUserCaches(userId: string): Promise<void> {
    const tags = [
      `dashboard-${userId}`,
      `links-${userId}`,
      `analytics-${userId}`,
      `appearance-${userId}`,
      `profile-${userId}`,
      'dashboard',
      'user-data'
    ];

    // Invalidate all related caches
    for (const tag of tags) {
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag })
        });
      } catch (error) {
        console.warn(`Failed to invalidate cache tag: ${tag}`, error);
      }
    }
  }

  // Prefetch data for better UX
  static async prefetchDashboardData(userId: string): Promise<void> {
    try {
      // Prefetch all dashboard data in parallel
      await Promise.allSettled([
        this.prefetchLinks(userId),
        this.prefetchAnalytics(userId),
        this.prefetchAppearance(userId),
        this.prefetchProfile(userId)
      ]);
    } catch (error) {
      console.warn('Failed to prefetch dashboard data:', error);
    }
  }

  private static async prefetchLinks(userId: string): Promise<void> {
    // This will be implemented in the links service
  }

  private static async prefetchAnalytics(userId: string): Promise<void> {
    // This will be implemented in the analytics service
  }

  private static async prefetchAppearance(userId: string): Promise<void> {
    // This will be implemented in the appearance service
  }

  private static async prefetchProfile(userId: string): Promise<void> {
    // This will be implemented in the profile service
  }
}
