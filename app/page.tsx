import { Header } from "@/components/ui/header";
import { HeroSection } from "@/components/ui/hero-section";
import { FeaturesSection } from "@/components/ui/features-section";
// Removed TestimonialsSection import
import { PricingSection } from "@/components/ui/pricing-section";
import { FaqSection } from "@/components/ui/faq-section";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <div id="features">
          <FeaturesSection />
        </div>
        
        {/* Testimonials Section removed */}
        
        {/* Pricing Section */}
        <div id="pricing">
          <PricingSection />
        </div>
        
        {/* FAQ Section */}
        <div id="faq">
          <FaqSection />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
