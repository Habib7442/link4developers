import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { ApiLinkService } from '@/lib/services/api-link-service';
import { LinkService, LinkCategory } from '@/lib/services/link-service';
import { CategoryOrderService } from '@/lib/services/category-order-service';
import { AppearanceService } from '@/lib/services/appearance-service';
import { TemplateService } from '@/lib/services/template-service';
import { getUserLinksWithPreview } from '@/lib/services/cached-data-service';
import { UserLinkWithPreview } from '@/lib/types/rich-preview';
import { toast } from 'sonner';

// Query Keys
export const queryKeys = {
  user: (userId: string) => ['user', userId],
  links: (userId: string) => ['links', userId],
  analytics: (userId: string) => ['analytics', userId],
  categoryOrder: (userId: string) => ['categoryOrder', userId],
  appearance: (userId: string) => ['appearance', userId],
  themes: () => ['themes'],
  profile: (userId: string) => ['profile', userId],
};

// Custom hook for user links
export function useUserLinks(userId: string) {
  return useQuery({
    queryKey: queryKeys.links(userId),
    queryFn: async () => {
      const links = await getUserLinksWithPreview(userId);
      // Group links by category
      const groupedLinks = links.reduce((acc, link) => {
        const category = link.category as LinkCategory;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(link);
        return acc;
      }, {} as Record<LinkCategory, UserLinkWithPreview[]>);
      
      // Ensure all categories exist
      const { LINK_CATEGORIES } = await import('@/lib/services/link-service');
      Object.keys(LINK_CATEGORIES).forEach(category => {
        if (!groupedLinks[category as LinkCategory]) {
          groupedLinks[category as LinkCategory] = [];
        }
      });
      
      return groupedLinks;
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Custom hook for link analytics
export function useLinkAnalytics(userId: string) {
  return useQuery({
    queryKey: queryKeys.analytics(userId),
    queryFn: () => LinkService.getLinkAnalytics(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Custom hook for category order
export function useCategoryOrder(userId: string) {
  return useQuery({
    queryKey: queryKeys.categoryOrder(userId),
    queryFn: () => CategoryOrderService.getCategoryOrder(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Custom hook for user appearance settings
export function useUserAppearance(userId: string) {
  return useQuery({
    queryKey: queryKeys.appearance(userId),
    queryFn: () => AppearanceService.getUserAppearanceSettings(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Custom hook for themes
export function useThemes(userId?: string) {
  return useQuery({
    queryKey: queryKeys.themes(),
    queryFn: () => TemplateService.getAvailableTemplates(userId || ''),
    enabled: !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Custom hook for user profile
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => {
      // This would fetch user profile data
      return Promise.resolve({ id: userId, name: 'User' });
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutations
export function useUpdateCategoryOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ userId, order }: { userId: string; order: string[] }) =>
      CategoryOrderService.updateCategoryOrder(userId, order),
    onSuccess: (data, { userId }) => {
      // Update the cache immediately
      queryClient.setQueryData(queryKeys.categoryOrder(userId), order);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.links(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics(userId) });
      
      toast.success('Category order updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update category order:', error);
      toast.error('Failed to update category order');
    },
  });
}

export function useToggleLinkStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ userId, linkId }: { userId: string; linkId: string }) =>
      ApiLinkService.toggleLinkStatus(userId, linkId),
    onSuccess: (data, { userId }) => {
      // Invalidate links and analytics
      queryClient.invalidateQueries({ queryKey: queryKeys.links(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics(userId) });
      
      toast.success('Link status updated');
    },
    onError: (error) => {
      console.error('Failed to toggle link status:', error);
      toast.error('Failed to update link status');
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ userId, linkId }: { userId: string; linkId: string }) =>
      ApiLinkService.deleteLink(userId, linkId),
    onSuccess: (data, { userId }) => {
      // Invalidate links and analytics
      queryClient.invalidateQueries({ queryKey: queryKeys.links(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics(userId) });
      
      toast.success('Link deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete link:', error);
      toast.error('Failed to delete link');
    },
  });
}

export function useUpdateAppearance() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ userId, settings }: { userId: string; settings: any }) =>
      AppearanceService.updateAppearanceSettings(userId, settings),
    onSuccess: (data, { userId }) => {
      // Update the cache immediately
      queryClient.setQueryData(queryKeys.appearance(userId), data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
      
      toast.success('Appearance updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update appearance:', error);
      toast.error('Failed to update appearance');
    },
  });
}

// Profile update mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, updateProfile: updateAuthProfile } = useAuthStore();

  return useMutation({
    mutationFn: async ({ userId, profileData }: { userId: string; profileData: any }) => {
      // Import ProfileService from the correct location
      const { ProfileService } = await import('@/lib/database');
      return ProfileService.updateUserProfile(userId, profileData);
    },
    onSuccess: async (updatedUser, { userId, profileData }) => {
      // Update the auth store
      await updateAuthProfile(profileData);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
      
      toast.success('Profile updated successfully');
      return updatedUser;
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    },
  });
}

// Theme update mutation
export function useUpdateTheme() {
  const queryClient = useQueryClient();
  const { user, updateProfile: updateAuthProfile } = useAuthStore();

  return useMutation({
    mutationFn: async ({ userId, templateId }: { userId: string; templateId: string }) => {
      // Import TemplateService dynamically to avoid circular dependencies
      const { TemplateService } = await import('@/lib/services/template-service');
      const success = await TemplateService.updateUserTemplate(userId, templateId);
      if (!success) {
        throw new Error('Failed to update theme');
      }
      return success;
    },
    onSuccess: async (data, { userId, templateId }) => {
      // Update the auth store
      await updateAuthProfile({ theme_id: templateId });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.appearance(userId) });
      
      toast.success('Theme updated successfully!');
      return data;
    },
    onError: (error) => {
      console.error('Failed to update theme:', error);
      toast.error('Failed to update theme. Please try again.');
    },
  });
}

// Prefetching functions for better UX
export function usePrefetchDashboardData() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const prefetchAll = async () => {
    if (!user?.id) return;

    // Prefetch all dashboard data in parallel
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: queryKeys.links(user.id),
        queryFn: () => getUserLinksWithPreview(user.id),
        staleTime: 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.analytics(user.id),
        queryFn: () => LinkService.getLinkAnalytics(user.id),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.categoryOrder(user.id),
        queryFn: () => CategoryOrderService.getCategoryOrder(user.id),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.appearance(user.id),
        queryFn: () => AppearanceService.getUserAppearance(user.id),
        staleTime: 10 * 60 * 1000,
      }),
    ]);
  };

  return { prefetchAll };
}
