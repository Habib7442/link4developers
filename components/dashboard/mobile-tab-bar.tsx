'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Link, 
  Palette, 
  Paintbrush, 
  BarChart3, 
  Settings,
  Eye,
  LogOut,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MobilePreviewModal } from '@/components/dashboard/mobile-preview-modal'

interface MobileTabBarProps {
  showPreview?: boolean
  previewContent?: React.ReactNode
}

const navigationItems = [
  { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/profile' },
  { id: 'links', label: 'Links', icon: Link, href: '/dashboard/links' },
  { id: 'themes', label: 'Themes', icon: Palette, href: '/dashboard/themes' },
  { id: 'appearance', label: 'Looks', icon: Paintbrush, href: '/dashboard/appearance' },
  { id: 'analytics', label: 'Stats', icon: BarChart3, href: '/dashboard/analytics' },
  { id: 'settings', label: 'Setup', icon: Settings, href: '/dashboard/settings' },
]

export function MobileTabBar({ showPreview = false, previewContent }: MobileTabBarProps) {
  const router = useRouter()
  const { signOut } = useAuthStore()
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('')
  
  // Determine active tab based on current path
  useEffect(() => {
    const updateActiveTab = () => {
      const path = window.location.pathname
      const currentTab = navigationItems.find(item => path.includes(item.href.split('/').pop() || ''))?.id || 'profile'
      setActiveTab(currentTab)
    }
    
    // Set initial active tab
    updateActiveTab()
    
    // Add event listener for route changes
    window.addEventListener('popstate', updateActiveTab)
    
    return () => {
      window.removeEventListener('popstate', updateActiveTab)
    }
  }, [])

  return (
    <>
      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1e1e20] border-t border-[#33373b] z-50">
        <Tabs defaultValue={activeTab} value={activeTab} className="w-full">
          <TabsList className="h-14 bg-transparent grid grid-cols-6 gap-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <TabsTrigger 
                  key={item.id}
                  value={item.id}
                  onClick={() => {
                    router.push(item.href)
                    setActiveTab(item.id)
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center space-y-0.5 h-full rounded-none data-[state=active]:bg-transparent",
                    isActive ? "text-[#54E0FF]" : "text-[#7a7a83]"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-[#54E0FF]" : "text-[#7a7a83]"
                  )} />
                  <span className="text-[8px] font-medium tracking-tight">{item.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
        
        {/* Preview Button - Floating above tab bar */}
        {showPreview && (
          <div className="absolute top-0 right-4 transform -translate-y-full">
            <Button
              onClick={() => setMobilePreviewOpen(true)}
              className="bg-[#54E0FF] hover:bg-[#29ADFF] text-[#18181a] rounded-t-none rounded-b-md p-2 h-8 flex items-center shadow-lg"
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="text-[12px] font-medium">Preview</span>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && previewContent && (
        <MobilePreviewModal
          isOpen={mobilePreviewOpen}
          onClose={() => setMobilePreviewOpen(false)}
          previewContent={previewContent}
        />
      )}
    </>
  )
}