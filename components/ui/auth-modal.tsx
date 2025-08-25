'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from './button'
import { X, Github, Mail, Eye, EyeOff } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'signin' | 'signup'
}

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const { 
    signInWithGitHub, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail,
    loading, 
    error, 
    clearError 
  } = useAuthStore()

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
      setEmail('')
      setPassword('')
      setFullName('')
      clearError()
    }
  }, [isOpen, defaultMode, clearError])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'signin') {
      const success = await signInWithEmail(email, password)
      if (success) {
        onClose() // Close modal on successful sign-in
      }
    } else {
      const success = await signUpWithEmail(email, password, fullName)
      // For sign-up, we don't close the modal immediately as user needs to check email
      // The success message is displayed in the modal
    }
  }

  const handleGitHubAuth = async () => {
    // For OAuth, we don't close the modal immediately as it redirects
    await signInWithGitHub()
  }

  const handleGoogleAuth = async () => {
    // For OAuth, we don't close the modal immediately as it redirects
    await signInWithGoogle()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glassmorphic rounded-[24px] p-8 shadow-[0px_24px_48px_rgba(0,0,0,0.40)] max-w-[480px] w-full mx-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#28282b] border border-[#33373b] flex items-center justify-center text-[#7a7a83] hover:text-white hover:border-[#54E0FF]/30 transition-colors duration-300"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-[32px] font-medium leading-[38px] tracking-[-1.6px] font-sharp-grotesk gradient-text-primary mb-4">
            {mode === 'signin' ? 'Welcome Back' : 'Join Link4Coders'}
          </h2>
          <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
            {mode === 'signin' 
              ? 'Sign in to access your developer profile' 
              : 'Create your developer profile in seconds'
            }
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-4 mb-6">
          <Button
            onClick={handleGitHubAuth}
            disabled={loading}
            className="w-full bg-[#28282b] border border-[#33373b] text-white hover:bg-[#33373b] hover:border-[#54E0FF]/30 font-medium text-[16px] tracking-[-0.48px] font-sharp-grotesk rounded-[12px] py-4 flex items-center justify-center gap-3"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </Button>
          
          <Button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-[#28282b] border border-[#33373b] text-white hover:bg-[#33373b] hover:border-[#54E0FF]/30 font-medium text-[16px] tracking-[-0.48px] font-sharp-grotesk rounded-[12px] py-4 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#33373b]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#18181a] px-4 text-[#7a7a83] font-sharp-grotesk">or</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 bg-[#28282b] border border-[#33373b] rounded-[12px] text-white placeholder-[#7a7a83] font-sharp-grotesk text-[16px] tracking-[-0.48px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                required
              />
            </div>
          )}
          
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 bg-[#28282b] border border-[#33373b] rounded-[12px] text-white placeholder-[#7a7a83] font-sharp-grotesk text-[16px] tracking-[-0.48px] focus:outline-none focus:border-[#54E0FF] transition-colors"
              required
            />
          </div>
          
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 bg-[#28282b] border border-[#33373b] rounded-[12px] text-white placeholder-[#7a7a83] font-sharp-grotesk text-[16px] tracking-[-0.48px] focus:outline-none focus:border-[#54E0FF] transition-colors"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7a7a83] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[8px]">
              <p className="text-red-400 text-[14px] font-light font-sharp-grotesk">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#18181a] hover:bg-gray-100 font-medium text-[16px] tracking-[-0.48px] font-sharp-grotesk rounded-[12px] py-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#18181a] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Mail className="w-5 h-5" />
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </>
            )}
          </Button>
        </form>

        {/* Mode Toggle */}
        <div className="text-center mt-6">
          <p className="text-[14px] font-light text-[#7a7a83] font-sharp-grotesk">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-[#54E0FF] hover:text-[#29ADFF] transition-colors font-medium"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
