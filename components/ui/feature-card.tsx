import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] group hover:scale-105 transition-transform duration-300">
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#54E0FF]/20 to-[#29ADFF]/20 flex items-center justify-center mb-6 group-hover:from-[#54E0FF]/30 group-hover:to-[#29ADFF]/30 transition-colors duration-300">
        <Icon className="h-8 w-8 text-[#54E0FF]" />
      </div>
      <h3 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-4">
        {title}
      </h3>
      <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk">
        {description}
      </p>
    </div>
  );
}