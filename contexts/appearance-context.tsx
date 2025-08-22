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

  // Load settings on mount or user change
  useEffect(() => {
    const loadSettings = async () => {
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
    }

    loadSettings()
  }, [user?.id])

  // Update debounced preview settings when the debounced value changes
  useEffect(() => {
    if (debouncedPreviewSettings) {
      setPreviewSettings(debouncedPreviewSettings)
    }
  }, [debouncedPreviewSettings])

  // Update settings for real-time preview
  const updateSettings = useCallback((updates: Partial<UserAppearanceSettings>) => {
    if (!tempPreviewSettings) return

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
