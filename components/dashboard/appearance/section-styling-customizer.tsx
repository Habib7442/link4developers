'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAppearanceSettings } from '@/lib/supabase'
import { LINK_CATEGORIES } from '@/lib/services/link-constants'
import { LinkCategory } from '@/lib/domain/entities'
import { SectionStyleOverride, SectionStyleOverrides } from '@/lib/utils/section-styling'
import { User, Github, BookOpen, Award, Mail, Share2, Link, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface SectionStylingCustomizerProps {
  settings: UserAppearanceSettings
  onUpdate: (updates: Partial<UserAppearanceSettings>) => void
}

export function SectionStylingCustomizer({ settings, onUpdate }: SectionStylingCustomizerProps) {
  // Parse existing section overrides from custom_css field
  const getSectionOverrides = (): SectionStyleOverrides => {
    try {
      if (settings.custom_css && settings.custom_css.startsWith('SECTION_OVERRIDES:')) {
        return JSON.parse(settings.custom_css.replace('SECTION_OVERRIDES:', ''))
      }
    } catch (error) {
      console.error('Error parsing section overrides:', error)
    }
    return {}
  }

  const [sectionOverrides, setSectionOverrides] = useState<SectionStyleOverrides>(getSectionOverrides())
  const [activeSection, setActiveSection] = useState<'profile' | LinkCategory>('profile')

  // Save section overrides back to settings
  const saveSectionOverrides = (newOverrides: SectionStyleOverrides) => {
    setSectionOverrides(newOverrides)
    const serialized = `SECTION_OVERRIDES:${JSON.stringify(newOverrides)}`
    onUpdate({ custom_css: serialized })
  }

  // Update specific section style
  const updateSectionStyle = (section: 'profile' | LinkCategory, styleUpdate: Partial<SectionStyleOverride>) => {
    const newOverrides = {
      ...sectionOverrides,
      [section]: {
        ...sectionOverrides[section],
        ...styleUpdate
      }
    }
    saveSectionOverrides(newOverrides)
  }

  // Reset section to global defaults
  const resetSection = (section: 'profile' | LinkCategory) => {
    const newOverrides = { ...sectionOverrides }
    delete newOverrides[section]
    saveSectionOverrides(newOverrides)
    toast.success(`${section === 'profile' ? 'Profile' : LINK_CATEGORIES[section]?.label} section reset to global styles`)
  }

  // Get current style for active section (with fallbacks to global)
  const getCurrentSectionStyle = (section: 'profile' | LinkCategory): SectionStyleOverride => {
    const override = sectionOverrides[section] || {}
    return {
      card_border_color: override.card_border_color || settings.border_color,
      card_border_radius: override.card_border_radius ?? settings.card_border_radius,
      card_border_width: override.card_border_width ?? 1,
      link_hover_color: override.link_hover_color || settings.link_hover_color
    }
  }

  const currentStyle = getCurrentSectionStyle(activeSection)
  const hasOverride = !!sectionOverrides[activeSection]

  // Section definitions
  const sections = [
    { id: 'profile' as const, label: 'Profile Section', icon: User },
    { id: 'personal' as const, label: LINK_CATEGORIES.personal.label, icon: User },
    { id: 'projects' as const, label: LINK_CATEGORIES.projects.label, icon: Github },
    { id: 'blogs' as const, label: LINK_CATEGORIES.blogs.label, icon: BookOpen },
    { id: 'achievements' as const, label: LINK_CATEGORIES.achievements.label, icon: Award },
    { id: 'contact' as const, label: LINK_CATEGORIES.contact.label, icon: Mail },
    { id: 'social' as const, label: LINK_CATEGORIES.social.label, icon: Share2 },
    { id: 'custom' as const, label: LINK_CATEGORIES.custom.label, icon: Link },
  ]

  // Color presets for quick styling
  const colorPresets = [
    { name: 'Blue', primary: '#3b82f6', secondary: '#1d4ed8', bg: 'rgba(59, 130, 246, 0.1)' },
    { name: 'Purple', primary: '#8b5cf6', secondary: '#7c3aed', bg: 'rgba(139, 92, 246, 0.1)' },
    { name: 'Green', primary: '#10b981', secondary: '#059669', bg: 'rgba(16, 185, 129, 0.1)' },
    { name: 'Orange', primary: '#f59e0b', secondary: '#d97706', bg: 'rgba(245, 158, 11, 0.1)' },
    { name: 'Pink', primary: '#ec4899', secondary: '#db2777', bg: 'rgba(236, 72, 153, 0.1)' },
    { name: 'Red', primary: '#ef4444', secondary: '#dc2626', bg: 'rgba(239, 68, 68, 0.1)' },
  ]

  return (
    <div className="space-y-6">
      {/* Section Selection */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk">
          Section-Wise Styling
        </h3>
        <p className="text-[14px] text-[#7a7a83] font-sharp-grotesk">
          Apply quick color themes and customize border styles. Text and background colors use global settings from Typography tab.
        </p>
        
        <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as 'profile' | LinkCategory)}>
          <div className="overflow-x-auto">
            <TabsList className="flex w-max min-w-full bg-[#28282b] border border-[#33373b] p-1">
            {sections.map((section) => {
              const Icon = section.icon
              const hasCustomStyle = !!sectionOverrides[section.id]
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex flex-col items-center gap-1 p-2 min-w-[80px] data-[state=active]:bg-[#54E0FF] data-[state=active]:text-[#18181a] relative"
                  title={section.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-medium truncate max-w-[70px] text-center">
                    {section.id === 'profile' ? 'Profile' : section.label.split(' ')[0]}
                  </span>
                  {hasCustomStyle && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#54E0FF] rounded-full border border-[#18181a]"></div>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="space-y-6 mt-6">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <section.icon className="w-5 h-5 text-[#54E0FF]" />
                  <div>
                    <h4 className="text-[16px] font-medium text-white font-sharp-grotesk">
                      {section.label}
                    </h4>
                    <p className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
                      {hasOverride ? 'Using custom styles' : 'Using global styles'}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {hasOverride && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resetSection(section.id)}
                      className="border-[#33373b] text-[#7a7a83] hover:text-white"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-3">
                <Label className="text-white font-sharp-grotesk text-sm">
                  Quick Color Themes
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateSectionStyle(section.id, {
                          link_hover_color: preset.secondary,
                          card_border_color: preset.primary
                        })
                        toast.success(`Applied ${preset.name} theme to ${section.label}`)
                      }}
                      className="h-12 border-[#33373b] bg-[#28282b] hover:bg-[#33373b] flex flex-col gap-1 p-2"
                    >
                      <div
                        className="w-4 h-2 rounded-sm"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="text-[10px] text-white font-sharp-grotesk">
                        {preset.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Style Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card Border Color */}
                <div>
                  <Label className="text-white font-sharp-grotesk mb-2 block">
                    Border Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentStyle.card_border_color?.replace(/rgba?\([^)]+\)/, '#ffffff') || '#ffffff'}
                      onChange={(e) => updateSectionStyle(section.id, { card_border_color: e.target.value })}
                      className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
                    />
                    <Input
                      type="text"
                      value={currentStyle.card_border_color || ''}
                      onChange={(e) => updateSectionStyle(section.id, { card_border_color: e.target.value })}
                      className="flex-1 border-[#33373b] bg-[#28282b] text-white"
                      placeholder="rgba(255, 255, 255, 0.2)"
                    />
                  </div>
                </div>

                {/* Link Hover Color */}
                <div>
                  <Label className="text-white font-sharp-grotesk mb-2 block">
                    Link Hover Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentStyle.link_hover_color?.replace(/rgba?\([^)]+\)/, '#ffc0cb') || '#ffc0cb'}
                      onChange={(e) => updateSectionStyle(section.id, { link_hover_color: e.target.value })}
                      className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
                    />
                    <Input
                      type="text"
                      value={currentStyle.link_hover_color || ''}
                      onChange={(e) => updateSectionStyle(section.id, { link_hover_color: e.target.value })}
                      className="flex-1 border-[#33373b] bg-[#28282b] text-white"
                      placeholder="#ffc0cb"
                    />
                  </div>
                </div>
              </div>

              {/* Border Properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Border Radius */}
                <div>
                  <Label className="text-white font-sharp-grotesk mb-2 block">
                    Border Radius: {currentStyle.card_border_radius || 0}px
                  </Label>
                  <Slider
                    value={[currentStyle.card_border_radius || 0]}
                    onValueChange={([value]) => updateSectionStyle(section.id, { card_border_radius: value })}
                    min={0}
                    max={30}
                    step={2}
                    className="w-full"
                  />
                </div>

                {/* Border Width */}
                <div>
                  <Label className="text-white font-sharp-grotesk mb-2 block">
                    Border Width: {currentStyle.card_border_width || 0}px
                  </Label>
                  <Slider
                    value={[currentStyle.card_border_width || 1]}
                    onValueChange={([value]) => updateSectionStyle(section.id, { card_border_width: value })}
                    min={0}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Global Profile Settings */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Settings
        </h3>

        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Avatar Size
          </Label>
          <Slider
            value={[settings.profile_avatar_size]}
            onValueChange={([value]) => onUpdate({ profile_avatar_size: value })}
            min={80}
            max={200}
            step={10}
            className="w-full"
          />
          <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
            {settings.profile_avatar_size}px
          </span>
        </div>
      </div>
    </div>
  )
}