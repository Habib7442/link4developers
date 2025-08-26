'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:hidden">
      <div className="bg-[#1e1e20] border border-[#33373b] rounded-[20px] w-full max-w-sm h-[80vh] flex flex-col shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] overflow-hidden">
        
        {/* Modal Handle for better UX */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-[#33373b] rounded-full"></div>
        </div>
        
        {/* Modal Header - Simplified to avoid duplication */}
        <div className="p-3 border-b border-[#33373b] flex-shrink-0 flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-white font-sharp-grotesk">
            Live Preview
          </h3>
          <Button
            onClick={onClose}
            size="sm"
            className="bg-transparent border-none text-[#7a7a83] hover:text-white p-1.5"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Preview Content - With improved padding and spacing for rounded corners */}
        <div className="flex-1 overflow-hidden bg-[#18181a] relative">
          <div 
            className="absolute inset-0 origin-top-left transition-transform duration-200"
            style={{ 
              transform: `scale(${scale})`,
              width: `${100 / scale}%`,
              height: `${100 / scale}%`
            }}
          >
            <div className="w-full h-full overflow-y-auto custom-scrollbar pb-4">
              {previewContent}
            </div>
          </div>
        </div>

        {/* Footer removed to prevent duplication */}
      </div>
    </div>
  )
}
