"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WalletSelector } from "@/components/dashboard/wallet-selector";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useToasts } from "@/lib/hooks/use-toasts";
import { LandingFooter } from "@/components/landing/landing-footer";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { WorkflowSection } from "@/components/landing/workflow-section";

export default function HomePage() {
  const router = useRouter();
  const { pushToast } = useToasts();
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);

  const wallet = useWallet({ pushToast });

  // Redirect to dashboard if wallet is connected
  useEffect(() => {
    if (wallet.walletAddress) {
      router.push("/dashboard");
    }
  }, [wallet.walletAddress, router]);

  const handleConnect = async (walletId?: string) => {
    try {
      await wallet.handleConnect(walletId);
      // The wallet state will be updated by useWallet hook
      // Redirect will happen via useEffect
    } catch (error) {
      // Error already handled by useWallet hook
      setWalletSelectorOpen(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Dashboard-inspired background */}
      <div className="landing-grid absolute inset-0 -z-10" />

      {/* Animated background orbs */}
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[--brand]/15 blur-3xl animate-pulse opacity-50" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl animate-pulse opacity-50" style={{ animationDelay: "1s" }} />

      <LandingHeader onConnectClick={() => setWalletSelectorOpen(true)} />

      <div className="space-y-0">
        <HeroSection onConnectClick={() => setWalletSelectorOpen(true)} />
        <FeaturesSection />
        <WorkflowSection />
        <FaqSection />
      </div>

      <LandingFooter />

      {/* Wallet Selector Modal */}
      <WalletSelector
        isOpen={walletSelectorOpen}
        onClose={() => setWalletSelectorOpen(false)}
        onSelect={handleConnect}
        lastWalletId={wallet.lastWalletId}
        currentWalletId={wallet.currentWalletId}
      />
    </main>
  );
}
