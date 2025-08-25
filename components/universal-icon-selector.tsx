'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Check, 
  X, 
  ImageIcon, 
  Upload,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Globe,
  BookOpen,
  Award,
  ExternalLink,
  LinkIcon
} from 'lucide-react'
import { detectPlatformFromUrl, SOCIAL_PLATFORMS } from '@/lib/config/social-icons'
import { LinkCategory } from '@/lib/services/link-service'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

interface UniversalIconSelectorProps {
  category: LinkCategory
  url?: string
  currentIconType: 'default' | 'platform' | 'upload' | 'url'
  currentIconVariant?: string
  customIconUrl?: string
  uploadedIconUrl?: string
  onIconChange: (iconType: 'default' | 'platform' | 'upload' | 'url', iconVariant?: string, customUrl?: string, uploadedUrl?: string) => void
  className?: string
}

// Default icons for each category
const DEFAULT_CATEGORY_ICONS = {
  personal: ExternalLink,
  projects: Github,
  blogs: BookOpen,
  achievements: Award,
  contact: Mail,
  social: Globe,
  custom: LinkIcon
}

export default function UniversalIconSelector({
  category,
  url,
  currentIconType,
  currentIconVariant,
  customIconUrl,
  uploadedIconUrl,
  onIconChange,
  className = ''
}: UniversalIconSelectorProps) {
  const [iconType, setIconType] = useState<'default' | 'platform' | 'upload' | 'url'>(currentIconType)
  const [selectedVariant, setSelectedVariant] = useState(currentIconVariant || 'default')
  const [customUrl, setCustomUrl] = useState(customIconUrl || '')
  const [uploadedUrl, setUploadedUrl] = useState(uploadedIconUrl || '')
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [previewError, setPreviewError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuthStore()

  // Detect platform from URL for social media
  const detectedPlatform = url ? detectPlatformFromUrl(url) : null
  const platformConfig = detectedPlatform ? SOCIAL_PLATFORMS[detectedPlatform] : null

  useEffect(() => {
    setIconType(currentIconType)
    setSelectedVariant(currentIconVariant || 'default')
    setCustomUrl(customIconUrl || '')
    setUploadedUrl(uploadedIconUrl || '')
  }, [currentIconType, currentIconVariant, customIconUrl, uploadedIconUrl])

  const handleIconTypeChange = (newType: 'default' | 'platform' | 'upload' | 'url') => {
    setIconType(newType)
    setPreviewError(false)
    
    console.log('Icon type changed to:', newType)
    
    if (newType === 'default') {
      onIconChange('default')
    } else if (newType === 'platform' && platformConfig) {
      onIconChange('platform', selectedVariant)
    } else if (newType === 'upload' && uploadedUrl) {
      onIconChange('upload', undefined, undefined, uploadedUrl)
    } else if (newType === 'url' && customUrl && isValidUrl) {
      onIconChange('url', undefined, customUrl)
    } else {
      // For cases where we don't have the data yet, still notify parent
      onIconChange(newType, selectedVariant, customUrl, uploadedUrl)
    }
  }

  const handleVariantChange = (variant: string) => {
    setSelectedVariant(variant)
    console.log('Icon variant changed to:', variant)
    onIconChange('platform', variant)
  }

  const handleCustomUrlChange = (newUrl: string) => {
    setCustomUrl(newUrl)
    setPreviewError(false)
    
    // Basic URL validation
    const urlPattern = /^https?:\/\/.+\.(png|jpg|jpeg|svg|webp)(\?.*)?$/i
    const valid = !newUrl || urlPattern.test(newUrl)
    setIsValidUrl(valid)
    
    console.log('Custom URL changed to:', newUrl, 'Valid:', valid)
    
    if (valid && newUrl) {
      onIconChange('url', undefined, newUrl)
    } else if (!newUrl) {
      // Clear custom URL
      onIconChange('url', undefined, undefined)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `link-icons/${user?.id}/${fileName}`

      // Check if bucket exists by trying to list files
      const bucketCheck = await supabase.storage
        .from('user-uploads')
        .list('', { limit: 1 })

      if (bucketCheck.error) {
        console.warn('Storage bucket check failed:', bucketCheck.error.message)
        toast.error('Storage bucket not available. Please check your Supabase configuration.')
        throw new Error('Storage bucket not configured correctly')
      }

      const { data, error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file)

      if (error) {
        console.error('Upload error details:', error)
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          toast.error('Storage bucket not available. Please contact support.')
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          toast.error('You don\'t have permission to upload files. Please contact support.')
        } else {
          toast.error(`Upload failed: ${error.message}`)
        }
        throw error
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        toast.error('Failed to get image URL')
        throw new Error('Failed to get public URL for uploaded file')
      }

      setUploadedUrl(urlData.publicUrl)
      onIconChange('upload', undefined, undefined, urlData.publicUrl)
      toast.success('Icon uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      // More specific error already shown from within try block
    } finally {
      setUploading(false)
    }
  }

  const handleImageError = () => {
    setPreviewError(true)
  }

  const DefaultIcon = DEFAULT_CATEGORY_ICONS[category]

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-1">
        <Label className="text-sm font-medium text-white font-sharp-grotesk">
          Icon Selection
        </Label>
        <p className="text-xs text-[#7a7a83] font-sharp-grotesk">
          Choose how you want to display your link icon
        </p>
      </div>

      <RadioGroup
        value={iconType}
        onValueChange={handleIconTypeChange}
        className="space-y-4"
      >
        {/* Default Icon Option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="default" />
            <Label htmlFor="default" className="text-sm font-medium text-white font-sharp-grotesk">
              Use Default Icon
            </Label>
          </div>
          
          {iconType === 'default' && (
            <div className="ml-6 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
                <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                  <DefaultIcon className="w-4 h-4 text-[#54E0FF]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white font-sharp-grotesk">Default Icon</p>
                  <p className="text-xs text-[#7a7a83] font-sharp-grotesk">Category default</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Platform Icons Option (for social media) */}
        {category === 'social' && platformConfig && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="platform" id="platform" />
              <Label htmlFor="platform" className="text-sm font-medium text-white font-sharp-grotesk">
                Use {platformConfig.displayName} Icons
              </Label>
            </div>
            
            {iconType === 'platform' && (
              <div className="ml-6 space-y-3">
                <p className="text-xs text-[#7a7a83] font-sharp-grotesk">
                  Choose from available {platformConfig.displayName} icon styles:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {platformConfig.iconVariants.map((variant) => (
                    <button
                      key={variant}
                      onClick={() => handleVariantChange(variant)}
                      className={`relative p-3 rounded-lg border transition-all ${
                        selectedVariant === variant
                          ? 'border-[#54E0FF] bg-[#54E0FF]/10'
                          : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#54E0FF]/50'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
                        <Image
                          src={`/icons/${detectedPlatform}/${variant}.png`}
                          alt={`${platformConfig.displayName} ${variant}`}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <p className="text-xs text-[#7a7a83] font-sharp-grotesk capitalize">
                        {variant.replace(/\d+$/, '')} {variant.match(/\d+$/)?.[0] || ''}
                      </p>
                      {selectedVariant === variant && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#54E0FF] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#18181a]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Custom Icon Option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload" className="text-sm font-medium text-white font-sharp-grotesk">
              Upload Custom Icon
            </Label>
          </div>
          
          {iconType === 'upload' && (
            <div className="ml-6 space-y-3">
              <div>
                <Label htmlFor="icon-upload" className="text-xs text-[#7a7a83] font-sharp-grotesk">
                  Upload Icon (PNG, JPG, SVG, WebP - Max 2MB)
                </Label>
                <div className="mt-1">
                  <Input
                    id="icon-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white file:bg-[#54E0FF]/10 file:text-[#54E0FF] file:border-0 file:rounded-md file:px-3 file:py-1"
                  />
                </div>
                {uploading && (
                  <p className="text-xs text-[#54E0FF] mt-1 font-sharp-grotesk">
                    Uploading...
                  </p>
                )}
              </div>
              
              {/* Upload Preview */}
              {uploadedUrl && (
                <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                    <Image
                      src={uploadedUrl}
                      alt="Uploaded icon preview"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white font-sharp-grotesk">Uploaded Icon</p>
                    <p className="text-xs text-[#7a7a83] font-sharp-grotesk">Ready to use</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom URL Icon Option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="url" id="url" />
            <Label htmlFor="url" className="text-sm font-medium text-white font-sharp-grotesk">
              Use Icon URL
            </Label>
          </div>
          
          {iconType === 'url' && (
            <div className="ml-6 space-y-3">
              <div>
                <Label htmlFor="custom-url" className="text-xs text-[#7a7a83] font-sharp-grotesk">
                  Icon URL (PNG, JPG, SVG, WebP)
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="custom-url"
                    type="url"
                    value={customUrl}
                    onChange={(e) => handleCustomUrlChange(e.target.value)}
                    placeholder="https://example.com/icon.png"
                    className={`bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#7a7a83] pr-10 ${
                      !isValidUrl ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {customUrl && (
                      isValidUrl ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )
                    )}
                  </div>
                </div>
                {!isValidUrl && customUrl && (
                  <p className="text-xs text-red-400 mt-1 font-sharp-grotesk">
                    Please enter a valid image URL
                  </p>
                )}
              </div>
              
              {/* URL Preview */}
              {customUrl && isValidUrl && (
                <div className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a]">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                    {!previewError ? (
                      <Image
                        src={customUrl}
                        alt="Custom icon preview"
                        width={32}
                        height={32}
                        className="w-full h-full object-contain"
                        onError={handleImageError}
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-[#7a7a83]" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white font-sharp-grotesk">Custom Icon</p>
                    <p className="text-xs text-[#7a7a83] font-sharp-grotesk">Preview</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </RadioGroup>
    </div>
  )
}
