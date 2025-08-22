'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { MobilePreviewModal } from '@/components/dashboard/mobile-preview-modal'
import ChainLinkIcon from '@/components/icons/ChainLinkIcon'
import {
  User,
  Settings,
  ExternalLink,
  ArrowLeft,
  Link,
  BarChart3,
  Palette,
  Paintbrush,
  Eye,
  Menu,
  X,
  LogOut
} from 'lucide-react'



interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  description: string
  isPremium?: boolean
}

const navigationItems: NavItem[] = [
  {
    id: 'profile',
    label: 'Profile Editor',
    icon: User,
    href: '/dashboard/profile',
    description: 'Edit your profile information and bio'
  },
  {
    id: 'links',
    label: 'Link Manager',
    icon: Link,
    href: '/dashboard/links',
    description: 'Manage your links and social profiles'
  },
  {
    id: 'themes',
    label: 'Themes',
    icon: Palette,
    href: '/dashboard/themes',
    description: 'Choose from pre-built templates'
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Paintbrush,
    href: '/dashboard/appearance',
    description: 'Customize colors, fonts, and layout',
    isPremium: true
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    description: 'View your profile and link statistics'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
    description: 'Account and privacy settings'
  }
]

interface DashboardLayoutProps {
  children: React.ReactNode
  showPreview?: boolean
  previewContent?: React.ReactNode
}

export function DashboardLayout({ children, showPreview = false, previewContent }: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getActiveNavItem = () => {
    return navigationItems.find(item => pathname.startsWith(item.href))?.id || 'profile'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181a] flex items-center justify-center">
        <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#54E0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-2">
              Loading Dashboard
            </h2>
            <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
              Please wait while we load your profile...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to home
  }

  return (
    <div className="h-screen bg-[#18181a] flex overflow-hidden">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#1e1e20] border-r border-[#33373b] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#33373b] flex-shrink-0">
          <div className="flex items-center gap-3">
            <ChainLinkIcon width={32} height={32} />
            <span className="text-white text-[18px] font-medium tracking-[-0.54px] font-sharp-grotesk">
              Dashboard
            </span>
          </div>
          <Button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden bg-transparent border-none text-[#7a7a83] hover:text-white p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-[#33373b] flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || user.email}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center">
                <User className="w-6 h-6 text-[#18181a]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-medium leading-[20px] tracking-[-0.48px] font-sharp-grotesk text-white truncate">
                {user.full_name || 'Developer'}
              </h3>
              <p className="text-[14px] font-light leading-[18px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          {/* Profile URL Preview */}
          <div className="bg-[#28282b] border border-[#33373b] rounded-[8px] px-3 py-2">
            <p className="text-[12px] font-light text-[#7a7a83] font-sharp-grotesk mb-1">
              Your profile URL:
            </p>
            <span className="text-[14px] font-medium text-[#54E0FF] font-sharp-grotesk">
              link4coders.com/{user.profile_slug || user.github_username || user.email?.split('@')[0] || 'yourname'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = getActiveNavItem() === item.id
              
              return (
                <Button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  className={`w-full justify-start text-left p-4 h-auto rounded-[12px] transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#54E0FF]/10 border border-[#54E0FF]/30 text-[#54E0FF]' 
                      : 'bg-transparent border border-transparent text-[#7a7a83] hover:text-white hover:bg-[#28282b] hover:border-[#33373b]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-[#54E0FF]' : 'text-current'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[14px] font-medium leading-[18px] tracking-[-0.42px] font-sharp-grotesk flex items-center gap-2 ${
                        isActive ? 'text-[#54E0FF]' : 'text-current'
                      }`}>
                        {item.label}
                        {item.isPremium && (
                          <div className="w-2 h-2 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] rounded-full"></div>
                        )}
                      </div>
                      <div className="text-[12px] font-light leading-[16px] tracking-[-0.36px] text-[#7a7a83] font-sharp-grotesk mt-1">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-[#33373b] flex-shrink-0">
          <div className="space-y-2">
            <Button
              onClick={() => router.push('/')}
              className="w-full justify-start bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF]/30 font-medium text-[14px] tracking-[-0.42px] font-sharp-grotesk rounded-[8px] px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button
              onClick={handleSignOut}
              className="w-full justify-start bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-red-400 hover:border-red-400/30 font-medium text-[14px] tracking-[-0.42px] font-sharp-grotesk rounded-[8px] px-3 py-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-0 flex flex-col h-screen">

        {/* Mobile Header */}
        <header className="lg:hidden bg-[#1e1e20] border-b border-[#33373b] p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setSidebarOpen(true)}
              className="bg-transparent border-none text-[#7a7a83] hover:text-white p-2"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-3">
              <ChainLinkIcon width={24} height={24} />
              <span className="text-white text-[16px] font-medium tracking-[-0.48px] font-sharp-grotesk">
                Dashboard
              </span>
            </div>
            {/* Mobile Preview Button */}
            {showPreview ? (
              <Button
                onClick={() => setMobilePreviewOpen(true)}
                className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] p-2"
              >
                <Eye className="w-5 h-5" />
              </Button>
            ) : (
              <div className="w-10" /> /* Spacer for centering */
            )}
          </div>
        </header>

        {/* Content Layout - Responsive 2 or 3 columns based on showPreview */}
        <div className={`flex-1 flex ${showPreview ? 'lg:grid lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-3' : ''} overflow-hidden`}>

          {/* Page Content */}
          <main className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${showPreview ? 'lg:col-span-3 xl:col-span-4 2xl:col-span-2' : ''}`}>
            {children}
          </main>

          {/* Live Preview Panel */}
          {showPreview && (
            <aside className="hidden lg:block lg:col-span-2 xl:col-span-3 2xl:col-span-1 bg-[#1e1e20] border-l border-[#33373b] overflow-hidden min-w-0">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-[#33373b] flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[16px] font-medium text-white font-sharp-grotesk">
                        Live Preview
                      </h3>
                      <p className="text-[12px] text-[#7a7a83] font-sharp-grotesk mt-1">
                        See how your profile looks to visitors
                      </p>
                    </div>

                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {previewContent}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Preview Modal */}
      {showPreview && previewContent && (
        <MobilePreviewModal
          isOpen={mobilePreviewOpen}
          onClose={() => setMobilePreviewOpen(false)}
          previewContent={previewContent}
        />
      )}
    </div>
  )
}
