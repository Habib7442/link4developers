"use client";

import React from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkManagementHeaderProps {
  onResetOrder: () => void;
  onAddLink: () => void;
}

export function LinkManagementHeader({ onResetOrder, onAddLink }: LinkManagementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
      <div className="min-w-0 flex-1">
        <h2 className="text-base sm:text-lg md:text-xl font-medium text-white">
          Manage Your Links
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
        <Button
          onClick={onResetOrder}
          size="sm"
          variant="outline"
          className="w-full sm:w-auto border-[#54E0FF]/20 text-[#54E0FF] hover:bg-[#54E0FF]/10 text-xs sm:text-sm h-8 sm:h-9 py-1 px-2 sm:px-3"
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Reset Order
        </Button>
        <Button
          onClick={onAddLink}
          className="w-full sm:w-auto bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:opacity-90 text-xs sm:text-sm h-8 sm:h-9 py-1 px-2 sm:px-3"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Add Link
        </Button>
      </div>
    </div>
  );
}
