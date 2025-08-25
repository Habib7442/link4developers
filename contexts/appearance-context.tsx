'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { UserAppearanceSettings } from '@/lib/supabase'
import { AppearanceService } from '@/lib/services/appearance-service'
import { useAuthStore } from '@/stores/auth-store'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface AppearanceContextType {
  settings: UserAppearanceSettings | null
  loading: boolean
  error: string | null
  updateSettings: (updates: Partial<UserAppearanceSettings>) => void
  saveSettings: () => Promise<boolean>
  resetSettings: () => Promise<boolean>
  refreshSettings: () => Promise<void>  // Add refresh method
  hasUnsavedChanges: boolean
  previewSettings: UserAppearanceSettings | null // For real-time preview
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined)

interface AppearanceProviderProps {
  children: ReactNode
}

export function AppearanceProvider({ children }: AppearanceProviderProps) {
  const { user } = useAuthStore()
  const [settings, setSettings] = useState<UserAppearanceSettings | null>(null)
  const [previewSettings, setPreviewSettings] = useState<UserAppearanceSettings | null>(null)
  const [tempPreviewSettings, setTempPreviewSettings] = useState<UserAppearanceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Debounce the preview settings to avoid excessive re-renders
  const debouncedPreviewSettings = useDebounce(tempPreviewSettings, 150)

  // Function to load settings
  const loadSettings = useCallback(async () => {
    if (!user?.id) {
      setSettings(null)
      setPreviewSettings(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const userSettings = await AppearanceService.getUserAppearanceSettings(user.id)
      setSettings(userSettings)
      setPreviewSettings(userSettings)
      setTempPreviewSettings(userSettings)
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Error loading appearance settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      setSettings(null)
      setPreviewSettings(null)
      setTempPreviewSettings(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Load settings on mount or user change
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Method to refresh settings from the server
  const refreshSettings = async (): Promise<void> => {
    try {
      if (!user?.id) return
      
      const freshSettings = await AppearanceService.getUserAppearanceSettings(user.id)
      if (freshSettings) {
        setSettings(freshSettings)
        setPreviewSettings(freshSettings)
        setTempPreviewSettings(freshSettings)
        setHasUnsavedChanges(false)
      }
    } catch (err) {
      console.error('Error refreshing appearance settings:', err)
    }
  }

  // Update debounced preview settings when the debounced value changes
  useEffect(() => {
    if (debouncedPreviewSettings) {
      setPreviewSettings(debouncedPreviewSettings)
    }
  }, [debouncedPreviewSettings])

  // Update settings for real-time preview
  const updateSettings = useCallback((updates: Partial<UserAppearanceSettings>) => {
    if (!tempPreviewSettings) return

    // If this is a complete settings object (after save/reset), replace entirely
    if ('id' in updates && 'user_id' in updates) {
      setSettings(updates as UserAppearanceSettings)
      setPreviewSettings(updates as UserAppearanceSettings)
      setTempPreviewSettings(updates as UserAppearanceSettings)
      setHasUnsavedChanges(false)
      return
    }

    // Otherwise it's a partial update
    const newSettings = { ...tempPreviewSettings, ...updates }
    setTempPreviewSettings(newSettings)
    setHasUnsavedChanges(true)
  }, [tempPreviewSettings])

  // Save settings to database
  const saveSettings = async (): Promise<boolean> => {
    if (!user?.id || !previewSettings) return false

    try {
      setError(null)
      const savedSettings = await AppearanceService.updateAppearanceSettings(user.id, previewSettings)
      
      if (savedSettings) {
        // Add cache invalidation here to ensure public profile shows the changes
        try {
          const username = user.profile_slug || user.github_username
          if (username) {
            await fetch(`/api/revalidate?tag=public-profile-${username}`, {
              method: "POST",
            })
            console.log("✅ Cache invalidated for profile:", username)
          }
        } catch (cacheError) {
          console.warn("Failed to invalidate cache:", cacheError)
          // Don't fail the operation if cache invalidation fails
        }
        
        setSettings(savedSettings)
        setPreviewSettings(savedSettings)
        setTempPreviewSettings(savedSettings)
        setHasUnsavedChanges(false)
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error saving appearance settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to save settings')
      return false
    }
  }

  // Reset settings to defaults
  const resetSettings = async (): Promise<boolean> => {
    if (!user?.id) return false

    try {
      setError(null)
      const defaultSettings = await AppearanceService.resetToDefaults(user.id)
      
      if (defaultSettings) {
        // Add cache invalidation here to ensure public profile shows the changes
        try {
          const username = user.profile_slug || user.github_username
          if (username) {
            await fetch(`/api/revalidate?tag=public-profile-${username}`, {
              method: "POST",
            })
            console.log("✅ Cache invalidated for profile:", username)
          }
        } catch (cacheError) {
          console.warn("Failed to invalidate cache:", cacheError)
          // Don't fail the operation if cache invalidation fails
        }
        
        setSettings(defaultSettings)
        setPreviewSettings(defaultSettings)
        setTempPreviewSettings(defaultSettings)
        setHasUnsavedChanges(false)
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error resetting appearance settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset settings')
      return false
    }
  }

  const value: AppearanceContextType = {
    settings,
    loading,
    error,
    updateSettings,
    saveSettings,
    resetSettings,
    refreshSettings,
    hasUnsavedChanges,
    previewSettings
  }

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider')
  }
  return context
}

// Hook for components that only need to read appearance settings (like preview)
export function useAppearanceSettings() {
  const context = useContext(AppearanceContext)
  return context?.previewSettings || null
}
