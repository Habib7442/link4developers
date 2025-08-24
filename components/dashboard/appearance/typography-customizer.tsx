'use client'

import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserAppearanceSettings } from '@/lib/supabase'
import { Type, Palette } from 'lucide-react'
import { loadGoogleFont, getFontFamilyWithFallbacks } from '@/lib/utils/font-loader'

interface TypographyCustomizerProps {
  settings: UserAppearanceSettings
  onUpdate: (updates: Partial<UserAppearanceSettings>) => void
}

export function TypographyCustomizer({ settings, onUpdate }: TypographyCustomizerProps) {
  const fontOptions = [
    { value: 'Sharp Grotesk', label: 'Sharp Grotesk (Default)' },
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'Orbitron', label: 'Orbitron (Futuristic)' },
    { value: 'Rajdhani', label: 'Rajdhani (Tech)' },
    { value: 'JetBrains Mono', label: 'JetBrains Mono (Monospace)' },
    { value: 'Fira Code', label: 'Fira Code (Monospace)' },
  ]

  // Load fonts when settings change
  useEffect(() => {
    const fontsToLoad = []
    if (settings.primary_font && settings.primary_font !== 'Sharp Grotesk') {
      fontsToLoad.push(settings.primary_font)
    }
    if (settings.secondary_font && settings.secondary_font !== 'Sharp Grotesk' && settings.secondary_font !== settings.primary_font) {
      fontsToLoad.push(settings.secondary_font)
    }

    if (fontsToLoad.length > 0) {
      fontsToLoad.forEach(font => {
        loadGoogleFont(font).catch(error => {
          console.error(`Failed to load font ${font}:`, error)
        })
      })
    }
  }, [settings.primary_font, settings.secondary_font])

  // Handle font selection with immediate loading
  const handleFontChange = async (type: 'primary_font' | 'secondary_font', fontName: string) => {
    // Load the font first if it's not Sharp Grotesk
    if (fontName !== 'Sharp Grotesk') {
      try {
        await loadGoogleFont(fontName)
      } catch (error) {
        console.error(`Failed to load font ${fontName}:`, error)
      }
    }

    // Update the settings
    onUpdate({ [type]: fontName })
  }

  const presetColorSchemes = [
    {
      name: 'Default Blue',
      primary: '#ffffff',
      secondary: '#7a7a83',
      accent: '#54E0FF',
      link: '#54E0FF',
      linkHover: '#29ADFF'
    },
    {
      name: 'Purple Theme',
      primary: '#ffffff',
      secondary: '#a1a1aa',
      accent: '#8B5CF6',
      link: '#8B5CF6',
      linkHover: '#7C3AED'
    },
    {
      name: 'Green Theme',
      primary: '#ffffff',
      secondary: '#9ca3af',
      accent: '#10B981',
      link: '#10B981',
      linkHover: '#059669'
    },
    {
      name: 'Orange Theme',
      primary: '#ffffff',
      secondary: '#9ca3af',
      accent: '#F59E0B',
      link: '#F59E0B',
      linkHover: '#D97706'
    },
    {
      name: 'Pink Theme',
      primary: '#ffffff',
      secondary: '#9ca3af',
      accent: '#EC4899',
      link: '#EC4899',
      linkHover: '#DB2777'
    },
    {
      name: 'Monochrome',
      primary: '#ffffff',
      secondary: '#9ca3af',
      accent: '#ffffff',
      link: '#d1d5db',
      linkHover: '#ffffff'
    }
  ]

  const applyColorScheme = (scheme: typeof presetColorSchemes[0]) => {
    onUpdate({
      text_primary_color: scheme.primary,
      text_secondary_color: scheme.secondary,
      text_accent_color: scheme.accent,
      link_color: scheme.link,
      link_hover_color: scheme.linkHover
    })
  }

  return (
    <div className="space-y-6">
      {/* Font Selection */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <Type className="w-5 h-5" />
          Font Selection
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Primary Font (Headings)
            </Label>
            <Select
              value={settings.primary_font}
              onValueChange={(value) => handleFontChange('primary_font', value)}
            >
              <SelectTrigger className="border-[#33373b] bg-[#28282b] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem
                    key={font.value}
                    value={font.value}
                    style={{ fontFamily: getFontFamilyWithFallbacks(font.value) }}
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Secondary Font (Body Text)
            </Label>
            <Select
              value={settings.secondary_font}
              onValueChange={(value) => handleFontChange('secondary_font', value)}
            >
              <SelectTrigger className="border-[#33373b] bg-[#28282b] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem
                    key={font.value}
                    value={font.value}
                    style={{ fontFamily: getFontFamilyWithFallbacks(font.value) }}
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Font Sizing */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <Type className="w-5 h-5" />
          Font Sizes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Heading Size
            </Label>
            <Slider
              value={[settings.font_size_heading]}
              onValueChange={([value]) => onUpdate({ font_size_heading: value })}
              min={20}
              max={48}
              step={2}
              className="w-full"
            />
            <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
              {settings.font_size_heading}px
            </span>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Subheading Size
            </Label>
            <Slider
              value={[settings.font_size_subheading]}
              onValueChange={([value]) => onUpdate({ font_size_subheading: value })}
              min={14}
              max={28}
              step={2}
              className="w-full"
            />
            <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
              {settings.font_size_subheading}px
            </span>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Body Text Size
            </Label>
            <Slider
              value={[settings.font_size_base]}
              onValueChange={([value]) => onUpdate({ font_size_base: value })}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
              {settings.font_size_base}px
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Heading Line Height
            </Label>
            <Slider
              value={[settings.line_height_heading]}
              onValueChange={([value]) => onUpdate({ line_height_heading: value })}
              min={1.0}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
              {settings.line_height_heading}
            </span>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Body Line Height
            </Label>
            <Slider
              value={[settings.line_height_base]}
              onValueChange={([value]) => onUpdate({ line_height_base: value })}
              min={1.0}
              max={2.5}
              step={0.1}
              className="w-full"
            />
            <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
              {settings.line_height_base}
            </span>
          </div>
        </div>
      </div>



      {/* Color Scheme */}
      <div className="space-y-4">
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Text Colors
        </h3>

        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <Label className="text-white font-sharp-grotesk w-32">
              Primary Text
            </Label>
            <Input
              type="color"
              value={settings.text_primary_color}
              onChange={(e) => onUpdate({ text_primary_color: e.target.value })}
              className="w-16 h-10 p-1 border-[#33373b] bg-[#28282b]"
            />
            <Input
              type="text"
              value={settings.text_primary_color}
              onChange={(e) => onUpdate({ text_primary_color: e.target.value })}
              className="flex-1 border-[#33373b] bg-[#28282b] text-white"
            />
          </div>

          <div className="flex gap-3 items-center">
            <Label className="text-white font-sharp-grotesk w-32">
              Secondary Text
            </Label>
            <Input
              type="color"
              value={settings.text_secondary_color}
              onChange={(e) => onUpdate({ text_secondary_color: e.target.value })}
              className="w-16 h-10 p-1 border-[#33373b] bg-[#28282b]"
            />
            <Input
              type="text"
              value={settings.text_secondary_color}
              onChange={(e) => onUpdate({ text_secondary_color: e.target.value })}
              className="flex-1 border-[#33373b] bg-[#28282b] text-white"
            />
          </div>

          <div className="flex gap-3 items-center">
            <Label className="text-white font-sharp-grotesk w-32">
              Accent Text
            </Label>
            <Input
              type="color"
              value={settings.text_accent_color}
              onChange={(e) => onUpdate({ text_accent_color: e.target.value })}
              className="w-16 h-10 p-1 border-[#33373b] bg-[#28282b]"
            />
            <Input
              type="text"
              value={settings.text_accent_color}
              onChange={(e) => onUpdate({ text_accent_color: e.target.value })}
              className="flex-1 border-[#33373b] bg-[#28282b] text-white"
            />
          </div>

          <div className="flex gap-3 items-center">
            <Label className="text-white font-sharp-grotesk w-32">
              Link Color
            </Label>
            <Input
              type="color"
              value={settings.link_color}
              onChange={(e) => onUpdate({ link_color: e.target.value })}
              className="w-16 h-10 p-1 border-[#33373b] bg-[#28282b]"
            />
            <Input
              type="text"
              value={settings.link_color}
              onChange={(e) => onUpdate({ link_color: e.target.value })}
              className="flex-1 border-[#33373b] bg-[#28282b] text-white"
            />
          </div>

          <div className="flex gap-3 items-center">
            <Label className="text-white font-sharp-grotesk w-32">
              Link Hover
            </Label>
            <Input
              type="color"
              value={settings.link_hover_color}
              onChange={(e) => onUpdate({ link_hover_color: e.target.value })}
              className="w-16 h-10 p-1 border-[#33373b] bg-[#28282b]"
            />
            <Input
              type="text"
              value={settings.link_hover_color}
              onChange={(e) => onUpdate({ link_hover_color: e.target.value })}
              className="flex-1 border-[#33373b] bg-[#28282b] text-white"
            />
          </div>
        </div>

        <div>
          <Label className="text-white font-sharp-grotesk mb-2 block">
            Preset Color Schemes
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {presetColorSchemes.map((scheme) => (
              <button
                key={scheme.name}
                onClick={() => applyColorScheme(scheme)}
                className="p-3 border border-[#33373b] rounded-lg hover:border-[#54E0FF] transition-colors text-left"
              >
                <div className="text-[12px] font-medium text-white font-sharp-grotesk mb-2">
                  {scheme.name}
                </div>
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-[#33373b]" 
                    style={{ backgroundColor: scheme.primary }}
                    title="Primary"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-[#33373b]" 
                    style={{ backgroundColor: scheme.secondary }}
                    title="Secondary"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-[#33373b]" 
                    style={{ backgroundColor: scheme.accent }}
                    title="Accent"
                  />
                  <div 
                    className="w-4 h-4 rounded-full border border-[#33373b]" 
                    style={{ backgroundColor: scheme.link }}
                    title="Link"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
