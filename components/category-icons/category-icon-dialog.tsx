'use client'

import { useState, useEffect } from 'react'
import { Settings, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LinkCategory, LINK_CATEGORIES } from '@/lib/services/link-service'
import { CategoryIconConfig, CategoryIconService, UpdateCategoryIconData } from '@/lib/services/category-icon-service'
import { CategoryIconSelector } from './category-icon-selector'
import { CategoryIconPreview } from './category-icon-preview'
import { toast } from 'sonner'

interface CategoryIconDialogProps {
  category: LinkCategory
  userId: string
  onUpdate?: () => void
  children?: React.ReactNode
}

export function CategoryIconDialog({ 
  category, 
  userId, 
  onUpdate,
  children 
}: CategoryIconDialogProps) {
  const [open, setOpen] = useState(false)
  const [iconConfig, setIconConfig] = useState<CategoryIconConfig | null>(null)
  const [loading, setLoading] = useState(false)

  const categoryConfig = LINK_CATEGORIES[category]

  useEffect(() => {
    if (open && userId) {
      loadIconConfig()
    }
  }, [open, userId, category])

  const loadIconConfig = async () => {
    try {
      setLoading(true)
      const config = await CategoryIconService.getCategoryIcon(userId, category)
      setIconConfig(config)
    } catch (error) {
      console.error('Error loading icon config:', error)
      toast.error('Failed to load icon configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (iconData: UpdateCategoryIconData) => {
    try {
      await CategoryIconService.updateCategoryIcon(userId, category, iconData)
      
      // Reload the icon config
      await loadIconConfig()
      
      // Notify parent component
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating icon:', error)
      throw error // Re-throw to let the selector handle the error display
    }
  }

  const handleReset = async () => {
    try {
      await CategoryIconService.resetCategoryIcon(userId, category)
      
      // Reload the icon config
      await loadIconConfig()
      
      // Notify parent component
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error resetting icon:', error)
      throw error // Re-throw to let the selector handle the error display
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className="border-[#33373b] text-gray-300 hover:text-white hover:bg-[#28282b]"
          >
            <Settings className="w-4 h-4 mr-2" />
            Customize Icon
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="glassmorphic border-[#33373b] bg-[#1a1a1a]/95 backdrop-blur-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-sharp-grotesk flex items-center gap-3">
            {iconConfig && (
              <CategoryIconPreview config={iconConfig} size={24} />
            )}
            Customize {categoryConfig?.label} Icon
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Info */}
          <div className="text-center p-4 bg-[#28282b]/50 rounded-lg border border-[#33373b]">
            <h3 className="text-white font-medium mb-1">{categoryConfig?.label}</h3>
            <p className="text-sm text-gray-400">{categoryConfig?.description}</p>
          </div>

          {/* Icon Selector */}
          {iconConfig ? (
            <CategoryIconSelector
              category={category}
              currentConfig={iconConfig}
              onUpdate={handleUpdate}
              onReset={handleReset}
              disabled={loading}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-[#33373b]">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="border-[#33373b] text-gray-300 hover:text-white hover:bg-[#28282b]"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
