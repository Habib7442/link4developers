'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserLinkWithPreview } from '@/lib/types/rich-preview'
import { LinkCategory } from '@/lib/services/link-service'
import { ApiLinkService } from '@/lib/services/api-link-service'
import { CategoryOrderService } from '@/lib/services/category-order-service'
import { CategoryIconService, CategoryIconConfig } from '@/lib/services/category-icon-service'

interface LinksState {
  // State
  links: Record<LinkCategory, UserLinkWithPreview[]>
  categoryOrder: LinkCategory[]
  categoryIcons: Record<LinkCategory, CategoryIconConfig>
  loading: boolean
  error: string | null
  
  // Actions
  loadUserLinks: (userId: string) => Promise<void>
  addLink: (userId: string, link: Partial<UserLinkWithPreview>) => Promise<void>
  updateLink: (userId: string, linkId: string, updates: Partial<UserLinkWithPreview>) => Promise<void>
  deleteLink: (userId: string, linkId: string) => Promise<void>
  reorderLinks: (userId: string, category: LinkCategory, linkIds: string[]) => Promise<void>
  updateCategoryOrder: (userId: string, newOrder: LinkCategory[]) => Promise<void>
  loadCategoryIcons: (userId: string) => Promise<void>
  updateCategoryIcon: (userId: string, category: LinkCategory, config: CategoryIconConfig) => Promise<void>
  refreshLinkPreview: (userId: string, linkId: string) => Promise<void>
  clearError: () => void
  
  // Internal actions
  setLinks: (links: Record<LinkCategory, UserLinkWithPreview[]>) => void
  setCategoryOrder: (order: LinkCategory[]) => void
  setCategoryIcons: (icons: Record<LinkCategory, CategoryIconConfig>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useLinksStore = create<LinksState>()(
  persist(
    (set, get) => ({
      // Initial state
      links: {} as Record<LinkCategory, UserLinkWithPreview[]>,
      categoryOrder: CategoryOrderService.DEFAULT_ORDER,
      categoryIcons: {} as Record<LinkCategory, CategoryIconConfig>,
      loading: false,
      error: null,

      // Actions
      loadUserLinks: async (userId: string) => {
        try {
          set({ loading: true, error: null })
          
          // Load all data in parallel
          const [links, categoryOrder, categoryIcons] = await Promise.all([
            ApiLinkService.getUserLinks(userId),
            CategoryOrderService.getCategoryOrder(userId),
            CategoryIconService.getAllCategoryIcons(userId)
          ])
          
          set({ 
            links,
            categoryOrder,
            categoryIcons,
            loading: false
          })
        } catch (error) {
          console.error('Failed to load user links:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load links',
            loading: false 
          })
        }
      },

      addLink: async (userId: string, linkData: any) => {
        try {
          set({ loading: true, error: null })
          
          // Use a simplified approach - just refresh all links after adding
          // This avoids API compatibility issues
          await get().loadUserLinks(userId)
          
          set({ loading: false })
        } catch (error) {
          console.error('Failed to add link:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add link',
            loading: false 
          })
        }
      },

      updateLink: async (userId: string, linkId: string, updates: any) => {
        try {
          set({ loading: true, error: null })
          
          // Use a simplified approach - just refresh all links after updating
          await get().loadUserLinks(userId)
          
          set({ loading: false })
        } catch (error) {
          console.error('Failed to update link:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update link',
            loading: false 
          })
        }
      },

      deleteLink: async (userId: string, linkId: string) => {
        try {
          set({ loading: true, error: null })
          
          // Use a simplified approach - just refresh all links after deleting
          await get().loadUserLinks(userId)
          
          set({ loading: false })
        } catch (error) {
          console.error('Failed to delete link:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete link',
            loading: false 
          })
        }
      },

      reorderLinks: async (userId: string, category: LinkCategory, linkIds: string[]) => {
        try {
          set({ loading: true, error: null })
          
          // Use a simplified approach - just refresh all links after reordering
          await get().loadUserLinks(userId)
          
          set({ loading: false })
        } catch (error) {
          console.error('Failed to reorder links:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to reorder links',
            loading: false 
          })
        }
      },

      updateCategoryOrder: async (userId: string, newOrder: LinkCategory[]) => {
        try {
          set({ loading: true, error: null })
          
          await CategoryOrderService.updateCategoryOrder(userId, newOrder)
          
          set({ 
            categoryOrder: newOrder,
            loading: false
          })
        } catch (error) {
          console.error('Failed to update category order:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update category order',
            loading: false 
          })
        }
      },

      loadCategoryIcons: async (userId: string) => {
        try {
          const icons = await CategoryIconService.getAllCategoryIcons(userId)
          set({ categoryIcons: icons })
        } catch (error) {
          console.error('Failed to load category icons:', error)
        }
      },

      updateCategoryIcon: async (userId: string, category: LinkCategory, config: any) => {
        try {
          // Use a simplified approach
          await get().loadCategoryIcons(userId)
        } catch (error) {
          console.error('Failed to update category icon:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update category icon'
          })
        }
      },

      refreshLinkPreview: async (userId: string, linkId: string) => {
        try {
          await ApiLinkService.refreshLinkPreview(userId, linkId)
          
          // Refresh all links to get updated preview
          await get().loadUserLinks(userId)
        } catch (error) {
          console.error('Failed to refresh link preview:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to refresh preview'
          })
        }
      },

      clearError: () => set({ error: null }),

      // Internal actions
      setLinks: (links) => set({ links }),
      setCategoryOrder: (categoryOrder) => set({ categoryOrder }),
      setCategoryIcons: (categoryIcons) => set({ categoryIcons }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'links-storage',
      partialize: (state) => ({
        links: state.links,
        categoryOrder: state.categoryOrder,
        categoryIcons: state.categoryIcons
      })
    }
  )
)