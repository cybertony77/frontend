import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for shorter time for real-time updates
      staleTime: 30 * 1000, // 30 seconds
      // Cache data for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for immediate updates
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Background refetch when stale
      refetchOnMount: true,
      // Enable background refetching for real-time updates
      refetchInterval: 10 * 1000, // Refetch every 10 seconds
      refetchIntervalInBackground: true, // Continue refetching when tab is not active
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Retry with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
  },
});

