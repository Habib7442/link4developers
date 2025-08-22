import { Button } from './button';
import ArrowRightIcon from '../icons/ArrowRightIcon';

interface TemplateCardProps {
  name: string;
  description: string;
  category: string;
  isPremium?: boolean;
  previewImage: string;
  features: string[];
}

function TemplateCard({ name, description, category, isPremium = false, previewImage, features }: TemplateCardProps) {
  return (
    <div className="glassmorphic rounded-[20px] p-6 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] relative group hover:scale-105 transition-transform duration-300">
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] text-[#18181a] px-3 py-1 rounded-full text-xs font-medium font-sharp-grotesk">
          PRO
        </div>
      )}
      
      {/* Template Preview */}
      <div className="relative mb-6 rounded-[12px] overflow-hidden bg-[#28282b] h-48">
        <div className="absolute inset-0 bg-gradient-to-br from-[#54E0FF]/10 to-[#29ADFF]/10"></div>
        <div className="p-4 h-full flex flex-col justify-between">
          {/* Mock Browser Bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          {/* Template Content Preview */}
          <div className="flex-1">
            {name === "Minimalist Pro" && (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF]"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/80 rounded w-3/4"></div>
                  <div className="h-2 bg-white/60 rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-white/20 rounded"></div>
                  <div className="h-8 bg-white/20 rounded"></div>
                  <div className="h-8 bg-white/20 rounded"></div>
                </div>
              </div>
            )}
            
            {name === "Cyberpunk Terminal" && (
              <div className="space-y-2 font-mono text-xs">
                <div className="text-green-400">$ whoami</div>
                <div className="text-white">developer@link4coders</div>
                <div className="text-green-400">$ ls -la projects/</div>
                <div className="text-blue-400">drwxr-xr-x awesome-app/</div>
                <div className="text-blue-400">drwxr-xr-x ml-project/</div>
                <div className="text-green-400">$ cat skills.json</div>
                <div className="text-yellow-400">{"{"}"react": "expert"{"}"}</div>
              </div>
            )}
            
            {name === "GitHub Focus" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-white/20"></div>
                  <div className="h-2 bg-white/80 rounded w-20"></div>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <div className="h-3 bg-green-500 rounded"></div>
                  <div className="h-3 bg-green-400 rounded"></div>
                  <div className="h-3 bg-green-300 rounded"></div>
                  <div className="h-3 bg-gray-600 rounded"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-1 bg-white/60 rounded w-full"></div>
                  <div className="h-1 bg-white/40 rounded w-3/4"></div>
                  <div className="h-1 bg-white/60 rounded w-5/6"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Template Info */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[20px] font-medium leading-[24px] tracking-[-0.6px] font-sharp-grotesk text-white">
              {name}
            </h3>
            <span className="text-[12px] font-light tracking-[-0.36px] text-[#54E0FF] font-sharp-grotesk uppercase">
              {category}
            </span>
          </div>
          <p className="text-[14px] font-light leading-[20px] tracking-[-0.42px] text-[#7a7a83] font-sharp-grotesk">
            {description}
          </p>
        </div>
        
        {/* Features */}
        <div className="space-y-2">
          {features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF]"></div>
              <span className="text-[12px] font-light text-[#7a7a83] font-sharp-grotesk">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Preview Button */}
        <Button
          size="sm"
          className="w-full bg-transparent border border-[#54E0FF]/30 text-[#54E0FF] hover:bg-[#54E0FF]/10 font-medium text-[14px] tracking-[-0.42px] font-sharp-grotesk rounded-[10px]"
        >
          Preview Template
        </Button>
      </div>
    </div>
  );
}

export function TemplatesShowcaseSection() {
  const templates = [
    {
      name: "Minimalist Pro",
      description: "Clean, professional design that puts your work front and center. Perfect for showcasing projects and skills.",
      category: "Professional",
      isPremium: true,
      previewImage: "/templates/minimalist.png",
      features: ["Dark/Light modes", "Project galleries", "Skill matrices", "Contact forms"]
    },
    {
      name: "Cyberpunk Terminal",
      description: "Retro-futuristic terminal interface for developers who love the command line aesthetic.",
      category: "Creative",
      isPremium: true,
      previewImage: "/templates/cyberpunk.png",
      features: ["Terminal animations", "Neon effects", "Code snippets", "Matrix background"]
    },
    {
      name: "GitHub Focus",
      description: "Designed around your GitHub activity with contribution graphs and repository showcases.",
      category: "Open Source",
      isPremium: false,
      previewImage: "/templates/github.png",
      features: ["GitHub integration", "Contribution graphs", "Repository cards", "Stats dashboard"]
    }
  ];

  return (
    <section className="relative w-full bg-[#18181a] py-20 overflow-hidden">
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[48px] font-normal leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary mb-6">
            Choose Your Style
          </h2>
          <p className="text-[20px] font-light leading-[30px] tracking-[-0.6px] text-[#7a7a83] font-sharp-grotesk max-w-[600px] mx-auto">
            From minimalist to cyberpunk, find the perfect template that matches your personality and showcases your work beautifully.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {templates.map((template, index) => (
            <TemplateCard
              key={index}
              name={template.name}
              description={template.description}
              category={template.category}
              isPremium={template.isPremium}
              previewImage={template.previewImage}
              features={template.features}
            />
          ))}
        </div>

        {/* More Templates CTA */}
        <div className="text-center">
          <div className="glassmorphic rounded-[20px] p-8 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] max-w-[600px] mx-auto">
            <h3 className="text-[24px] font-medium leading-[28px] tracking-[-0.72px] font-sharp-grotesk text-white mb-4">
              More Templates Coming Soon
            </h3>
            <p className="text-[16px] font-light leading-[24px] tracking-[-0.48px] text-[#7a7a83] font-sharp-grotesk mb-6">
              We're constantly adding new templates designed by developers, for developers. Join early access to get first pick.
            </p>
            <Button
              size="default"
              className="bg-white text-[#18181a] hover:bg-gray-100 font-medium text-[16px] tracking-[-0.48px] font-sharp-grotesk rounded-[12px] px-6 py-3 flex items-center justify-center mx-auto"
            >
              Browse All Templates
              <ArrowRightIcon width={18} height={14} className="ml-2" />
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
