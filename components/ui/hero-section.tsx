'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from './button';
import { PreviewCard } from './preview-card';
import ArrowRightIcon from '../icons/ArrowRightIcon';
import { AuthModal } from './auth-modal';
import { useAuthStore } from '@/stores/auth-store';
import { LayoutDashboard, User } from 'lucide-react';

export function HeroSection() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const handleCTAClick = () => {
    if (user) {
      // Set navigating state to show loading indicator
      setIsNavigating(true);
      // Navigate to dashboard
      router.push('/dashboard');
    } else {
      // Open authentication modal
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <section
        className="relative w-full h-[600px] sm:h-[879px] bg-[#18181a] overflow-hidden"
        style={{
          backgroundImage: 'url(/background-grid.svg)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
      {/* Responsive container */}
      <div className="relative w-full max-w-[1440px] h-[600px] sm:h-[879px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">

        {/* Mobile Layout (below 640px) */}
        <div className="sm:hidden flex flex-col items-center justify-center h-full text-center px-4 py-4">
          {/* User Status Indicator - Mobile */}
          {user && (
            <div className="mb-4">
              <div className="flex items-center gap-2 glassmorphic rounded-[12px] px-3 py-2 shadow-[0px_8px_16px_rgba(0,0,0,0.20)]">
                {user.avatar_url && user.avatar_url.trim() !== '' ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.email}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center">
                    <User className="w-3 h-3 text-[#18181a]" />
                  </div>
                )}
                <span className="text-[12px] font-medium tracking-[-0.36px] font-sharp-grotesk text-white">
                  Signed in as {user.full_name || user.email}
                </span>
              </div>
            </div>
          )}

          {/* Main Headline Text - Mobile */}
          <div className="mb-4">
            <h1 className="text-[36px] leading-[42px] font-normal tracking-[-1.8px] font-sharp-grotesk gradient-text-primary">
              One link{' '}
              <span className="inline-flex items-center justify-center rotate-12">
                <Image src="/logo.png" alt="Link4Devs Logo" width={46} height={46} className="relative -mb-[3px]" />
              </span>{' '}
              for
              <br />
              everything you{' '}
              <span className="font-semibold italic gradient-text-accent">build.</span>
            </h1>
          </div>

          {/* Description - Mobile */}
          <div className="mb-6 max-w-sm">
            <p className="text-[14px] font-light leading-[20px] tracking-[-0.28px] text-[#7a7a83] font-sharp-grotesk">
              {user
                ? `Welcome back, ${user.full_name || user.email?.split('@')[0]}! Ready to showcase your latest projects?`
                : 'Your dev portfolio, repos, runnable snippets, blog, and projects — all in one developer-first bio.'
              }
            </p>
          </div>

          {/* CTA Button - Mobile */}
          <div className="w-full max-w-xs">
            <Button
              onClick={handleCTAClick}
              disabled={loading || isNavigating}
              size="default"
              className={`font-medium text-[14px] tracking-[-0.42px] font-sharp-grotesk rounded-[12px] shadow-[0px_8px_20px_rgba(0,0,0,0.30)] h-[44px] w-full flex items-center justify-center transition-all duration-300 ${
                user
                  ? 'bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:from-[#29ADFF] hover:to-[#54E0FF]'
                  : 'bg-white text-[#18181a] hover:bg-gray-100'
              } ${(loading || isNavigating) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading || isNavigating ? (
                <div className="w-4 h-4 border-2 border-[#18181a] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {user ? (
                    <>
                      <LayoutDashboard width={16} height={12} className="mr-2" />
                      Go to Dashboard
                    </>
                  ) : (
                    <>
                      <User width={16} height={12} className="mr-2" />
                      Create Your Profile
                    </>
                  )}
                  <ArrowRightIcon width={16} height={12} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Desktop Layout (640px and above) */}
        <div className="hidden sm:block">
          {/* User Status Indicator */}
          {user && (
            <div
              className="absolute"
              style={{ left: 'clamp(1rem, 10.3vw, 149px)', top: '235px' }}
            >
              <div className="flex items-center gap-2 glassmorphic rounded-[12px] px-4 py-2 shadow-[0px_8px_16px_rgba(0,0,0,0.20)]">
                {user.avatar_url && user.avatar_url.trim() !== '' ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.email}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center">
                    <User className="w-3 h-3 text-[#18181a]" />
                  </div>
                )}
                <span className="text-[14px] font-medium tracking-[-0.42px] font-sharp-grotesk text-white">
                  Signed in as {user.full_name || user.email}
                </span>
              </div>
            </div>
          )}

          {/* Main Headline Text */}
          <div
            className="absolute"
            style={{ left: 'clamp(1rem, 10.3vw, 149px)', top: '275px', width: 'min(457px, 32vw)', height: '158px' }}
          >
            <h1 className="text-[66.22px] font-normal leading-[78.80px] tracking-[-3.97px] font-sharp-grotesk gradient-text-primary whitespace-nowrap">
              One link{' '}
              <span className="inline-flex items-center justify-center rotate-12">
                
                <Image src="/logo.png" alt="Link4Devs Logo" width={76} height={76} className="relative -mb-[5px]" />
              </span>{' '}
              for
              <br />
              everything you{' '}
              <span className="font-semibold italic gradient-text-accent">build.</span>
            </h1>
          </div>

          {/* Description */}
          <div
            className="absolute"
            style={{ left: 'clamp(1rem, 10.3vw, 149px)', top: '456px', width: 'min(630px, 44vw)', height: '74px' }}
          >
            <p className="text-[24.85px] font-light leading-[36.54px] tracking-[-0.75px] text-[#7a7a83] font-sharp-grotesk">
              {user
                ? `Welcome back, ${user.full_name || user.email?.split('@')[0]}! Ready to showcase your latest projects?`
                : 'Your dev portfolio, repos, runnable snippets, blog, and projects — all in one developer-first bio.'
              }
            </p>
          </div>

          {/* CTA Button */}
          <div
            className="absolute"
            style={{ left: 'clamp(1rem, 10.4vw, 150px)', top: '575px', width: 'min(320px, 22vw)', height: '60px' }}
          >
            <Button
              onClick={handleCTAClick}
              disabled={loading || isNavigating}
              size="default"
              className={`font-medium text-[20px] tracking-[-0.6px] font-sharp-grotesk rounded-[15px] shadow-[0px_12px_32px_rgba(0,0,0,0.40)] h-full w-full flex items-center justify-center transition-all duration-300 ${
                user
                  ? 'bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] hover:from-[#29ADFF] hover:to-[#54E0FF]'
                  : 'bg-white text-[#18181a] hover:bg-gray-100'
              } ${(loading || isNavigating) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading || isNavigating ? (
                <div className="w-6 h-6 border-2 border-[#18181a] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {user ? (
                    <>
                      <LayoutDashboard width={24} height={18} className="mr-2" />
                      Go to Dashboard
                    </>
                  ) : (
                    <>
                      <User width={24} height={18} className="mr-2" />
                      Create Your Profile
                    </>
                  )}
                  <ArrowRightIcon width={24} height={18} className="ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Right Side Preview Container */}
          <div
            className="absolute"
            style={{
              left: 'clamp(calc(100% - 444px - 2rem), 58.8vw, 846px)',
              top: '195px',  /* Changed from 235px to 195px to move it up */
              width: 'min(444px, 31vw)',
              height: '536px'
            }}
          >
            <PreviewCard className="w-full h-full" />
          </div>
        </div>

      </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="signup"
      />
    </>
  );
}