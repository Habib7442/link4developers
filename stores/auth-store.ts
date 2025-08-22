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
  signInWithGitHub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  clearError: () => void
  
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
        } catch (error) {
          console.error('GitHub sign in error:', error)
          set({ error: (error as AuthError).message, loading: false })
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
        } catch (error) {
          console.error('Google sign in error:', error)
          set({ error: (error as AuthError).message, loading: false })
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
        } catch (error) {
          console.error('Email sign in error:', error)
          set({ error: (error as AuthError).message, loading: false })
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
        } catch (error) {
          console.error('Email sign up error:', error)
          set({ error: (error as AuthError).message, loading: false })
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
          } else {
            set({ session: null, user: null, loading: false })
          }
          
          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id)
            
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
            } else {
              set({ 
                session: null, 
                user: null, 
                loading: false 
              })
            }
          })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ error: (error as Error).message, loading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
)
