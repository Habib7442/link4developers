'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserAppearanceSettings } from '@/lib/supabase'
import { AppearanceService } from '@/lib/services/appearance-service'

interface AppearanceState {
  // State
  settings: UserAppearanceSettings | null
  loading: boolean
  error: string | null
  hasUnsavedChanges: boolean
  previewSettings: UserAppearanceSettings | null
  
  // Actions
  loadSettings: (userId: string) => Promise<void>
  updateSettings: (userId: string, settings: Partial<UserAppearanceSettings>) => Promise<void>
  updatePreview: (settings: Partial<UserAppearanceSettings>) => void
  resetToDefaults: (userId: string) => Promise<void>
  saveSettings: (userId: string) => Promise<void>
  clearError: () => void
  
  // Internal actions
  setSettings: (settings: UserAppearanceSettings | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
}

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: null,
      loading: false,
      error: null,
      hasUnsavedChanges: false,
      previewSettings: null,

      // Actions
      loadSettings: async (userId: string) => {
        try {
          set({ loading: true, error: null })
          
          const settings = await AppearanceService.getUserAppearanceSettings(userId)
          
          set({ 
            settings,
            previewSettings: settings,
            loading: false,
            hasUnsavedChanges: false
          })
        } catch (error) {
          console.error('Failed to load appearance settings:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load settings',
            loading: false 
          })
        }
      },

      updateSettings: async (userId: string, updates: Partial<UserAppearanceSettings>) => {
        try {
          set({ loading: true, error: null })
          
          const updatedSettings = await AppearanceService.updateAppearanceSettings(userId, updates)
          
          set({ 
            settings: updatedSettings,
            previewSettings: updatedSettings,
            loading: false,
            hasUnsavedChanges: false
          })
        } catch (error) {
          console.error('Failed to update appearance settings:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update settings',
            loading: false 
          })
        }
      },

      updatePreview: (updates: Partial<UserAppearanceSettings>) => {
        const { settings } = get()
        if (!settings) return

        const newPreviewSettings = { ...settings, ...updates }
        set({ 
          previewSettings: newPreviewSettings,
          hasUnsavedChanges: true
        })
      },

      resetToDefaults: async (userId: string) => {
        try {
          set({ loading: true, error: null })
          
          await AppearanceService.resetToDefaults(userId)
          
          // Reload settings after reset
          const settings = await AppearanceService.getUserAppearanceSettings(userId)
          
          set({ 
            settings,
            previewSettings: settings,
            loading: false,
            hasUnsavedChanges: false
          })
        } catch (error) {
          console.error('Failed to reset to defaults:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to reset settings',
            loading: false 
          })
        }
      },

      saveSettings: async (userId: string) => {
        try {
          const { previewSettings } = get()
          if (!previewSettings) return

          set({ loading: true, error: null })
          
          const updatedSettings = await AppearanceService.updateAppearanceSettings(userId, previewSettings)
          
          set({ 
            settings: updatedSettings,
            previewSettings: updatedSettings,
            loading: false,
            hasUnsavedChanges: false
          })
        } catch (error) {
          console.error('Failed to save appearance settings:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to save settings',
            loading: false 
          })
        }
      },

      clearError: () => set({ error: null }),

      // Internal actions
      setSettings: (settings) => set({ settings, previewSettings: settings }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges })
    }),
    {
      name: 'appearance-storage',
      partialize: (state) => ({
        settings: state.settings,
        previewSettings: state.previewSettings
      })
    }
  )
)