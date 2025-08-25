"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Time before data is considered stale
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Time before inactive queries are garbage collected
            gcTime: 15 * 60 * 1000, // 15 minutes
            // Retry failed requests
            retry: (failureCount, error: Error) => {
              // Don't retry on 4xx errors (client errors)
              const status = (error as { status?: number })?.status;
              if (status !== undefined && status >= 400 && status < 500) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            // Refetch on window focus (keep data fresh)
            refetchOnWindowFocus: true,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Ensure queries start executing immediately
            refetchOnMount: true,
            
          },
          mutations: {
            // Retry failed mutations
            retry: (failureCount, error: Error) => {
              const status = (error as { status?: number })?.status;
              if (status !== undefined && status >= 400 && status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
