export interface User {
  id: string
  email: string
  full_name?: string
  profile_title?: string
  bio?: string
  avatar_url?: string
  github_username?: string
  profile_slug?: string
  theme_id?: string
  is_public?: boolean
  is_premium?: boolean
  is_admin?: boolean
  category_order?: string[]
  last_known_ip?: string
  last_known_user_agent?: string
  user_metadata?: {
    full_name?: string
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  full_name?: string
  profile_title?: string
  bio?: string
  avatar_url?: string
  github_username?: string
  profile_slug?: string
  theme_id?: string
  is_public?: boolean
}
