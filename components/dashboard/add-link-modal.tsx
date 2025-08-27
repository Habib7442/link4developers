'use client'

import React, { useState, useEffect } from 'react'
import { X, Globe, Github, Linkedin, Twitter, Mail, BookOpen, Award, User, Share2, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LinkService, CreateLinkData, UpdateLinkData } from '@/lib/services/link-service'
import { LinkCategory } from '@/lib/domain/entities'
import { LINK_CATEGORIES, PLATFORM_CONFIGS } from '@/lib/services/link-constants'
import { ApiLinkService } from '@/lib/services/api-link-service'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import UniversalIconSelector from '@/components/universal-icon-selector'
import { detectPlatformFromUrl } from '@/lib/config/social-icons'
import { checkUserUploadsBucket } from '@/lib/utils/storage-setup'
import { supabase } from '@/lib/supabase'

interface AddLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultCategory?: LinkCategory
  editLink?: {
    id: string
    title: string
    url: string
    description?: string
    icon_type: string
    category: LinkCategory
    live_project_url?: string
    // Universal icon fields
    custom_icon_url?: string
    uploaded_icon_url?: string
    icon_variant?: string
    use_custom_icon?: boolean
    icon_selection_type?: 'default' | 'platform' | 'upload' | 'url'
    platform_detected?: string
  } | null
}

export function AddLinkModal({ isOpen, onClose, onSuccess, defaultCategory, editLink }: AddLinkModalProps) {
  const { user, session } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [bucketStatus, setBucketStatus] = useState<{ checked: boolean, exists: boolean, error: string | null }>({
    checked: false,
    exists: false,
    error: null
  })
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
    icon_selection_type: 'default' as 'default' | 'platform' | 'upload' | 'url',
    platform_detected: '',
    // GitHub Projects specific field
    live_project_url: ''
  })

  // Helper function to validate and set form data
  const setValidatedFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates }
      // Ensure category is always valid
      if (!newData.category || !Object.keys(LINK_CATEGORIES).includes(newData.category)) {
        newData.category = 'personal'
      }
      return newData
    })
  }

  // Helper function to safely validate a URL
  const isValidUrl = (urlString?: string): boolean => {
    if (!urlString || urlString.trim() === '') return false;
    
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  // Form validation function for all required fields and format checks
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Required fields validation
    if (!formData.title.trim()) {
      errors.push('Title is required')
    } else if (formData.title.length > 100) {
      errors.push('Title must be less than 100 characters')
    }

    if (!formData.url.trim()) {
      errors.push('URL is required')
    } else if (!isValidUrl(formData.url)) {
      errors.push('Please enter a valid URL (e.g., https://example.com)')
    }

    // Description length check
    if (formData.description && formData.description.length > 200) {
      errors.push('Description must be less than 200 characters')
    }

    // Live project URL validation (only for projects category)
    if (formData.category === 'projects' && 
        formData.live_project_url && 
        formData.live_project_url.trim() !== '' && 
        !isValidUrl(formData.live_project_url)) {
      errors.push('Please enter a valid Live Project URL or leave it empty')
    }

    // Check custom URL or upload icon validation when selected
    if (formData.icon_selection_type === 'url' && !formData.custom_icon_url.trim()) {
      errors.push('Please provide a valid icon URL or select a different icon type')
    } else if (formData.icon_selection_type === 'url' && formData.custom_icon_url.trim()) {
      // Validate custom icon URL format
      if (!isValidUrl(formData.custom_icon_url)) {
        errors.push('Please enter a valid custom icon URL (must start with https://)')
      } else {
        // Check if it's an image URL
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']
        const hasImageExtension = imageExtensions.some(ext => 
          formData.custom_icon_url.toLowerCase().includes(ext)
        )
        if (!hasImageExtension) {
          errors.push('Custom icon URL must point to an image file (png, jpg, jpeg, svg, webp, gif)')
        }
      }
    }

    if (formData.icon_selection_type === 'upload' && !formData.uploaded_icon_url.trim()) {
      errors.push('Please upload an icon or select a different icon type')
    }

    // Validate icon variant format
    if (formData.icon_variant && !/^[a-z0-9_-]+$/.test(formData.icon_variant)) {
      errors.push('Icon variant contains invalid characters')
    }

    // Validate platform detected format
    if (formData.platform_detected && !/^[a-z0-9_-]*$/.test(formData.platform_detected)) {
      errors.push('Platform detected contains invalid characters')
    }

    return { 
      isValid: errors.length === 0,
      errors 
    }
  }

  useEffect(() => {
    if (isOpen) {
      setLoading(false) // Reset loading state when modal opens
      
      // Check if user-uploads bucket exists
      const checkBucket = async () => {
        try {
          // Check if bucket exists
          const exists = await checkUserUploadsBucket()
          setBucketStatus({
            checked: true,
            exists,
            error: exists ? null : 'User uploads bucket not available'
          })
        } catch (error) {
          setBucketStatus({
            checked: true,
            exists: false,
            error: (error as Error).message || 'Error checking bucket status'
          })
        }
      }
      
      checkBucket()
      
      if (editLink && editLink.id && editLink.id.trim() !== '') {
        console.log('🔍 EditLink object received:', editLink)
        console.log('EditLink ID:', editLink.id)
        setValidatedFormData({
          title: editLink.title,
          url: editLink.url,
          description: editLink.description || '',
          icon_type: editLink.icon_type,
          category: editLink.category,
          // Universal icon fields from edit data
          custom_icon_url: editLink.custom_icon_url || '',
          uploaded_icon_url: editLink.uploaded_icon_url || '',
          icon_variant: editLink.icon_variant || 'default',
          use_custom_icon: editLink.use_custom_icon || false,
          icon_selection_type: editLink.icon_selection_type || 'default',
          platform_detected: editLink.platform_detected || '',
          // GitHub Projects specific field
          live_project_url: editLink.live_project_url || ''
        })
      } else {
        const selectedCategory = defaultCategory || 'personal'
        console.log('🎯 Modal opened with defaultCategory:', defaultCategory, 'Using category:', selectedCategory)
        setValidatedFormData({
          title: '',
          url: '',
          description: '',
          icon_type: 'link',
          category: selectedCategory,
          // Reset social media icon fields
          custom_icon_url: '',
          uploaded_icon_url: '',
          icon_variant: 'default',
          use_custom_icon: false,
          icon_selection_type: 'default',
          platform_detected: '',
          // GitHub Projects specific field
          live_project_url: ''
        })
      }
    }
  }, [editLink, isOpen, defaultCategory])

  // Function to reset form to initial state
  const resetForm = (keepCategory = false) => {
    setFormData({
      title: '',
      url: '',
      description: '',
      icon_type: 'link',
      category: keepCategory ? (defaultCategory || 'personal') : 'personal',
      custom_icon_url: '',
      uploaded_icon_url: '',
      icon_variant: 'default',
      use_custom_icon: false,
      icon_selection_type: 'default',
      platform_detected: '',
      live_project_url: ''
    })
  }

  const handleClose = () => {
    // Force reset loading state when closing
    setLoading(false)
    
    // Reset form to clean state
    resetForm(false) // Don't keep category when closing
    
    console.log('➕ Modal closed, state reset')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submissions
    if (loading) {
      console.log('⏳ Form already submitting, ignoring duplicate submission')
      return
    }

    if (!user?.id) {
      toast.error('User not authenticated')
      return
    }

    // Run full form validation
    const validation = validateForm()
    if (!validation.isValid) {
      // Show toast with the first error
      toast.error(validation.errors[0])
      // Could also show all errors in UI if needed
      console.error('Validation errors:', validation.errors)
      return
    }

    let isSubmissionSuccessful = false
    
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
        const updateData: UpdateLinkData = {
          id: editLink.id,
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || undefined,
          icon_type: formData.icon_type,
          category: formData.category,
          // Include universal icon data - ensure all fields are properly included
          custom_icon_url: formData.custom_icon_url ? formData.custom_icon_url.trim() : undefined,
          uploaded_icon_url: formData.uploaded_icon_url ? formData.uploaded_icon_url.trim() : undefined,
          icon_variant: formData.icon_variant || 'default',
          use_custom_icon: formData.use_custom_icon || false,
          icon_selection_type: formData.icon_selection_type || 'default',
          platform_detected: formData.platform_detected || undefined,
          // GitHub Projects specific field - only include if not empty
          live_project_url: formData.live_project_url && formData.live_project_url.trim() ? formData.live_project_url.trim() : undefined
        }

        // Log the data being sent to help with debugging
        console.log('📤 Sending update data to API:', JSON.stringify(updateData, null, 2))
        
        // Fix: Pass the correct parameters to updateLink (userId, linkId, updates)
        const result = await ApiLinkService.updateLink(user.id, editLink.id, updateData)
        console.log('✅ Update successful:', result)
        toast.success('Link updated successfully!')
        isSubmissionSuccessful = true
      } else {
        // Create new link
        console.log('➕ Creating new link...')
        const linkData = {
          title: formData.title.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || undefined,
          icon_type: formData.icon_type,
          category: formData.category,
          // Include universal icon data - ensure all fields are properly included
          custom_icon_url: formData.custom_icon_url ? formData.custom_icon_url.trim() : undefined,
          uploaded_icon_url: formData.uploaded_icon_url ? formData.uploaded_icon_url.trim() : undefined,
          icon_variant: formData.icon_variant || 'default',
          use_custom_icon: formData.use_custom_icon || false,
          icon_selection_type: formData.icon_selection_type || 'default',
          platform_detected: formData.platform_detected || undefined,
          // GitHub Projects specific field - only include if not empty
          live_project_url: formData.live_project_url && formData.live_project_url.trim() ? formData.live_project_url.trim() : undefined
        }

        // Log the data being sent to help with debugging
        console.log('📤 Sending link data to API:', JSON.stringify(linkData, null, 2))
        
        const result = await ApiLinkService.createLink(user.id, linkData)
        console.log('✅ Create successful:', result)
        toast.success('Link added successfully!')
        isSubmissionSuccessful = true
      }

      // Only proceed with cleanup if submission was successful
      if (isSubmissionSuccessful) {
        // Reset form and close modal
        resetForm(true) // Keep category when successful

        console.log('🔄 Calling onSuccess and onClose...')
        
        // Add a small delay to ensure toast is visible before modal closes
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 100)
      }
    } catch (error) {
      console.error('❌ Error saving link:', error)
      console.error('Error details:', {
        message: (error as Error)?.message,
        code: (error as unknown as { code?: string })?.code,
        details: (error as unknown as { details?: string })?.details,
        hint: (error as unknown as { hint?: string })?.hint,
        stack: (error as Error)?.stack
      })
      
      // Determine error message based on error type and code
      let errorMessage = 'Failed to save link. Please try again.'
      
      // Type guard to check if error has message property
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as Error & { code?: string };
        if (err.message.includes('validation')) {
          errorMessage = 'Please check all required fields and try again.'
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (err.code === '23505' || err.message.includes('already exists')) {
          errorMessage = 'A link with this URL already exists in this category.'
        } else if (err.code === '42703' || err.message.includes('column')) {
          errorMessage = 'There was a database schema error. Please contact support.'
        } else if (err.message.includes('timeout') || err.message.includes('aborted')) {
          errorMessage = 'The request timed out. Please try again.'
        } else if (err.code === '22P02') {
          errorMessage = 'Invalid input format. Please check your data.'
        } else if (err.message.includes('user') && err.message.includes('unauthorized')) {
          errorMessage = 'You are not authorized to perform this action. Please sign in again.'
          // Could also trigger an authentication refresh here
        } else {
          errorMessage = err.message
        }
      }
      
      // Check if error has details from API
      if (error && typeof error === 'object' && 'details' in error) {
        const apiError = error as { details?: string[]; fields?: string[] };
        if (apiError.details && Array.isArray(apiError.details)) {
          errorMessage = `Validation failed: ${apiError.details.join(', ')}`
        }
        if (apiError.fields && Array.isArray(apiError.fields)) {
          errorMessage += ` (Fields: ${apiError.fields.join(', ')})`
        }
      }
      
      toast.error(errorMessage)
      isSubmissionSuccessful = false
    } finally {
      // Always reset loading state, regardless of success or failure
      setLoading(false)
      console.log('🏁 Save operation completed, loading set to false')
    }
  }

  const handlePlatformSelect = (platform: string) => {
    const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS]
    if (config) {
      setValidatedFormData({
        icon_type: platform,
        category: config.category,
        // Only update URL if it's empty or doesn't start with http
        url: formData.url && formData.url.startsWith('http') ? formData.url : config.baseUrl
      })
    } else {
      // For platforms not in config, just update icon
      setValidatedFormData({
        icon_type: platform
      })
    }
  }

  const handleIconChange = (
    iconType: 'default' | 'platform' | 'upload' | 'url',
    iconVariant?: string,
    customUrl?: string,
    uploadedUrl?: string
  ) => {
    // Detect platform from current URL
    const detectedPlatform = formData.url ? detectPlatformFromUrl(formData.url) : null
    
    console.log('Icon change:', { iconType, iconVariant, customUrl, uploadedUrl, detectedPlatform })
    
    setValidatedFormData({
      icon_selection_type: iconType,
      use_custom_icon: iconType !== 'default' && iconType !== 'platform',
      icon_variant: iconVariant || 'default',
      custom_icon_url: customUrl || '',
      uploaded_icon_url: uploadedUrl || '',
      platform_detected: detectedPlatform || ''
    })
  }

  // Auto-detect social media URLs and suggest category
  const handleUrlChange = (url: string) => {
    // Detect platform from URL
    const detectedPlatform = url ? detectPlatformFromUrl(url) : null
    
    // Update form data with URL and detected platform
    setValidatedFormData({ 
      url,
      platform_detected: detectedPlatform || ''
    })
    
    // Skip further processing if URL is empty or invalid
    if (!url.trim() || !isValidUrl(url)) {
      // Invalid URL - no category changes
      return
    }

    // Only auto-detect and change category if:
    // 1. There's no defaultCategory (modal opened from general Add Link button)
    // 2. Current category is 'personal' (default fallback)
    // 3. URL is detected as a social platform
    if (!defaultCategory && formData.category === 'personal' && detectedPlatform) {
      // Auto-set to social category for better UX, but only when appropriate
      console.log('🔍 Auto-detected social platform, setting category to social')
      setValidatedFormData({ 
        url,
        category: 'social',
        platform_detected: detectedPlatform
      })
    }
    
    // Special case: GitHub URLs should go to projects category if no specific category is set
    if (!defaultCategory && formData.category === 'personal' && url && url.includes('github.com')) {
      console.log('🔍 Auto-detected GitHub URL, setting category to projects')
      setValidatedFormData({ 
        url,
        category: 'projects',
        platform_detected: detectedPlatform || ''
      })
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
            <Select 
              value={formData.category || 'personal'} 
              onValueChange={(value) => {
                console.log('📊 Category changed to:', value)
                // Validate that the value is a valid LinkCategory
                const validCategories = Object.keys(LINK_CATEGORIES) as LinkCategory[]
                if (value && validCategories.includes(value as LinkCategory)) {
                  setValidatedFormData({ category: value as LinkCategory })
                } else {
                  console.warn('Invalid category value received:', value, 'Keeping current:', formData.category)
                  // Set to a valid default if current category is also invalid
                  if (!validCategories.includes(formData.category)) {
                    setValidatedFormData({ category: 'personal' })
                  }
                }
              }}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                <SelectValue placeholder="Select a category" />
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
              onChange={(e) => setValidatedFormData({ title: e.target.value })}
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

          {/* Live Project URL - Only for GitHub Projects */}
          {formData.category === 'projects' && (
            <div>
              <label className="text-[14px] font-medium text-white font-sharp-grotesk mb-2 block">
                Live Project URL (Optional)
              </label>
              <Input
                value={formData.live_project_url}
                onChange={(e) => setValidatedFormData({ live_project_url: e.target.value })}
                placeholder="https://your-project-demo.com"
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#7a7a83]"
                type="url"
              />
              <p className="text-[12px] text-[#7a7a83] font-sharp-grotesk mt-1">
                Link to the live/deployed version of your project
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-[14px] font-medium text-white font-sharp-grotesk mb-2 block">
              Description (Optional)
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setValidatedFormData({ description: e.target.value })}
              placeholder="Brief description of this link..."
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#7a7a83] resize-none"
              rows={3}
            />
          </div>

          {/* Universal Icon Selection */}
          {formData.url && (
            <div className="space-y-2">
              {bucketStatus.checked && !bucketStatus.exists && (
                <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-xs">
                    Warning: Custom icon uploads require the user-uploads storage bucket, which is not available. 
                    Please run the migrations to enable this feature.
                  </p>
                </div>
              )}
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
          
          {/* Form validation errors */}
          {!validateForm().isValid && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-4">
              <h4 className="text-sm font-medium text-red-400 mb-1">Please fix the following issues:</h4>
              <ul className="list-disc pl-5 text-sm text-red-400">
                {validateForm().errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Helpful message for social media links */}
          {formData.url && detectPlatformFromUrl(formData.url) && formData.category !== 'social' && (
            <div className="bg-[#54E0FF]/10 border border-[#54E0FF]/30 rounded-lg p-3">
              <p className="text-sm text-[#54E0FF] font-sharp-grotesk">
                💡 This looks like a social media link! Set the category to &quot;Social Media&quot; to access platform-specific icons.
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
            disabled={loading || !validateForm().isValid}
            className="flex-1 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:opacity-90"
          >
            {loading ? 'Saving...' : (editLink && editLink.id && editLink.id.trim() !== '') ? 'Update Link' : 'Add Link'}
          </Button>
        </div>
      </div>
    </div>
  )
}
