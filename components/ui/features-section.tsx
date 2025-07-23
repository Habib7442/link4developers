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
      description: 'Automatically pull repository data, stars, and contributions to showcase your open source work.',
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
    <section className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Features Built for Developers</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
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