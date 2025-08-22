'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { LinkCategory } from '@/lib/services/link-service'
import { CategoryIconService } from '@/lib/services/category-icon-service'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'

interface LibraryIcon {
  id: string
  name: string
  icon: string
}

interface IconLibrarySelectorProps {
  category: LinkCategory
  onSelect: (iconId: string) => void
  disabled?: boolean
}

export function IconLibrarySelector({ category, onSelect, disabled = false }: IconLibrarySelectorProps) {
  const [icons, setIcons] = useState<LibraryIcon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIcon, setSelectedIcon] = useState<string>('')

  useEffect(() => {
    loadLibraryIcons()
  }, [category])

  const loadLibraryIcons = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/category-icons/library?category=${category}`)
      
      if (!response.ok) {
        throw new Error('Failed to load library icons')
      }

      const data = await response.json()
      setIcons(data.icons || [])
    } catch (error) {
      console.error('Error loading library icons:', error)
      // Fallback to client-side icons
      const fallbackIcons = CategoryIconService.getLibraryIcons(category)
      setIcons(fallbackIcons)
    } finally {
      setLoading(false)
    }
  }

  const handleIconSelect = (iconId: string) => {
    setSelectedIcon(iconId)
    onSelect(iconId)
  }

  const renderIcon = (iconName: string, size: number = 24) => {
    // Get the icon component from Lucide
    const IconComponent = (LucideIcons as any)[iconName]
    
    if (!IconComponent) {
      // Fallback to a default icon if not found
      const FallbackIcon = LucideIcons.HelpCircle
      return <FallbackIcon size={size} />
    }
    
    return <IconComponent size={size} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#54E0FF]" />
        <span className="ml-2 text-gray-400">Loading icons...</span>
      </div>
    )
  }

  if (icons.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No icons available for this category
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
      {icons.map((icon) => (
        <Button
          key={icon.id}
          onClick={() => handleIconSelect(icon.id)}
          disabled={disabled}
          variant="outline"
          className={cn(
            "h-16 w-16 p-2 border-[#33373b] bg-[#28282b] hover:bg-[#33373b] hover:border-[#54E0FF] transition-all duration-200",
            selectedIcon === icon.id && "border-[#54E0FF] bg-[#54E0FF]/10"
          )}
          title={icon.name}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="text-[#54E0FF]">
              {renderIcon(icon.icon, 20)}
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">
              {icon.name}
            </span>
          </div>
        </Button>
      ))}
    </div>
  )
}
