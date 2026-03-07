"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { WalletStatusBanner } from "@/components/dashboard/wallet-status-banner";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { PaymentFormCard } from "@/components/dashboard/payment-form-card";
import { ToastStack } from "@/components/dashboard/toast-stack";
import { PaymentSuccessDialog } from "@/components/dashboard/payment-success-dialog";
import { TransactionHistoryCard } from "@/components/dashboard/transaction-history-card";
import { EscrowBanner } from "@/components/escrow/escrow-banner";
// import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { useToasts } from "@/lib/hooks/use-toasts";
import { useWallet } from "@/lib/hooks/use-wallet";
import { usePayment } from "@/lib/hooks/use-payment";
import { useEscrowStore } from "@/lib/store";
import { EXPLORER_CONFIG } from "@/lib/config";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import type { TransactionRecord } from "@/lib/types/transaction";

export default function DashboardPage() {
  const router = useRouter();
  const { toasts, pushToast, removeToast } = useToasts();
  const paymentFormRef = useRef<HTMLDivElement>(null);
  const { escrows } = useEscrowStore();
  const hasRedirectedRef = useRef(false);

  const wallet = useWallet({ pushToast });

  const payment = usePayment({
    walletAddress: wallet.walletAddress,
    walletNetwork: wallet.walletNetwork,
    walletBalance: wallet.walletBalance,
    walletOnTestnet: wallet.walletOnTestnet,
    pushToast,
    refreshBalance: wallet.refreshBalance,
  });

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
  }, [wallet.walletAddress, wallet.isConnectingWallet, router, pushToast]);


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

  const handleDisconnect = () => {
    wallet.handleDisconnect();
    payment.clearTransactions();
  };

  const handleImportTransactions = (importedTransactions: TransactionRecord[]) => {
    const existingHashes = new Set(payment.transactions.map(tx => tx.hash));
    const newTransactions = importedTransactions.filter(tx => !existingHashes.has(tx.hash));
    
    if (newTransactions.length > 0) {
      pushToast("Import Successful", `Imported ${newTransactions.length} transactions`, "success");
    } else {
      pushToast("No New Transactions", "All imported transactions already exist", "success");
    }
  };

  const scrollToPaymentForm = () => {
    paymentFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleCreateEscrowClick = () => {
    router.push("/escrow/create");
  };

  const handleViewAllEscrowsClick = () => {
    router.push("/escrow");
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="landing-grid absolute inset-0 -z-10" />

      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[--brand]/10 blur-3xl animate-pulse opacity-40" style={{ animationDuration: "4s" }} />
      <div className="absolute -bottom-40 left-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl animate-pulse opacity-40" style={{ animationDuration: "5s" }} />

      <ToastStack toasts={toasts} onRemove={removeToast} />

      <DashboardHeader
        connected={Boolean(wallet.walletAddress)}
        connecting={wallet.isConnectingWallet}
        onConnect={wallet.handleConnect}
        lastWalletId={wallet.lastWalletId}
        currentWalletId={wallet.currentWalletId}
        onDisconnect={handleDisconnect}
      />

      <section className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-12 pt-10 md:px-10">
        <div className="animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationFillMode: "both" }}>
          <Badge className="mb-3 w-fit border border-[--brand-soft] bg-white/75 text-[--brand] dark:bg-white/10 dark:text-white animate-in fade-in zoom-in-50 duration-500" style={{ animationFillMode: "both" }}>
            Stellar testnet dashboard
          </Badge>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            Send and verify rent transactions
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            Balance updates every 30 seconds, payments are signed with Freighter, and
            each transaction is logged below with a verification link.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
          <WalletStatusBanner
            walletOnTestnet={wallet.walletOnTestnet}
            walletOnMainnet={wallet.walletOnMainnet}
            shortAddress={wallet.shortAddress}
            walletError={wallet.walletError}
          />
        </div>

        <div className="animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: "0.35s", animationFillMode: "both" }}>
          <EscrowBanner
            activeEscrowsCount={escrows.length}
            onCreateClick={handleCreateEscrowClick}
            onViewAllClick={handleViewAllEscrowsClick}
          />
        </div>

        <div className="animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: "0.36s", animationFillMode: "both" }}>
          <OnboardingChecklist
            hasWallet={Boolean(wallet.walletAddress)}
            hasBalance={wallet.walletOnTestnet && (wallet.walletBalance ?? 0) > 0}
            hasTransactions={payment.transactions.length > 0}
            hasEscrows={escrows.length > 0}
            onDismiss={() => {}}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
            <BalanceCard
              balance={wallet.walletBalance}
              isRefreshing={wallet.isRefreshingBalance}
              lastUpdated={wallet.lastBalanceUpdated}
              canRefresh={Boolean(wallet.walletAddress) && wallet.walletOnTestnet}
              onRefresh={() => wallet.walletAddress ? void wallet.refreshBalance(wallet.walletAddress, wallet.walletNetwork) : undefined}
              isZeroBalance={wallet.walletOnTestnet && (wallet.walletBalance ?? 0) === 0}
              friendbotUrl={EXPLORER_CONFIG.friendbotUrl}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: "0.4s", animationFillMode: "both" }} ref={paymentFormRef}>
            <PaymentFormCard
              recipientAddress={payment.recipientAddress}
              amount={payment.paymentAmount}
              canSubmit={Boolean(wallet.walletAddress) && wallet.walletOnTestnet}
              isSending={payment.isSendingPayment}
              onRecipientChange={payment.setRecipientAddress}
              onAmountChange={payment.setPaymentAmount}
              onSubmit={payment.handlePaymentSubmit}
              walletBalance={wallet.walletBalance}
            />
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
          <TransactionHistoryCard
            transactions={payment.transactions}
            explorerBaseUrl={EXPLORER_CONFIG.txBaseUrl}
            walletAddress={wallet.walletAddress || ""}
            onCopyHash={payment.copyText}
            onImportTransactions={handleImportTransactions}
            onScrollToPaymentForm={scrollToPaymentForm}
          />
        </div>

        <Card className="border-0 bg-linear-to-r from-[--brand] to-sky-500 text-white">
          <CardContent className="flex flex-col gap-2 p-6 md:flex-row md:items-center md:justify-between">
            <p className="text-lg font-semibold">
              Network: {wallet.walletOnTestnet ? "Testnet" : wallet.walletOnMainnet ? "Mainnet" : "Unknown"}
            </p>
            <p className="text-sm text-white/90">Explorer verification enabled for every hash.</p>
          </CardContent>
        </Card>
      </section>

      <PaymentSuccessDialog
        hash={payment.paymentSuccessHash}
        explorerBaseUrl={EXPLORER_CONFIG.txBaseUrl}
        onClose={() => payment.setPaymentSuccessHash(null)}
        onCopy={payment.copyText}
      />
    </main>
  );
}
