import { User, UserProfile } from '@/lib/domain/entities'

export interface UserRepository {
  getUserById(userId: string): Promise<User | null>
  updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<User | null>
  getUserByUsername(username: string): Promise<User | null>
}

export interface UserUseCases {
  getUserProfile(userId: string): Promise<User | null>
  updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<User | null>
  getUserByUsername(username: string): Promise<User | null>
}

export class UserUseCaseImpl implements UserUseCases {
  constructor(private userRepository: UserRepository) {}

  async getUserProfile(userId: string): Promise<User | null> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    return this.userRepository.getUserById(userId)
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<User | null> {
    if (!userId) {
      throw new Error('User ID is required')
    }
    return this.userRepository.updateUserProfile(userId, profileData)
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (!username) {
      throw new Error('Username is required')
    }
    return this.userRepository.getUserByUsername(username)
  }
}

