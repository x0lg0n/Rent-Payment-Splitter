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
import { ServiceInfoSection } from "@/components/landing/service-info-section";
import { WorkflowSection } from "@/components/landing/workflow-section";

export default function HomePage() {
  const router = useRouter();
  const { pushToast } = useToasts();
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);

  const wallet = useWallet({ pushToast });

  const openWalletSelector = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setWalletSelectorOpen(true);
  };

  // Redirect to dashboard if wallet is connected
  useEffect(() => {
    if (wallet.walletAddress) {
      router.push("/dashboard");
    }
  }, [wallet.walletAddress, router]);

  const handleConnect = async (walletId?: string) => {
    return wallet.handleConnect(walletId);
    // Redirect will happen via useEffect when wallet state updates.
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-3 py-4 md:px-6 md:py-6">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,#dde9ff_0%,#eef3ff_38%,#f8fbff_70%,#f6f8ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,#0d1325_0%,#121a2f_45%,#0a1020_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-28 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl dark:bg-sky-500/20" />
        <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-500/10" />
      </div>

      <div className="mx-auto w-full max-w-375">
        <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(13,28,70,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
          <LandingHeader onConnectClick={openWalletSelector} />
          <div className="space-y-6 p-4 md:space-y-8 md:p-8">
            <HeroSection onConnectClick={openWalletSelector} />
            <FeaturesSection />
            <WorkflowSection />
            <ServiceInfoSection />
            <FaqSection />
          </div>
          <LandingFooter />
        </div>
      </div>

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
