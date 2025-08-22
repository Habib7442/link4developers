'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAppearanceSettings } from '@/lib/supabase'
import { Layout, Square, Circle, CornerDownRight, Palette, Move } from 'lucide-react'

interface LayoutCustomizerProps {
  settings: UserAppearanceSettings
  onUpdate: (updates: Partial<UserAppearanceSettings>) => void
}

export function LayoutCustomizer({ settings, onUpdate }: LayoutCustomizerProps) {
  const presetCardStyles = [
    {
      name: 'Glassmorphic (Default)',
      style: 'glassmorphic',
      background: 'rgba(0, 0, 0, 0.20)',
      borderRadius: 20,
      shadow: '0px 16px 30.7px rgba(0,0,0,0.30)',
      backdropBlur: 10
    },
    {
      name: 'Solid Dark',
      style: 'solid',
      background: '#28282b',
      borderRadius: 12,
      shadow: '0px 4px 12px rgba(0,0,0,0.15)',
      backdropBlur: 0
    },
    {
      name: 'Outlined',
      style: 'outline',
      background: 'transparent',
      borderRadius: 8,
      shadow: 'none',
      backdropBlur: 0
    },
    {
      name: 'Minimal',
      style: 'minimal',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 6,
      shadow: '0px 2px 8px rgba(0,0,0,0.10)',
      backdropBlur: 5
    }
  ]

  const applyCardPreset = (preset: typeof presetCardStyles[0]) => {
    onUpdate({
      button_style: preset.style as any,
      card_background_color: preset.background,
      card_border_radius: preset.borderRadius,
      card_shadow: preset.shadow,
      card_backdrop_blur: preset.backdropBlur
    })
  }

  return (
    <div className="space-y-6">
      {/* Card Styling */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <Square className="w-5 h-5" />
          Card Styling
        </h3>

        {/* Card Background */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Card Background
          </Label>
          <div className="flex gap-3">
            <Input
              type="color"
              value={settings.card_background_color.startsWith('rgba') ? '#28282b' : settings.card_background_color}
              onChange={(e) => onUpdate({ card_background_color: e.target.value })}
              className="w-16 h-10 p-1 border-[#33373b] bg-[#28282b]"
            />
            <Input
              type="text"
              value={settings.card_background_color}
              onChange={(e) => onUpdate({ card_background_color: e.target.value })}
              placeholder="rgba(0, 0, 0, 0.20)"
              className="flex-1 border-[#33373b] bg-[#28282b] text-white"
            />
          </div>
        </div>

        {/* Border Radius */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Border Radius: {settings.card_border_radius}px
          </Label>
          <Slider
            value={[settings.card_border_radius]}
            onValueChange={([value]) => onUpdate({ card_border_radius: value })}
            min={0}
            max={40}
            step={2}
            className="w-full"
          />
        </div>

        {/* Border Width */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Border Width: {settings.card_border_width}px
          </Label>
          <Slider
            value={[settings.card_border_width]}
            onValueChange={([value]) => onUpdate({ card_border_width: value })}
            min={0}
            max={5}
            step={1}
            className="w-full"
          />
        </div>

        {/* Backdrop Blur */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Backdrop Blur: {settings.card_backdrop_blur}px
          </Label>
          <Slider
            value={[settings.card_backdrop_blur]}
            onValueChange={([value]) => onUpdate({ card_backdrop_blur: value })}
            min={0}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        {/* Shadow */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Box Shadow
          </Label>
          <Input
            type="text"
            value={settings.card_shadow}
            onChange={(e) => onUpdate({ card_shadow: e.target.value })}
            placeholder="0px 16px 30.7px rgba(0,0,0,0.30)"
            className="border-[#33373b] bg-[#28282b] text-white"
          />
        </div>

        {/* Preset Card Styles */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Preset Card Styles
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {presetCardStyles.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyCardPreset(preset)}
                className="p-4 border border-[#33373b] rounded-lg hover:border-[#54E0FF] transition-colors text-left"
              >
                <div className="text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                  {preset.name}
                </div>
                <div 
                  className="w-full h-8 rounded border border-[#33373b]"
                  style={{
                    background: preset.background,
                    borderRadius: `${preset.borderRadius}px`,
                    boxShadow: preset.shadow,
                    backdropFilter: preset.backdropBlur > 0 ? `blur(${preset.backdropBlur}px)` : 'none'
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Settings */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <Layout className="w-5 h-5" />
          Layout & Spacing
        </h3>

        {/* Container Width */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Container Max Width: {settings.container_max_width}px
          </Label>
          <Slider
            value={[settings.container_max_width]}
            onValueChange={([value]) => onUpdate({ container_max_width: value })}
            min={400}
            max={1000}
            step={20}
            className="w-full"
          />
        </div>

        {/* Section Spacing */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Section Spacing: {settings.section_spacing}px
          </Label>
          <Slider
            value={[settings.section_spacing]}
            onValueChange={([value]) => onUpdate({ section_spacing: value })}
            min={16}
            max={64}
            step={4}
            className="w-full"
          />
        </div>

        {/* Element Spacing */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Element Spacing: {settings.element_spacing}px
          </Label>
          <Slider
            value={[settings.element_spacing]}
            onValueChange={([value]) => onUpdate({ element_spacing: value })}
            min={8}
            max={32}
            step={2}
            className="w-full"
          />
        </div>

        {/* Profile Avatar Size */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Profile Avatar Size: {settings.profile_avatar_size}px
          </Label>
          <Slider
            value={[settings.profile_avatar_size]}
            onValueChange={([value]) => onUpdate({ profile_avatar_size: value })}
            min={80}
            max={200}
            step={10}
            className="w-full"
          />
        </div>
      </div>

      {/* Button Styling */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <CornerDownRight className="w-5 h-5" />
          Button Styling
        </h3>

        {/* Button Style */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Button Style
          </Label>
          <Select
            value={settings.button_style}
            onValueChange={(value: 'glassmorphic' | 'solid' | 'outline' | 'minimal') => 
              onUpdate({ button_style: value })
            }
          >
            <SelectTrigger className="border-[#33373b] bg-[#28282b] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="glassmorphic">Glassmorphic</SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Button Border Radius */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Button Border Radius: {settings.button_border_radius}px
          </Label>
          <Slider
            value={[settings.button_border_radius]}
            onValueChange={([value]) => onUpdate({ button_border_radius: value })}
            min={0}
            max={30}
            step={2}
            className="w-full"
          />
        </div>

        {/* Button Padding */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Horizontal Padding: {settings.button_padding_x}px
            </Label>
            <Slider
              value={[settings.button_padding_x]}
              onValueChange={([value]) => onUpdate({ button_padding_x: value })}
              min={12}
              max={40}
              step={2}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Vertical Padding: {settings.button_padding_y}px
            </Label>
            <Slider
              value={[settings.button_padding_y]}
              onValueChange={([value]) => onUpdate({ button_padding_y: value })}
              min={8}
              max={24}
              step={2}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Social Media Icons */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <Circle className="w-5 h-5" />
          Social Media Icons
        </h3>

        {/* Icon Size */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Icon Size: {settings.social_icon_size}px
          </Label>
          <Slider
            value={[settings.social_icon_size]}
            onValueChange={([value]) => onUpdate({ social_icon_size: value })}
            min={16}
            max={48}
            step={2}
            className="w-full"
          />
        </div>

        {/* Icon Style */}
        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Icon Style
          </Label>
          <Select
            value={settings.social_icon_style}
            onValueChange={(value: 'rounded' | 'square' | 'circle') => 
              onUpdate({ social_icon_style: value })
            }
          >
            <SelectTrigger className="border-[#33373b] bg-[#28282b] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Icon Colors */}
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <Label className="text-white font-sharp-grotesk w-24">
              Icon Color
            </Label>
            <Input
              type="color"
              value={settings.social_icon_color}
              onChange={(e) => onUpdate({ social_icon_color: e.target.value })}
              className="w-16 h-10 p-1 border-[#33373b] bg-[#28282b]"
            />
            <Input
              type="text"
              value={settings.social_icon_color}
              onChange={(e) => onUpdate({ social_icon_color: e.target.value })}
              className="flex-1 border-[#33373b] bg-[#28282b] text-white"
            />
          </div>

          <div className="flex gap-3 items-center">
            <Label className="text-white font-sharp-grotesk w-24">
              Background
            </Label>
            <Input
              type="color"
              value={settings.social_icon_background === 'transparent' ? '#000000' : settings.social_icon_background}
              onChange={(e) => onUpdate({ social_icon_background: e.target.value })}
              className="w-16 h-10 p-1 border-[#33373b] bg-[#28282b]"
            />
            <Input
              type="text"
              value={settings.social_icon_background}
              onChange={(e) => onUpdate({ social_icon_background: e.target.value })}
              placeholder="transparent"
              className="flex-1 border-[#33373b] bg-[#28282b] text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
