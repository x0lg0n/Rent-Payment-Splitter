"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { WalletStatusBanner } from "@/components/dashboard/wallet-status-banner";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { PaymentFormCard } from "@/components/dashboard/payment-form-card";
import { ToastStack } from "@/components/dashboard/toast-stack";
import { PaymentSuccessDialog } from "@/components/dashboard/payment-success-dialog";
import { TransactionHistoryCard } from "@/components/dashboard/transaction-history-card";
import { useToasts } from "@/lib/hooks/use-toasts";
import { useWallet } from "@/lib/hooks/use-wallet";
import { usePayment } from "@/lib/hooks/use-payment";

const TESTNET_TX_EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";
const TESTNET_FRIENDBOT =
  "https://laboratory.stellar.org/#account-creator?network=test";

export default function DashboardPage() {
  const { toasts, pushToast, removeToast } = useToasts();

  const wallet = useWallet({ pushToast });

  const payment = usePayment({
    walletAddress: wallet.walletAddress,
    walletNetwork: wallet.walletNetwork,
    walletBalance: wallet.walletBalance,
    walletOnTestnet: wallet.walletOnTestnet,
    pushToast,
    refreshBalance: wallet.refreshBalance,
  });

  const handleDisconnect = () => {
    wallet.handleDisconnect();
    payment.clearTransactions();
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="landing-grid absolute inset-0 -z-10" />
      <div className="landing-glow absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl" />

      <ToastStack toasts={toasts} onRemove={removeToast} />

      <DashboardHeader
        connected={Boolean(wallet.walletAddress)}
        connecting={wallet.isConnectingWallet}
        onConnect={wallet.handleConnect}
        onDisconnect={handleDisconnect}
      />

      <section className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-12 pt-10 md:px-10">
        <div>
          <Badge className="mb-3 w-fit border border-[var(--brand-soft)] bg-white/75 text-[var(--brand)] dark:bg-white/10 dark:text-white">
            Stellar testnet dashboard
          </Badge>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">
            Send and verify rent transactions
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Balance updates every 30 seconds, payments are signed with Freighter, and
            each transaction is logged below with a verification link.
          </p>
        </div>

        <WalletStatusBanner
          walletOnTestnet={wallet.walletOnTestnet}
          walletOnMainnet={wallet.walletOnMainnet}
          shortAddress={wallet.shortAddress}
          walletError={wallet.walletError}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <BalanceCard
            balance={wallet.walletBalance}
            isRefreshing={wallet.isRefreshingBalance}
            lastUpdated={wallet.lastBalanceUpdated}
            canRefresh={Boolean(wallet.walletAddress) && wallet.walletOnTestnet}
            onRefresh={() =>
              wallet.walletAddress
                ? void wallet.refreshBalance(wallet.walletAddress, wallet.walletNetwork)
                : undefined
            }
            isZeroBalance={wallet.walletOnTestnet && (wallet.walletBalance ?? 0) === 0}
            friendbotUrl={TESTNET_FRIENDBOT}
          />
          <PaymentFormCard
            recipientAddress={payment.recipientAddress}
            amount={payment.paymentAmount}
            canSubmit={Boolean(wallet.walletAddress) && wallet.walletOnTestnet}
            isSending={payment.isSendingPayment}
            onRecipientChange={payment.setRecipientAddress}
            onAmountChange={payment.setPaymentAmount}
            onSubmit={payment.handlePaymentSubmit}
          />
        </div>

        <TransactionHistoryCard
          transactions={payment.transactions}
          explorerBaseUrl={TESTNET_TX_EXPLORER_BASE}
          onCopyHash={payment.copyText}
        />

        <Card className="border-0 bg-gradient-to-r from-[var(--brand)] to-sky-500 text-white">
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
        explorerBaseUrl={TESTNET_TX_EXPLORER_BASE}
        onClose={() => payment.setPaymentSuccessHash(null)}
        onCopy={payment.copyText}
      />
    </main>
  );
}
