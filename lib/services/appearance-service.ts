import { AppearanceUseCaseImpl } from '@/lib/application/use-cases'
import { SupabaseAppearanceRepository } from '@/lib/infrastructure/repositories'
import { UserAppearanceSettings, AppearanceUpdateData } from '@/lib/domain/entities'

// Create singleton instances
const appearanceRepository = new SupabaseAppearanceRepository()
const appearanceUseCases = new AppearanceUseCaseImpl(appearanceRepository)

export class AppearanceService {
  static async getUserAppearanceSettings(userId: string): Promise<UserAppearanceSettings | null> {
    return appearanceUseCases.getUserAppearanceSettings(userId)
  }

  static async updateAppearanceSettings(userId: string, updates: AppearanceUpdateData): Promise<UserAppearanceSettings | null> {
    return appearanceUseCases.updateAppearanceSettings(userId, updates)
  }

  static async createDefaultAppearanceSettings(userId: string, themeId: string): Promise<UserAppearanceSettings> {
    return appearanceUseCases.createDefaultAppearanceSettings(userId, themeId)
  }
  
  // Alias for getUserAppearanceSettings, used in public profile context
  static async getPublicAppearanceSettings(userId: string): Promise<UserAppearanceSettings | null> {
    return this.getUserAppearanceSettings(userId)
  }
  
  // Method to delete appearance settings (used for reset functionality)
  static async deleteAppearanceSettings(userId: string): Promise<boolean> {
    return appearanceUseCases.deleteAppearanceSettings(userId)
  }
  
  // Method to reset to defaults by deleting and recreating
  static async resetToDefaults(userId: string): Promise<UserAppearanceSettings | null> {
    return appearanceUseCases.resetToDefaults(userId)
  }
}