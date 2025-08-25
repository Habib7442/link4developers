"use client";

import { ReactNode } from 'react';
import { LoadingSkeleton } from './loading-skeleton';

interface QueryLoadingStatesProps {
  isLoading: boolean;
  isError: boolean;
  error: any;
  children: ReactNode;
  loadingType?: 'page' | 'section' | 'card';
  errorMessage?: string;
  onRetry?: () => void;
}

export function QueryLoadingStates({
  isLoading,
  isError,
  error,
  children,
  loadingType = 'section',
  errorMessage,
  onRetry
}: QueryLoadingStatesProps) {
  if (isLoading) {
    return <LoadingSkeleton type={loadingType} />;
  }

  if (isError) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="glassmorphic rounded-xl p-4 sm:p-8 shadow-lg text-center">
          <p className="text-red-400 mb-4">
            {errorMessage || 'Something went wrong'}
          </p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-4 py-2 bg-[#54E0FF] text-black rounded-lg hover:bg-[#54E0FF]/80 transition-colors"
            >
              Retry
            </button>
          )}
          {!onRetry && (
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#54E0FF] text-black rounded-lg hover:bg-[#54E0FF]/80 transition-colors"
            >
              Refresh Page
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Specialized loading states for different components
export function LinksLoadingState({ isLoading, isError, error, children }: {
  isLoading: boolean;
  isError: boolean;
  error: any;
  children: ReactNode;
}) {
  return (
    <QueryLoadingStates
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingType="section"
      errorMessage="Failed to load links"
      onRetry={() => window.location.reload()}
    >
      {children}
    </QueryLoadingStates>
  );
}

export function AnalyticsLoadingState({ isLoading, isError, error, children }: {
  isLoading: boolean;
  isError: boolean;
  error: any;
  children: ReactNode;
}) {
  return (
    <QueryLoadingStates
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingType="card"
      errorMessage="Failed to load analytics"
    >
      {children}
    </QueryLoadingStates>
  );
}
