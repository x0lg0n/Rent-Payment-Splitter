import { LandingFooter } from "@/components/landing/landing-footer";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { WorkflowSection } from "@/components/landing/workflow-section";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Dashboard-inspired background */}
      <div className="landing-grid absolute inset-0 -z-10" />
      
      {/* Animated background orbs */}
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[var(--brand)]/15 blur-3xl animate-pulse opacity-50" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl animate-pulse opacity-50" style={{ animationDelay: "1s" }} />

      <LandingHeader />

      <div className="space-y-0">
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <FaqSection />
      </div>

      <LandingFooter />
    </main>
  );
}
