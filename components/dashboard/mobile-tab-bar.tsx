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
  const [isModalOpen, setIsModalOpen] = useState(false)
  
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

  // Listen for modal state changes
  useEffect(() => {
    interface ModalStateEvent extends Event {
      detail?: {
        isModalOpen: boolean;
      };
    }

    const handleModalStateChange = (event: ModalStateEvent) => {
      if (event.detail && typeof event.detail.isModalOpen === 'boolean') {
        setIsModalOpen(event.detail.isModalOpen);
      }
    };
    
    // Listen for custom events from other components
    window.addEventListener('modalStateChange', handleModalStateChange as EventListener);
    
    // Check if any modals are currently open (for AddLinkModal, etc.)
    const checkForModals = () => {
      const modalElements = document.querySelectorAll('[role="dialog"]');
      setIsModalOpen(modalElements.length > 0);
    };
    
    // Check initially and set up observer
    checkForModals();
    const observer = new MutationObserver(checkForModals);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      window.removeEventListener('modalStateChange', handleModalStateChange as EventListener);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1e1e20] border-t border-[#33373b] z-50">
        <Tabs defaultValue={activeTab} value={activeTab} className="w-full">
          <TabsList className="h-12 bg-transparent grid grid-cols-6 gap-0.5">
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
                    "h-4 w-4",
                    isActive ? "text-[#54E0FF]" : "text-[#7a7a83]"
                  )} />
                  <span className="text-[7px] font-medium tracking-tight">{item.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
        
        {/* Preview Button removed - now in header */}
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