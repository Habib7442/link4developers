'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { ProfileService } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { TechStackSelector } from '@/components/dashboard/tech-stack-selector'
import { toast } from 'sonner'
import { Lock, Loader2, User } from 'lucide-react'
import { checkProfileCompletion, getCompletionMessage } from '@/lib/utils/profile-completion'
import { useUpdateProfile } from '@/lib/hooks/use-dashboard-queries'

interface ProfileFormData {
  full_name: string
  profile_slug: string
  bio: string
  avatar_url?: string
  github_username?: string
  github_url?: string
  website_url?: string
  location?: string
  company?: string
  twitter_username?: string
  linkedin_url?: string
  profile_title?: string
  tech_stacks?: string[]
  [key: string]: string | string[] | boolean | undefined
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
    avatar_url: undefined,
    tech_stacks: []
  })
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [previewRefresh, setPreviewRefresh] = useState(0)

  // Use the React Query mutation hook
  const updateProfileMutation = useUpdateProfile()

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
        avatar_url: user.avatar_url || undefined,
        tech_stacks: (user.tech_stacks as string[]) || []
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

  const handleInputChange = (field: keyof ProfileFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarUpdate = (avatarUrl: string | undefined) => {
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

    updateProfileMutation.mutate({ userId: user.id, profileData: formData }, {
      onSuccess: async () => {
        toast.success('Profile updated successfully!')
        setPreviewRefresh(prev => prev + 1)
        
        // Trigger revalidation of public profile through API
        if (user.profile_slug || user.github_username) {
          const username = user.profile_slug || user.github_username
          if (username) {
            try {
              await fetch(`/api/revalidate?tag=public-profile-${username}`, {
                method: 'POST',
              })
            } catch (error) {
              console.warn('Warning: Failed to trigger API revalidation for profile:', username)
            }
          }
        }
      },
      onError: (error) => {
        console.error('Error updating profile:', error)
        toast.error('Failed to update profile. Please try again.')
      }
    })
  }

  if (!user) {
    return (
      <div className="glassmorphic rounded-[16px] sm:rounded-[20px] p-4 sm:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-4 sm:h-6 bg-[#28282b] rounded w-1/4"></div>
          <div className="space-y-3 sm:space-y-4">
            <div className="h-10 sm:h-12 bg-[#28282b] rounded-[8px]"></div>
            <div className="h-10 sm:h-12 bg-[#28282b] rounded-[8px]"></div>
            <div className="h-16 sm:h-20 bg-[#28282b] rounded-[8px]"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-8 pb-20 sm:pb-8">
      
      {/* Profile Completion Banner */}
      {(() => {
        try {
          const profileStatus = checkProfileCompletion(user);
          if (!profileStatus.isComplete) {
            return (
              <div className="glassmorphic rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] border-l-4 border-yellow-400">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-[16px] sm:text-[18px] font-medium text-white mb-2">
                      Complete Your Profile
                    </h3>
                    <p className="text-[14px] text-[#7a7a83] mb-3">
                      {getCompletionMessage(profileStatus)}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm text-[#7a7a83] mb-1">
                          <span>Completion Progress</span>
                          <span>{profileStatus.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-[#28282b] rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${profileStatus.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        } catch (error) {
          console.error('Error rendering profile completion banner:', error);
          return null;
        }
      })()}
      
      {/* Current Profile Status */}
      <div className="glassmorphic rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] sm:text-[24px] font-medium leading-[24px] sm:leading-[28px] tracking-[-0.6px] sm:tracking-[-0.72px] font-sharp-grotesk text-white">
            Profile Overview
          </h2>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#54E0FF]" />
            <span className="text-[12px] sm:text-[14px] font-medium text-[#54E0FF] font-sharp-grotesk">
              Profile Settings
            </span>
          </div>
        </div>
      </div>

      {/* Current Profile Picture */}
      <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white">
            Profile Picture
          </h2>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-[#54E0FF]" />
            <span className="text-[14px] font-medium text-[#54E0FF] font-sharp-grotesk">
              {formData.avatar_url ? 'Customized' : 'Default'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-8">
            <AvatarUpload
              currentAvatarUrl={formData.avatar_url}
              onAvatarUpdate={(url) => handleAvatarUpdate(url || undefined)}
              size="lg"
              className="w-32 h-32"
            />
          </div>
          <div className="max-w-md">
            <p className="text-[16px] font-light text-[#7a7a83] font-sharp-grotesk mb-4">
              Upload a profile picture to make your profile more personal.
            </p>
            <ul className="text-[14px] font-light text-[#7a7a83] font-sharp-grotesk space-y-2 mb-6">
              <li>• Recommended size: 200×200px</li>
              <li>• Formats: JPEG, PNG, WebP, GIF</li>
              <li>• Max size: 5MB</li>
            </ul>

            {formData.avatar_url && (
              <Button
                onClick={async () => {
                  try {
                    updateProfileMutation.mutate({ userId: user!.id, profileData: { avatar_url: undefined } }, {
                      onSuccess: () => {
                        handleAvatarUpdate(undefined)
                        toast.success('Avatar removed successfully!')
                      },
                      onError: (error) => {
                        console.error('Remove avatar error:', error)
                        toast.error('Failed to remove avatar')
                      }
                    })
                  } catch (error) {
                    console.error('Remove avatar error:', error)
                    toast.error('Failed to remove avatar')
                  } finally {
                    // setSaving(false) // This line is no longer needed as updateProfileMutation handles loading state
                  }
                }}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-400/20 hover:bg-red-400/10 hover:border-red-400/40 text-[14px] py-2 px-4"
              >
                Remove Avatar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Editor Form */}
      <div className="glassmorphic rounded-[16px] sm:rounded-[20px] p-4 sm:p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        <h2 className="text-[20px] sm:text-[24px] font-medium leading-[24px] sm:leading-[28px] tracking-[-0.6px] sm:tracking-[-0.72px] font-sharp-grotesk text-white mb-4 sm:mb-6">
          Edit Your Profile
        </h2>
        
        <div className="space-y-6 sm:space-y-8">
          
          {/* Basic Information Section */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-[16px] sm:text-[18px] font-medium leading-[20px] sm:leading-[22px] tracking-[-0.48px] sm:tracking-[-0.54px] font-sharp-grotesk text-white border-b border-[#33373b] pb-2 sm:pb-3">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Full Name */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full bg-[#28282b] border border-[#33373b] rounded-[6px] sm:rounded-[8px] px-3 sm:px-4 py-2 sm:py-3 text-white font-sharp-grotesk text-[13px] sm:text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Profile Title */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                  Profile Title
                </label>
                <input
                  type="text"
                  value={formData.profile_title}
                  onChange={(e) => handleInputChange('profile_title', e.target.value)}
                  className="w-full bg-[#28282b] border border-[#33373b] rounded-[6px] sm:rounded-[8px] px-3 sm:px-4 py-2 sm:py-3 text-white font-sharp-grotesk text-[13px] sm:text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                  placeholder="e.g., Full Stack Developer"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
                className="w-full bg-[#28282b] border border-[#33373b] rounded-[6px] sm:rounded-[8px] px-3 sm:px-4 py-2 sm:py-3 text-white font-sharp-grotesk text-[13px] sm:text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors resize-none"
                placeholder="Tell visitors about yourself..."
              />
              <p className="text-[10px] sm:text-[12px] text-[#7a7a83] font-sharp-grotesk mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Profile URL */}
            <div>
              <label className="block text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                Profile URL *
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="w-full sm:flex-1 flex items-center bg-[#28282b] border border-[#33373b] rounded-[6px] sm:rounded-[8px] overflow-hidden">
                  <span className="px-2 sm:px-4 py-2 sm:py-3 text-[#7a7a83] font-sharp-grotesk text-[11px] sm:text-[14px] border-r border-[#33373b] whitespace-nowrap">
                    link4coders.in/
                  </span>
                  <input
                    type="text"
                    value={formData.profile_slug}
                    onChange={(e) => handleInputChange('profile_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-white font-sharp-grotesk text-[13px] sm:text-[14px] focus:outline-none min-w-0"
                    placeholder="your-username"
                  />
                </div>
                <Button
                  onClick={generateSlugFromName}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF]/30 text-[11px] sm:text-[12px] h-8 sm:h-auto py-2 px-3"
                >
                  Generate
                </Button>
              </div>
              
              {/* Slug availability indicator */}
              {formData.profile_slug && formData.profile_slug !== user.profile_slug && (
                <div className="flex items-center gap-2 mt-2">
                  {updateProfileMutation.isPending ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-[#54E0FF] border-t-transparent rounded-full animate-spin" />
                  ) : slugAvailable === true ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  ) : slugAvailable === false ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                  ) : null}
                  
                  <span className={`text-[11px] sm:text-[12px] font-sharp-grotesk ${
                    updateProfileMutation.isPending ? 'text-[#7a7a83]' :
                    slugAvailable === true ? 'text-green-500' :
                    slugAvailable === false ? 'text-red-500' : 'text-[#7a7a83]'
                  }`}>
                    {updateProfileMutation.isPending ? 'Checking...' :
                     slugAvailable === true ? 'Available!' :
                     slugAvailable === false ? 'Already taken' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-[16px] sm:text-[18px] font-medium leading-[20px] sm:leading-[22px] tracking-[-0.48px] sm:tracking-[-0.54px] font-sharp-grotesk text-white border-b border-[#33373b] pb-2 sm:pb-3">
              Professional Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Company */}
              <div>
                <label className="block text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full bg-[#28282b] border border-[#33373b] rounded-[6px] sm:rounded-[8px] px-3 sm:px-4 py-2 sm:py-3 text-white font-sharp-grotesk text-[13px] sm:text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                  placeholder="Your current company"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full bg-[#28282b] border border-[#33373b] rounded-[6px] sm:rounded-[8px] px-3 sm:px-4 py-2 sm:py-3 text-white font-sharp-grotesk text-[13px] sm:text-[14px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            {/* Tech Stack Selector */}
            <div className="mt-4">
              <label className="block text-[12px] sm:text-[14px] font-medium text-white font-sharp-grotesk mb-2">
                Tech Stack
              </label>
              <TechStackSelector
                selectedTechStacks={formData.tech_stacks || []}
                onChange={(techStacks) => handleInputChange('tech_stacks', techStacks)}
              />
            </div>
          </div>

        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending || slugAvailable === false}
            className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:opacity-90 px-6 sm:px-8 py-2 sm:py-3 text-[13px] sm:text-[14px]"
          >
            {updateProfileMutation.isPending ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-[#18181a] border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}