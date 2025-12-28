/**
 * useSettings Hook
 * Business logic for settings and preferences
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPCClient } from '@/utils/trpc';
import { APP_VERSION, APP_NAME } from '@/lib/constants';

export function useSettings() {
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();

  // Fetch user preferences
  const {
    data: preferencesData,
    isLoading: preferencesLoading,
  } = useQuery({
    queryKey: ['storage', 'getPreferences'],
    queryFn: () => trpcClient.storage.getPreferences.query({}),
  });

  // Fetch user context
  const {
    data: contextData,
    isLoading: contextLoading,
  } = useQuery({
    queryKey: ['context', 'getCurrentContext'],
    queryFn: () => trpcClient.context.getCurrentContext.query({}),
  });

  // Fetch analytics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useQuery({
    queryKey: ['storage', 'getAnalytics'],
    queryFn: () => trpcClient.storage.getAnalytics.query({ limit: 10 }),
  });

  // Clear user data mutation
  const clearDataMutation = useMutation({
    mutationFn: () => trpcClient.storage.clearUserData.mutate({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage', 'getPreferences'] });
    },
  });

  // Handlers
  const handleClearCache = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all cached data?')) {
      clearDataMutation.mutate();
    }
  }, [clearDataMutation]);

  return {
    // App info
    appInfo: {
      name: APP_NAME,
      version: APP_VERSION,
    },

    // User preferences
    preferences: preferencesData?.preferences,
    isLoadingPreferences: preferencesLoading,

    // User context
    context: contextData,
    isLoadingContext: contextLoading,

    // Analytics
    analytics: analyticsData?.entries || [],
    analyticsCount: analyticsData?.count || 0,
    isLoadingAnalytics: analyticsLoading,

    // Actions
    onClearCache: handleClearCache,
    isClearingCache: clearDataMutation.isPending,

    // Server status
    isConnected: !preferencesLoading && !contextLoading,
  };
}
