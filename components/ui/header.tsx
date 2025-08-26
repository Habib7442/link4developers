'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from './button';
import ChainLinkIcon from '../icons/ChainLinkIcon';
import { AuthModal } from './auth-modal';
import { useAuthStore } from '@/stores/auth-store';
import { LogOut, User, Menu, X } from 'lucide-react';

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuthStore();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    // Handle ESC key press to close menu
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="relative w-full">
        <div className="absolute top-[62px] left-1/2 transform -translate-x-1/2 z-10">
          <nav className="glassmorphic rounded-[20px] px-4 sm:px-6 py-3 sm:py-4 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] min-w-[320px] sm:min-w-0">
            <div className="flex items-center justify-between gap-4 sm:gap-8 w-full">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center justify-center">
                  <Image src="/logo.png" alt="Link4Devs Logo" width={44} height={44} className="sm:w-[56px] sm:h-[56px] relative top-[2px]" />
                </div>
                <span className="text-white text-[13px] sm:text-[15px] font-medium tracking-[-0.39px] sm:tracking-[-0.45px] font-sharp-grotesk">
                  link4coders
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-6">
                <a href="#" className="text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] font-sharp-grotesk hover:text-white transition-colors" onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  Home
                </a>
                <a href="#features" className="text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] font-sharp-grotesk hover:text-white transition-colors" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Features
                </a>
                <a href="#pricing" className="text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] font-sharp-grotesk hover:text-white transition-colors" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Pricing
                </a>
              </div>

              <div className="flex items-center gap-2">

              {user ? (
                <>
                  {user.avatar_url && user.avatar_url.trim() !== '' ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.full_name || user.email || 'User avatar'}
                      width={32}
                      height={32}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-[#18181a]" />
                    </div>
                  )}
                  <Button
                    onClick={handleSignOut}
                    disabled={loading}
                    size="sm"
                    className="hidden sm:flex bg-transparent border border-[#54E0FF]/30 text-[#54E0FF] hover:bg-[#54E0FF]/10 font-medium text-[12px] sm:text-[14px] tracking-[-0.36px] sm:tracking-[-0.42px] font-sharp-grotesk rounded-[8px] px-3 sm:px-3 py-2 sm:py-2 items-center gap-2 sm:gap-2"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="inline sm:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  size="sm"
                  className="bg-white text-[#18181a] hover:bg-gray-100 font-medium text-[13px] sm:text-[15px] tracking-[-0.39px] sm:tracking-[-0.45px] font-sharp-grotesk rounded-[10px] px-3 sm:px-4 py-2"
                >
                  Sign Up
                </Button>
              )}
              
              {/* Mobile Menu Button */}
              <div className="sm:hidden ml-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                  }}
                  size="sm"
                  className="bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] p-2"
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="absolute top-[140px] left-1/2 transform -translate-x-1/2 z-20 sm:hidden">
            <div className="glassmorphic rounded-[16px] px-4 py-3 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-[14px] font-medium">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#7a7a83] hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href="#"
                  className="text-[#7a7a83] text-[14px] font-light tracking-[-0.42px] font-sharp-grotesk hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Home
                </a>
                <a
                  href="#features"
                  className="text-[#7a7a83] text-[14px] font-light tracking-[-0.42px] font-sharp-grotesk hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-[#7a7a83] text-[14px] font-light tracking-[-0.42px] font-sharp-grotesk hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Pricing
                </a>
                {user && (
                  <a
                    href="#"
                    className="text-red-400 text-[14px] font-light tracking-[-0.42px] font-sharp-grotesk hover:text-red-300 transition-colors py-2 px-3 rounded-lg hover:bg-white/5 flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-3.5 h-3.5 min-w-0 truncate" />
                    <span className="min-w-0 truncate">Sign Out</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="signup"
      />
    </>
  );
}