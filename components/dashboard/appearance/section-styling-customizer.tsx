'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAppearanceSettings } from '@/lib/supabase'
import { Palette, User, Github, BookOpen, Award, Mail, Share2 } from 'lucide-react'

interface SectionStylingCustomizerProps {
  settings: UserAppearanceSettings
  onUpdate: (updates: Partial<UserAppearanceSettings>) => void
}

export function SectionStylingCustomizer({ settings, onUpdate }: SectionStylingCustomizerProps) {
  
  // Section-specific color presets
  const sectionPresets = [
    { name: 'Profile', icon: User, color: '#54E0FF' },
    { name: 'Social', icon: Share2, color: '#8B5CF6' },
    { name: 'Projects', icon: Github, color: '#10B981' },
    { name: 'Professional', icon: Award, color: '#F59E0B' },
    { name: 'Blogs', icon: BookOpen, color: '#EC4899' },
    { name: 'Contact', icon: Mail, color: '#EF4444' },
  ]

  return (
    <div className="space-y-8">
      
      {/* Profile Section Styling */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Section
        </h3>

        {/* Profile Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Name Color
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.text_primary_color}
                onChange={(e) => onUpdate({ text_primary_color: e.target.value })}
                className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
              />
              <Input
                type="text"
                value={settings.text_primary_color}
                onChange={(e) => onUpdate({ text_primary_color: e.target.value })}
                className="flex-1 border-[#33373b] bg-[#28282b] text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Title Color
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.text_accent_color}
                onChange={(e) => onUpdate({ text_accent_color: e.target.value })}
                className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
              />
              <Input
                type="text"
                value={settings.text_accent_color}
                onChange={(e) => onUpdate({ text_accent_color: e.target.value })}
                className="flex-1 border-[#33373b] bg-[#28282b] text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Bio Color
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.text_secondary_color}
                onChange={(e) => onUpdate({ text_secondary_color: e.target.value })}
                className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
              />
              <Input
                type="text"
                value={settings.text_secondary_color}
                onChange={(e) => onUpdate({ text_secondary_color: e.target.value })}
                className="flex-1 border-[#33373b] bg-[#28282b] text-white"
              />
            </div>
          </div>

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

      {/* Link Cards Styling */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Link Cards (All Sections)
        </h3>

        {/* Card Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Card Background
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.card_background_color?.replace(/rgba?\([^)]+\)/, '#28282b') || '#28282b'}
                onChange={(e) => onUpdate({ card_background_color: `${e.target.value}99` })}
                className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
              />
              <Input
                type="text"
                value={settings.card_background_color}
                onChange={(e) => onUpdate({ card_background_color: e.target.value })}
                className="flex-1 border-[#33373b] bg-[#28282b] text-white"
                placeholder="rgba(40, 40, 43, 0.6)"
              />
            </div>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Card Border
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.border_color}
                onChange={(e) => onUpdate({ border_color: e.target.value })}
                className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
              />
              <Input
                type="text"
                value={settings.border_color}
                onChange={(e) => onUpdate({ border_color: e.target.value })}
                className="flex-1 border-[#33373b] bg-[#28282b] text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Link Text Color
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.link_color}
                onChange={(e) => onUpdate({ link_color: e.target.value })}
                className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
              />
              <Input
                type="text"
                value={settings.link_color}
                onChange={(e) => onUpdate({ link_color: e.target.value })}
                className="flex-1 border-[#33373b] bg-[#28282b] text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Link Hover Color
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.link_hover_color}
                onChange={(e) => onUpdate({ link_hover_color: e.target.value })}
                className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
              />
              <Input
                type="text"
                value={settings.link_hover_color}
                onChange={(e) => onUpdate({ link_hover_color: e.target.value })}
                className="flex-1 border-[#33373b] bg-[#28282b] text-white"
              />
            </div>
          </div>
        </div>

        {/* Card Shape */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Border Radius
            </Label>
            <Slider
              value={[settings.card_border_radius]}
              onValueChange={([value]) => onUpdate({ card_border_radius: value })}
              min={0}
              max={30}
              step={2}
              className="w-full"
            />
            <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
              {settings.card_border_radius}px
            </span>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Border Width
            </Label>
            <Slider
              value={[settings.card_border_width]}
              onValueChange={([value]) => onUpdate({ card_border_width: value })}
              min={0}
              max={4}
              step={1}
              className="w-full"
            />
            <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
              {settings.card_border_width}px
            </span>
          </div>
        </div>
      </div>

      {/* Section Color Presets */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk">
          Quick Color Presets
        </h3>
        <p className="text-[14px] text-[#7a7a83] font-sharp-grotesk">
          Apply coordinated colors for different sections
        </p>
        
        <div className="grid grid-cols-3 gap-3">
          {sectionPresets.map((preset) => {
            const Icon = preset.icon
            return (
              <Button
                key={preset.name}
                variant="outline"
                onClick={() => {
                  onUpdate({
                    text_accent_color: preset.color,
                    link_color: preset.color,
                    link_hover_color: preset.color + 'CC'
                  })
                }}
                className="h-16 border-[#33373b] bg-[#28282b] hover:bg-[#33373b] flex flex-col gap-1"
              >
                <Icon className="w-5 h-5" style={{ color: preset.color }} />
                <span className="text-[12px] text-white font-sharp-grotesk">
                  {preset.name}
                </span>
              </Button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
