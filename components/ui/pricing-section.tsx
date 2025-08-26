'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from './button';
import { AuthModal } from './auth-modal';
import { useAuthStore } from '@/stores/auth-store';

interface PricingTierProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  onEarlyAccessClick: () => void;
}

function PricingTier({
  name,
  price,
  description,
  features,
  highlighted = false,
  onEarlyAccessClick
}: PricingTierProps) {
  return (
    <div className={`glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] flex flex-col relative ${highlighted ? 'border-2 border-[#54E0FF]/50' : ''}`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] px-4 py-2 rounded-full text-sm font-medium font-sharp-grotesk">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-[28px] font-medium leading-[32px] tracking-[-0.84px] font-sharp-grotesk text-white mb-3">{name}</h3>
        <div className="mb-4">
          <span className="text-[48px] font-bold leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary">{price}</span>
          {price !== 'Free' && <span className="text-[18px] font-light text-[#7a7a83] font-sharp-grotesk">/month</span>}
        </div>
        <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">{description}</p>
      </div>

      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="h-3 w-3 text-[#18181a]" />
            </div>
            <span className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-white font-sharp-grotesk">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onEarlyAccessClick}
        className={`w-full font-medium text-[16px] tracking-[-0.48px] font-sharp-grotesk rounded-[12px] py-3 ${
          highlighted
            ? 'bg-white text-[#18181a] hover:bg-gray-100'
            : 'bg-transparent border border-[#54E0FF]/30 text-[#54E0FF] hover:bg-[#54E0FF]/10'
        }`}
      >
        Get Early Access
      </Button>
    </div>
  );
}

export function PricingSection() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuthStore();

  const handleEarlyAccessClick = () => {
    if (user) {
      // User is already signed in, show success message or redirect to dashboard
      alert(`Welcome ${user.full_name || user.email}! You already have early access.`);
    } else {
      // Open authentication modal
      setIsAuthModalOpen(true);
    }
  };

  const pricingTiers = [
    {
      name: 'Free',
      price: 'Free',
      description: 'Perfect for getting started with a basic developer profile.',
      features: [
        'Basic link-in-bio profile',
        'Up to 5 project showcases',
        'GitHub profile integration',
        'Basic analytics',
        'Standard themes',
      ],
      highlighted: false,
    },
    {
      name: 'Team',
      price: '$29',
      description: 'For development teams and agencies to showcase their work.',
      features: [
        'Everything in Free',
        'Team management',
        'Collaborative projects',
        'Team analytics dashboard',
        'Priority support',
        'Team branding options',
        'API access',
        'Remove Link4Coders branding',
      ],
      highlighted: true,
    },
  ];

  return (
    <>
      <section id="pricing" className="relative w-full bg-[#18181a] py-20 overflow-hidden">
        <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">

          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-[48px] font-normal leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[20px] font-light leading-[30px] tracking-[-0.6px] text-[#7a7a83] font-sharp-grotesk max-w-[600px] mx-auto">
              Choose the plan that fits your needs. All plans include core features to showcase your developer profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <PricingTier
                key={index}
                name={tier.name}
                price={tier.price}
                description={tier.description}
                features={tier.features}
                highlighted={tier.highlighted}
                onEarlyAccessClick={handleEarlyAccessClick}
              />
            ))}
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