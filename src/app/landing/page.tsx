import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials";

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Background Gradient - Enhanced Blue Shades */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/80 to-blue-200/60 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-blue-800/10 -z-10" />

      {/* Additional Blue Accent Overlays */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/30 to-transparent dark:from-blue-950/20 dark:to-transparent -z-10" />
      <div className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-t from-blue-50/40 to-transparent dark:from-blue-900/10 dark:to-transparent -z-10" />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50/70 to-blue-100/50 dark:from-blue-950/15 dark:to-blue-900/10 backdrop-blur-sm">
        <FeaturesGrid />
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-r from-blue-100/60 to-blue-200/40 dark:from-blue-900/20 dark:to-blue-800/15">
        <HowItWorks />
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-950/25 dark:to-blue-900/15 backdrop-blur-sm">
        <PricingSection />
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-r from-blue-200/40 to-blue-100/60 dark:from-blue-800/10 dark:to-blue-950/20">
        <TestimonialsSection />
      </section>
    </div>
  );
}