"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { AddLinkModal } from "@/components/dashboard/add-link-modal";
import { useAuthStore } from "@/stores/auth-store";
import { UserLink, LinkCategory } from "@/lib/services/link-service";
import { CategoryOrderService } from "@/lib/services/category-order-service";
import { LinkService } from "@/lib/services/link-service";
import { toast } from "sonner";
import Image from "next/image";
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

// Import React Query hooks
import {
  useUserLinks,
  useLinkAnalytics,
  useCategoryOrder,
  useUpdateCategoryOrder,
  useToggleLinkStatus,
  useDeleteLink,
  usePrefetchDashboardData,
} from "@/lib/hooks/use-dashboard-queries";
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/hooks/use-dashboard-queries';

// Import the new components
import { LinkStatistics } from "./link-statistics";
import { AnalyticsOverview } from "./analytics-overview";
import { LinkManagementHeader } from "./link-management-header";
import { LinkCategorySection } from "./link-category-section";
import { LinksLoadingState } from "../query-loading-states";

// Interfaces for proper typing
import { UserLinkWithPreview, RichPreviewMetadata } from '@/lib/types/rich-preview';

// Just using UserLinkWithPreview directly from the types
type LinkWithPreview = UserLinkWithPreview;

interface LinkAnalytics {
  totalClicks: number;
  linksByCategory: Record<string, number>;
  topLinks: Array<{ title: string; clicks: number; url: string }>;
}

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
  const defaultIcons: Record<string, string> = {
    personal: "🔗",
    projects: "📁",
    blogs: "📝",
    achievements: "🏆",
    contact: "📧",
    social: "🌐",
    custom: "🔗",
  };

  return <span className="text-[#54E0FF]">{defaultIcons[link.category] || "🔗"}</span>;
};

interface LinkManagerProps {
  onPreviewRefresh: () => void;
}

export function LinkManager({ onPreviewRefresh }: LinkManagerProps) {
  const { user } = useAuthStore();
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

  // React Query hooks
  const queryClient = useQueryClient();
  const { data: links = {} as Record<LinkCategory, LinkWithPreview[]>, isLoading: linksLoading, error: linksError } = useUserLinks(user?.id || '');
  const { data: analytics = null as LinkAnalytics | null, isLoading: analyticsLoading } = useLinkAnalytics(user?.id || '');
  const { data: categoryOrder = [], isLoading: orderLoading } = useCategoryOrder(user?.id || '');
  
  // Mutations
  const updateCategoryOrderMutation = useUpdateCategoryOrder();
  const toggleLinkStatusMutation = useToggleLinkStatus();
  const deleteLinkMutation = useDeleteLink();
  
  // Prefetching
  const { prefetchAll } = usePrefetchDashboardData();

  // Prefetch data when component mounts
  React.useEffect(() => {
    if (user?.id) {
      prefetchAll();
    }
  }, [user?.id, prefetchAll]);

  const handleToggleStatus = async (linkId: string) => {
    if (!user?.id) return;
    
    try {
      await toggleLinkStatusMutation.mutateAsync({ userId: user.id, linkId });
      onPreviewRefresh();
    } catch (error) {
      // Error is handled by the mutation
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
    if (!user?.id) return;
    
    try {
      console.log('🗑️ LinkManager: Deleting link...', { 
        userId: user.id, 
        linkId: deleteDialog.linkId 
      });
      
      await deleteLinkMutation.mutateAsync({ 
        userId: user.id, 
        linkId: deleteDialog.linkId 
      });
      
      console.log('🗑️ LinkManager: Link deleted successfully');
      
      // Force refresh the links data with a complete cache reset
      await queryClient.invalidateQueries({ queryKey: queryKeys.links(user.id) });
      await queryClient.refetchQueries({ queryKey: queryKeys.links(user.id), exact: true });
      
      // Wait a bit to ensure the UI has time to process the updated data
      setTimeout(() => {
        onPreviewRefresh();
        closeDeleteDialog();
      }, 100);
    } catch (error) {
      // Show error to user
      toast.error('Failed to delete link: ' + (error as Error).message);
      console.error('Failed to delete link:', error);
    }
  };

  const handleEditLink = (link: LinkWithPreview) => {
    setEditingLink({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      icon_type: link.icon_type,
      category: link.category as LinkCategory,
      live_project_url: link.live_project_url || '',
    });
  };

  const handleAddLink = (category?: LinkCategory) => {
    setDefaultCategory(category);
    setEditingLink(null);
    setShowAddModal(true);
  };

  const handleDragEnd = async (result: {
    destination?: { droppableId: string; index: number } | null;
    source: { droppableId: string; index: number };
    type?: string;
  }) => {
    if (!result.destination || !user?.id) return;

    const { source, destination } = result;

    // Handle section reordering
    if (
      source.droppableId === "category-sections" &&
      destination.droppableId === "category-sections"
    ) {
      const newCategoryOrder = [...categoryOrder];
      const [reorderedCategory] = newCategoryOrder.splice(source.index, 1);
      newCategoryOrder.splice(destination.index, 0, reorderedCategory);

      try {
        await updateCategoryOrderMutation.mutateAsync({
          userId: user.id,
          order: newCategoryOrder
        });
        onPreviewRefresh();
      } catch (error) {
        // Error is handled by the mutation
      }
      return;
    }

    // Handle link reordering within categories
    const category = source.droppableId as LinkCategory;

    if (source.droppableId !== destination.droppableId) return;

    const categoryLinks = [...(links[category] || [])];
    const [reorderedItem] = categoryLinks.splice(source.index, 1);
    categoryLinks.splice(destination.index, 0, reorderedItem);

    try {
      const linkIds = categoryLinks.map((link) => link.id);
      await LinkService.reorderLinks(user.id, category, linkIds);
      onPreviewRefresh();
      toast.success("Links reordered successfully");
    } catch (error) {
      console.error("Error reordering links:", error);
      toast.error("Failed to reorder links");
    }
  };

  const handleResetCategoryOrder = async () => {
    if (!user?.id) return;
    
    try {
      await updateCategoryOrderMutation.mutateAsync({
        userId: user.id,
        order: CategoryOrderService.DEFAULT_ORDER
      });
      onPreviewRefresh();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getCategoryIcon = (category: LinkCategory, iconName: string) => {
    const icons = {
      User: "👤",
      Github: "📁",
      BookOpen: "📖",
      Award: "🏆",
      Mail: "📧",
      Share2: "🔗",
      Link: "🔗",
    };
    return <span className="text-[#54E0FF]">{icons[iconName as keyof typeof icons] || "🔗"}</span>;
  };

  // Show loading state while data is loading
  if (linksLoading || orderLoading || !user?.id) {
    return (
      <LinksLoadingState
        isLoading={true}
        isError={false}
        error={null}
      >
        <div />
      </LinksLoadingState>
    );
  }

  // Show error state
  if (linksError) {
    return (
      <LinksLoadingState
        isLoading={false}
        isError={true}
        error={linksError}
      >
        <div />
      </LinksLoadingState>
    );
  }

  const totalLinks = Object.values(links).reduce(
    (sum: number, categoryLinks: UserLinkWithPreview[]) => sum + categoryLinks.length,
    0
  );

  const activeLinks = Object.values(links).reduce(
    (sum: number, categoryLinks: UserLinkWithPreview[]) =>
      sum + categoryLinks.filter((link: UserLinkWithPreview) => link.is_active).length,
    0
  );

  return (
    <div className="h-full p-1 sm:p-2 space-y-2 sm:space-y-3">
      {/* Link Statistics Status */}
      <LinkStatistics
        totalLinks={totalLinks}
        activeLinks={activeLinks}
        totalClicks={analytics?.totalClicks || 0}
      />

      {/* Analytics Overview */}
      <AnalyticsOverview
        analytics={analytics}
        totalLinks={totalLinks}
        activeLinks={activeLinks}
      />

      {/* Link Management */}
      <div className="glassmorphic rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-lg w-full">
        <LinkManagementHeader
          onResetOrder={handleResetCategoryOrder}
          onAddLink={() => handleAddLink()}
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="category-sections" type="CATEGORY">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 sm:space-y-4 md:space-y-6"
              >
                {categoryOrder.map((category, index) => {
                  const categoryLinks = links[category] || [];

                  return (
                    <LinkCategorySection
                      key={category}
                      category={category}
                      categoryLinks={categoryLinks as UserLinkWithPreview[]}
                      index={index}
                      onAddLink={handleAddLink}
                      onToggleStatus={handleToggleStatus}
                      onEditLink={handleEditLink}
                      onDeleteLink={openDeleteDialog}
                      getCategoryIcon={getCategoryIcon}
                      getLinkIcon={getLinkIcon}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
