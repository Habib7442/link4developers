# React Query Caching Strategy for Link4Devs Dashboard

## Overview

We've implemented **TanStack React Query** (formerly React Query) to provide comprehensive caching for all dashboard pages, eliminating loading states and improving user experience.

## Benefits

✅ **Instant Navigation** - No more loading spinners between pages  
✅ **Background Updates** - Data stays fresh automatically  
✅ **Optimistic Updates** - UI responds immediately to user actions  
✅ **Smart Caching** - Intelligent cache invalidation and refetching  
✅ **Error Handling** - Built-in retry logic and error states  
✅ **Prefetching** - Data loads before user needs it  

## Architecture

### 1. Query Provider Setup
```tsx
// components/providers/query-provider.tsx
<QueryProvider>
  <AuthProvider>
    {children}
  </AuthProvider>
</QueryProvider>
```

### 2. Custom Hooks
```tsx
// lib/hooks/use-dashboard-queries.ts
export function useUserLinks(userId: string) {
  return useQuery({
    queryKey: queryKeys.links(userId),
    queryFn: () => ApiLinkService.getUserLinks(userId),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 3. Cache Configuration
- **Links**: 1 minute stale time, 5 minutes garbage collection
- **Analytics**: 5 minutes stale time, 10 minutes garbage collection  
- **Category Order**: 10 minutes stale time, 30 minutes garbage collection
- **Appearance**: 10 minutes stale time, 30 minutes garbage collection
- **Themes**: 1 hour stale time, 24 hours garbage collection

## Usage Examples

### Basic Query
```tsx
const { data: links, isLoading, error } = useUserLinks(userId);

if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorState error={error} />;

return <LinksList links={links} />;
```

### Mutations with Cache Updates
```tsx
const toggleStatusMutation = useToggleLinkStatus();

const handleToggle = async (linkId: string) => {
  await toggleStatusMutation.mutateAsync({ userId, linkId });
  // Cache automatically invalidates and refetches
};
```

### Prefetching for Better UX
```tsx
const { prefetchAll } = usePrefetchDashboardData();

useEffect(() => {
  if (user?.id) {
    prefetchAll(); // Loads all dashboard data in background
  }
}, [user?.id]);
```

## Cache Invalidation Strategy

### Automatic Invalidation
- **Links updated** → Invalidates links, analytics, and profile caches
- **Category order changed** → Invalidates links and analytics caches
- **Appearance updated** → Invalidates profile and appearance caches

### Manual Invalidation
```tsx
const queryClient = useQueryClient();

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: queryKeys.links(userId) });

// Invalidate multiple related queries
queryClient.invalidateQueries({ queryKey: queryKeys.links(userId) });
queryClient.invalidateQueries({ queryKey: queryKeys.analytics(userId) });
```

## Performance Optimizations

### 1. Stale Time vs Garbage Collection
- **Stale Time**: How long data is considered fresh
- **GC Time**: How long inactive data stays in memory
- **Balance**: Keep data fresh but don't waste memory

### 2. Background Refetching
- **Window Focus**: Refetch when user returns to tab
- **Network Reconnect**: Refetch when internet returns
- **Stale Data**: Refetch when data becomes stale

### 3. Prefetching Strategy
```tsx
// Prefetch all dashboard data when user logs in
useEffect(() => {
  if (user?.id) {
    prefetchAll();
  }
}, [user?.id]);
```

## Error Handling

### Retry Logic
```tsx
retry: (failureCount, error) => {
  // Don't retry client errors (4xx)
  if (error?.status >= 400 && error?.status < 500) {
    return false;
  }
  // Retry up to 3 times for other errors
  return failureCount < 3;
}
```

### Error States
```tsx
export function QueryLoadingStates({ isLoading, isError, error, children }) {
  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState error={error} />;
  return <>{children}</>;
}
```

## Development Tools

### React Query DevTools
- **Development Only**: Automatically hidden in production
- **Query Explorer**: View all cached queries and their states
- **Cache Inspector**: Examine cache contents and timing
- **Performance Metrics**: Monitor query performance

## Migration from Manual State

### Before (Manual State)
```tsx
const [links, setLinks] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadLinks();
}, []);

const loadLinks = async () => {
  setLoading(true);
  try {
    const data = await fetchLinks();
    setLinks(data);
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### After (React Query)
```tsx
const { data: links, isLoading, error } = useUserLinks(userId);

// Loading and error states handled automatically
// Data automatically cached and refetched
// No manual state management needed
```

## Best Practices

### 1. Query Keys
- **Consistent Naming**: Use descriptive, hierarchical keys
- **User-Specific**: Include userId in keys for user data
- **Versioning**: Consider adding version numbers for breaking changes

### 2. Stale Time Configuration
- **Frequently Changing**: Short stale time (1-5 minutes)
- **Rarely Changing**: Long stale time (10+ minutes)
- **Static Data**: Very long stale time (1+ hours)

### 3. Cache Invalidation
- **Granular**: Invalidate only affected queries
- **Consistent**: Use the same invalidation pattern everywhere
- **Timely**: Invalidate immediately after mutations

### 4. Error Boundaries
- **Graceful Degradation**: Show fallback UI for errors
- **User Feedback**: Clear error messages and retry options
- **Logging**: Log errors for debugging

## Monitoring and Debugging

### Console Logging
```tsx
// Enable detailed logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Query state:', { isLoading, isError, data });
}
```

### Performance Monitoring
- **Query Duration**: Monitor how long queries take
- **Cache Hit Rate**: Track cache effectiveness
- **Memory Usage**: Watch for memory leaks

## Future Enhancements

### 1. Persistent Cache
- **Local Storage**: Persist cache across browser sessions
- **Service Worker**: Cache API responses offline
- **Background Sync**: Sync data when connection returns

### 2. Advanced Prefetching
- **Route-Based**: Prefetch data for likely next routes
- **User Behavior**: Predict data needs based on usage patterns
- **Priority System**: Prioritize critical data over nice-to-have

### 3. Cache Analytics
- **Hit/Miss Ratios**: Track cache effectiveness
- **User Patterns**: Understand data access patterns
- **Performance Metrics**: Monitor query performance over time

## Conclusion

This React Query implementation provides:
- **Instant page loads** with intelligent caching
- **Automatic data freshness** with background updates
- **Better user experience** with no loading states
- **Easier development** with less state management code
- **Performance optimization** with smart cache strategies

The dashboard now feels like a native app with instant navigation and always-fresh data!
