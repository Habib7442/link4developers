interface StatCardProps {
  number: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function StatCard({ number, label, description, icon }: StatCardProps) {
  return (
    <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] text-center group hover:scale-105 transition-transform duration-300">
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center group-hover:from-[#54E0FF]/30 group-hover:to-[#29ADFF]/30 transition-colors duration-300">
          {icon}
        </div>
      </div>
      
      {/* Number */}
      <div className="mb-4">
        <span className="text-[48px] font-bold leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary">
          {number}
        </span>
      </div>
      
      {/* Label */}
      <h3 className="text-[20px] font-medium leading-[24px] tracking-[-0.6px] font-sharp-grotesk text-white mb-2">
        {label}
      </h3>
      
      {/* Description */}
      <p className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
        {description}
      </p>
    </div>
  );
}

function TrustIndicator({ logo, name, description }: { logo: React.ReactNode; name: string; description: string }) {
  return (
    <div className="flex items-center gap-4 glassmorphic rounded-[16px] p-6 shadow-[0px_8px_16px_rgba(0,0,0,0.20)]">
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center flex-shrink-0">
        {logo}
      </div>
      <div>
        <h4 className="text-[16px] font-medium leading-[20px] tracking-[-0.48px] font-sharp-grotesk text-white">
          {name}
        </h4>
        <p className="text-[12px] font-light leading-[16px] tracking-[-0.36px] text-[#7a7a83] font-sharp-grotesk">
          {description}
        </p>
      </div>
    </div>
  );
}

export function DeveloperStatsSection() {
  const stats = [
    {
      number: "10K+",
      label: "Developers",
      description: "Already building their profiles on Link4Coders",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" fill="url(#dev-gradient)"/>
          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="url(#dev-gradient)"/>
          <defs>
            <linearGradient id="dev-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      number: "50M+",
      label: "GitHub Stars",
      description: "Collective stars across all developer profiles",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9L17 13.74L18.18 20.74L12 17.27L5.82 20.74L7 13.74L2 9L8.91 8.26L12 2Z" fill="url(#star-gradient)"/>
          <defs>
            <linearGradient id="star-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      number: "100K+",
      label: "Projects Showcased",
      description: "Amazing projects shared by our developer community",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="url(#project-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <defs>
            <linearGradient id="project-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      number: "95%",
      label: "Developer Satisfaction",
      description: "Of developers love their Link4Coders profile",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="url(#satisfaction-gradient)"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#18181a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9h.01" stroke="#18181a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 9h.01" stroke="#18181a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="satisfaction-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      )
    }
  ];

  const trustIndicators = [
    {
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="url(#github-trust-gradient)"/>
          <defs>
            <linearGradient id="github-trust-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      ),
      name: "GitHub Integration",
      description: "Seamless connection to your repositories"
    },
    {
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L22 9L17 14L18.18 21L12 17.27L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="url(#quality-gradient)"/>
          <defs>
            <linearGradient id="quality-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      ),
      name: "Premium Quality",
      description: "Professional templates and features"
    },
    {
      logo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="url(#secure-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <defs>
            <linearGradient id="secure-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#54E0FF" />
              <stop offset="1" stopColor="#29ADFF" />
            </linearGradient>
          </defs>
        </svg>
      ),
      name: "Secure & Reliable",
      description: "Enterprise-grade security and uptime"
    }
  ];

  return (
    <section className="relative w-full bg-[#18181a] py-20 overflow-hidden">
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[48px] font-normal leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary mb-6">
            Trusted by Developers
          </h2>
          <p className="text-[20px] font-light leading-[30px] tracking-[-0.6px] text-[#7a7a83] font-sharp-grotesk max-w-[600px] mx-auto">
            Join thousands of developers who have already transformed their online presence with Link4Coders.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              number={stat.number}
              label={stat.label}
              description={stat.description}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustIndicators.map((indicator, index) => (
            <TrustIndicator
              key={index}
              logo={indicator.logo}
              name={indicator.name}
              description={indicator.description}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
