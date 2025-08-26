import { UserAppearanceSettings, AppearanceUpdateData } from '@/lib/domain/entities'

export interface AppearanceRepository {
  getUserAppearanceSettings(userId: string): Promise<UserAppearanceSettings | null>
  updateAppearanceSettings(userId: string, updates: AppearanceUpdateData): Promise<UserAppearanceSettings | null>
  createDefaultAppearanceSettings(userId: string, themeId: string): Promise<UserAppearanceSettings>
  deleteAppearanceSettings(userId: string): Promise<boolean>
}

export interface AppearanceUseCases {
  getUserAppearanceSettings(userId: string): Promise<UserAppearanceSettings | null>
  updateAppearanceSettings(userId: string, updates: AppearanceUpdateData): Promise<UserAppearanceSettings | null>
  createDefaultAppearanceSettings(userId: string, themeId: string): Promise<UserAppearanceSettings>
  deleteAppearanceSettings(userId: string): Promise<boolean>
  resetToDefaults(userId: string): Promise<UserAppearanceSettings | null>
}

export class AppearanceUseCaseImpl implements AppearanceUseCases {
  constructor(private appearanceRepository: AppearanceRepository) {}

  async getUserAppearanceSettings(userId: string): Promise<UserAppearanceSettings | null> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    return this.appearanceRepository.getUserAppearanceSettings(userId)
  }

  async updateAppearanceSettings(userId: string, updates: AppearanceUpdateData): Promise<UserAppearanceSettings | null> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    return this.appearanceRepository.updateAppearanceSettings(userId, updates)
  }

  async createDefaultAppearanceSettings(userId: string, themeId: string): Promise<UserAppearanceSettings> {
    if (!userId || !themeId) {
      throw new Error('User ID and Theme ID are required')
    }
    return this.appearanceRepository.createDefaultAppearanceSettings(userId, themeId)
  }
  
  async deleteAppearanceSettings(userId: string): Promise<boolean> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    return this.appearanceRepository.deleteAppearanceSettings(userId)
  }
  
  async resetToDefaults(userId: string): Promise<UserAppearanceSettings | null> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    try {
      // First delete existing settings
      const deleted = await this.deleteAppearanceSettings(userId)
      if (!deleted) {
        console.error('Failed to delete appearance settings for reset')
        return null
      }
      
      // Then create default settings
      // Note: Using a default theme ID, in practice this might need to be determined differently
      const defaultSettings = await this.createDefaultAppearanceSettings(userId, 'default')
      return defaultSettings
    } catch (error) {
      console.error('Error in resetToDefaults:', error)
      return null
    }
  }
}
