'use client'

import React, { useState, useEffect } from 'react'
import { Plus, BarChart3, Eye, EyeOff, Edit, Trash2, GripVertical, User, Github, BookOpen, Award, Mail, Share2, Link, Globe, ExternalLink, Linkedin, Twitter, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { AddLinkModal } from '@/components/dashboard/add-link-modal'
import { LivePreview } from '@/components/dashboard/live-preview'
import { useAuthStore } from '@/stores/auth-store'
import { LinkService, UserLink, LinkCategory, LINK_CATEGORIES } from '@/lib/services/link-service'
import { ApiLinkService } from '@/lib/services/api-link-service'
import { CategoryOrderService } from '@/lib/services/category-order-service'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'


// Function to get the appropriate icon for a link
const getLinkIcon = (link: UserLink) => {
  // Check for uploaded icon
  if (link.icon_selection_type === 'upload' && link.uploaded_icon_url) {
    return (
      <Image
        src={link.uploaded_icon_url}
        alt={`${link.title} icon`}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    )
  }

  // Check for custom URL icon
  if (link.icon_selection_type === 'url' && link.custom_icon_url) {
    return (
      <Image
        src={link.custom_icon_url}
        alt={`${link.title} icon`}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    )
  }

  // Check for platform icon (social media)
  if (link.icon_selection_type === 'platform' && link.category === 'social' && link.platform_detected) {
    return (
      <Image
        src={`/icons/${link.platform_detected}/${link.icon_variant || 'default'}.png`}
        alt={`${link.platform_detected} icon`}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    )
  }

  // Default icons based on category
  const defaultIcons = {
    personal: ExternalLink,
    projects: Github,
    blogs: BookOpen,
    achievements: Award,
    contact: Mail,
    social: Globe,
    custom: Link
  }

  const IconComponent = defaultIcons[link.category] || Link
  return <IconComponent className="w-4 h-4 text-[#54E0FF]" />
}

export default function LinksPage() {
  const { user } = useAuthStore()
  const [links, setLinks] = useState<Record<LinkCategory, UserLink[]>>({} as Record<LinkCategory, UserLink[]>)
  const [categoryOrder, setCategoryOrder] = useState<LinkCategory[]>(CategoryOrderService.DEFAULT_ORDER)
  const [loading, setLoading] = useState(true)
  const [previewRefresh, setPreviewRefresh] = useState(0)

  const [analytics, setAnalytics] = useState<{
    totalClicks: number
    linksByCategory: Record<LinkCategory, number>
    topLinks: Array<{ title: string; clicks: number; url: string }>
  } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLink, setEditingLink] = useState<{
    id: string
    title: string
    url: string
    description?: string
    icon_type: string
    category: LinkCategory
  } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    linkId: string
    linkTitle: string
  }>({
    isOpen: false,
    linkId: '',
    linkTitle: ''
  })

  useEffect(() => {
    if (user?.id) {
      loadCategoryOrder()
      loadLinks()
      loadAnalytics()
    }
  }, [user?.id])

  const loadCategoryOrder = async () => {
    if (!user) return

    try {
      const order = await CategoryOrderService.getCategoryOrder(user.id)
      setCategoryOrder(order)
    } catch (error) {
      console.error('Error loading category order:', error)
      // Keep default order on error
    }
  }

  const loadLinks = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading links for user:', user!.id)
      const userLinks = await ApiLinkService.getUserLinks(user!.id)
      console.log('✅ Links loaded successfully:', userLinks)
      setLinks(userLinks)
    } catch (error) {
      console.error('❌ Error loading links:', error)
      toast.error('Failed to load links')
    } finally {
      setLoading(false)
    }
  }



  const loadAnalytics = async () => {
    try {
      const analyticsData = await LinkService.getLinkAnalytics(user!.id)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const handleToggleStatus = async (linkId: string) => {
    try {
      console.log('🔄 Toggling link status:', linkId)
      await ApiLinkService.toggleLinkStatus(user!.id, linkId)
      await loadLinks()
      setPreviewRefresh(prev => prev + 1)
      toast.success('Link status updated')
    } catch (error) {
      console.error('❌ Error toggling link status:', error)
      toast.error('Failed to update link status')
    }
  }

  const openDeleteDialog = (linkId: string, linkTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      linkId,
      linkTitle
    })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      linkId: '',
      linkTitle: ''
    })
  }

  const handleDeleteLink = async () => {
    try {
      console.log('🗑️ Deleting link:', deleteDialog.linkId)
      await ApiLinkService.deleteLink(user!.id, deleteDialog.linkId)
      await loadLinks()
      setPreviewRefresh(prev => prev + 1)
      toast.success('Link deleted successfully')
      closeDeleteDialog()
    } catch (error) {
      console.error('❌ Error deleting link:', error)
      toast.error('Failed to delete link')
      closeDeleteDialog()
    }
  }

  const handleEditLink = (link: UserLink) => {
    setEditingLink({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      icon_type: link.icon_type,
      category: link.category
    })
  }

  const handleAddLink = (category?: LinkCategory) => {
    // Don't set editingLink for add mode, just open the modal
    setEditingLink(null)
    setShowAddModal(true)

    // If we need to pre-select a category, we can handle it differently
    // For now, let's keep it simple and let users select the category
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    // Handle section reordering
    if (source.droppableId === 'category-sections' && destination.droppableId === 'category-sections') {
      const newCategoryOrder = [...categoryOrder]
      const [reorderedCategory] = newCategoryOrder.splice(source.index, 1)
      newCategoryOrder.splice(destination.index, 0, reorderedCategory)

      // Update local state immediately
      setCategoryOrder(newCategoryOrder)

      try {
        await CategoryOrderService.updateCategoryOrder(user!.id, newCategoryOrder)
        setPreviewRefresh(prev => prev + 1)
        toast.success('Category sections reordered successfully')
      } catch (error) {
        console.error('Error reordering category sections:', error)
        toast.error('Failed to reorder category sections')
        // Revert to previous order
        loadCategoryOrder()
      }
      return
    }

    // Handle link reordering within categories
    const category = source.droppableId as LinkCategory

    if (source.droppableId !== destination.droppableId) return

    const categoryLinks = [...links[category]]
    const [reorderedItem] = categoryLinks.splice(source.index, 1)
    categoryLinks.splice(destination.index, 0, reorderedItem)

    // Update local state immediately
    setLinks(prev => ({
      ...prev,
      [category]: categoryLinks
    }))

    try {
      const linkIds = categoryLinks.map(link => link.id)
      await LinkService.reorderLinks(user!.id, category, linkIds)
      setPreviewRefresh(prev => prev + 1)
      toast.success('Links reordered successfully')
    } catch (error) {
      console.error('Error reordering links:', error)
      toast.error('Failed to reorder links')
      // Reload to revert changes
      loadLinks()
    }
  }

  const handleResetCategoryOrder = async () => {
    try {
      await CategoryOrderService.resetCategoryOrder(user!.id)
      setCategoryOrder(CategoryOrderService.DEFAULT_ORDER)
      setPreviewRefresh(prev => prev + 1)
      toast.success('Category order reset to default')
    } catch (error) {
      console.error('Error resetting category order:', error)
      toast.error('Failed to reset category order')
    }
  }

  const getCategoryIcon = (category: LinkCategory, iconName: string) => {
    // Use default icons for categories
    const icons = {
      User, Github, BookOpen, Award, Mail, Share2, Link
    }
    const IconComponent = icons[iconName as keyof typeof icons] || Link
    return <IconComponent className="w-5 h-5" />
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#54E0FF]"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Create preview content
  const previewContent = (
    <LivePreview
      profileData={user || undefined}
      refreshTrigger={previewRefresh}
    />
  )

  return (
    <DashboardLayout showPreview={true} previewContent={previewContent}>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-medium leading-[38px] tracking-[-0.96px] font-sharp-grotesk text-white">
                Link Manager
              </h1>
              <p className="text-[16px] font-light text-[#7a7a83] font-sharp-grotesk mt-2">
                Organize your links by category and track their performance
              </p>
            </div>
            <Button
              onClick={() => handleAddLink()}
              className="bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>

          {/* Analytics Overview */}
          {analytics && (
            <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#54E0FF]" />
                <h2 className="text-[20px] font-medium leading-[24px] tracking-[-0.6px] font-sharp-grotesk text-white">
                  Analytics Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-[24px] font-medium text-[#54E0FF] font-sharp-grotesk">
                    {analytics.totalClicks}
                  </div>
                  <div className="text-[14px] text-[#7a7a83] font-sharp-grotesk">Total Clicks</div>
                </div>

                <div className="text-center">
                  <div className="text-[24px] font-medium text-[#54E0FF] font-sharp-grotesk">
                    {Object.values(links).reduce((sum, categoryLinks) => sum + categoryLinks.length, 0)}
                  </div>
                  <div className="text-[14px] text-[#7a7a83] font-sharp-grotesk">Total Links</div>
                </div>

                <div className="text-center">
                  <div className="text-[24px] font-medium text-[#54E0FF] font-sharp-grotesk">
                    {Object.values(links).reduce((sum, categoryLinks) =>
                      sum + categoryLinks.filter(link => link.is_active).length, 0
                    )}
                  </div>
                  <div className="text-[14px] text-[#7a7a83] font-sharp-grotesk">Active Links</div>
                </div>
              </div>
            </div>
          )}

          {/* Link Categories */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-medium text-white font-sharp-grotesk">
              Category Sections
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetCategoryOrder}
              className="border-[#54E0FF]/20 text-[#54E0FF] hover:bg-[#54E0FF]/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Order
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="category-sections" type="CATEGORY">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-6"
                >
                  {categoryOrder.map((category, index) => {
                    const categoryConfig = LINK_CATEGORIES[category]
                    const categoryLinks = links[category] || []

                    return (
                      <Draggable key={category} draggableId={category} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] ${
                              snapshot.isDragging ? 'shadow-2xl scale-[1.02] rotate-1' : ''
                            } transition-all duration-200`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-[#7a7a83] hover:text-white cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 transition-colors"
                                  title="Drag to reorder section"
                                >
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center">
                                  <div className="text-[#54E0FF]">
                                    {getCategoryIcon(category, categoryConfig.icon)}
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-[18px] font-medium leading-[22px] tracking-[-0.54px] font-sharp-grotesk text-white">
                                    {categoryConfig.label}
                                  </h3>
                                  <p className="text-[14px] font-light text-[#7a7a83] font-sharp-grotesk">
                                    {categoryConfig.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk">
                                  {categoryLinks.length}/{categoryConfig.maxLinks}
                                </span>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddLink(category)}
                                  className="border-[#54E0FF]/20 text-[#54E0FF] hover:bg-[#54E0FF]/10"
                                  disabled={categoryLinks.length >= categoryConfig.maxLinks}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                  </div>

                  <Droppable droppableId={category}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {categoryLinks.length === 0 ? (
                          <div className="text-center py-8 text-[#7a7a83] font-sharp-grotesk">
                            No links in this category yet. Add your first link!
                          </div>
                        ) : (
                          categoryLinks.map((link, index) => (
                            <Draggable key={link.id} draggableId={link.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]/50 ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  } ${!link.is_active ? 'opacity-50' : ''}`}
                                >
                                  <div {...provided.dragHandleProps} className="text-[#7a7a83] hover:text-white cursor-grab">
                                    <GripVertical className="w-4 h-4" />
                                  </div>

                                  {/* Link Icon */}
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center flex-shrink-0">
                                    {getLinkIcon(link)}
                                  </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-[14px] font-medium text-white font-sharp-grotesk truncate">
                                {link.title}
                              </h4>
                              <span className="text-[12px] text-[#7a7a83] font-sharp-grotesk flex-shrink-0">
                                {link.click_count || 0} clicks
                              </span>
                            </div>
                            <p className="text-[12px] text-[#7a7a83] font-sharp-grotesk truncate">
                              {link.url}
                            </p>
                          </div>

                          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(link.id)}
                              className="text-[#7a7a83] hover:text-white h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md"
                            >
                              {link.is_active ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditLink(link)}
                              className="text-[#7a7a83] hover:text-white h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDeleteDialog(link.id, link.title)}
                              className="text-red-400 hover:text-red-300 h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

          {/* Add/Edit Link Modal */}
          <AddLinkModal
            isOpen={showAddModal || !!editingLink}
            onClose={() => {
              setShowAddModal(false)
              setEditingLink(null)
            }}
            onSuccess={() => {
              loadLinks()
              loadAnalytics()
              setPreviewRefresh(prev => prev + 1)
            }}
            editLink={editingLink}
          />

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialog.isOpen} onOpenChange={closeDeleteDialog}>
            <AlertDialogContent className="glassmorphic border-[#2a2a2a] shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-medium leading-[24px] tracking-[-0.6px] font-sharp-grotesk text-white">
                  Delete Link
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[14px] font-light text-[#7a7a83] font-sharp-grotesk">
                  Are you sure you want to delete "{deleteDialog.linkTitle}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3 pt-4">
                <AlertDialogCancel className="border-[#2a2a2a] text-[#7a7a83] hover:text-white hover:border-[#54E0FF]/50 bg-transparent">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteLink}
                  className="bg-red-600 text-white hover:bg-red-700 border-0"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DashboardLayout>
  )
}
