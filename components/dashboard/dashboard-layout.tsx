"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { MobilePreviewModal } from "@/components/dashboard/mobile-preview-modal";
import { MobileTabBar } from "@/components/dashboard/mobile-tab-bar";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { performanceMonitor } from "@/lib/utils/performance";
import ChainLinkIcon from "@/components/icons/ChainLinkIcon";
import {
  User,
  Settings,
  ExternalLink,
  ArrowLeft,
  Link,
  BarChart3,
  Palette,
  Paintbrush,
  Eye,
  Menu,
  X,
  LogOut,
  Loader2,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
  isPremium?: boolean;
}

const navigationItems: NavItem[] = [
  {
    id: "profile",
    label: "Profile Editor",
    icon: User,
    href: "/dashboard/profile",
    description: "Edit your profile information and bio",
  },
  {
    id: "links",
    label: "Link Manager",
    icon: Link,
    href: "/dashboard/links",
    description: "Manage your links and social profiles",
  },
  {
    id: "themes",
    label: "Themes",
    icon: Palette,
    href: "/dashboard/themes",
    description: "Choose from pre-built templates",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Paintbrush,
    href: "/dashboard/appearance",
    description: "Customize colors, fonts, and layout",
    isPremium: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    description: "View your profile and link statistics",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    description: "Account and privacy settings",
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  showPreview?: boolean;
  previewContent?: React.ReactNode;
}

export function DashboardLayout({
  children,
  showPreview = false,
  previewContent,
}: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleNavigation = (href: string) => {
    performanceMonitor.startNavigation()
    setIsNavigating(true);
    router.push(href);
  };

  const handlePrefetch = (href: string) => {
    router.prefetch(href);
  };

  // Track when navigation completes
  useEffect(() => {
    if (!isNavigating && pathname) {
      performanceMonitor.endNavigation()
    }
  }, [isNavigating, pathname])

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const getActiveNavItem = () => {
    return (
      navigationItems.find((item) => pathname.startsWith(item.href))?.id ||
      "profile"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#18181a] flex items-center justify-center">
        <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#54E0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-2">
              Loading Dashboard
            </h2>
            <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
              Please wait while we load your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <div className="h-screen bg-[#18181a] flex overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-[#1e1e20] border-r border-[#33373b] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 hidden lg:flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#33373b] flex-shrink-0">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Link4Devs Logo" 
              width={32}
              height={32}
              className="flex-shrink-0"
            />
            <span className="text-white text-[18px] font-medium tracking-[-0.54px] font-sharp-grotesk">
              Dashboard
            </span>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 sm:p-6 border-b border-[#33373b] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || user.email}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#18181a]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] sm:text-[16px] font-medium leading-[18px] sm:leading-[20px] tracking-[-0.42px] sm:tracking-[-0.48px] font-sharp-grotesk text-white truncate">
                {user.full_name || "Developer"}
              </h3>
              <p className="text-[12px] sm:text-[14px] font-light leading-[16px] sm:leading-[18px] tracking-[-0.36px] sm:tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Profile URL Preview */}
          <div className="bg-[#28282b] border border-[#33373b] rounded-[6px] sm:rounded-[8px] px-2 sm:px-3 py-1.5 sm:py-2">
            <p className="text-[11px] sm:text-[12px] font-light text-[#7a7a83] font-sharp-grotesk mb-0.5 sm:mb-1">
              Your profile URL:
            </p>
            <span className="text-[12px] sm:text-[14px] font-medium text-[#54E0FF] font-sharp-grotesk break-all">
              link4coders.in/
              {user.profile_slug ||
                user.github_username ||
                user.email?.split("@")[0] ||
                "yourname"}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = getActiveNavItem() === item.id;

              return (
                <Button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  onMouseEnter={() => handlePrefetch(item.href)}
                  disabled={isNavigating}
                  className={`w-full justify-start text-left p-3 sm:p-4 h-auto rounded-[8px] sm:rounded-[12px] transition-all duration-200 ${
                    isActive
                      ? "bg-[#54E0FF]/10 border border-[#54E0FF]/30 text-[#54E0FF]"
                      : "bg-transparent border border-transparent text-[#7a7a83] hover:text-white hover:bg-[#28282b] hover:border-[#33373b]"
                  } ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    {isNavigating && isActive ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 animate-spin" />
                    ) : (
                      <Icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${
                          isActive ? "text-[#54E0FF]" : "text-current"
                        }`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] sm:text-[14px] font-medium leading-[16px] sm:leading-[18px] tracking-[-0.39px] sm:tracking-[-0.42px] font-sharp-grotesk flex items-center gap-2 ${
                          isActive ? "text-[#54E0FF]" : "text-current"
                        }`}
                      >
                        {item.label}
                        {item.isPremium && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <div className="text-[11px] sm:text-[12px] font-light leading-[14px] sm:leading-[16px] tracking-[-0.33px] sm:tracking-[-0.36px] text-[#7a7a83] font-sharp-grotesk mt-0.5 sm:mt-1">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 sm:p-6 border-t border-[#33373b] flex-shrink-0">
          <div className="space-y-1.5 sm:space-y-2">
            <Button
              onClick={() => router.push("/")}
              className="w-full justify-start bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF]/30 font-medium text-[13px] sm:text-[14px] tracking-[-0.39px] sm:tracking-[-0.42px] font-sharp-grotesk rounded-[6px] sm:rounded-[8px] px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Back to Home</span>
            </Button>
            <Button
              onClick={handleSignOut}
              className="w-full justify-start bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-red-400 hover:border-red-400/30 font-medium text-[13px] sm:text-[14px] tracking-[-0.39px] sm:tracking-[-0.42px] font-sharp-grotesk rounded-[6px] sm:rounded-[8px] px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-0 flex flex-col h-screen">
        {/* Mobile Header - Always show on mobile, hidden on desktop */}
        <header className="lg:hidden bg-[#1e1e20] border-b border-[#33373b] flex-shrink-0 mobile-header">
          <div className="flex items-center justify-between w-full px-2 py-3">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden max-w-[60%]">
              <Image 
                src="/logo.png" 
                alt="Link4Devs Logo" 
                width={24}
                height={24}
                className="flex-shrink-0"
              />
              <span className="text-white text-[14px] font-medium tracking-[-0.42px] font-sharp-grotesk truncate">
                Dashboard
              </span>
            </div>
            <div className="flex items-center flex-shrink-0 ml-3">
              <Button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 h-8 rounded-md flex items-center text-[11px] font-medium whitespace-nowrap min-w-0 justify-center logout-button"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content Layout - Responsive 2 or 3 columns based on showPreview */}
        <div className={`flex-1 flex flex-col lg:flex-row ${showPreview ? 'lg:grid lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-3' : ''} overflow-hidden`}>

          {/* Page Content */}
          <main className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-20 sm:pb-24 lg:pb-0 mobile-safe-area ${showPreview ? 'lg:col-span-3 xl:col-span-4 2xl:col-span-2' : ''}`}>
            {isNavigating ? (
              <LoadingSkeleton type="page" />
            ) : (
              <Suspense fallback={<LoadingSkeleton type="page" />}>
                {children}
              </Suspense>
            )}
          </main>

          {/* Live Preview Panel */}
          {showPreview && (
            <aside className="hidden lg:block lg:col-span-2 xl:col-span-3 2xl:col-span-1 bg-[#1e1e20] border-l border-[#33373b] overflow-hidden min-w-0">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-[#33373b] flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[16px] font-medium text-white font-sharp-grotesk">
                        Live Preview
                      </h3>
                      <p className="text-[12px] text-[#7a7a83] font-sharp-grotesk mt-1">
                        See how your profile looks to visitors
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {previewContent}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1e1e20] border-t border-[#33373b] px-2 py-2 sm:py-3 shadow-lg">
        <MobileTabBar showPreview={showPreview} previewContent={previewContent} />
      </div>

      {/* Mobile Preview Modal - For compatibility with existing code */}
      {showPreview && previewContent && (
        <MobilePreviewModal
          isOpen={mobilePreviewOpen}
          onClose={() => setMobilePreviewOpen(false)}
          previewContent={previewContent}
        />
      )}

    </div>
  );
}
