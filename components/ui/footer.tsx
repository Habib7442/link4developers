import ChainLinkIcon from '../icons/ChainLinkIcon';

export function Footer() {
  // Use static year to prevent hydration mismatches
  const currentYear = 2024;

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.95718 14.8821 3.28445C14.0247 3.61173 13.2884 4.19445 12.773 4.95371C12.2575 5.71297 11.9877 6.61234 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39624C5.36074 6.60667 4.01032 5.43666 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3V3Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Discord',
      href: '#',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="currentColor"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="relative w-full bg-[#18181a] border-t border-[#33373b] py-16">
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <ChainLinkIcon width={44} height={44} />
              <span className="text-white text-[18px] font-medium tracking-[-0.54px] font-sharp-grotesk">
                link4coders
              </span>
            </div>
            <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk mb-8 max-w-[300px]">
              The ultimate link-in-bio platform designed specifically for developers to showcase their projects, skills, and contributions.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-[#28282b] border border-[#33373b] flex items-center justify-center text-[#7a7a83] hover:text-[#54E0FF] hover:border-[#54E0FF]/30 transition-colors duration-300"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-[16px] font-medium leading-[20px] tracking-[-0.48px] font-sharp-grotesk text-white mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Features</a></li>
                <li><a href="#templates" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Templates</a></li>
                <li><a href="#pricing" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Pricing</a></li>
                <li><a href="#how-it-works" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">How it Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[16px] font-medium leading-[20px] tracking-[-0.48px] font-sharp-grotesk text-white mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                <li><a href="#about" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">About</a></li>
                <li><a href="#blog" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Blog</a></li>
                <li><a href="#careers" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Careers</a></li>
                <li><a href="#contact" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[16px] font-medium leading-[20px] tracking-[-0.48px] font-sharp-grotesk text-white mb-4">
                Resources
              </h4>
              <ul className="space-y-3">
                <li><a href="#docs" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Documentation</a></li>
                <li><a href="#help" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Help Center</a></li>
                <li><a href="#community" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Community</a></li>
                <li><a href="#status" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[16px] font-medium leading-[20px] tracking-[-0.48px] font-sharp-grotesk text-white mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li><a href="#privacy" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#terms" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Terms of Service</a></li>
                <li><a href="#cookies" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">Cookie Policy</a></li>
                <li><a href="#gdpr" className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk hover:text-[#54E0FF] transition-colors duration-300">GDPR</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#33373b] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
            &copy; {currentYear} Link4Coders. All rights reserved.
          </p>
          <p className="text-[12px] font-light leading-[16px] tracking-[-0.36px] text-[#7a7a83] font-sharp-grotesk">
            Made with ❤️ for the developer community
          </p>
        </div>
      </div>
    </footer>
  );
}