import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { LinkCategory } from '@/lib/domain/entities'

interface DashboardState {
  // UI State
  activeTab: string
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  
  // Data State
  selectedCategory: LinkCategory | null
  searchQuery: string
  filterActive: boolean
  
  // Actions
  setActiveTab: (tab: string) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSelectedCategory: (category: LinkCategory | null) => void
  setSearchQuery: (query: string) => void
  setFilterActive: (active: boolean) => void
  resetDashboard: () => void
}

const initialState = {
  activeTab: 'links',
  sidebarCollapsed: false,
  theme: 'system' as const,
  selectedCategory: null,
  searchQuery: '',
  filterActive: false,
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setActiveTab: (tab: string) => set({ activeTab: tab }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
      
      setSelectedCategory: (category: LinkCategory | null) => set({ 
        selectedCategory: category 
      }),
      
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      
      setFilterActive: (active: boolean) => set({ filterActive: active }),
      
      resetDashboard: () => set(initialState),
    }),
    {
      name: 'dashboard-store',
    }
  )
)

