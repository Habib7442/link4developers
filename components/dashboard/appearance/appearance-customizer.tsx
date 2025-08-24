'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { UserAppearanceSettings } from '@/lib/supabase'
import { useAppearance } from '@/contexts/appearance-context'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BackgroundCustomizer } from './background-customizer'
import { TypographyCustomizer } from './typography-customizer'
import { SectionStylingCustomizer } from './section-styling-customizer'
import {
  Palette,
  Type,
  Paintbrush,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface AppearanceCustomizerProps {
  onPreviewUpdate?: () => void
}

export function AppearanceCustomizer({ onPreviewUpdate }: AppearanceCustomizerProps) {
  const { user } = useAuthStore()
  const {
    settings,
    loading,
    error,
    updateSettings,
    saveSettings,
    resetSettings,
    hasUnsavedChanges,
    previewSettings
  } = useAppearance()
  const [saving, setSaving] = useState(false)

  // Handle settings updates
  const handleUpdate = (updates: Partial<UserAppearanceSettings>) => {
    updateSettings(updates)
    // Trigger preview update
    onPreviewUpdate?.()
  }

  // Save settings to database
  const handleSave = async () => {
    setSaving(true)
    try {
      const success = await saveSettings()
      if (success) {
        toast.success('Appearance settings saved successfully!')
      } else {
        toast.error('Failed to save appearance settings')
      }
    } catch (error) {
      console.error('Error saving appearance settings:', error)
      toast.error('Failed to save appearance settings')
    } finally {
      setSaving(false)
    }
  }

  // Reset to defaults
  const handleReset = async () => {
    setSaving(true)
    try {
      const success = await resetSettings()
      if (success) {
        onPreviewUpdate?.()
        toast.success('Appearance settings reset to defaults!')
      } else {
        toast.error('Failed to reset appearance settings')
      }
    } catch (error) {
      console.error('Error resetting appearance settings:', error)
      toast.error('Failed to reset appearance settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="glassmorphic rounded-[16px] sm:rounded-[20px] p-4 sm:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] mobile-form-card">
        <div className="flex items-center justify-center py-8 sm:py-12">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-[#54E0FF]" />
          <span className="ml-3 text-[14px] sm:text-[16px] text-white font-sharp-grotesk">Loading appearance settings...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glassmorphic rounded-[16px] sm:rounded-[20px] p-4 sm:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center mobile-form-card">
        <h3 className="text-[18px] sm:text-[20px] font-medium text-white font-sharp-grotesk mb-2">
          Unable to Load Settings
        </h3>
        <p className="text-[14px] sm:text-[16px] text-[#7a7a83] font-sharp-grotesk">
          {error}
        </p>
      </div>
    )
  }

  if (!previewSettings) {
    return (
      <div className="glassmorphic rounded-[16px] sm:rounded-[20px] p-4 sm:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center mobile-form-card">
        <h3 className="text-[18px] sm:text-[20px] font-medium text-white font-sharp-grotesk mb-2">
          No Settings Available
        </h3>
        <p className="text-[14px] sm:text-[16px] text-[#7a7a83] font-sharp-grotesk">
          Unable to load appearance settings. Please try refreshing the page.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Save/Reset Actions */}
      <div className="glassmorphic rounded-[14px] sm:rounded-[20px] p-3 sm:p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] mobile-form-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div>
            <h2 className="text-[20px] sm:text-[24px] font-medium leading-[24px] sm:leading-[28px] tracking-[-0.6px] sm:tracking-[-0.72px] font-sharp-grotesk text-white">
              Appearance Customization
            </h2>
            <p className="text-[12px] sm:text-[14px] text-[#7a7a83] font-sharp-grotesk mt-1">
              Customize your profile's visual appearance with real-time preview
            </p>
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="border-[#33373b] text-[#7a7a83] hover:text-white text-[12px] sm:text-[14px] h-8 sm:h-9 px-2 sm:px-3"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:from-[#29ADFF] hover:to-[#54E0FF] text-[12px] sm:text-[14px] h-8 sm:h-9 px-2 sm:px-3"
            >
              {saving ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
              ) : hasUnsavedChanges ? (
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              ) : (
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              )}
              {saving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
            </Button>
          </div>
        </div>
      </div>

      {/* Customization Tabs */}
      <div className="glassmorphic rounded-[14px] sm:rounded-[20px] p-3 sm:p-6 md:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] mobile-form-card">
        <Tabs defaultValue="background" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#28282b] border border-[#33373b]">
            <TabsTrigger 
              value="background" 
              className="flex items-center justify-center sm:gap-2 data-[state=active]:bg-[#54E0FF] data-[state=active]:text-[#18181a] px-1 sm:px-2 py-1 sm:py-2 text-[11px] sm:text-[14px]"
            >
              <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-0" />
              <span className="sm:ml-1">Background</span>
            </TabsTrigger>
            <TabsTrigger 
              value="typography" 
              className="flex items-center justify-center sm:gap-2 data-[state=active]:bg-[#54E0FF] data-[state=active]:text-[#18181a] px-1 sm:px-2 py-1 sm:py-2 text-[11px] sm:text-[14px]"
            >
              <Type className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-0" />
              <span className="sm:ml-1">Typography</span>
            </TabsTrigger>
            <TabsTrigger
              value="sections"
              className="flex items-center justify-center sm:gap-2 data-[state=active]:bg-[#54E0FF] data-[state=active]:text-[#18181a] px-1 sm:px-2 py-1 sm:py-2 text-[11px] sm:text-[14px]"
            >
              <Paintbrush className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-0" />
              <span className="sm:ml-1">Sections</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 sm:mt-6">
            <TabsContent value="background" className="space-y-4 sm:space-y-6">
              <BackgroundCustomizer
                settings={previewSettings}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="typography" className="space-y-4 sm:space-y-6">
              <TypographyCustomizer
                settings={previewSettings}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="sections" className="space-y-4 sm:space-y-6">
              <SectionStylingCustomizer
                settings={previewSettings}
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="glassmorphic rounded-[14px] sm:rounded-[20px] p-2 sm:p-4 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] border border-yellow-500/30 mobile-form-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] sm:text-[14px] text-yellow-400 font-sharp-grotesk">
              You have unsaved changes. Don't forget to save!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
