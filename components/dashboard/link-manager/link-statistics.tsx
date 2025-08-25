"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface LinkStatisticsProps {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
}

export function LinkStatistics({ totalLinks, activeLinks, totalClicks }: LinkStatisticsProps) {
  return (
    <div className="glassmorphic rounded-xl p-2 sm:p-3 md:p-4 shadow-lg w-full">
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
            {totalClicks} Total Clicks
          </span>
        </div>
      </div>
    </div>
  );
}
