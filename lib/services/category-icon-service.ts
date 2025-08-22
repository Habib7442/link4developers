import { supabase } from '@/lib/supabase'
import { LinkCategory } from './link-service'

export interface CategoryIconConfig {
  type: 'default' | 'upload' | 'url' | 'library'
  icon: string // Icon name, URL, or library ID
  size: number
  color?: string
}

export interface CategoryIconSetting {
  id: string
  user_id: string
  category: LinkCategory
  icon_type: 'default' | 'upload' | 'url' | 'library'
  custom_icon_url?: string
  library_icon_id?: string
  icon_size: number
  icon_color?: string
  created_at: string
  updated_at: string
}

export interface UpdateCategoryIconData {
  icon_type: 'default' | 'upload' | 'url' | 'library'
  custom_icon_url?: string
  library_icon_id?: string
  icon_size?: number
  icon_color?: string
}

/**
 * Service for managing category icon customizations
 */
export class CategoryIconService {
  
  /**
   * Get category icon configuration for a user
   */
  static async getCategoryIcon(userId: string, category: LinkCategory): Promise<CategoryIconConfig> {
    try {
      const { data, error } = await supabase
        .rpc('get_category_icon', {
          p_user_id: userId,
          p_category: category
        })

      if (error) {
        console.error('Error getting category icon:', error)
        return this.getDefaultIconConfig(category)
      }

      return data as CategoryIconConfig
    } catch (error) {
      console.error('Error getting category icon:', error)
      return this.getDefaultIconConfig(category)
    }
  }

  /**
   * Get all category icon configurations for a user
   */
  static async getAllCategoryIcons(userId: string): Promise<Record<LinkCategory, CategoryIconConfig>> {
    try {
      const categories: LinkCategory[] = ['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom']
      const results: Record<LinkCategory, CategoryIconConfig> = {} as Record<LinkCategory, CategoryIconConfig>

      // Get all category settings in parallel
      const promises = categories.map(async (category) => {
        const config = await this.getCategoryIcon(userId, category)
        return { category, config }
      })

      const categoryConfigs = await Promise.all(promises)
      
      categoryConfigs.forEach(({ category, config }) => {
        results[category] = config
      })

      return results
    } catch (error) {
      console.error('Error getting all category icons:', error)
      // Return default configurations
      const categories: LinkCategory[] = ['personal', 'projects', 'blogs', 'achievements', 'contact', 'social', 'custom']
      const defaults: Record<LinkCategory, CategoryIconConfig> = {} as Record<LinkCategory, CategoryIconConfig>
      
      categories.forEach(category => {
        defaults[category] = this.getDefaultIconConfig(category)
      })
      
      return defaults
    }
  }

  /**
   * Update category icon setting
   */
  static async updateCategoryIcon(
    userId: string, 
    category: LinkCategory, 
    iconData: UpdateCategoryIconData
  ): Promise<void> {
    try {
      // Validate icon data
      this.validateIconData(iconData)

      const { data, error } = await supabase
        .rpc('update_category_icon', {
          p_user_id: userId,
          p_category: category,
          p_icon_type: iconData.icon_type,
          p_custom_icon_url: iconData.custom_icon_url || null,
          p_library_icon_id: iconData.library_icon_id || null,
          p_icon_size: iconData.icon_size || null,
          p_icon_color: iconData.icon_color || null
        })

      if (error) {
        throw new Error(`Failed to update category icon: ${error.message}`)
      }

      console.log('✅ Category icon updated successfully')
    } catch (error) {
      console.error('❌ Error updating category icon:', error)
      throw error
    }
  }

  /**
   * Reset category icon to default
   */
  static async resetCategoryIcon(userId: string, category: LinkCategory): Promise<void> {
    try {
      const { data, error } = await supabase
        .rpc('reset_category_icon', {
          p_user_id: userId,
          p_category: category
        })

      if (error) {
        throw new Error(`Failed to reset category icon: ${error.message}`)
      }

      console.log('✅ Category icon reset to default')
    } catch (error) {
      console.error('❌ Error resetting category icon:', error)
      throw error
    }
  }

  /**
   * Upload category icon file to Supabase Storage
   */
  static async uploadCategoryIcon(
    userId: string, 
    category: LinkCategory, 
    file: File
  ): Promise<string> {
    try {
      // Validate file
      this.validateIconFile(file)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${category}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('category-icons')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Failed to upload icon: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('category-icons')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (error) {
      console.error('❌ Error uploading category icon:', error)
      throw error
    }
  }

  /**
   * Delete uploaded category icon file
   */
  static async deleteCategoryIcon(iconUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(iconUrl)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'category-icons')
      
      if (bucketIndex === -1) {
        throw new Error('Invalid icon URL')
      }

      const filePath = pathParts.slice(bucketIndex + 1).join('/')

      const { error } = await supabase.storage
        .from('category-icons')
        .remove([filePath])

      if (error) {
        console.warn('Failed to delete icon file:', error)
        // Don't throw error as this is cleanup
      }
    } catch (error) {
      console.warn('Error deleting category icon file:', error)
      // Don't throw error as this is cleanup
    }
  }

  /**
   * Validate icon file
   */
  private static validateIconFile(file: File): void {
    const maxSize = 2 * 1024 * 1024 // 2MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif']

    if (file.size > maxSize) {
      throw new Error('File size must be less than 2MB')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File must be a valid image (PNG, JPG, SVG, WebP, or GIF)')
    }
  }

  /**
   * Validate icon data
   */
  private static validateIconData(iconData: UpdateCategoryIconData): void {
    if (iconData.icon_type === 'url' && !iconData.custom_icon_url) {
      throw new Error('Custom icon URL is required when icon type is URL')
    }

    if (iconData.icon_type === 'library' && !iconData.library_icon_id) {
      throw new Error('Library icon ID is required when icon type is library')
    }

    if (iconData.custom_icon_url && !this.isValidImageUrl(iconData.custom_icon_url)) {
      throw new Error('Invalid image URL format')
    }

    if (iconData.icon_color && !this.isValidHexColor(iconData.icon_color)) {
      throw new Error('Invalid color format. Use hex format (#RRGGBB)')
    }

    if (iconData.icon_size && (iconData.icon_size < 12 || iconData.icon_size > 48)) {
      throw new Error('Icon size must be between 12 and 48 pixels')
    }
  }

  /**
   * Validate image URL format
   */
  private static isValidImageUrl(url: string): boolean {
    try {
      new URL(url)
      return /\.(png|jpg|jpeg|svg|webp|gif|ico)(\?.*)?$/i.test(url)
    } catch {
      return false
    }
  }

  /**
   * Validate hex color format
   */
  private static isValidHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color)
  }

  /**
   * Get default icon configuration for a category
   */
  private static getDefaultIconConfig(category: LinkCategory): CategoryIconConfig {
    const defaultIcons = {
      personal: 'User',
      projects: 'Github',
      blogs: 'BookOpen',
      achievements: 'Award',
      contact: 'Mail',
      social: 'Share2',
      custom: 'Link'
    }

    return {
      type: 'default',
      icon: defaultIcons[category] || 'Link',
      size: 20
    }
  }

  /**
   * Get available library icons for a category
   */
  static getLibraryIcons(category: LinkCategory): Array<{ id: string; name: string; icon: string }> {
    const libraryIcons = {
      personal: [
        { id: 'user', name: 'User', icon: 'User' },
        { id: 'person', name: 'Person', icon: 'UserCircle' },
        { id: 'profile', name: 'Profile', icon: 'UserCheck' },
        { id: 'id-card', name: 'ID Card', icon: 'CreditCard' },
        { id: 'briefcase', name: 'Briefcase', icon: 'Briefcase' },
        { id: 'contact', name: 'Contact', icon: 'Contact' },
        { id: 'smile', name: 'Smile', icon: 'Smile' }
      ],
      projects: [
        { id: 'github', name: 'GitHub', icon: 'Github' },
        { id: 'code', name: 'Code', icon: 'Code' },
        { id: 'terminal', name: 'Terminal', icon: 'Terminal' },
        { id: 'folder', name: 'Folder', icon: 'Folder' },
        { id: 'git-branch', name: 'Git Branch', icon: 'GitBranch' },
        { id: 'package', name: 'Package', icon: 'Package' },
        { id: 'cpu', name: 'CPU', icon: 'Cpu' },
        { id: 'database', name: 'Database', icon: 'Database' }
      ],
      blogs: [
        { id: 'book-open', name: 'Book Open', icon: 'BookOpen' },
        { id: 'edit', name: 'Edit', icon: 'Edit' },
        { id: 'file-text', name: 'File Text', icon: 'FileText' },
        { id: 'pen-tool', name: 'Pen Tool', icon: 'PenTool' },
        { id: 'newspaper', name: 'Newspaper', icon: 'Newspaper' },
        { id: 'feather', name: 'Feather', icon: 'Feather' },
        { id: 'book', name: 'Book', icon: 'Book' }
      ],
      achievements: [
        { id: 'award', name: 'Award', icon: 'Award' },
        { id: 'trophy', name: 'Trophy', icon: 'Trophy' },
        { id: 'medal', name: 'Medal', icon: 'Medal' },
        { id: 'star', name: 'Star', icon: 'Star' },
        { id: 'target', name: 'Target', icon: 'Target' },
        { id: 'crown', name: 'Crown', icon: 'Crown' },
        { id: 'gem', name: 'Gem', icon: 'Gem' }
      ],
      contact: [
        { id: 'mail', name: 'Mail', icon: 'Mail' },
        { id: 'phone', name: 'Phone', icon: 'Phone' },
        { id: 'map-pin', name: 'Location', icon: 'MapPin' },
        { id: 'message-circle', name: 'Message', icon: 'MessageCircle' },
        { id: 'calendar', name: 'Calendar', icon: 'Calendar' },
        { id: 'at-sign', name: 'At Sign', icon: 'AtSign' },
        { id: 'send', name: 'Send', icon: 'Send' }
      ],
      social: [
        { id: 'share-2', name: 'Share', icon: 'Share2' },
        { id: 'users', name: 'Users', icon: 'Users' },
        { id: 'heart', name: 'Heart', icon: 'Heart' },
        { id: 'thumbs-up', name: 'Thumbs Up', icon: 'ThumbsUp' },
        { id: 'link', name: 'Link', icon: 'Link' },
        { id: 'rss', name: 'RSS', icon: 'Rss' },
        { id: 'hash', name: 'Hash', icon: 'Hash' }
      ],
      custom: [
        { id: 'link', name: 'Link', icon: 'Link' },
        { id: 'external-link', name: 'External Link', icon: 'ExternalLink' },
        { id: 'globe', name: 'Globe', icon: 'Globe' },
        { id: 'bookmark', name: 'Bookmark', icon: 'Bookmark' },
        { id: 'tag', name: 'Tag', icon: 'Tag' },
        { id: 'paperclip', name: 'Paperclip', icon: 'Paperclip' },
        { id: 'layers', name: 'Layers', icon: 'Layers' }
      ]
    }

    return libraryIcons[category] || libraryIcons.custom
  }
}
