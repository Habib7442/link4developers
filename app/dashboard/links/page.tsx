"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { LinkManager } from "@/components/dashboard/link-manager";
import { LivePreview } from "@/components/dashboard/live-preview";
import { useAuthStore } from "@/stores/auth-store";

export default function LinksPage() {
  const { user } = useAuthStore();
  const [previewRefresh, setPreviewRefresh] = useState(0);

  // Create preview content
  const previewContent = (
    <LivePreview
      profileData={user || undefined}
      refreshTrigger={previewRefresh}
    />
  );

  const handlePreviewRefresh = () => {
    setPreviewRefresh((prev) => prev + 1);
  };

  return (
    <DashboardLayout showPreview={true} previewContent={previewContent}>
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="w-full mx-auto dashboard-form-container mobile-safe-area">
          {/* Page Header */}
          <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-8">
            <h1 className="text-[18px] sm:text-[20px] md:text-[24px] lg:text-[32px] font-medium leading-[22px] sm:leading-[24px] md:leading-[30px] lg:leading-[40px] tracking-[-0.54px] sm:tracking-[-0.6px] md:tracking-[-0.72px] lg:tracking-[-0.96px] font-sharp-grotesk gradient-text-primary mb-1 sm:mb-2">
               Link Manager
            </h1>
            <p className="text-[11px] sm:text-[12px] md:text-[14px] font-light leading-[14px] sm:leading-[16px] md:leading-[20px] tracking-[-0.33px] sm:tracking-[-0.36px] md:tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
              Organize your links by category and track their performance
            </p>
          </div>

          {/* Link Manager Component */}
          <LinkManager onPreviewRefresh={handlePreviewRefresh} />
        </div>
      </div>
    </DashboardLayout>
  );
}
