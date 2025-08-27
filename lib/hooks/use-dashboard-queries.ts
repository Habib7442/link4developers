import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { LinkService } from '@/lib/services/link-service'
import { ApiLinkService } from '@/lib/services/api-link-service'
import { CategoryOrderService } from '@/lib/services/category-order-service'
import { AppearanceService } from '@/lib/services/appearance-service'
import { UserService } from '@/lib/services/user-service'
import { TemplateService } from '@/lib/services/template-service'
import { LinkCategory, TemplateId } from '@/lib/domain/entities'
import { toast } from 'sonner'
import { handleApiError, parseRateLimitError } from '@/lib/utils/rate-limit-handler'

// Query Keys - Centralized and type-safe
export const queryKeys = {
  user: (userId: string) => ['user', userId] as const,
  links: (userId: string) => ['links', userId] as const,
  categoryOrder: (userId: string) => ['categoryOrder', userId] as const,
  appearance: (userId: string) => ['appearance', userId] as const,
  profile: (userId: string) => ['profile', userId] as const,
  themes: () => ['themes'] as const,
  userTheme: (userId: string) => ['userTheme', userId] as const,
} as const

// User Links Query
export function useUserLinks(userId: string, isPreview: boolean = false) {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  
  return useQuery({
    queryKey: [...queryKeys.links(userId), isPreview],
    queryFn: async () => {
      try {
        // Make authenticated API request
        const result = await ApiLinkService.getUserLinks(userId, isPreview);
        return result;
      } catch (error) {
        console.error('Error fetching links:', error);
        throw error;
      }
    },
    enabled: !!userId && !!session,
    staleTime: 0, // Always consider data stale to ensure freshness
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// Link Analytics Query
export function useLinkAnalytics(userId: string) {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  
  return useQuery({
    queryKey: ['linkAnalytics', userId],
    queryFn: async () => {
      try {
        return await LinkService.getLinkAnalytics(userId);
      } catch (error) {
        console.error('Error fetching link analytics:', error);
        return {
          totalClicks: 0,
          linksByCategory: {},
          topLinks: []
        };
      }
    },
    enabled: !!userId && !!session,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// User Theme Query
export function useUserTheme(userId: string) {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.userTheme(userId),
    queryFn: async () => {
      try {
        return await TemplateService.getUserTemplate(userId);
      } catch (error) {
        console.error('Error fetching user template:', error);
        throw error;
      }
    },
    enabled: !!userId && !!session,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// Category Order Query
export function useCategoryOrder(userId: string) {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.categoryOrder(userId),
    queryFn: async () => {
      try {
        // Make authenticated API request
        return await CategoryOrderService.getCategoryOrder(userId);
      } catch (error) {
        console.error('Error fetching category order:', error);
        // Fallback to default order in case of error
        return CategoryOrderService.DEFAULT_ORDER;
      }
    },
    enabled: !!userId && !!session,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// User Appearance Query
export function useUserAppearance(userId: string) {
  const queryClient = useQueryClient();
  const { session } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.appearance(userId),
    queryFn: () => AppearanceService.getUserAppearanceSettings(userId),
    enabled: !!userId && !!session,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// User Profile Query
export function useUserProfile(userId: string) {
  const { session } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => UserService.getUserProfile(userId),
    enabled: !!userId && !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// Mutations
export function useUpdateCategoryOrder() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ userId, order }: { userId: string; order: LinkCategory[] }) => {
      return LinkService.updateCategoryOrder(userId, order)
    },
    onSuccess: (data, { userId, order }) => {
      // Update the cache immediately
      queryClient.setQueryData(queryKeys.categoryOrder(userId), order)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.links(userId) })
      
      toast.success('Category order updated successfully')
    },
    onError: (error) => {
      console.error('Failed to update category order:', error)
      toast.error('Failed to update category order')
    },
  })
}

export function useToggleLinkStatus() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ userId, linkId }: { userId: string; linkId: string }) => {
      return ApiLinkService.toggleLinkStatus(userId, linkId)
    },
    onSuccess: (data, { userId }) => {
      // Invalidate links query
      queryClient.invalidateQueries({ queryKey: queryKeys.links(userId) })
      
      toast.success('Link status updated')
    },
    onError: (error) => {
      console.error('Failed to toggle link status:', error)
      
      // Check if this is a rate limit error
      if (error instanceof Error) {
        const rateLimitData = parseRateLimitError(error.message)
        if (rateLimitData) {
          // Show specific rate limit error message
          // This will trigger the event that shows the alert dialog
          const event = new CustomEvent('show-rate-limit-error', { 
            detail: rateLimitData 
          })
          window.dispatchEvent(event)
          return
        }
      }
      
      // Default error message for non-rate-limit errors
      toast.error('Failed to update link status: ' + (error as Error).message)
    },
  })
}

export function useDeleteLink() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ userId, linkId }: { userId: string; linkId: string }) => {
      return ApiLinkService.deleteLink(userId, linkId)
    },
    onSuccess: async (data, { userId }) => {
      // Completely invalidate and refresh the links cache
      await queryClient.invalidateQueries({ queryKey: queryKeys.links(userId) })
      await queryClient.refetchQueries({ queryKey: queryKeys.links(userId), exact: true })
      
      toast.success('Link deleted successfully')
    },
    onError: (error) => {
      console.error('Failed to delete link:', error)
      toast.error('Failed to delete link: ' + (error as Error).message)
    },
  })
}

export function useUpdateAppearance() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ userId, settings }: { userId: string; settings: Record<string, unknown> }) => {
      return AppearanceService.updateAppearanceSettings(userId, settings)
    },
    onSuccess: (data, { userId }) => {
      // Update the cache immediately
      queryClient.setQueryData(queryKeys.appearance(userId), data)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) })
      
      toast.success('Appearance updated successfully')
    },
    onError: (error) => {
      console.error('Failed to update appearance:', error)
      toast.error('Failed to update appearance')
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user, updateProfile: updateAuthProfile } = useAuthStore()

  return useMutation({
    mutationFn: async ({ userId, profileData }: { userId: string; profileData: Record<string, unknown> }) => {
      return UserService.updateProfile(userId, profileData)
    },
    onSuccess: async (updatedUser, { userId, profileData }) => {
      // Update the auth store
      await updateAuthProfile(profileData)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
      
      // Also invalidate other related queries that might be affected
      queryClient.invalidateQueries({ queryKey: queryKeys.links(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.categoryOrder(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.appearance(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.userTheme(userId) })
      
      toast.success('Profile updated successfully')
      return updatedUser
    },
    onError: (error) => {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile. Please try again.')
    },
  })
}

// Prefetching functions for better UX
export function usePrefetchDashboardData() {
  const queryClient = useQueryClient()
  const { user, session } = useAuthStore()

  const prefetchAll = async () => {
    if (!user?.id || !session) {
      console.warn('Cannot prefetch dashboard data: User or session not available');
      return;
    }

    console.log('🔄 Prefetching dashboard data...')
    
    // Prefetch all dashboard data in parallel
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: queryKeys.links(user.id),
        queryFn: () => ApiLinkService.getUserLinks(user.id),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.categoryOrder(user.id),
        queryFn: () => CategoryOrderService.getCategoryOrder(user.id),
        staleTime: 10 * 60 * 1000, // 10 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.appearance(user.id),
        queryFn: () => AppearanceService.getUserAppearanceSettings(user.id),
        staleTime: 10 * 60 * 1000, // 10 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.profile(user.id),
        queryFn: () => UserService.getUserProfile(user.id),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }),
    ])
    
    console.log('✅ Dashboard data prefetched successfully')
  }

  return { prefetchAll }
}

// Update user's theme
export function useUpdateTheme() {
  const queryClient = useQueryClient()
  const { user, refreshAuth } = useAuthStore()

  return useMutation({
    mutationFn: async ({ userId, templateId }: { userId: string; templateId: TemplateId }) => {
      const result = await TemplateService.updateUserTemplate(userId, templateId)
      // Update user data in DB with the new theme
      if (result) {
        await UserService.updateProfile(userId, { theme_id: templateId })
      }
      return result
    },
    onSuccess: async (success, { userId, templateId }) => {
      if (success) {
        // Get the full template configuration
        const templateConfig = TemplateService.getTemplate(templateId);
        
        // Force immediate cache updates for the preview with full template config
        queryClient.setQueryData(
          queryKeys.userTheme(userId),
          templateConfig
        )
        
        // Update the auth store with the new theme
        await refreshAuth()
        
        // Invalidate all related queries to ensure data consistency
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.userTheme(userId) })
        
        // Attempt to trigger a revalidation of the public profile
        try {
          const username = user?.profile_slug || user?.github_username;
          if (username) {
            await fetch(`/api/revalidate?tag=public-profile-${username}`, {
              method: "POST",
            });
            console.log("✅ Cache invalidated for profile:", username);
          }
        } catch (error) {
          console.warn("Warning: Failed to invalidate cache:", error);
        }
        
        toast.success('Theme updated successfully')
      } else {
        throw new Error('Failed to update theme')
      }
    },
    onError: (error) => {
      console.error('Failed to update theme:', error)
      toast.error('Failed to update theme. Please try again.')
    },
  })
}