'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, type User, type AuthUser } from '@/lib/supabase'
import type { Session, AuthError } from '@supabase/supabase-js'

interface AuthState {
  // State
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  
  // Actions
  signInWithGitHub: () => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  signInWithEmail: (email: string, password: string) => Promise<boolean>
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<boolean>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  clearError: () => void
  refreshAuth: () => Promise<void>
  isSessionValid: () => Promise<boolean>
  forceReAuth: () => Promise<void>
  
  // Internal actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      loading: true,
      error: null,

      // Actions
      signInWithGitHub: async () => {
        try {
          set({ loading: true, error: null })
          
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              scopes: 'read:user user:email'
            }
          })
          
          if (error) throw error
          return true // Return success
        } catch (error) {
          console.error('GitHub sign in error:', error)
          set({ error: (error as AuthError).message, loading: false })
          return false // Return failure
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null })
          
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              scopes: 'email profile'
            }
          })
          
          if (error) throw error
          return true // Return success
        } catch (error) {
          console.error('Google sign in error:', error)
          set({ error: (error as AuthError).message, loading: false })
          return false // Return failure
        }
      },

      signInWithEmail: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null })
          
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          if (error) throw error
          return true // Return success
        } catch (error) {
          console.error('Email sign in error:', error)
          set({ error: (error as AuthError).message, loading: false })
          return false // Return failure
        }
      },

      signUpWithEmail: async (email: string, password: string, fullName?: string) => {
        try {
          set({ loading: true, error: null })
          
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName
              }
            }
          })
          
          if (error) throw error
          
          // Show success message for email confirmation
          set({ 
            error: 'Please check your email for a confirmation link.',
            loading: false 
          })
          return true // Return success
        } catch (error) {
          console.error('Email sign up error:', error)
          set({ error: (error as AuthError).message, loading: false })
          return false // Return failure
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null })
          
          const { error } = await supabase.auth.signOut()
          
          if (error) throw error
          
          set({ user: null, session: null, loading: false })
        } catch (error) {
          console.error('Sign out error:', error)
          set({ error: (error as AuthError).message, loading: false })
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const { user } = get()
          if (!user) throw new Error('No user logged in')
          
          set({ loading: true, error: null })
          
          const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()
          
          if (error) throw error
          
          set({ user: data, loading: false })
        } catch (error) {
          console.error('Profile update error:', error)
          set({ error: (error as Error).message, loading: false })
        }
      },

      clearError: () => set({ error: null }),
  
  // Force refresh auth state
  refreshAuth: async () => {
    try {
      set({ loading: true, error: null })
      console.log('🔄 Manually refreshing auth state...')
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        set({ 
          session, 
          user: userProfile || null,
          loading: false 
        })
        
        console.log('✅ Auth state refreshed successfully')
      } else {
        set({ session: null, user: null, loading: false })
        console.log('🔓 No session found during refresh')
      }
    } catch (error) {
      console.error('❌ Auth refresh error:', error)
      set({ error: (error as Error).message, loading: false })
    }
  },

  // Check if current session is still valid
  isSessionValid: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return false
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000)
      if (session.expires_at && session.expires_at < now) {
        console.log('⚠️ Session token expired')
        return false
      }
      
      return true
    } catch (error) {
      console.error('❌ Error checking session validity:', error)
      return false
    }
  },

  // Force re-authentication by clearing state and re-initializing
  forceReAuth: async () => {
    try {
      console.log('🔄 Force re-authentication...')
      set({ user: null, session: null, loading: true, error: null })
      
      // Clear stored auth data
      localStorage.removeItem('auth-storage')
      
      // Re-initialize
      await get().initialize()
      
      console.log('✅ Force re-authentication completed')
    } catch (error) {
      console.error('❌ Force re-authentication error:', error)
      set({ error: (error as Error).message, loading: false })
    }
  },

      // Internal actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      initialize: async () => {
        try {
          set({ loading: true })
          
          // Get initial session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) throw sessionError
          
          if (session?.user) {
            console.log('🔐 Initial session found for user:', session.user.id)
            
            // Fetch user profile from our users table
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching user profile:', profileError)
            }
            
            set({ 
              session, 
              user: userProfile || null,
              loading: false 
            })
            
            console.log('✅ User profile loaded:', userProfile?.username || 'Unknown')
          } else {
            console.log('🔓 No initial session found')
            set({ session: null, user: null, loading: false })
          }
          
          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth state changed:', event, session?.user?.id)
            
            if (session?.user) {
              // Fetch user profile
              const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()
              
              set({ 
                session, 
                user: userProfile || null,
                loading: false 
              })
              
              console.log('✅ Auth state updated - user profile loaded')
            } else {
              set({ 
                session: null, 
                user: null, 
                loading: false 
              })
              
              console.log('🔓 Auth state updated - user signed out')
            }
          })
        } catch (error) {
          console.error('❌ Auth initialization error:', error)
          set({ error: (error as Error).message, loading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      }),
      // Add rehydration logic to restore session on page load
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('🔄 Rehydrating auth state from storage...')
          // Force re-initialization when rehydrating from storage
          setTimeout(() => {
            state.initialize()
          }, 100)
        }
      }
    }
  )
)
