'use client';

import { Header } from "@/components/ui/header";
import { HeroSection } from "@/components/ui/hero-section";
import { HowItWorksSection } from "@/components/ui/how-it-works-section";
import { FeaturesSection } from "@/components/ui/features-section";
import { TemplatesShowcaseSection } from "@/components/ui/templates-showcase-section";
import { DeveloperStatsSection } from "@/components/ui/developer-stats-section";
import { PricingSection } from "@/components/ui/pricing-section";
import { TestimonialsSection } from "@/components/ui/testimonials-section";
import { FaqSection } from "@/components/ui/faq-section";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#18181a]">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TemplatesShowcaseSection />
        <DeveloperStatsSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}