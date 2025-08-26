import { Code, Github, Globe, Layers, LineChart, Zap } from 'lucide-react';
import { FeatureCard } from './feature-card';

export function FeaturesSection() {
  const features = [
    {
      icon: Code,
      title: 'Interactive Code Snippets',
      description: 'Embed live, interactive code snippets directly on your profile to showcase your skills and solutions.',
    },
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Connect your GitHub account and manually add repository links to showcase your open source work.',
    },
    {
      icon: Layers,
      title: 'Project Showcase',
      description: 'Create beautiful, detailed project cards with screenshots, tech stack, and live demos.',
    },
    {
      icon: LineChart,
      title: 'Skill Matrix',
      description: 'Visualize your technical skills with a comprehensive matrix showing proficiency levels.',
    },
    {
      icon: Globe,
      title: 'Blog Integration',
      description: 'Connect your technical blog and automatically display your latest articles and tutorials.',
    },
    {
      icon: Zap,
      title: 'Developer-Centric Design',
      description: 'Choose from themes and layouts specifically designed for developers and their unique needs.',
    },
  ];

  return (
    <section id="features" className="relative w-full bg-[#18181a] py-20 overflow-hidden">
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-[48px] font-normal leading-[56px] tracking-[-2.88px] font-sharp-grotesk gradient-text-primary mb-6">
            Features Built for Developers
          </h2>
          <p className="text-[20px] font-light leading-[30px] tracking-[-0.6px] text-[#7a7a83] font-sharp-grotesk max-w-[600px] mx-auto">
            Link4Coders is designed specifically for developers, with features that showcase your technical skills and projects effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}