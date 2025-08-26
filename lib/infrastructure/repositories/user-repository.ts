import { User, UserProfile } from '@/lib/domain/entities'
import { UserRepository } from '@/lib/application/use-cases'
import { supabase } from '@/lib/supabase'

export class SupabaseUserRepository implements UserRepository {
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return null
      }

      return data as User
    } catch (error) {
      console.error('Error in getUserById:', error)
      return null
    }
  }

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }

      return data as User
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('profile_slug', username)
        .single()

      if (error) {
        console.error('Error fetching user by username:', error)
        return null
      }

      return data as User
    } catch (error) {
      console.error('Error in getUserByUsername:', error)
      return null
    }
  }
}

