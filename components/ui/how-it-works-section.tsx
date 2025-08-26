import { Button } from './button';
import ChainLinkIcon from '../icons/ChainLinkIcon';
import ArrowRightIcon from '../icons/ArrowRightIcon';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function StepCard({ step, title, description, icon }: StepCardProps) {
  return (
    <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] relative">
      {/* Step Number */}
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center">
        <span className="text-[#18181a] font-bold text-lg font-sharp-grotesk">{step}</span>
      </div>
      
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="text-center">
        <h3 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-4">
          {title}
        </h3>
        <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
          {description}
        </p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      step: 1,
      title: "Connect GitHub",
      description: "Sign up with your GitHub account and manually add your project links through our link manager to showcase your work.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="url(#github-gradient)"/>
          <defs>
            <linearGradient id="github-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      step: 2,
      title: "Choose Template",
      description: "Pick from our collection of developer-focused templates. From minimalist to cyberpunk, find your style.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v14h16V5H4zm2 2h12v2H6V7zm0 4h8v2H6v-2zm0 4h10v2H6v-2z" fill="url(#template-gradient)"/>
          <defs>
            <linearGradient id="template-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      step: 3,
      title: "Customize Profile",
      description: "Add your projects, skills, blog posts, and achievements. Make it uniquely yours with custom sections.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.59 10.75C10.21 10.37 9.7 10.17 9.17 10.17C7.95 10.17 7 11.12 7 12.34C7 13.56 7.95 14.5 9.17 14.5C10.39 14.5 11.33 13.56 11.33 12.34C11.33 11.81 11.13 11.3 10.75 10.92L16.33 5.34L19 8V10H21V9ZM4 15.5C4 16.61 4.39 17.62 5 18.41V20C5 21.1 5.9 22 7 22H9C10.1 22 11 21.1 11 20V19H13V20C13 21.1 13.9 22 15 22H17C18.1 22 19 21.1 19 20V18.41C19.61 17.62 20 16.61 20 15.5C20 13.01 17.99 11 15.5 11C13.01 11 11 13.01 11 15.5C11 16.61 11.39 17.62 12 18.41V19H12V20H10V18.41C9.39 17.62 9 16.61 9 15.5C9 13.01 6.99 11 4.5 11C2.01 11 0 13.01 0 15.5Z" fill="url(#customize-gradient)"/>
          <defs>
            <linearGradient id="customize-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      step: 4,
      title: "Share & Shine",
      description: "Get your unique link and share it everywhere. Watch as recruiters and fellow developers discover your work.",
      icon: <ChainLinkIcon width={32} height={32} />
    }
  ];

  return (
    <section
      className="relative w-full bg-[#18181a] py-12 sm:py-20 overflow-hidden"
    >
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[48px] font-normal leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary mb-6">
            How It Works
          </h2>
          <p className="text-[20px] font-light leading-[30px] tracking-[-0.6px] text-[#7a7a83] font-sharp-grotesk max-w-[600px] mx-auto">
            Create your developer profile in minutes, not hours. Our streamlined process gets you from signup to sharing in just 4 simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              step={step.step}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button
            size="default"
            className="bg-white text-[#18181a] hover:bg-gray-100 font-medium text-[18px] tracking-[-0.54px] font-sharp-grotesk rounded-[15px] shadow-[0px_12px_32px_rgba(0,0,0,0.40)] px-8 py-4 flex items-center justify-center mx-auto"
          >
            Start Building Your Profile
            <ArrowRightIcon width={20} height={15} className="ml-2" />
          </Button>
        </div>

      </div>
    </section>
  );
}
