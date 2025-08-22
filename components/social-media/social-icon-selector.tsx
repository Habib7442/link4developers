'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  SOCIAL_PLATFORMS,
  getSVGIcon,
  detectPlatformFromUrl,
  isValidIconUrl,
  getPlatformColor,
  getIconContent,
  isIconSVG
} from '@/lib/config/social-icons'
import { ExternalLink, Upload, Check, X } from 'lucide-react'
import Image from 'next/image'

interface SocialIconSelectorProps {
  url: string
  currentIconType: 'custom' | 'platform'
  currentIconVariant: string
  customIconUrl?: string
  onIconChange: (iconType: 'custom' | 'platform', iconVariant: string, customUrl?: string) => void
  className?: string
}

export function SocialIconSelector({
  url,
  currentIconType,
  currentIconVariant,
  customIconUrl,
  onIconChange,
  className = ''
}: SocialIconSelectorProps) {
  const [iconType, setIconType] = useState<'custom' | 'platform'>(currentIconType)
  const [selectedVariant, setSelectedVariant] = useState(currentIconVariant)
  const [customUrl, setCustomUrl] = useState(customIconUrl || '')
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [previewError, setPreviewError] = useState(false)

  // Detect platform from URL
  const detectedPlatform = detectPlatformFromUrl(url)
  const platformConfig = detectedPlatform ? SOCIAL_PLATFORMS[detectedPlatform] : null

  useEffect(() => {
    // Validate custom URL when it changes
    if (customUrl) {
      setIsValidUrl(isValidIconUrl(customUrl))
    } else {
      setIsValidUrl(true)
    }
    setPreviewError(false)
  }, [customUrl])

  const handleIconTypeChange = (newType: 'custom' | 'platform') => {
    setIconType(newType)
    if (newType === 'platform' && platformConfig) {
      const variant = selectedVariant || platformConfig.defaultIcon
      onIconChange(newType, variant)
    } else if (newType === 'custom' && customUrl && isValidUrl) {
      onIconChange(newType, 'custom', customUrl)
    }
  }

  const handleVariantChange = (variant: string) => {
    setSelectedVariant(variant)
    if (iconType === 'platform') {
      onIconChange(iconType, variant)
    }
  }

  const handleCustomUrlChange = (newUrl: string) => {
    setCustomUrl(newUrl)
    if (iconType === 'custom' && newUrl && isValidIconUrl(newUrl)) {
      onIconChange(iconType, 'custom', newUrl)
    }
  }

  const handleImageError = () => {
    setPreviewError(true)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium text-white font-sharp-grotesk">
          Icon Selection
        </Label>
        <p className="text-xs text-[#7a7a83] font-sharp-grotesk mt-1">
          Choose how you want to display your social media icon
        </p>
      </div>

      <RadioGroup
        value={iconType}
        onValueChange={handleIconTypeChange}
        className="space-y-4"
      >
        {/* Platform Icons Option */}
        {platformConfig && (
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
                      type="button"
                      onClick={() => handleVariantChange(variant)}
                      className={`
                        relative p-3 rounded-lg border-2 transition-all duration-200
                        ${selectedVariant === variant
                          ? 'border-[#54E0FF] bg-[#54E0FF]/10'
                          : 'border-[#2a2a2a] hover:border-[#54E0FF]/50'
                        }
                      `}
                    >
                      <div className="w-8 h-8 mx-auto flex items-center justify-center">
                        {(() => {
                          const iconContent = getIconContent(detectedPlatform!, variant)
                          if (isIconSVG(iconContent)) {
                            return (
                              <div
                                className="w-8 h-8"
                                style={{ color: platformConfig.color }}
                                dangerouslySetInnerHTML={{ __html: iconContent }}
                              />
                            )
                          } else {
                            return (
                              <Image
                                src={iconContent}
                                alt={`${platformConfig.displayName} ${variant}`}
                                width={32}
                                height={32}
                                className="w-8 h-8 object-contain"
                              />
                            )
                          }
                        })()}
                      </div>
                      <p className="text-xs mt-2 text-[#7a7a83] font-sharp-grotesk capitalize">
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

        {/* Custom Icon Option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="text-sm font-medium text-white font-sharp-grotesk">
              Use Custom Icon
            </Label>
          </div>
          
          {iconType === 'custom' && (
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
                {!isValidUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    Please enter a valid image URL (PNG, JPG, SVG, WebP)
                  </p>
                )}
              </div>

              {/* Custom Icon Preview */}
              {customUrl && isValidUrl && (
                <div className="space-y-2">
                  <Label className="text-xs text-[#7a7a83] font-sharp-grotesk">
                    Preview:
                  </Label>
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-lg border border-[#2a2a2a] overflow-hidden bg-[#1a1a1a]">
                      {!previewError ? (
                        <Image
                          src={customUrl}
                          alt="Custom icon preview"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <X className="w-4 h-4 text-[#7a7a83]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      {!previewError ? (
                        <p className="text-xs text-green-400 font-sharp-grotesk">
                          ✓ Icon loaded successfully
                        </p>
                      ) : (
                        <p className="text-xs text-red-400 font-sharp-grotesk">
                          ✗ Failed to load icon. Please check the URL.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#54E0FF]/10 border border-[#54E0FF]/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Upload className="w-4 h-4 text-[#54E0FF] mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-[#54E0FF] font-sharp-grotesk">
                    <p className="font-medium mb-1">Tips for custom icons:</p>
                    <ul className="space-y-1 text-[#54E0FF]/80">
                      <li>• Use square images (1:1 aspect ratio) for best results</li>
                      <li>• Recommended size: 64x64px or larger</li>
                      <li>• Ensure the URL is publicly accessible</li>
                      <li>• SVG format provides the best quality</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </RadioGroup>

      {/* Current Selection Summary */}
      <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white font-sharp-grotesk">
              Current Selection:
            </p>
            <p className="text-xs text-[#7a7a83] font-sharp-grotesk">
              {iconType === 'platform' && platformConfig
                ? `${platformConfig.displayName} - ${selectedVariant}`
                : iconType === 'custom' && customUrl
                ? 'Custom icon'
                : 'No icon selected'
              }
            </p>
          </div>
          
          {/* Preview of current selection */}
          <div className="w-8 h-8 rounded border border-[#2a2a2a] overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
            {iconType === 'platform' && platformConfig && detectedPlatform ? (
              (() => {
                const iconContent = getIconContent(detectedPlatform, selectedVariant)
                if (isIconSVG(iconContent)) {
                  return (
                    <div
                      className="w-6 h-6"
                      style={{ color: platformConfig.color }}
                      dangerouslySetInnerHTML={{ __html: iconContent }}
                    />
                  )
                } else {
                  return (
                    <Image
                      src={iconContent}
                      alt={`${platformConfig.displayName} preview`}
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                  )
                }
              })()
            ) : iconType === 'custom' && customUrl && isValidUrl && !previewError ? (
              <Image
                src={customUrl}
                alt="Selected icon"
                width={24}
                height={24}
                className="w-6 h-6 object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-4 h-4 bg-[#7a7a83] rounded" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
