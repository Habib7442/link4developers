'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { ProfileService } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { LivePreview } from '@/components/dashboard/live-preview'
import { User, Save, ExternalLink, Camera, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileFormData {
  full_name: string
  profile_title: string
  bio: string
  profile_slug: string
  github_username: string
  github_url: string
  website_url: string
  location: string
  company: string
  twitter_username: string
  linkedin_url: string
  avatar_url: string | null
  is_public: boolean
}

export function ProfileEditor() {
  const { user, updateProfile } = useAuthStore()
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    profile_title: '',
    bio: '',
    profile_slug: '',
    github_username: '',
    github_url: '',
    website_url: '',
    location: '',
    company: '',
    twitter_username: '',
    linkedin_url: '',
    avatar_url: null,
    is_public: true
  })
  const [isLoading, setSaving] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [previewRefresh, setPreviewRefresh] = useState(0)

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        profile_title: user.profile_title || '',
        bio: user.bio || '',
        profile_slug: user.profile_slug || '',
        github_username: user.github_username || '',
        github_url: user.github_url || '',
        website_url: user.website_url || '',
        location: user.location || '',
        company: user.company || '',
        twitter_username: user.twitter_username || '',
        linkedin_url: user.linkedin_url || '',
        avatar_url: user.avatar_url || null,
        is_public: user.is_public ?? true
      })
    }
  }, [user])

  // Check slug availability with debounce
  useEffect(() => {
    if (!formData.profile_slug || formData.profile_slug === user?.profile_slug) {
      setSlugAvailable(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setCheckingSlug(true)
      try {
        const available = await ProfileService.isSlugAvailable(formData.profile_slug, user?.id)
        setSlugAvailable(available)
      } catch (error) {
        console.error('Error checking slug availability:', error)
      } finally {
        setCheckingSlug(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.profile_slug, user?.profile_slug, user?.id])

  const handleInputChange = (field: keyof ProfileFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: avatarUrl
    }))

    // Also update the user in auth store immediately for UI consistency
    if (user) {
      updateProfile({ avatar_url: avatarUrl })
    }
  }

  const generateSlugFromName = () => {
    const slug = formData.full_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    if (slug) {
      handleInputChange('profile_slug', slug)
    }
  }

  const handleSave = async () => {
    if (!user) return

    // Validation
    if (!formData.full_name.trim()) {
      toast.error('Please enter your full name')
      return
    }

    if (!formData.profile_slug.trim()) {
      toast.error('Please enter a profile URL slug')
      return
    }

    if (slugAvailable === false) {
      toast.error('This profile URL is already taken. Please choose another.')
      return
    }

    setSaving(true)
    try {
      const updatedUser = await ProfileService.updateUserProfile(user.id, formData)
      
      if (updatedUser) {
        // Update the auth store with new user data
        await updateProfile(formData)
        // Trigger preview refresh
        setPreviewRefresh(prev => prev + 1)
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#54E0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        
        {/* Basic Information */}
        <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
          <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-6">
            Basic Information
          </h2>
          
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full bg-[#28282b] border border-[#33373b] rounded-[8px] px-4 py-3 text-white font-sharp-grotesk text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            {/* Profile Title */}
            <div>
              <label className="block text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                Profile Title
              </label>
              <input
                type="text"
                value={formData.profile_title}
                onChange={(e) => handleInputChange('profile_title', e.target.value)}
                className="w-full bg-[#28282b] border border-[#33373b] rounded-[8px] px-4 py-3 text-white font-sharp-grotesk text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                placeholder="e.g., Full Stack Developer, Frontend Engineer"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full bg-[#28282b] border border-[#33373b] rounded-[8px] px-4 py-3 text-white font-sharp-grotesk text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors resize-none thin-scrollbar"
                placeholder="Tell visitors about yourself, your skills, and what you're passionate about..."
              />
              <p className="text-[12px] text-[#7a7a83] font-sharp-grotesk mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Profile URL */}
            <div>
              <label className="block text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                Profile URL *
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-[#28282b] border border-[#33373b] rounded-[8px] overflow-hidden">
                  <span className="px-4 py-3 text-[#7a7a83] font-sharp-grotesk text-[14px] border-r border-[#33373b]">
                    link4coders.com/
                  </span>
                  <input
                    type="text"
                    value={formData.profile_slug}
                    onChange={(e) => handleInputChange('profile_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 bg-transparent px-4 py-3 text-white font-sharp-grotesk text-[14px] focus:outline-none"
                    placeholder="your-username"
                  />
                </div>
                <Button
                  onClick={generateSlugFromName}
                  className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF]/30 px-3 py-2 text-[12px]"
                >
                  Generate
                </Button>
              </div>
              
              {/* Slug availability indicator */}
              {formData.profile_slug && formData.profile_slug !== user.profile_slug && (
                <div className="flex items-center gap-2 mt-2">
                  {checkingSlug ? (
                    <div className="w-4 h-4 border-2 border-[#54E0FF] border-t-transparent rounded-full animate-spin" />
                  ) : slugAvailable === true ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : slugAvailable === false ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : null}
                  
                  <span className={`text-[12px] font-sharp-grotesk ${
                    checkingSlug ? 'text-[#7a7a83]' :
                    slugAvailable === true ? 'text-green-500' :
                    slugAvailable === false ? 'text-red-500' : 'text-[#7a7a83]'
                  }`}>
                    {checkingSlug ? 'Checking availability...' :
                     slugAvailable === true ? 'Available!' :
                     slugAvailable === false ? 'Already taken' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Upload Section */}
        <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
          <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-6">
            Profile Picture
          </h2>

          <div className="flex items-start gap-6">
            <AvatarUpload
              currentAvatarUrl={formData.avatar_url}
              onAvatarUpdate={handleAvatarUpdate}
              size="lg"
            />
            <div className="flex-1">
              <p className="text-[14px] font-light text-[#7a7a83] font-sharp-grotesk mb-3">
                Upload a profile picture to make your profile more personal and recognizable.
              </p>
              <ul className="text-[12px] font-light text-[#7a7a83] font-sharp-grotesk space-y-1 mb-4">
                <li>• Recommended size: 200x200px or larger</li>
                <li>• Supported formats: JPEG, PNG, WebP, GIF</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Image will be automatically cropped to square</li>
              </ul>

              {formData.avatar_url && (
                <Button
                  onClick={async () => {
                    try {
                      setSaving(true)
                      const { error } = await ProfileService.updateUserProfile(user!.id, { avatar_url: null })
                      if (error) throw error
                      handleAvatarUpdate(null)
                      toast.success('Avatar removed successfully!')
                    } catch (error) {
                      console.error('Remove avatar error:', error)
                      toast.error('Failed to remove avatar')
                    } finally {
                      setSaving(false)
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-400/20 hover:bg-red-400/10 hover:border-red-400/40"
                >
                  Remove Avatar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
          <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-6">
            Professional Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company */}
            <div>
              <label className="block text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full bg-[#28282b] border border-[#33373b] rounded-[8px] px-4 py-3 text-white font-sharp-grotesk text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                placeholder="Your current company"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full bg-[#28282b] border border-[#33373b] rounded-[8px] px-4 py-3 text-white font-sharp-grotesk text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                placeholder="City, Country"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isLoading || slugAvailable === false}
            className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:from-[#29ADFF] hover:to-[#54E0FF] font-medium text-[16px] tracking-[-0.48px] font-sharp-grotesk rounded-[12px] px-8 py-3 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#18181a] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
    </div>
  )
}
