'use client'

import React, { useState, useEffect } from 'react'
import { X, Globe, Github, Linkedin, Twitter, Mail, BookOpen, Award, User, Share2, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LinkService, CreateLinkData, UpdateLinkData, LinkCategory, LINK_CATEGORIES, PLATFORM_CONFIGS } from '@/lib/services/link-service'
import { ApiLinkService } from '@/lib/services/api-link-service'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { UniversalIconSelector } from '@/components/universal-icon-selector'
import { detectPlatformFromUrl } from '@/lib/config/social-icons'

interface AddLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editLink?: {
    id: string
    title: string
    url: string
    description?: string
    icon_type: string
    category: LinkCategory
  } | null
}

export function AddLinkModal({ isOpen, onClose, onSuccess, editLink }: AddLinkModalProps) {
  const { user, session } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    icon_type: 'link',
    category: 'personal' as LinkCategory,
    // Universal icon fields
    custom_icon_url: '',
    uploaded_icon_url: '',
    icon_variant: 'default',
    use_custom_icon: false,
    icon_selection_type: 'default' as 'default' | 'platform' | 'upload' | 'url'
  })

  useEffect(() => {
    if (isOpen) {
      setLoading(false) // Reset loading state when modal opens
      if (editLink && editLink.id && editLink.id.trim() !== '') {
        console.log('🔍 EditLink object received:', editLink)
        console.log('EditLink ID:', editLink.id)
        setFormData({
          title: editLink.title,
          url: editLink.url,
          description: editLink.description || '',
          icon_type: editLink.icon_type,
          category: editLink.category,
          // Universal icon fields from edit data
          custom_icon_url: (editLink as any).custom_icon_url || '',
          uploaded_icon_url: (editLink as any).uploaded_icon_url || '',
          icon_variant: (editLink as any).icon_variant || 'default',
          use_custom_icon: (editLink as any).use_custom_icon || false,
          icon_selection_type: (editLink as any).icon_selection_type || 'default'
        })
      } else {
        setFormData({
          title: '',
          url: '',
          description: '',
          icon_type: 'link',
          category: 'personal',
          // Reset social media icon fields
          custom_icon_url: '',
          icon_variant: 'default',
          use_custom_icon: false
        })
      }
    }
  }, [editLink, isOpen])

  const handleClose = () => {
    setLoading(false) // Reset loading state
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error('User not authenticated')
      return
    }

    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Title and URL are required')
      return
    }

    try {
      setLoading(true)
      console.log('🚀 Starting save operation...', {
        editMode: !!editLink,
        user: user,
        session: session,
        userId: user?.id,
        sessionUserId: session?.user?.id,
        formData: {
          ...formData,
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || undefined
        }
      })

      if (!user || !user.id) {
        throw new Error('User not authenticated or user ID missing')
      }

      if (editLink && editLink.id && editLink.id.trim() !== '') {
        // Update existing link
        console.log('📝 Updating existing link:', editLink.id)
        console.log('📝 EditLink object:', editLink)

        const updateData = {
          id: editLink.id,
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || undefined,
          icon_type: formData.icon_type,
          category: formData.category
        }

        console.log('📝 Update data being sent:', updateData)

        const result = await ApiLinkService.updateLink(user.id, updateData)
        console.log('✅ Update successful:', result)
        toast.success('Link updated successfully!')
      } else {
        // Create new link
        console.log('➕ Creating new link...')
        const linkData = {
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || undefined,
          icon_type: formData.icon_type,
          category: formData.category,
          // Include universal icon data
          custom_icon_url: formData.custom_icon_url || undefined,
          uploaded_icon_url: formData.uploaded_icon_url || undefined,
          icon_variant: formData.icon_variant,
          use_custom_icon: formData.use_custom_icon,
          icon_selection_type: formData.icon_selection_type
        }

        const result = await ApiLinkService.createLink(user.id, linkData)
        console.log('✅ Create successful:', result)
        toast.success('Link added successfully!')
      }

      // Reset form and close modal
      setFormData({
        title: '',
        url: '',
        description: '',
        icon_type: 'link',
        category: 'personal',
        custom_icon_url: '',
        uploaded_icon_url: '',
        icon_variant: 'default',
        use_custom_icon: false,
        icon_selection_type: 'default'
      })

      console.log('🔄 Calling onSuccess and onClose...')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('❌ Error saving link:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      })
      const errorMessage = error?.message || 'Failed to save link. Please check the console for details.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      console.log('🏁 Save operation completed, loading set to false')
    }
  }

  const handlePlatformSelect = (platform: string) => {
    const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]
    if (config) {
      setFormData(prev => ({
        ...prev,
        icon_type: platform,
        category: config.category,
        // Only update URL if it's empty or doesn't start with http
        url: prev.url && prev.url.startsWith('http') ? prev.url : config.baseUrl
      }))
    } else {
      // For platforms not in config, just update icon
      setFormData(prev => ({
        ...prev,
        icon_type: platform
      }))
    }
  }

  const handleIconChange = (
    iconType: 'default' | 'platform' | 'upload' | 'url',
    iconVariant?: string,
    customUrl?: string,
    uploadedUrl?: string
  ) => {
    setFormData(prev => ({
      ...prev,
      icon_selection_type: iconType,
      use_custom_icon: iconType !== 'default' && iconType !== 'platform',
      icon_variant: iconVariant || 'default',
      custom_icon_url: customUrl || '',
      uploaded_icon_url: uploadedUrl || ''
    }))
  }

  // Auto-detect social media URLs and suggest category
  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, url }))

    // If URL is detected as a social platform and category is not already social, suggest it
    if (url && detectPlatformFromUrl(url) && formData.category !== 'social') {
      // Auto-set to social category for better UX
      setFormData(prev => ({ ...prev, category: 'social' }))
    }
  }

  const getIcon = (iconType: string) => {
    const icons = {
      github: Github,
      linkedin: Linkedin,
      twitter: Twitter,
      email: Mail,
      website: Globe,
      'dev-to': BookOpen,
      medium: BookOpen,
      hashnode: BookOpen,
      stackoverflow: BookOpen,
      leetcode: Award,
      portfolio: Globe,
      link: LinkIcon
    }
    const IconComponent = icons[iconType as keyof typeof icons] || LinkIcon
    return <IconComponent className="w-4 h-4" />
  }

  // Popular platforms with distinct icons
  const POPULAR_PLATFORMS = [
    { key: 'github', icon: Github, label: 'GitHub' },
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
    { key: 'twitter', icon: Twitter, label: 'Twitter' },
    { key: 'email', icon: Mail, label: 'Email' },
    { key: 'website', icon: Globe, label: 'Website' },
    { key: 'dev-to', icon: BookOpen, label: 'Dev.to' },
    { key: 'medium', icon: BookOpen, label: 'Medium' },
    { key: 'hashnode', icon: BookOpen, label: 'Hashnode' },
    { key: 'leetcode', icon: Award, label: 'LeetCode' },
    { key: 'link', icon: LinkIcon, label: 'Custom' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glassmorphic rounded-[20px] shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] w-full max-w-md max-h-[90vh] min-h-[400px] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#2a2a2a] flex-shrink-0">
          <h2 className="text-[20px] font-medium leading-[24px] tracking-[-0.6px] font-sharp-grotesk text-white">
            {editLink && editLink.id && editLink.id.trim() !== '' ? 'Edit Link' : 'Add New Link'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-[#7a7a83] hover:text-white"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar min-h-0">
          <form id="link-form" onSubmit={handleSubmit} className="space-y-4 pb-4">
          {/* Platform Quick Select */}
          <div>
            <label className="text-[14px] font-medium text-white font-sharp-grotesk mb-2 block">
              Platform (Optional)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {POPULAR_PLATFORMS.map(({ key, icon: IconComponent, label }) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlatformSelect(key)}
                  className={`border-[#2a2a2a] hover:border-[#54E0FF]/50 flex flex-col items-center gap-1 h-auto py-2 px-1 ${
                    formData.icon_type === key ? 'border-[#54E0FF] bg-[#54E0FF]/10' : ''
                  }`}
                  title={label}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-[9px] text-[#7a7a83] text-center leading-tight">{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[14px] font-medium text-white font-sharp-grotesk mb-2 block">
              Category *
            </label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as LinkCategory }))}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                {Object.entries(LINK_CATEGORIES).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-white hover:bg-[#2a2a2a]">
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="text-[14px] font-medium text-white font-sharp-grotesk mb-2 block">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., My GitHub Profile"
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#7a7a83]"
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="text-[14px] font-medium text-white font-sharp-grotesk mb-2 block">
              URL *
            </label>
            <Input
              value={formData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://github.com/username"
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#7a7a83]"
              required
              type="url"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[14px] font-medium text-white font-sharp-grotesk mb-2 block">
              Description (Optional)
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this link..."
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#7a7a83] resize-none"
              rows={3}
            />
          </div>

          {/* Universal Icon Selection */}
          {formData.url && (
            <div className="space-y-2">
              <UniversalIconSelector
                category={formData.category}
                url={formData.url}
                currentIconType={formData.icon_selection_type}
                currentIconVariant={formData.icon_variant}
                customIconUrl={formData.custom_icon_url}
                uploadedIconUrl={formData.uploaded_icon_url}
                onIconChange={handleIconChange}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4"
              />
            </div>
          )}

          {/* Helpful message for social media links */}
          {formData.url && detectPlatformFromUrl(formData.url) && formData.category !== 'social' && (
            <div className="bg-[#54E0FF]/10 border border-[#54E0FF]/30 rounded-lg p-3">
              <p className="text-sm text-[#54E0FF] font-sharp-grotesk">
                💡 This looks like a social media link! Set the category to "Social Media" to access platform-specific icons.
              </p>
            </div>
          )}

          </form>
        </div>

        {/* Fixed Action Buttons */}
        <div className="flex gap-3 p-6 pt-4 border-t border-[#2a2a2a] flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 border-[#2a2a2a] text-[#7a7a83] hover:text-white hover:border-[#54E0FF]/50"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="link-form"
            disabled={loading || !formData.title || !formData.url}
            className="flex-1 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:opacity-90"
          >
            {loading ? 'Saving...' : (editLink && editLink.id && editLink.id.trim() !== '') ? 'Update Link' : 'Add Link'}
          </Button>
        </div>
      </div>
    </div>
  )
}
