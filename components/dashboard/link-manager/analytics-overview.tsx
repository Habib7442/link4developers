"use client";

import React from "react";

interface AnalyticsOverviewProps {
  analytics: {
    totalClicks: number;
    linksByCategory: Record<string, number>;
    topLinks: Array<{ title: string; clicks: number; url: string }>;
  } | null;
  totalLinks: number;
  activeLinks: number;
}

export function AnalyticsOverview({ analytics, totalLinks, activeLinks }: AnalyticsOverviewProps) {
  return (
    <div className="glassmorphic rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-lg w-full">
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-medium text-white">
          Analytics Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="text-center bg-[#28282b]/70 rounded-lg p-2 sm:p-3 w-full">
          <div className="text-lg sm:text-xl font-medium text-[#54E0FF]">
            {analytics?.totalClicks || 0}
          </div>
          <div className="text-xs sm:text-sm text-[#7a7a83]">
            Total Clicks
          </div>
        </div>

        <div className="text-center bg-[#28282b]/70 rounded-lg p-2 sm:p-3 w-full">
          <div className="text-lg sm:text-xl font-medium text-[#54E0FF]">
            {totalLinks}
          </div>
          <div className="text-xs sm:text-sm text-[#7a7a83]">
            Total Links
          </div>
        </div>

        <div className="text-center bg-[#28282b]/70 rounded-lg p-2 sm:p-3 w-full">
          <div className="text-lg sm:text-xl font-medium text-[#54E0FF]">
            {activeLinks}
          </div>
          <div className="text-xs sm:text-sm text-[#7a7a83]">
            Active Links
          </div>
        </div>
      </div>
    </div>
  )
}
