"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fetchTestnetXlmBalance } from "@/lib/stellar/horizon";
import {
  isValidStellarAddress,
  isValidXlmAmount,
  sendTestnetXlmPayment,
} from "@/lib/stellar/payment";
import { isMainnetNetwork, isTestnetNetwork } from "@/lib/stellar/network";
import { connectFreighter, getFreighterSession } from "@/lib/wallet/freighter";
import type { TransactionRecord } from "@/lib/types/transaction";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { WalletStatusBanner } from "@/components/dashboard/wallet-status-banner";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { PaymentFormCard } from "@/components/dashboard/payment-form-card";
import {
  type AppToast,
  type ToastLevel,
  ToastStack,
} from "@/components/dashboard/toast-stack";
import { PaymentSuccessDialog } from "@/components/dashboard/payment-success-dialog";
import { TransactionHistoryCard } from "@/components/dashboard/transaction-history-card";

const TESTNET_TX_EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";
const TESTNET_FRIENDBOT =
  "https://laboratory.stellar.org/#account-creator?network=test";

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [lastBalanceUpdated, setLastBalanceUpdated] = useState<Date | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [recipientAddress, setRecipientAddress] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const [paymentSuccessHash, setPaymentSuccessHash] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const [toasts, setToasts] = useState<AppToast[]>([]);

  const walletOnTestnet = isTestnetNetwork(walletNetwork);
  const walletOnMainnet = isMainnetNetwork(walletNetwork);

  const shortAddress = useMemo(() => {
    if (!walletAddress) return null;
    return `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const historyStorageKey = useMemo(() => {
    if (!walletAddress) return null;
    return `splitrent:tx-history:${walletAddress}`;
  }, [walletAddress]);

  const pushToast = useCallback(
    (title: string, description: string, level: ToastLevel = "error") => {
      const toastId = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id: toastId, title, description, level }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      }, 5000);
    },
    [],
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const refreshBalance = useCallback(
    async (address: string, network: string | null) => {
      if (!isTestnetNetwork(network)) {
        setWalletBalance(null);
        return;
      }

      setIsRefreshingBalance(true);
      try {
        const nextBalance = await fetchTestnetXlmBalance(address);
        setWalletBalance(nextBalance);
        setLastBalanceUpdated(new Date());
      } catch {
        setWalletError(
          "Unable to fetch testnet balance. Make sure your account exists and is funded on testnet.",
        );
      } finally {
        setIsRefreshingBalance(false);
      }
    },
    [],
  );

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getFreighterSession();
        if (!session) return;
        setWalletAddress(session.address);
        setWalletNetwork(session.network);
      } catch {
        setWalletError("Unable to restore wallet session.");
      }
    };
    void loadSession();
  }, []);

  useEffect(() => {
    if (!walletAddress || !walletOnTestnet) return;

    void refreshBalance(walletAddress, walletNetwork);
    const timer = window.setInterval(() => {
      void refreshBalance(walletAddress, walletNetwork);
    }, 30000);

    return () => window.clearInterval(timer);
  }, [refreshBalance, walletAddress, walletNetwork, walletOnTestnet]);

  useEffect(() => {
    if (!historyStorageKey) {
      setTransactions([]);
      return;
    }
    try {
      const raw = localStorage.getItem(historyStorageKey);
      if (!raw) {
        setTransactions([]);
        return;
      }
      const parsed = JSON.parse(raw) as TransactionRecord[];
      setTransactions(parsed);
    } catch {
      setTransactions([]);
    }
  }, [historyStorageKey]);

  useEffect(() => {
    if (!historyStorageKey) return;
    localStorage.setItem(historyStorageKey, JSON.stringify(transactions));
  }, [historyStorageKey, transactions]);

  const handleWalletConnect = async () => {
    setWalletError(null);
    setIsConnectingWallet(true);
    try {
      const session = await connectFreighter();
      setWalletAddress(session.address);
      setWalletNetwork(session.network);
      if (!isTestnetNetwork(session.network)) {
        setWalletBalance(null);
        setWalletError(
          "Wallet connected on MAINNET. Switch Freighter to TESTNET for this app.",
        );
        pushToast(
          "Wrong network",
          "Freighter is connected to mainnet. Please switch to testnet.",
          "error",
        );
        return;
      }
      await refreshBalance(session.address, session.network);
      pushToast("Wallet connected", "Freighter connected on Stellar testnet.", "success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to connect wallet. Please try again.";
      setWalletError(message);
      pushToast("Wallet connection failed", message, "error");
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleWalletDisconnect = () => {
    setWalletAddress(null);
    setWalletNetwork(null);
    setWalletBalance(null);
    setLastBalanceUpdated(null);
    setWalletError(null);
    setTransactions([]);
  };

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWalletError(null);

    if (!walletAddress) {
      pushToast("Wallet required", "Connect Freighter before sending payment.");
      return;
    }
    if (!walletOnTestnet) {
      pushToast("Testnet required", "Switch Freighter network to testnet.");
      return;
    }

    const cleanRecipient = recipientAddress.trim();
    const cleanAmount = paymentAmount.trim();

    if (!isValidStellarAddress(cleanRecipient)) {
      pushToast(
        "Invalid recipient address",
        "Address must be a valid Stellar public key starting with G.",
      );
      return;
    }

    if (!isValidXlmAmount(cleanAmount)) {
      pushToast(
        "Invalid amount",
        "Amount must be a positive number with up to 7 decimals.",
      );
      return;
    }

    if (walletBalance !== null && Number(cleanAmount) > walletBalance) {
      pushToast(
        "Insufficient balance",
        `You have ${walletBalance.toFixed(2)} XLM, but tried to send ${Number(cleanAmount).toFixed(2)} XLM.`,
      );
      return;
    }

    setIsSendingPayment(true);
    try {
      const hash = await sendTestnetXlmPayment({
        sourceAddress: walletAddress,
        destinationAddress: cleanRecipient,
        amount: cleanAmount,
      });

      const tx: TransactionRecord = {
        id: `${Date.now()}-${hash.slice(0, 6)}`,
        hash,
        from: walletAddress,
        to: cleanRecipient,
        amount: cleanAmount,
        network: "testnet",
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [tx, ...prev]);
      setPaymentSuccessHash(hash);
      setRecipientAddress("");
      setPaymentAmount("");
      await refreshBalance(walletAddress, walletNetwork);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Payment failed due to an unknown error.";
      pushToast("Transaction failed", message, "error");
    } finally {
      setIsSendingPayment(false);
    }
  };

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      pushToast("Copied", "Copied to clipboard.", "success");
    } catch {
      pushToast("Copy failed", "Unable to copy to clipboard.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="landing-grid absolute inset-0 -z-10" />
      <div className="landing-glow absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl" />

      <ToastStack toasts={toasts} onRemove={removeToast} />

      <DashboardHeader
        connected={Boolean(walletAddress)}
        connecting={isConnectingWallet}
        onConnect={handleWalletConnect}
        onDisconnect={handleWalletDisconnect}
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
          walletOnTestnet={walletOnTestnet}
          walletOnMainnet={walletOnMainnet}
          shortAddress={shortAddress}
          walletError={walletError}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <BalanceCard
            balance={walletBalance}
            isRefreshing={isRefreshingBalance}
            lastUpdated={lastBalanceUpdated}
            canRefresh={Boolean(walletAddress) && walletOnTestnet}
            onRefresh={() =>
              walletAddress ? void refreshBalance(walletAddress, walletNetwork) : undefined
            }
            isZeroBalance={walletOnTestnet && (walletBalance ?? 0) === 0}
            friendbotUrl={TESTNET_FRIENDBOT}
          />
          <PaymentFormCard
            recipientAddress={recipientAddress}
            amount={paymentAmount}
            canSubmit={Boolean(walletAddress) && walletOnTestnet}
            isSending={isSendingPayment}
            onRecipientChange={setRecipientAddress}
            onAmountChange={setPaymentAmount}
            onSubmit={handlePaymentSubmit}
          />
        </div>

        <TransactionHistoryCard
          transactions={transactions}
          explorerBaseUrl={TESTNET_TX_EXPLORER_BASE}
          onCopyHash={copyText}
        />

        <Card className="border-0 bg-gradient-to-r from-[var(--brand)] to-sky-500 text-white">
          <CardContent className="flex flex-col gap-2 p-6 md:flex-row md:items-center md:justify-between">
            <p className="text-lg font-semibold">
              Network: {walletOnTestnet ? "Testnet" : walletOnMainnet ? "Mainnet" : "Unknown"}
            </p>
            <p className="text-sm text-white/90">Explorer verification enabled for every hash.</p>
          </CardContent>
        </Card>
      </section>

      <PaymentSuccessDialog
        hash={paymentSuccessHash}
        explorerBaseUrl={TESTNET_TX_EXPLORER_BASE}
        onClose={() => setPaymentSuccessHash(null)}
        onCopy={copyText}
      />
    </main>
  );
}
