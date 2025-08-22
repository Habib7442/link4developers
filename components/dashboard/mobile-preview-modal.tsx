'use client'

import { useState } from 'react'
import { X, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

interface MobilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  previewContent: React.ReactNode
}

export function MobilePreviewModal({ isOpen, onClose, previewContent }: MobilePreviewModalProps) {
  const { user } = useAuthStore()
  const [scale, setScale] = useState(0.8)

  if (!isOpen) return null

  // Handle opening full preview in new tab
  const handleOpenFullPreview = () => {
    if (!user?.profile_slug && !user?.github_username) {
      return
    }
    
    const username = user.profile_slug || user.github_username
    const previewUrl = `/${username}`
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:hidden">
      <div className="bg-[#1e1e20] border border-[#33373b] rounded-[20px] w-full max-w-sm h-[80vh] flex flex-col shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
        
        {/* Modal Header */}
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
            <Button
              onClick={onClose}
              size="sm"
              className="bg-transparent border-none text-[#7a7a83] hover:text-white p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Controls */}
        <div className="p-3 border-b border-[#33373b] flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                size="sm"
                className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 px-3"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              
              <Button
                onClick={handleOpenFullPreview}
                size="sm"
                className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 px-3"
                disabled={!user?.profile_slug && !user?.github_username}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            {/* Scale Controls */}
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setScale(Math.max(0.4, scale - 0.1))}
                size="sm"
                className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 w-8 p-0 text-xs"
              >
                -
              </Button>
              <span className="text-[11px] text-[#7a7a83] font-sharp-grotesk min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                onClick={() => setScale(Math.min(1, scale + 0.1))}
                size="sm"
                className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] h-8 w-8 p-0 text-xs"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden bg-[#18181a] relative">
          <div 
            className="absolute inset-0 origin-top-left transition-transform duration-200"
            style={{ 
              transform: `scale(${scale})`,
              width: `${100 / scale}%`,
              height: `${100 / scale}%`
            }}
          >
            <div className="w-full h-full overflow-y-auto custom-scrollbar">
              {previewContent}
            </div>
          </div>
        </div>

        {/* Preview Info */}
        <div className="p-3 border-t border-[#33373b] flex-shrink-0">
          <p className="text-[10px] text-[#7a7a83] font-sharp-grotesk text-center">
            {user?.profile_slug ? `link4coders.com/${user.profile_slug}` : 'Set up your profile URL to enable preview'}
          </p>
        </div>
      </div>
    </div>
  )
}
