'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
// Button import removed as it's no longer needed

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-bold mr-2">
              L4C
            </div>
            <span className="text-xl font-bold">Link4Coders</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium">
              Pricing
            </a>
            {/* Testimonials link removed */}
            <a href="#faq" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium">
              FAQ
            </a>
          </nav>

          {/* CTA Button removed */}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <a 
                href="#features" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              {/* Testimonials link removed */}
              <a 
                href="#faq" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </a>
              {/* Early Access button removed */}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}