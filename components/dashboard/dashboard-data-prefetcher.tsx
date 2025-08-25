"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { usePrefetchDashboardData } from '@/lib/hooks/use-dashboard-queries';
import { useQueryClient } from '@tanstack/react-query';

export function DashboardDataPrefetcher() {
  const { user, session, refreshAuth } = useAuthStore();
  const { prefetchAll } = usePrefetchDashboardData();
  const queryClient = useQueryClient();

  // Check and refresh auth if needed
  useEffect(() => {
    if (user?.id && !session) {
      console.log('⚠️ User available but no session, refreshing auth...');
      refreshAuth();
    }
  }, [user?.id, session, refreshAuth]);

  useEffect(() => {
    if (user?.id && session) {
      // Immediately prefetch all dashboard data when user and session are available
      console.log('🔄 Initial data prefetch with authenticated session');
      prefetchAll();
      
      // Set up interval to periodically refresh data in the background
      const refreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          console.log('🔄 Background prefetch running...');
          prefetchAll();
        }
      }, 60000); // Refresh every minute
      
      return () => clearInterval(refreshInterval);
    }
  }, [user?.id, session, prefetchAll]);
  
  // Set up visibility change listener to refresh when tab becomes visible
  useEffect(() => {
    if (!user?.id || !session) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Tab became visible, refreshing data...');
        prefetchAll();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, session, prefetchAll]);

  // This component doesn't render anything
  return null;
}
