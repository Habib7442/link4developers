"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { usePrefetchDashboardData } from '@/lib/hooks/use-dashboard-queries';

export function DashboardDataPrefetcher() {
  const { user } = useAuthStore();
  const { prefetchAll } = usePrefetchDashboardData();

  useEffect(() => {
    if (user?.id) {
      // Prefetch all dashboard data when user is available
      prefetchAll();
    }
  }, [user?.id, prefetchAll]);

  // This component doesn't render anything
  return null;
}
