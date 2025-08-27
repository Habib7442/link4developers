"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  BarChart3,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  GripVertical,
  User,
  Github,
  BookOpen,
  Award,
  Mail,
  Share2,
  Link,
  Globe,
  ExternalLink,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowBigUp,
  ArrowBigDown,
} from "lucide-react";
import Image from "next/image";
import { AddLinkModal } from "@/components/dashboard/add-link-modal";
import { useAuthStore } from "@/stores/auth-store";
import {
  LinkService,
  UserLink,
} from "@/lib/services/link-service";
import { LinkCategory } from '@/lib/domain/entities';
import { LINK_CATEGORIES } from "@/lib/services/link-constants";
import { ApiLinkService } from "@/lib/services/api-link-service";
import { CategoryOrderService } from "@/lib/services/category-order-service";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { UserLinkWithPreview } from '@/lib/types/rich-preview';
import { supabase } from '@/lib/supabase';

// Import dnd-kit libraries instead of @hello-pangea/dnd
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Add this new component for sortable link items
interface SortableLinkItemProps {
  id: string;
  link: UserLinkWithPreview;
  index: number;
  category: LinkCategory;
  onToggleStatus: (linkId: string) => Promise<void>;
  onEditLink: (link: UserLinkWithPreview) => void;
  onDeleteLink: (linkId: string, linkTitle: string) => void;
}

const SortableLinkItem = ({
  id,
  link,
  index,
  category,
  onToggleStatus,
  onEditLink,
  onDeleteLink,
}: SortableLinkItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-lg border border-[#33373b] bg-[#1a1a1a]/50 ${
        isDragging ? "shadow-lg z-10" : ""
      } ${!link.is_active ? "opacity-50" : ""} overflow-hidden`}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-[#7a7a83] hover:text-white cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical className="w-3 h-3 sm:w-4 sm:h-4" />
      </div>

      {/* Link Icon */}
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center flex-shrink-0">
        {getLinkIcon(link)}
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
          <h4 className="text-xs sm:text-sm font-medium text-white truncate flex-1">
            {link.title}
          </h4>
          <span className="text-xs text-[#7a7a83] flex-shrink-0 whitespace-nowrap hidden sm:inline">
            {link.click_count || 0} clicks
          </span>
        </div>
        <p className="text-xs text-[#7a7a83] truncate">
          {link.url}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggleStatus(link.id)}
          className="text-[#7a7a83] hover:text-white h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-md flex-shrink-0"
        >
          {link.is_active ? (
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEditLink(link)}
          className="text-[#7a7a83] hover:text-white h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-md flex-shrink-0"
        >
          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDeleteLink(link.id, link.title)}
          className="text-red-400 hover:text-red-300 h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-md flex-shrink-0"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
};

// Function to get the appropriate icon for a link
const getLinkIcon = (link: UserLinkWithPreview) => {
  // Check for uploaded icon
  if (link.icon_selection_type === "upload" && link.uploaded_icon_url) {
    return (
      <Image
        src={link.uploaded_icon_url}
        alt={`${link.title} icon`}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    );
  }

  // Check for custom URL icon
  if (link.icon_selection_type === "url" && link.custom_icon_url) {
    return (
      <Image
        src={link.custom_icon_url}
        alt={`${link.title} icon`}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    );
  }

  // Check for platform icon (social media)
  if (
    link.icon_selection_type === "platform" &&
    link.category === "social" &&
    link.platform_detected
  ) {
    return (
      <Image
        src={`/icons/${link.platform_detected}/${
          link.icon_variant || "default"
        }.png`}
        alt={`${link.platform_detected} icon`}
        width={16}
        height={16}
        className="w-4 h-4 object-contain"
      />
    );
  }

  // Default icons based on category
  const defaultIcons = {
    personal: ExternalLink,
    projects: Github,
    blogs: BookOpen,
    achievements: Award,
    contact: Mail,
    social: Globe,
    custom: Link,
  };

  const IconComponent = defaultIcons[link.category as keyof typeof defaultIcons] || Link;
  return <IconComponent className="w-4 h-4 text-[#54E0FF]" />;
};

interface LinkManagerProps {
  onPreviewRefresh: () => void;
}

export function LinkManager({ onPreviewRefresh }: LinkManagerProps) {
  const { user } = useAuthStore();
  const [links, setLinks] = useState<Record<LinkCategory, UserLinkWithPreview[]>>(
    {} as Record<LinkCategory, UserLinkWithPreview[]>
  );
  const [categoryOrder, setCategoryOrder] = useState<LinkCategory[]>(
    CategoryOrderService.DEFAULT_ORDER
  );
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState<{
    totalClicks: number;
    linksByCategory: Record<LinkCategory, number>;
    topLinks: Array<{ title: string; clicks: number; url: string }>;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState<
    LinkCategory | undefined
  >(undefined);
  const [editingLink, setEditingLink] = useState<{
    id: string;
    title: string;
    url: string;
    description?: string;
    icon_type: string;
    category: LinkCategory;
    custom_icon_url?: string;
    uploaded_icon_url?: string;
    icon_variant?: string;
    use_custom_icon?: boolean;
    icon_selection_type?: 'default' | 'platform' | 'upload' | 'url';
    platform_detected?: string;
    live_project_url?: string;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    linkId: string;
    linkTitle: string;
  }>({
    isOpen: false,
    linkId: "",
    linkTitle: "",
  });
  
  // Set up sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Add the new reordering functions here
  const moveLink = async (category: LinkCategory, fromIndex: number, toIndex: number) => {
    if (!user?.id || fromIndex === toIndex) return;

    try {
      // Update local state immediately for instant feedback
      setLinks(prev => moveLinkInCategory(prev, category, fromIndex, toIndex));
      
      // Get the updated link order
      const categoryLinks = links[category];
      const updatedLinks = [...categoryLinks];
      const [movedLink] = updatedLinks.splice(fromIndex, 1);
      updatedLinks.splice(toIndex, 0, movedLink);
      
      // Send the new order to the API
      const linkIds = updatedLinks.map(link => link.id);
      await LinkService.reorderLinks(user.id, category, linkIds);
      
      // Invalidate cache to ensure public profile shows the changes
      try {
        const username = user?.profile_slug || user?.github_username;
        if (username) {
          await fetch(`/api/revalidate?tag=public-profile-${username}`, {
            method: "POST",
          });
          console.log("✅ Cache invalidated for profile:", username);
        }
      } catch (cacheError) {
        console.warn("Failed to invalidate cache:", cacheError);
      }
      
      onPreviewRefresh();
      toast.success("Link moved successfully");
    } catch (error) {
      console.error("Error moving link:", error);
      toast.error("Failed to move link");
      // Reload to revert changes
      loadLinks();
    }
  };

  const moveLinkToTop = async (category: LinkCategory, index: number) => {
    if (index === 0) return; // Already at top
    await moveLink(category, index, 0);
  };

  const moveLinkToBottom = async (category: LinkCategory, index: number) => {
    const categoryLinks = links[category];
    if (index === categoryLinks.length - 1) return; // Already at bottom
    await moveLink(category, index, categoryLinks.length - 1);
  };

  const moveLinkUp = async (category: LinkCategory, index: number) => {
    if (index === 0) return; // Already at top
    await moveLink(category, index, index - 1);
  };

  const moveLinkDown = async (category: LinkCategory, index: number) => {
    const categoryLinks = links[category];
    if (index === categoryLinks.length - 1) return; // Already at bottom
    await moveLink(category, index, index + 1);
  };

  useEffect(() => {
    if (user?.id) {
      loadCategoryOrder();
      loadLinks();
      loadAnalytics();
    }
  }, [user?.id]);

  const loadCategoryOrder = async () => {
    if (!user) return;

    try {
      const order = await CategoryOrderService.getCategoryOrder(user.id);
      setCategoryOrder(order);
    } catch (error) {
      console.error("Error loading category order:", error);
      // Keep default order on error
    }
  };

  const loadLinks = async () => {
    try {
      setLoading(true);
      const userLinks = await ApiLinkService.getUserLinks(user!.id);

      // Cast the returned data to the correct type
      setLinks(userLinks as Record<LinkCategory, UserLinkWithPreview[]>);
    } catch (error) {
      console.error("❌ Error loading links:", error);
      toast.error("Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await LinkService.getLinkAnalytics(user!.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const handleToggleStatus = async (linkId: string) => {
    try {
      await ApiLinkService.toggleLinkStatus(user!.id, linkId);
      await loadLinks();
      onPreviewRefresh();
      toast.success("Link status updated");
    } catch (error) {
      console.error("❌ Error toggling link status:", error);
      toast.error("Failed to update link status");
    }
  };

  const openDeleteDialog = (linkId: string, linkTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      linkId,
      linkTitle,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      linkId: "",
      linkTitle: "",
    });
  };

  const handleDeleteLink = async () => {
    try {
      await ApiLinkService.deleteLink(user!.id, deleteDialog.linkId);
      await loadLinks();
      onPreviewRefresh();
      toast.success("Link deleted successfully");
      closeDeleteDialog();
    } catch (error) {
      console.error("❌ Error deleting link:", error);
      toast.error("Failed to delete link");
      closeDeleteDialog();
    }
  };

  const handleEditLink = (link: UserLinkWithPreview) => {
    setEditingLink({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      icon_type: link.icon_type,
      category: link.category as LinkCategory,
      custom_icon_url: link.custom_icon_url,
      uploaded_icon_url: link.uploaded_icon_url,
      icon_variant: link.icon_variant,
      use_custom_icon: link.use_custom_icon,
      icon_selection_type: link.icon_selection_type,
      platform_detected: link.platform_detected,
      live_project_url: link.live_project_url || '',
    });
  };

  const handleAddLink = (category?: LinkCategory) => {
    // Set the default category for the modal
    setDefaultCategory(category);
    setEditingLink(null);
    setShowAddModal(true);
  };

  // Replace the old handleDragEnd with this new one for dnd-kit
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) {
      return;
    }
    
    // Extract category and link ID from the combined ID
    const activeIdParts = String(active.id).split('::');
    const category = activeIdParts[0] as LinkCategory;
    const linkId = activeIdParts[1];
    
    // Find the indices for reordering
    const categoryLinks = [...links[category]];
    const oldIndex = categoryLinks.findIndex(link => link.id === linkId);
    const newIndex = categoryLinks.findIndex(link => link.id === String(over.id).split('::')[1]);
    
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    
    try {
      // Update local state immediately for better UX
      setLinks(prev => {
        const newLinks = { ...prev };
        newLinks[category] = arrayMove(categoryLinks, oldIndex, newIndex);
        return newLinks;
      });
      
      // Get the updated link order
      const updatedLinks = arrayMove(categoryLinks, oldIndex, newIndex);
      const linkIds = updatedLinks.map(link => link.id);
      
      // Check if the reorderLinks method exists in ApiLinkService, otherwise fall back to LinkService
      if (typeof ApiLinkService.reorderLinks === 'function') {
        await ApiLinkService.reorderLinks(user!.id, category, linkIds);
      } else {
        // Fallback to a direct API call if the method isn't available

        // Get auth session for manual API call
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;
        
        if (!accessToken) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('/api/links/reorder', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ category, linkIds }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to reorder links');
        }
      }
      
      // Invalidate cache to ensure public profile shows the changes
      try {
        const username = user?.profile_slug || user?.github_username;
        if (username) {
          await fetch(`/api/revalidate?tag=public-profile-${username}`, {
            method: "POST",
          });
        }
      } catch (cacheError) {
        console.warn("Failed to invalidate cache:", cacheError);
      }
      
      onPreviewRefresh();
      toast.success("Links reordered successfully");
    } catch (error) {
      console.error("Error reordering links:", error);
      toast.error("Failed to reorder links: " + (error instanceof Error ? error.message : "An unknown error occurred"));
      // Reload to revert changes
      loadLinks();
    }
  };

  const handleResetCategoryOrder = async () => {
    try {
      await CategoryOrderService.resetCategoryOrder(user!.id);
      setCategoryOrder(CategoryOrderService.DEFAULT_ORDER);

      // Invalidate cache to ensure public profile shows the changes
      try {
        const username = user?.profile_slug || user?.github_username;
        if (username) {
          await fetch(`/api/revalidate?tag=public-profile-${username}`, {
            method: "POST",
          });
          console.log("✅ Cache invalidated for profile:", username);
        }
      } catch (cacheError) {
        console.warn("Failed to invalidate cache:", cacheError);
        // Don't fail the operation if cache invalidation fails
      }

      onPreviewRefresh();
      toast.success("Category order reset to default");
    } catch (error) {
      console.error("Error resetting category order:", error);
      toast.error("Failed to reset category order");
    }
  };

  // Add these new functions to handle section reordering
  const moveSectionUp = async (index: number) => {
    if (index === 0) return; // Already at top
    
    try {
      // Create new order by swapping positions
      const newCategoryOrder = [...categoryOrder];
      const temp = newCategoryOrder[index];
      newCategoryOrder[index] = newCategoryOrder[index - 1];
      newCategoryOrder[index - 1] = temp;
      
      // Update local state immediately
      setCategoryOrder(newCategoryOrder);
      
      // Update in database
      await CategoryOrderService.updateCategoryOrder(user!.id, newCategoryOrder);
      
      // Invalidate cache to ensure public profile shows the changes
      try {
        const username = user?.profile_slug || user?.github_username;
        if (username) {
          await fetch(`/api/revalidate?tag=public-profile-${username}`, {
            method: "POST",
          });
        }
      } catch (cacheError) {
        console.warn("Failed to invalidate cache:", cacheError);
      }
      
      onPreviewRefresh();
      toast.success("Section moved up successfully");
    } catch (error) {
      console.error("Error moving section up:", error);
      toast.error("Failed to move section");
      // Reload to revert changes
      loadCategoryOrder();
    }
  };
  
  const moveSectionDown = async (index: number) => {
    if (index === categoryOrder.length - 1) return; // Already at bottom
    
    try {
      // Create new order by swapping positions
      const newCategoryOrder = [...categoryOrder];
      const temp = newCategoryOrder[index];
      newCategoryOrder[index] = newCategoryOrder[index + 1];
      newCategoryOrder[index + 1] = temp;
      
      // Update local state immediately
      setCategoryOrder(newCategoryOrder);
      
      // Update in database
      await CategoryOrderService.updateCategoryOrder(user!.id, newCategoryOrder);
      
      // Invalidate cache to ensure public profile shows the changes
      try {
        const username = user?.profile_slug || user?.github_username;
        if (username) {
          await fetch(`/api/revalidate?tag=public-profile-${username}`, {
            method: "POST",
          });
        }
      } catch (cacheError) {
        console.warn("Failed to invalidate cache:", cacheError);
      }
      
      onPreviewRefresh();
      toast.success("Section moved down successfully");
    } catch (error) {
      console.error("Error moving section down:", error);
      toast.error("Failed to move section");
      // Reload to revert changes
      loadCategoryOrder();
    }
  };
  
  const moveSectionToTop = async (index: number) => {
    if (index === 0) return; // Already at top
    
    try {
      // Create new order by moving the selected category to the top
      const newCategoryOrder = [...categoryOrder];
      const [category] = newCategoryOrder.splice(index, 1);
      newCategoryOrder.unshift(category);
      
      // Update local state immediately
      setCategoryOrder(newCategoryOrder);
      
      // Update in database
      await CategoryOrderService.updateCategoryOrder(user!.id, newCategoryOrder);
      
      // Invalidate cache to ensure public profile shows the changes
      try {
        const username = user?.profile_slug || user?.github_username;
        if (username) {
          await fetch(`/api/revalidate?tag=public-profile-${username}`, {
            method: "POST",
          });
        }
      } catch (cacheError) {
        console.warn("Failed to invalidate cache:", cacheError);
      }
      
      onPreviewRefresh();
      toast.success("Section moved to top successfully");
    } catch (error) {
      console.error("Error moving section to top:", error);
      toast.error("Failed to move section");
      // Reload to revert changes
      loadCategoryOrder();
    }
  };
  
  const moveSectionToBottom = async (index: number) => {
    if (index === categoryOrder.length - 1) return; // Already at bottom
    
    try {
      // Create new order by moving the selected category to the bottom
      const newCategoryOrder = [...categoryOrder];
      const [category] = newCategoryOrder.splice(index, 1);
      newCategoryOrder.push(category);
      
      // Update local state immediately
      setCategoryOrder(newCategoryOrder);
      
      // Update in database
      await CategoryOrderService.updateCategoryOrder(user!.id, newCategoryOrder);
      
      // Invalidate cache to ensure public profile shows the changes
      try {
        const username = user?.profile_slug || user?.github_username;
        if (username) {
          await fetch(`/api/revalidate?tag=public-profile-${username}`, {
            method: "POST",
          });
        }
      } catch (cacheError) {
        console.warn("Failed to invalidate cache:", cacheError);
      }
      
      onPreviewRefresh();
      toast.success("Section moved to bottom successfully");
    } catch (error) {
      console.error("Error moving section to bottom:", error);
      toast.error("Failed to move section");
      // Reload to revert changes
      loadCategoryOrder();
    }
  };

  const getCategoryIcon = (category: LinkCategory, iconName: string) => {
    // Use default icons for categories
    const icons = {
      User,
      Github,
      BookOpen,
      Award,
      Mail,
      Share2,
      Link,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Link;
    return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  if (loading) {
    return (
      <div className="w-[86%] sm:w-[90%] md:w-[94%] lg:w-full mx-auto px-0 sm:px-0 md:px-0 max-w-full">
        <div className="glassmorphic rounded-xl p-4 sm:p-5 md:p-6 shadow-lg min-w-[280px] max-w-[330px] sm:max-w-[500px] md:max-w-[650px] lg:max-w-none mx-auto w-full overflow-hidden">
          <div className="animate-pulse space-y-4 sm:space-y-5">
            <div className="h-5 sm:h-6 md:h-7 bg-[#28282b] rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 sm:h-20 md:h-24 bg-[#28282b] rounded-lg"></div>
              ))}
            </div>
            <div className="h-32 sm:h-40 md:h-48 bg-[#28282b] rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalLinks = Object.values(links).reduce(
    (sum, categoryLinks) => sum + categoryLinks.length,
    0
  );

  const activeLinks = Object.values(links).reduce(
    (sum, categoryLinks) =>
      sum + categoryLinks.filter((link) => link.is_active).length,
    0
  );

  return (
    <div className="w-[86%] sm:w-[90%] md:w-[94%] lg:w-full mx-auto px-0 sm:px-0 md:px-0 max-w-full">
      {/* Link Statistics Status */}
      <div className="glassmorphic rounded-xl p-4 sm:p-5 md:p-6 shadow-lg min-w-[280px] max-w-[330px] sm:max-w-[500px] md:max-w-[650px] lg:max-w-none mx-auto w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg md:text-xl font-medium text-white mb-1 sm:mb-2">
              Link Statistics
            </h2>
            <p className="text-xs sm:text-sm font-light text-[#7a7a83] break-words">
              {totalLinks > 0 ? `${activeLinks} active links out of ${totalLinks} total` : 'No links added yet'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#54E0FF]" />
            <span className="text-xs sm:text-sm font-medium text-[#54E0FF] whitespace-nowrap">
              {analytics?.totalClicks || 0} Total Clicks
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="glassmorphic rounded-xl p-4 sm:p-5 md:p-6 shadow-lg min-w-[280px] max-w-[330px] sm:max-w-[500px] md:max-w-[650px] lg:max-w-none mx-auto w-full mt-4 sm:mt-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg md:text-xl font-medium text-white">
              Analytics Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div className="text-center bg-[#28282b]/70 rounded-lg p-4 w-full">
              <div className="text-lg sm:text-xl font-medium text-[#54E0FF]">
                {analytics.totalClicks}
              </div>
              <div className="text-xs sm:text-sm text-[#7a7a83]">
                Total Clicks
              </div>
            </div>

            <div className="text-center bg-[#28282b]/70 rounded-lg p-4 w-full">
              <div className="text-lg sm:text-xl font-medium text-[#54E0FF]">
                {totalLinks}
              </div>
              <div className="text-xs sm:text-sm text-[#7a7a83]">
                Total Links
              </div>
            </div>

            <div className="text-center bg-[#28282b]/70 rounded-lg p-4 w-full">
              <div className="text-lg sm:text-xl font-medium text-[#54E0FF]">
                {activeLinks}
              </div>
              <div className="text-xs sm:text-sm text-[#7a7a83]">
                Active Links
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Management */}
      <div className="glassmorphic rounded-xl p-4 sm:p-5 md:p-6 shadow-lg min-w-[280px] max-w-[330px] sm:max-w-[500px] md:max-w-[650px] lg:max-w-none mx-auto w-full mt-4 sm:mt-5 overflow-hidden" style={{ position: 'relative' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg md:text-xl font-medium text-white">
              Manage Your Links
            </h2>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 md:space-y-5 overflow-visible relative">
          {categoryOrder.map((category, index) => {
            const categoryConfig = LINK_CATEGORIES[category];
            const categoryLinks = links[category] || [];

            return (
              <div
                key={category}
                className={`bg-[#28282b] border border-[#33373b] rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 transition-all duration-150 overflow-hidden`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center flex-shrink-0">
                      <div className="text-[#54E0FF]">
                        {getCategoryIcon(
                          category,
                          categoryConfig.icon
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h3 className="text-sm sm:text-base font-medium text-white truncate">
                        {categoryConfig.label}
                      </h3>
                      <p className="text-xs text-[#7a7a83] truncate hidden sm:block">
                        {categoryConfig.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-0 sm:ml-0 mt-2 sm:mt-0">
                    {/* Section reordering buttons */}
                    <div className="flex flex-col gap-0.5 mr-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSectionToTop(index)}
                        className="text-[#7a7a83] hover:text-white h-5 w-5 p-0 rounded-md flex-shrink-0"
                        disabled={index === 0}
                        title="Move section to top"
                      >
                        <ArrowBigUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSectionUp(index)}
                        className="text-[#7a7a83] hover:text-white h-5 w-5 p-0 rounded-md flex-shrink-0"
                        disabled={index === 0}
                        title="Move section up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <span className="text-xs text-[#7a7a83]">
                      {categoryLinks.length}/{categoryConfig.maxLinks}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddLink(category)}
                      className="border-[#54E0FF]/20 text-[#54E0FF] hover:bg-[#54E0FF]/10 h-7 sm:h-8 text-xs px-2 sm:px-3"
                      disabled={
                        categoryLinks.length >=
                        categoryConfig.maxLinks
                      }
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden xs:inline">Add</span>
                    </Button>
                    
                    <div className="flex flex-col gap-0.5 ml-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSectionDown(index)}
                        className="text-[#7a7a83] hover:text-white h-5 w-5 p-0 rounded-md flex-shrink-0"
                        disabled={index === categoryOrder.length - 1}
                        title="Move section down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveSectionToBottom(index)}
                        className="text-[#7a7a83] hover:text-white h-5 w-5 p-0 rounded-md flex-shrink-0"
                        disabled={index === categoryOrder.length - 1}
                        title="Move section to bottom"
                      >
                        <ArrowBigDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Link items with dnd-kit */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event)}
                >
                  <div className="space-y-3 sm:space-y-4 min-h-[40px] relative overflow-hidden">
                    {categoryLinks.length === 0 ? (
                      <div className="text-center py-3 sm:py-4 text-xs sm:text-sm text-[#7a7a83]">
                        No links in this category yet. Add your first link!
                      </div>
                    ) : (
                      <SortableContext
                        items={categoryLinks.map(link => `${category}::${link.id}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {categoryLinks.map((link, linkIndex) => (
                          <SortableLinkItem
                            key={link.id}
                            id={`${category}::${link.id}`}
                            link={link}
                            index={linkIndex}
                            category={category}
                            onToggleStatus={handleToggleStatus}
                            onEditLink={handleEditLink}
                            onDeleteLink={openDeleteDialog}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </div>
                </DndContext>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Link Modal */}
      <AddLinkModal
        isOpen={showAddModal || !!editingLink}
        onClose={() => {
          setShowAddModal(false);
          setEditingLink(null);
          setDefaultCategory(undefined);
        }}
        onSuccess={() => {
          loadLinks();
          loadAnalytics();
          onPreviewRefresh();
        }}
        defaultCategory={defaultCategory}
        editLink={editingLink}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent className="glassmorphic rounded-xl border-[#2a2a2a] shadow-lg max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg font-medium text-white">
              Delete Link
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm font-light text-[#7a7a83]">
              Are you sure you want to delete &ldquo;{deleteDialog.linkTitle}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-3 pt-3 sm:pt-4">
            <AlertDialogCancel className="border-[#2a2a2a] text-[#7a7a83] hover:text-white hover:border-[#54E0FF]/50 bg-transparent h-8 sm:h-9 text-xs sm:text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLink}
              className="bg-red-600 text-white hover:bg-red-700 border-0 h-8 sm:h-9 text-xs sm:text-sm">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Add this helper function before the LinkManager component
const moveLinkInCategory = (
  links: Record<LinkCategory, UserLinkWithPreview[]>,
  category: LinkCategory,
  fromIndex: number,
  toIndex: number
): Record<LinkCategory, UserLinkWithPreview[]> => {
  const newLinks = { ...links };
  const categoryLinks = [...newLinks[category]];
  const [movedLink] = categoryLinks.splice(fromIndex, 1);
  categoryLinks.splice(toIndex, 0, movedLink);
  newLinks[category] = categoryLinks;
  return newLinks;
};
