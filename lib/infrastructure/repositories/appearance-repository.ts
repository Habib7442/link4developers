import { UserAppearanceSettings, AppearanceUpdateData } from '@/lib/domain/entities'
import { AppearanceRepository } from '@/lib/application/use-cases'
import { supabase } from '@/lib/supabase'

export class SupabaseAppearanceRepository implements AppearanceRepository {
  async getUserAppearanceSettings(userId: string): Promise<UserAppearanceSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_appearance_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching appearance settings:', error)
        return null
      }

      return data as UserAppearanceSettings
    } catch (error) {
      console.error('Error in getUserAppearanceSettings:', error)
      return null
    }
  }

  async updateAppearanceSettings(userId: string, updates: AppearanceUpdateData): Promise<UserAppearanceSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_appearance_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating appearance settings:', error)
        return null
      }

      return data as UserAppearanceSettings
    } catch (error) {
      console.error('Error in updateAppearanceSettings:', error)
      return null
    }
  }

  async createDefaultAppearanceSettings(userId: string, themeId: string): Promise<UserAppearanceSettings> {
    try {
      const defaultSettings: Omit<UserAppearanceSettings, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        theme_id: themeId,
        primary_color: '#3B82F6',
        secondary_color: '#1F2937',
        accent_color: '#10B981',
        background_color: '#FFFFFF',
        text_color: '#1F2937',
        font_family: 'Inter',
        font_size_base: 16,
        font_size_heading: 24,
        font_size_subheading: 18,
        line_height_base: 1.5,
        line_height_heading: 1.2,
        card_border_radius: 12,
        card_border_width: 1,
        card_backdrop_blur: 0,
        card_shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        button_style: 'rounded',
        button_border_radius: 8,
        button_padding_x: 16,
        button_padding_y: 8,
        element_spacing: 16,
        container_max_width: 1200,
        social_icon_background: '#F3F4F6',
        social_icon_hover_color: '#3B82F6'
      }

      const { data, error } = await supabase
        .from('user_appearance_settings')
        .insert(defaultSettings)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create default appearance settings: ${error.message}`)
      }

      return data as UserAppearanceSettings
    } catch (error) {
      console.error('Error in createDefaultAppearanceSettings:', error)
      throw error
    }
  }
  
  // Method to delete appearance settings
  async deleteAppearanceSettings(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_appearance_settings')
        .delete()
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error deleting appearance settings:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in deleteAppearanceSettings:', error)
      return false
    }
  }
}
