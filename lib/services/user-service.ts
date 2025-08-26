import { UserUseCaseImpl } from '@/lib/application/use-cases'
import { SupabaseUserRepository } from '@/lib/infrastructure/repositories'
import { User, UserProfile } from '@/lib/domain/entities'

// Create singleton instances
const userRepository = new SupabaseUserRepository()
const userUseCases = new UserUseCaseImpl(userRepository)

export class UserService {
  static async getUserProfile(userId: string): Promise<User | null> {
    return userUseCases.getUserProfile(userId)
  }

  static async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<User | null> {
    return userUseCases.updateProfile(userId, profileData)
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    return userUseCases.getUserByUsername(username)
  }
}

