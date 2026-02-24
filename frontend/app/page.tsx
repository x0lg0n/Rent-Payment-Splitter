import { LandingFooter } from "@/components/landing/landing-footer";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { WorkflowSection } from "@/components/landing/workflow-section";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="landing-grid absolute inset-0 -z-10" />
      <div className="landing-glow absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl" />

      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <FaqSection />
      <LandingFooter />
    </main>
  );
}
