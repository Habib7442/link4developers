'use client';

import { useState } from 'react';
import { Button } from './button';
import ArrowRightIcon from '../icons/ArrowRightIcon';
import ChainLinkIcon from '../icons/ChainLinkIcon';
import { AuthModal } from './auth-modal';
import { useAuthStore } from '@/stores/auth-store';

interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function BenefitItem({ icon, title, description }: BenefitItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-[18px] font-medium leading-[22px] tracking-[-0.54px] font-sharp-grotesk text-white mb-2">
          {title}
        </h4>
        <p className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
          {description}
        </p>
      </div>
    </div>
  );
}

export function EarlyAccessSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  const handleJoinBeta = () => {
    if (user) {
      // User is already signed in, show success message
      setIsSubmitted(true);
    } else {
      // Open auth modal for sign up
      setIsAuthModalOpen(true);
    }
  };

  const benefits = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#early-gradient)"/>
          <defs>
            <linearGradient id="early-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "First Access",
      description: "Be among the first to create your developer profile when we launch"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9L17 13.74L18.18 20.74L12 17.27L5.82 20.74L7 13.74L2 9L8.91 8.26L12 2Z" fill="url(#premium-gradient)"/>
          <defs>
            <linearGradient id="premium-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "Premium Templates",
      description: "Exclusive access to premium templates during the beta period"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" fill="url(#feedback-gradient)"/>
          <defs>
            <linearGradient id="feedback-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "Shape the Product",
      description: "Your feedback will directly influence features and improvements"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7ZM20 8V14M23 11H17" stroke="url(#community-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <defs>
            <linearGradient id="community-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "Exclusive Community",
      description: "Join our private Discord community of early adopters and beta testers"
    }
  ];

  return (
    <section
      className="relative w-full bg-[#18181a] py-20 overflow-hidden"
    >
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        {/* Main Content Container */}
        <div className="glassmorphic rounded-[24px] p-12 shadow-[0px_24px_48px_rgba(0,0,0,0.40)] max-w-[1000px] mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <ChainLinkIcon width={64} height={64} />
            </div>
            <h2 className="text-[48px] font-normal leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary mb-6">
              Join the Beta
            </h2>
            <p className="text-[20px] font-light leading-[30px] tracking-[-0.6px] text-[#7a7a83] font-sharp-grotesk max-w-[600px] mx-auto">
              Be among the first developers to experience Link4Coders. Get early access, exclusive templates, and help shape the future of developer portfolios.
            </p>
          </div>

          {/* Email Signup Form */}
          <div className="mb-12">
            {!isSubmitted && !user ? (
              <div className="max-w-[500px] mx-auto">
                <form onSubmit={handleSubmit} className="mb-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full px-6 py-4 bg-[#28282b] border border-[#33373b] rounded-[12px] text-white placeholder-[#7a7a83] font-sharp-grotesk text-[16px] tracking-[-0.48px] focus:outline-none focus:border-[#54E0FF] transition-colors"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-white text-[#18181a] hover:bg-gray-100 font-medium text-[16px] tracking-[-0.48px] font-sharp-grotesk rounded-[12px] px-8 py-4 flex items-center justify-center disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-[#18181a] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          Join Beta
                          <ArrowRightIcon width={18} height={14} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-[12px] font-light text-[#7a7a83] font-sharp-grotesk mt-3 text-center">
                    No spam, just updates on our progress and early access notifications.
                  </p>
                </form>

                <div className="text-center">
                  <p className="text-[14px] font-light text-[#7a7a83] font-sharp-grotesk mb-4">
                    Or get instant access with your developer account
                  </p>
                  <Button
                    onClick={handleJoinBeta}
                    className="bg-transparent border border-[#54E0FF]/30 text-[#54E0FF] hover:bg-[#54E0FF]/10 font-medium text-[16px] tracking-[-0.48px] font-sharp-grotesk rounded-[12px] px-8 py-3 flex items-center justify-center mx-auto"
                  >
                    Sign Up with GitHub
                    <ArrowRightIcon width={18} height={14} className="ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center glassmorphic rounded-[16px] p-8 max-w-[500px] mx-auto">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#18181a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-2">
                  {user ? "Welcome to the Beta!" : "You're In!"}
                </h3>
                <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
                  {user
                    ? `Welcome ${user.full_name || user.email}! You now have early access to Link4Coders.`
                    : "Thanks for joining! We'll notify you as soon as Link4Coders is ready."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <BenefitItem
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>

        </div>

      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode="signup"
      />
    </section>
  );
}
