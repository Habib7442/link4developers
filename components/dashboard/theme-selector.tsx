'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { TemplateService } from '@/lib/services/template-service'
import { getAllTemplates, getTemplateConfig } from '@/lib/templates/template-config'
import { TemplateId, TemplateConfig } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Check, Crown, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateTheme } from '@/lib/hooks/use-dashboard-queries'

interface ThemeSelectorProps {
  onThemeChange?: () => void
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps = {}) {
  const { user } = useAuthStore()
  const [currentTemplate, setCurrentTemplate] = useState<TemplateId>('developer-dark')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('developer-dark')
  const [loading, setLoading] = useState(true)
  
  // Use the React Query mutation hook
  const updateThemeMutation = useUpdateTheme()

  // Load user's current template
  useEffect(() => {
    if (user) {
      const userTemplateId = (user.theme_id as TemplateId) || 'developer-dark'
      setCurrentTemplate(userTemplateId)
      setSelectedTemplate(userTemplateId)
      setLoading(false)
    }
  }, [user])

  const handleTemplateSelect = (templateId: TemplateId) => {
    setSelectedTemplate(templateId)
  }

  const handleSaveTemplate = async () => {
    if (!user || selectedTemplate === currentTemplate) return

    updateThemeMutation.mutate({ 
      userId: user.id, 
      templateId: selectedTemplate 
    }, {
      onSuccess: () => {
        // Update local state after successful mutation
        setCurrentTemplate(selectedTemplate)
        // Trigger preview refresh
        onThemeChange?.()
      }
    })
  }

  if (loading) {
    return (
      <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-[#28282b] rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[#28282b] rounded-[16px]"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const templates = getAllTemplates()

  return (
    <div className="space-y-8">
      
      {/* Current Theme Info */}
      <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-medium leading-[24px] tracking-[-0.6px] font-sharp-grotesk text-white mb-2">
              Current Theme
            </h2>
            <p className="text-[14px] font-light text-[#7a7a83] font-sharp-grotesk">
              {getTemplateConfig(currentTemplate).name} - {getTemplateConfig(currentTemplate).description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#54E0FF]" />
            <span className="text-[14px] font-medium text-[#54E0FF] font-sharp-grotesk">
              {getTemplateConfig(currentTemplate).name}
            </span>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-6">
          Choose Your Template
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              isCurrent={currentTemplate === template.id}
              onSelect={() => handleTemplateSelect(template.id)}
              isPremium={template.category === 'premium'}
              userIsPremium={user?.is_premium || false}
            />
          ))}
        </div>

        {/* Save Button */}
        {selectedTemplate !== currentTemplate && (
          <div className="flex justify-center">
            <Button
              onClick={handleSaveTemplate}
              disabled={updateThemeMutation.isPending}
              className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:opacity-90 px-8 py-3"
            >
              {updateThemeMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#18181a] border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply Theme
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: TemplateConfig
  isSelected: boolean
  isCurrent: boolean
  onSelect: () => void
  isPremium: boolean
  userIsPremium: boolean
}

function TemplateCard({ 
  template, 
  isSelected, 
  isCurrent, 
  onSelect, 
  isPremium, 
  userIsPremium 
}: TemplateCardProps) {
  const canUse = !isPremium || userIsPremium

  return (
    <div 
      className={`relative bg-[#28282b] border rounded-[16px] p-4 transition-all duration-200 cursor-pointer group ${
        isSelected 
          ? 'border-[#54E0FF] shadow-[0px_0px_20px_rgba(84,224,255,0.3)]' 
          : 'border-[#33373b] hover:border-[#54E0FF]/50'
      } ${!canUse ? 'opacity-60' : ''}`}
      onClick={canUse ? onSelect : undefined}
    >
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] px-2 py-1 rounded-full text-xs font-medium font-sharp-grotesk flex items-center gap-1">
          <Crown className="w-3 h-3" />
          PRO
        </div>
      )}

      {/* Current Badge */}
      {isCurrent && (
        <div className="absolute -top-2 -left-2 bg-[#2ea043] text-white px-2 py-1 rounded-full text-xs font-medium font-sharp-grotesk flex items-center gap-1">
          <Check className="w-3 h-3" />
          Current
        </div>
      )}

      {/* Template Preview */}
      <div className="relative mb-4 rounded-[12px] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 h-32">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundColor: template.color_scheme.primary }}
        />
        <div className="p-3 h-full flex flex-col justify-between relative z-10">
          {/* Mock Browser Bar */}
          <div className="flex items-center gap-1 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          
          {/* Template Content Preview */}
          <div className="flex-1 space-y-2">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: template.color_scheme.primary }}></div>
            <div className="space-y-1">
              <div className="h-1.5 bg-white/80 rounded w-3/4"></div>
              <div className="h-1.5 bg-white/60 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="h-4 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="space-y-2 mb-4">
        <h3 className="text-[16px] font-medium leading-[20px] tracking-[-0.48px] font-sharp-grotesk text-white">
          {template.name}
        </h3>
        <p className="text-[12px] font-light leading-[16px] text-[#7a7a83] font-sharp-grotesk">
          {template.description}
        </p>
      </div>

      {/* Features */}
      <div className="space-y-1 mb-4">
        {template.features.slice(0, 2).map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#54E0FF]"></div>
            <span className="text-[10px] font-light text-[#7a7a83] font-sharp-grotesk">{feature}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {canUse ? (
          <div className="flex-1 text-center">
            {isSelected ? (
              <div className="text-[#54E0FF] text-xs font-medium font-sharp-grotesk py-1.5">
                Selected
              </div>
            ) : (
              <div className="text-[#7a7a83] text-xs font-light font-sharp-grotesk py-1.5">
                Click to select
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 text-center">
            <div className="text-[#7a7a83] text-xs font-light font-sharp-grotesk py-1.5">
              Premium only
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
