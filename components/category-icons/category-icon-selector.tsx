'use client'

import { useState, useRef } from 'react'
import { Upload, Link as LinkIcon, Palette, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { LinkCategory } from '@/lib/services/link-service'
import { CategoryIconConfig, UpdateCategoryIconData } from '@/lib/services/category-icon-service'
import { IconLibrarySelector } from './icon-library-selector'
import { CategoryIconPreview } from './category-icon-preview'

interface CategoryIconSelectorProps {
  category: LinkCategory
  currentConfig: CategoryIconConfig
  onUpdate: (iconData: UpdateCategoryIconData) => Promise<void>
  onReset: () => Promise<void>
  disabled?: boolean
}

export function CategoryIconSelector({
  category,
  currentConfig,
  onUpdate,
  onReset,
  disabled = false
}: CategoryIconSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [selectedLibraryIcon, setSelectedLibraryIcon] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast.error('File must be a valid image (PNG, JPG, SVG, WebP, or GIF)')
        return
      }

      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const response = await fetch('/api/category-icons/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()
      toast.success('Icon uploaded successfully!')

      // The upload endpoint already updates the category icon setting
      // Just trigger a refresh
      window.location.reload()

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload icon')
    } finally {
      setIsLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL')
      return
    }

    try {
      setIsLoading(true)
      
      await onUpdate({
        icon_type: 'url',
        custom_icon_url: urlInput.trim()
      })

      toast.success('Icon URL updated successfully!')
      setUrlInput('')
    } catch (error) {
      console.error('URL update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update icon URL')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLibraryIconSelect = async (iconId: string) => {
    try {
      setIsLoading(true)
      
      await onUpdate({
        icon_type: 'library',
        library_icon_id: iconId
      })

      toast.success('Icon updated successfully!')
      setSelectedLibraryIcon('')
    } catch (error) {
      console.error('Library icon update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update icon')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    try {
      setIsLoading(true)
      await onReset()
      toast.success('Icon reset to default!')
    } catch (error) {
      console.error('Reset error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reset icon')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Icon Preview */}
      <div className="text-center">
        <CategoryIconPreview config={currentConfig} size={48} />
        <p className="text-sm text-gray-400 mt-2">Current Icon</p>
      </div>

      {/* Icon Selection Tabs */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#28282b] border border-[#33373b]">
          <TabsTrigger 
            value="library" 
            className="flex items-center gap-2 data-[state=active]:bg-[#54E0FF] data-[state=active]:text-[#18181a]"
            disabled={disabled || isLoading}
          >
            <Palette className="w-4 h-4" />
            Library
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="flex items-center gap-2 data-[state=active]:bg-[#54E0FF] data-[state=active]:text-[#18181a]"
            disabled={disabled || isLoading}
          >
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger 
            value="url" 
            className="flex items-center gap-2 data-[state=active]:bg-[#54E0FF] data-[state=active]:text-[#18181a]"
            disabled={disabled || isLoading}
          >
            <LinkIcon className="w-4 h-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Library Icons */}
          <TabsContent value="library" className="space-y-4">
            <div>
              <Label className="text-white font-sharp-grotesk mb-3 block">
                Choose from Default Icons
              </Label>
              <IconLibrarySelector
                category={category}
                onSelect={handleLibraryIconSelect}
                disabled={disabled || isLoading}
              />
            </div>
          </TabsContent>

          {/* File Upload */}
          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label className="text-white font-sharp-grotesk mb-3 block">
                Upload Custom Icon
              </Label>
              <div className="border-2 border-dashed border-[#33373b] rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={disabled || isLoading}
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PNG, JPG, SVG, WebP, or GIF (max 2MB)
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isLoading}
                  className="bg-[#54E0FF] hover:bg-[#29ADFF] text-black"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* URL Input */}
          <TabsContent value="url" className="space-y-4">
            <div>
              <Label className="text-white font-sharp-grotesk mb-3 block">
                Icon URL
              </Label>
              <div className="flex gap-3">
                <Input
                  type="url"
                  placeholder="https://example.com/icon.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="border-[#33373b] bg-[#28282b] text-white flex-1"
                  disabled={disabled || isLoading}
                />
                <Button
                  onClick={handleUrlSubmit}
                  disabled={disabled || isLoading || !urlInput.trim()}
                  className="bg-[#54E0FF] hover:bg-[#29ADFF] text-black"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Update'
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter a direct URL to an image file
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Reset Button */}
      {currentConfig.type !== 'default' && (
        <div className="pt-4 border-t border-[#33373b]">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={disabled || isLoading}
            className="w-full border-[#33373b] text-gray-300 hover:text-white hover:bg-[#28282b]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      )}
    </div>
  )
}
