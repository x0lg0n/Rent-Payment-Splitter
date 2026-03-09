"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastStack } from "@/components/dashboard/toast-stack";
import { WalletSelector } from "@/components/dashboard/wallet-selector";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardContextProvider } from "@/components/dashboard/dashboard-context";
import { useToasts } from "@/lib/hooks/use-toasts";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useTransactionStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { toasts, pushToast, removeToast } = useToasts();
  const hasRedirectedRef = useRef(false);
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const clearTransactions = useTransactionStore((state) => state.clearTransactions);

  const wallet = useWallet({ pushToast });

  const openWalletSelector = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setWalletSelectorOpen(true);
  };

  useEffect(() => {
    if (wallet.walletAddress === null && !wallet.isConnectingWallet && !hasRedirectedRef.current) {
      const timer = setTimeout(() => {
        if (!wallet.walletAddress) {
          hasRedirectedRef.current = true;
          pushToast("Wallet Required", "Please connect a wallet first", "error");
          router.push("/");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [wallet.walletAddress, wallet.isConnectingWallet, pushToast, router]);

  if (wallet.walletAddress === null && !wallet.isConnectingWallet) {
    return (
      <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <div className="landing-grid absolute inset-0 -z-10" />
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[--brand] border-r-transparent" />
          <p className="text-muted-foreground">Redirecting to home...</p>
        </div>
      </main>
    );
  }

  return (
    <DashboardContextProvider value={{ wallet, pushToast }}>
      <main className="relative min-h-screen overflow-hidden px-3 py-4 md:px-6 md:py-6">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,#dde9ff_0%,#eef3ff_38%,#f8fbff_70%,#f6f8ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,#0d1325_0%,#121a2f_45%,#0a1020_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-28 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl dark:bg-sky-500/20" />
          <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl dark:bg-cyan-500/20" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-500/10" />
        </div>

        <ToastStack toasts={toasts} onRemove={removeToast} />

        <div className="mx-auto w-full max-w-[1500px]">
          <DashboardSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
            walletAddress={wallet.walletAddress}
            shortAddress={wallet.shortAddress}
            walletOnTestnet={wallet.walletOnTestnet}
            walletOnMainnet={wallet.walletOnMainnet}
            isRefreshingBalance={wallet.isRefreshingBalance}
            onRefreshBalance={() =>
              wallet.walletAddress
                ? void wallet.refreshBalance(wallet.walletAddress, wallet.walletNetwork)
                : undefined
            }
            onOpenWalletSelector={openWalletSelector}
            onDisconnect={() => {
              wallet.handleDisconnect();
              clearTransactions();
            }}
          />

          <section
            className={cn(
              "mt-4 flex-1 rounded-[30px] border border-white/70 bg-white/80 p-4 shadow-[0_20px_60px_rgba(13,28,70,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 md:p-6 lg:mt-0 lg:min-h-[calc(100vh-3rem)] lg:transition-[margin-left] lg:duration-300 lg:ease-out lg:p-8",
              isSidebarCollapsed ? "lg:ml-[112px]" : "lg:ml-[280px]",
            )}
          >
            {children}
          </section>
        </div>

        <WalletSelector
          isOpen={walletSelectorOpen}
          onClose={() => setWalletSelectorOpen(false)}
          onSelect={wallet.handleConnect}
          lastWalletId={wallet.lastWalletId}
          currentWalletId={wallet.currentWalletId}
        />
      </main>
    </DashboardContextProvider>
  );
}
