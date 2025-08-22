'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BackgroundGradient, UserAppearanceSettings } from '@/lib/supabase'
import { Palette, Image, Zap, Plus, Trash2, Upload, Link } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { useAuthStore } from '@/stores/auth-store'

interface BackgroundCustomizerProps {
  settings: UserAppearanceSettings
  onUpdate: (updates: Partial<UserAppearanceSettings>) => void
}

export function BackgroundCustomizer({ settings, onUpdate }: BackgroundCustomizerProps) {
  const { user } = useAuthStore()
  const [gradientColors, setGradientColors] = useState<string[]>(
    settings.background_gradient?.colors || ['#54E0FF', '#29ADFF']
  )

  const handleBackgroundTypeChange = (type: 'color' | 'gradient' | 'image') => {
    onUpdate({ background_type: type })
  }

  const handleColorChange = (color: string) => {
    onUpdate({ background_color: color })
  }

  const handleGradientUpdate = (gradient: BackgroundGradient) => {
    onUpdate({ background_gradient: gradient })
  }

  const handleImageUrlChange = (url: string) => {
    onUpdate({ background_image_url: url })
  }

  const handleImagePositionChange = (position: string) => {
    onUpdate({ background_image_position: position })
  }

  const handleImageSizeChange = (size: string) => {
    onUpdate({ background_image_size: size })
  }

  const handleImageUploadSuccess = (url: string, filePath: string) => {
    // Clean up previous uploaded image if it exists
    if (settings.background_image_path && settings.background_image_path !== filePath) {
      // Note: We could implement cleanup here, but for now we'll keep old images
      // to avoid breaking existing profiles if they switch back
    }

    onUpdate({
      background_image_url: url,
      background_image_path: filePath // Store the file path for potential deletion later
    })
  }

  const addGradientColor = () => {
    const newColors = [...gradientColors, '#ffffff']
    setGradientColors(newColors)
    handleGradientUpdate({
      type: settings.background_gradient?.type || 'linear',
      colors: newColors,
      direction: settings.background_gradient?.direction || '45deg'
    })
  }

  const removeGradientColor = (index: number) => {
    if (gradientColors.length <= 2) return // Minimum 2 colors
    const newColors = gradientColors.filter((_, i) => i !== index)
    setGradientColors(newColors)
    handleGradientUpdate({
      type: settings.background_gradient?.type || 'linear',
      colors: newColors,
      direction: settings.background_gradient?.direction || '45deg'
    })
  }

  const updateGradientColor = (index: number, color: string) => {
    const newColors = [...gradientColors]
    newColors[index] = color
    setGradientColors(newColors)
    handleGradientUpdate({
      type: settings.background_gradient?.type || 'linear',
      colors: newColors,
      direction: settings.background_gradient?.direction || '45deg'
    })
  }

  const presetBackgrounds = [
    { name: 'Dark', color: '#18181a' },
    { name: 'Black', color: '#000000' },
    { name: 'Dark Blue', color: '#0f172a' },
    { name: 'Dark Purple', color: '#1e1b4b' },
    { name: 'Dark Green', color: '#064e3b' },
    { name: 'Dark Red', color: '#7f1d1d' },
  ]

  const presetGradients = [
    { name: 'Blue Ocean', colors: ['#54E0FF', '#29ADFF'] },
    { name: 'Purple Sunset', colors: ['#8B5CF6', '#EC4899'] },
    { name: 'Green Forest', colors: ['#10B981', '#059669'] },
    { name: 'Orange Fire', colors: ['#F59E0B', '#EF4444'] },
    { name: 'Pink Dream', colors: ['#EC4899', '#8B5CF6'] },
    { name: 'Dark Gradient', colors: ['#1f2937', '#111827'] },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[18px] font-medium text-white font-sharp-grotesk mb-4">
          Background Type
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={settings.background_type === 'color' ? 'default' : 'outline'}
            onClick={() => handleBackgroundTypeChange('color')}
            className="flex items-center gap-2 h-12"
          >
            <Palette className="w-4 h-4" />
            Color
          </Button>
          <Button
            variant={settings.background_type === 'gradient' ? 'default' : 'outline'}
            onClick={() => handleBackgroundTypeChange('gradient')}
            className="flex items-center gap-2 h-12"
          >
            <Zap className="w-4 h-4" />
            Gradient
          </Button>
          <Button
            variant={settings.background_type === 'image' ? 'default' : 'outline'}
            onClick={() => handleBackgroundTypeChange('image')}
            className="flex items-center gap-2 h-12"
          >
            <Image className="w-4 h-4" />
            Image
          </Button>
        </div>
      </div>

      {/* Solid Color Background */}
      {settings.background_type === 'color' && (
        <div className="space-y-4">
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Background Color
            </Label>
            <div className="flex gap-3">
              <Input
                type="color"
                value={settings.background_color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-16 h-10 p-1 border-[#33373b] bg-[#28282b]"
              />
              <Input
                type="text"
                value={settings.background_color}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#18181a"
                className="flex-1 border-[#33373b] bg-[#28282b] text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Preset Colors
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {presetBackgrounds.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleColorChange(preset.color)}
                  className="w-12 h-12 rounded-lg border-2 border-[#33373b] hover:border-[#54E0FF] transition-colors"
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gradient Background */}
      {settings.background_type === 'gradient' && (
        <div className="space-y-4">
          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Gradient Type
            </Label>
            <Select
              value={settings.background_gradient?.type || 'linear'}
              onValueChange={(value: 'linear' | 'radial') => 
                handleGradientUpdate({
                  ...settings.background_gradient,
                  type: value,
                  colors: gradientColors
                } as BackgroundGradient)
              }
            >
              <SelectTrigger className="border-[#33373b] bg-[#28282b] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Gradient Colors
            </Label>
            <div className="space-y-2">
              {gradientColors.map((color, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => updateGradientColor(index, e.target.value)}
                    className="w-12 h-10 p-1 border-[#33373b] bg-[#28282b]"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => updateGradientColor(index, e.target.value)}
                    className="flex-1 border-[#33373b] bg-[#28282b] text-white"
                  />
                  {gradientColors.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeGradientColor(index)}
                      className="border-[#33373b] text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addGradientColor}
                className="w-full border-[#33373b] text-[#54E0FF] hover:text-[#29ADFF]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Color
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-white font-sharp-grotesk mb-2 block">
              Preset Gradients
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {presetGradients.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setGradientColors(preset.colors)
                    handleGradientUpdate({
                      type: 'linear',
                      colors: preset.colors,
                      direction: '45deg'
                    })
                  }}
                  className="h-12 rounded-lg border-2 border-[#33373b] hover:border-[#54E0FF] transition-colors"
                  style={{
                    background: `linear-gradient(45deg, ${preset.colors.join(', ')})`
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Background */}
      {settings.background_type === 'image' && (
        <div className="space-y-6">
          <div>
            <Label className="text-white font-sharp-grotesk mb-4 block">
              Background Image Source
            </Label>

            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#28282b] border border-[#33373b]">
                <TabsTrigger
                  value="url"
                  className="flex items-center gap-2 data-[state=active]:bg-[#54E0FF] data-[state=active]:text-[#18181a]"
                >
                  <Link className="w-4 h-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="flex items-center gap-2 data-[state=active]:bg-[#54E0FF] data-[state=active]:text-[#18181a]"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label className="text-white font-sharp-grotesk mb-2 block">
                      Image URL
                    </Label>
                    <Input
                      type="url"
                      value={settings.background_image_url || ''}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="border-[#33373b] bg-[#28282b] text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter a direct URL to an image file (JPEG, PNG, WebP, GIF)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div>
                    <Label className="text-white font-sharp-grotesk mb-2 block">
                      Upload Image
                    </Label>
                    {user && (
                      <ImageUpload
                        userId={user.id}
                        onUploadSuccess={handleImageUploadSuccess}
                        className="border-[#33373b]"
                      />
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Current Background Image Info */}
          {settings.background_image_url && (
            <div className="p-4 bg-[#28282b] border border-[#33373b] rounded-lg">
              <div className="flex items-start gap-3">
                <Image className="w-5 h-5 text-[#54E0FF] mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white mb-1">Current Background Image</p>
                  <p className="text-xs text-gray-400 break-all">
                    {settings.background_image_path ? 'Uploaded image' : settings.background_image_url}
                  </p>
                  {settings.background_image_path && (
                    <p className="text-xs text-green-400 mt-1">✓ Uploaded to your storage</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white font-sharp-grotesk mb-2 block">
                Position
              </Label>
              <Select
                value={settings.background_image_position}
                onValueChange={handleImagePositionChange}
              >
                <SelectTrigger className="border-[#33373b] bg-[#28282b] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white font-sharp-grotesk mb-2 block">
                Size
              </Label>
              <Select
                value={settings.background_image_size}
                onValueChange={handleImageSizeChange}
              >
                <SelectTrigger className="border-[#33373b] bg-[#28282b] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="100% 100%">Stretch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
