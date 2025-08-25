"use client";

import React from "react";
import { Plus, GripVertical, Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkCategory, LINK_CATEGORIES } from "@/lib/services/link-constants";
import { UserLinkWithPreview } from '@/lib/types/rich-preview';

interface LinkCategorySectionProps {
  category: LinkCategory;
  categoryLinks: UserLinkWithPreview[];
  index: number;
  onAddLink: (category: LinkCategory) => void;
  onToggleStatus: (linkId: string) => void;
  onEditLink: (link: UserLinkWithPreview) => void;
  onDeleteLink: (linkId: string, linkTitle: string) => void;
  getCategoryIcon: (category: LinkCategory, iconName: string) => React.ReactNode;
  getLinkIcon: (link: UserLinkWithPreview) => React.ReactNode;
}

export function LinkCategorySection({
  category,
  categoryLinks,
  index,
  onAddLink,
  onToggleStatus,
  onEditLink,
  onDeleteLink,
  getCategoryIcon,
  getLinkIcon
}: LinkCategorySectionProps) {
  const categoryConfig = LINK_CATEGORIES[category];

  return (
    <Draggable key={category} draggableId={category} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-[#28282b] border border-[#33373b] rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 ${
            snapshot.isDragging
              ? "shadow-2xl scale-[1.02] rotate-1"
              : ""
          } transition-all duration-200`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
              <div
                {...provided.dragHandleProps}
                className="text-[#7a7a83] hover:text-white cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center flex-shrink-0">
                <div className="text-[#54E0FF]">
                  {getCategoryIcon(category, categoryConfig.icon)}
                </div>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="text-sm sm:text-base font-medium text-white truncate">
                  {categoryConfig.label}
                </h3>
                <p className="text-xs text-[#7a7a83] truncate">
                  {categoryConfig.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-0 sm:ml-0">
              <span className="text-xs text-[#7a7a83]">
                {categoryLinks.length}/{categoryConfig.maxLinks}
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddLink(category)}
                className="border-[#54E0FF]/20 text-[#54E0FF] hover:bg-[#54E0FF]/10 h-7 sm:h-8 text-xs px-2 sm:px-3"
                disabled={categoryLinks.length >= categoryConfig.maxLinks}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <Droppable droppableId={category}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 sm:space-y-2 md:space-y-3"
              >
                {categoryLinks.length === 0 ? (
                  <div className="text-center py-3 sm:py-4 md:py-6 text-xs sm:text-sm text-[#7a7a83]">
                    No links in this category yet. Add your first link!
                  </div>
                ) : (
                  categoryLinks.map((link, index) => (
                    <Draggable
                      key={link.id}
                      draggableId={link.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-lg border border-[#33373b] bg-[#1a1a1a]/50 ${
                            snapshot.isDragging
                              ? "shadow-lg"
                              : ""
                          } ${
                            !link.is_active ? "opacity-50" : ""
                          } overflow-hidden`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="text-[#7a7a83] hover:text-white cursor-grab flex-shrink-0"
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
                              <span className="text-xs text-[#7a7a83] flex-shrink-0 whitespace-nowrap">
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
  );
}