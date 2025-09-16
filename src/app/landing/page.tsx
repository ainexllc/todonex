import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { SimpleFooter } from "@/components/landing/simple-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="bg-card/30">
        <FeaturesGrid />
      </section>

      {/* Footer */}
      <SimpleFooter />
    </div>
  );
}