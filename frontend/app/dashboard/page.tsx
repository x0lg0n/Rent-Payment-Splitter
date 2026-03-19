"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Clock3,
  Copy,
  Link2,
  Loader2,
  QrCode,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PaymentSuccessDialog } from "@/components/dashboard/payment-success-dialog";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";
import { usePayment } from "@/lib/hooks/use-payment";
import { useEscrowStore } from "@/lib/store";
import { APP_CONFIG, EXPLORER_CONFIG } from "@/lib/config";

const REFRESH_SECONDS = Math.ceil(APP_CONFIG.balanceRefreshInterval / 1000);

const xlmFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const ESTIMATED_XLM_USD_RATE = Number.parseFloat(
  process.env.NEXT_PUBLIC_XLM_USD_RATE ?? "0.12",
);

type StatsRange = "weekly" | "monthly";
type QuickTransferMode = "send" | "receive";

interface ChartBucket {
  key: string;
  label: string;
  income: number;
  expense: number;
}

function formatShortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatXlm(value: number | null) {
  if (value === null || Number.isNaN(value)) return "0.00";
  return xlmFormatter.format(value);
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function DashboardPage() {
  const router = useRouter();
  const quickTransferRef = useRef<HTMLDivElement>(null);
  const { escrows } = useEscrowStore();
  const { wallet, pushToast } = useDashboardContext();
  const [statsRange, setStatsRange] = useState<StatsRange>("weekly");
  const [quickTransferMode, setQuickTransferMode] =
    useState<QuickTransferMode>("send");
  const [searchTerm, setSearchTerm] = useState("");
  const [clockTick, setClockTick] = useState(() => Date.now());

  const payment = usePayment({
    walletAddress: wallet.walletAddress,
    walletNetwork: wallet.walletNetwork,
    walletBalance: wallet.walletBalance,
    walletOnTestnet: wallet.walletOnTestnet,
    pushToast,
    refreshBalance: wallet.refreshBalance,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const walletAddressLower = wallet.walletAddress?.toLowerCase() ?? "";
  const secondsUntilRefresh = useMemo(() => {
    if (
      !wallet.walletAddress ||
      !wallet.walletOnTestnet ||
      !wallet.lastBalanceUpdated
    ) {
      return REFRESH_SECONDS;
    }

    const elapsed = clockTick - wallet.lastBalanceUpdated.getTime();
    const remaining = Math.ceil(
      (APP_CONFIG.balanceRefreshInterval - elapsed) / 1000,
    );
    return Math.max(0, remaining);
  }, [
    clockTick,
    wallet.walletAddress,
    wallet.walletOnTestnet,
    wallet.lastBalanceUpdated,
  ]);

  const frequentContacts = useMemo(() => {
    if (!walletAddressLower) return [];

    const contactFrequency = new Map<string, number>();
    for (const tx of payment.transactions) {
      const from = tx.from.toLowerCase();
      const to = tx.to.toLowerCase();
      const counterparty =
        from === walletAddressLower ? tx.to
        : to === walletAddressLower ? tx.from
        : null;

      if (!counterparty) continue;
      contactFrequency.set(
        counterparty,
        (contactFrequency.get(counterparty) ?? 0) + 1,
      );
    }

    return Array.from(contactFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([address]) => address);
  }, [payment.transactions, walletAddressLower]);

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return payment.transactions;

    return payment.transactions.filter((tx) => {
      return (
        tx.hash.toLowerCase().includes(query) ||
        tx.from.toLowerCase().includes(query) ||
        tx.to.toLowerCase().includes(query)
      );
    });
  }, [payment.transactions, searchTerm]);

  const receivePayLink = useMemo(() => {
    if (!wallet.walletAddress) return "";
    const params = new URLSearchParams({ destination: wallet.walletAddress });
    if (wallet.walletOnTestnet) params.set("network", "testnet");
    return `web+stellar:pay?${params.toString()}`;
  }, [wallet.walletAddress, wallet.walletOnTestnet]);

  const statsBuckets = useMemo<ChartBucket[]>(() => {
    const now = new Date();
    const buckets: ChartBucket[] = [];
    const bucketLookup = new Map<string, ChartBucket>();

    if (statsRange === "weekly") {
      const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      });
      for (let offset = 6; offset >= 0; offset -= 1) {
        const day = new Date(now);
        day.setHours(0, 0, 0, 0);
        day.setDate(now.getDate() - offset);

        const key = day.toISOString().slice(0, 10);
        const bucket: ChartBucket = {
          key,
          label: weekdayFormatter.format(day),
          income: 0,
          expense: 0,
        };
        buckets.push(bucket);
        bucketLookup.set(key, bucket);
      }
    } else {
      const monthFormatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
      });
      for (let offset = 5; offset >= 0; offset -= 1) {
        const monthDate = new Date(
          now.getFullYear(),
          now.getMonth() - offset,
          1,
        );
        const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
        const bucket: ChartBucket = {
          key,
          label: monthFormatter.format(monthDate),
          income: 0,
          expense: 0,
        };
        buckets.push(bucket);
        bucketLookup.set(key, bucket);
      }
    }

    for (const tx of payment.transactions) {
      const date = new Date(tx.createdAt);
      if (Number.isNaN(date.getTime())) continue;

      const key =
        statsRange === "weekly" ?
          date.toISOString().slice(0, 10)
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const bucket = bucketLookup.get(key);
      if (!bucket) continue;

      const amount = Number.parseFloat(tx.amount);
      if (!Number.isFinite(amount)) continue;

      if (tx.to.toLowerCase() === walletAddressLower) bucket.income += amount;
      if (tx.from.toLowerCase() === walletAddressLower)
        bucket.expense += amount;
    }

    return buckets;
  }, [payment.transactions, statsRange, walletAddressLower]);

  const periodIncome = useMemo(
    () => statsBuckets.reduce((sum, bucket) => sum + bucket.income, 0),
    [statsBuckets],
  );
  const periodExpense = useMemo(
    () => statsBuckets.reduce((sum, bucket) => sum + bucket.expense, 0),
    [statsBuckets],
  );
  const chartMax = useMemo(
    () =>
      Math.max(
        1,
        ...statsBuckets.flatMap((bucket) => [bucket.income, bucket.expense]),
      ),
    [statsBuckets],
  );

  const escrowLocked = useMemo(() => {
    return escrows.reduce(
      (sum, escrow) => sum + Number(escrow.deposited_amount || 0),
      0,
    );
  }, [escrows]);

  const confirmedTransactions = payment.transactions.filter(
    (tx) => tx.confirmed,
  ).length;
  const walletHealthScore = useMemo(() => {
    let score = 0;

    if (wallet.walletAddress) score += 35;
    if (wallet.walletOnTestnet) score += 35;
    if (wallet.walletOnMainnet) score += 15;
    score += Math.min(30, Math.round(payment.successRate * 0.3));

    return Math.min(100, score);
  }, [
    wallet.walletAddress,
    wallet.walletOnMainnet,
    wallet.walletOnTestnet,
    payment.successRate,
  ]);
  const walletHealthLabel =
    walletHealthScore >= 85 ? "Excellent"
    : walletHealthScore >= 65 ? "Good"
    : walletHealthScore >= 45 ? "Fair"
    : "Low";
  const estimatedUsdBalance = useMemo(() => {
    const xlmBalance = wallet.walletBalance ?? 0;
    if (
      !Number.isFinite(ESTIMATED_XLM_USD_RATE) ||
      ESTIMATED_XLM_USD_RATE <= 0
    ) {
      return 0;
    }
    return xlmBalance * ESTIMATED_XLM_USD_RATE;
  }, [wallet.walletBalance]);

  return (
    <>
      <DashboardPageHeader
        title="Rent payment control center"
        subtitle="Live wallet balance, quick transfer, transaction tracking, and weekly/monthly stats."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <article className="flex h-full flex-col justify-center rounded-[26px] border border-[#9eabd3]/90 bg-[#aeb9d9]/90 p-5 shadow-[0_14px_35px_rgba(62,95,184,0.20)] dark:border-slate-700 dark:bg-slate-800/80">
          <div className="mx-auto w-full max-w-3xl text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Available balance
            </p>
            {wallet.walletBalance === null ?
              <div className="mt-2 space-y-2">
                <Skeleton className="mx-auto h-13 w-50" />
                <Skeleton className="mx-auto h-5 w-37.5" />
              </div>
            : <>
                <p className="mt-2 text-[44px] font-bold leading-none tracking-tight text-slate-950 dark:text-white">
                  {formatXlm(wallet.walletBalance)} XLM
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                  ≈ {usdFormatter.format(estimatedUsdBalance)} USD
                  <span className="ml-1 text-xs text-slate-600/90 dark:text-slate-400">
                    est.
                  </span>
                </p>
              </>
            }
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/65 px-2.5 py-1 dark:bg-slate-900/70">
                <Clock3 className="h-3.5 w-3.5" />
                Auto-refresh in {secondsUntilRefresh}s
              </span>
              {wallet.isRefreshingBalance && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/65 px-2.5 py-1 dark:bg-slate-900/70">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Refreshing...
                </span>
              )}
              {wallet.lastBalanceUpdated && (
                <span className="rounded-full bg-white/65 px-2.5 py-1 dark:bg-slate-900/70">
                  Updated {wallet.lastBalanceUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="mx-auto mt-5 grid w-full max-w-3xl gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              className="h-11 rounded-full bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              onClick={() =>
                quickTransferRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }>
              Send
            </button>
            <button
              type="button"
              className="h-11 rounded-full bg-white/65 px-4 text-sm font-medium text-slate-800 transition hover:bg-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              onClick={() =>
                pushToast(
                  "Coming Soon",
                  "Request payment flow is next in roadmap.",
                  "success",
                )
              }>
              Request
            </button>
            <button
              type="button"
              className="h-11 rounded-full bg-white/65 px-4 text-sm font-medium text-slate-800 transition hover:bg-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              onClick={() => router.push("/dashboard/escrow-create")}>
              Split Bill
            </button>
            <button
              type="button"
              className="h-11 rounded-full bg-white/65 px-4 text-sm font-medium text-slate-800 transition hover:bg-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              onClick={() =>
                window.open(
                  EXPLORER_CONFIG.friendbotUrl,
                  "_blank",
                  "noopener,noreferrer",
                )
              }>
              Top Up
            </button>
          </div>
        </article>

        <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Wallet health
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Connectivity and payment readiness
              </p>
            </div>
            {!wallet.walletAddress ?
              <Skeleton className="h-6 w-20 rounded-full" />
            : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {wallet.walletOnTestnet ?
                  "TESTNET"
                : wallet.walletOnMainnet ?
                  "MAINNET"
                : "OFFLINE"}
              </span>
            }
          </div>

          {!wallet.walletAddress ?
            <div className="mt-4 space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          : <>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                  <span>Health score</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {walletHealthScore}/100 · {walletHealthLabel}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <span
                    className={cn(
                      "block h-full rounded-full transition-all",
                      walletHealthScore >= 85 ? "bg-emerald-500"
                      : walletHealthScore >= 65 ? "bg-sky-500"
                      : walletHealthScore >= 45 ? "bg-amber-500"
                      : "bg-rose-500",
                    )}
                    style={{ width: `${walletHealthScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-300">
                    Address
                  </span>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {wallet.walletAddress ?
                      formatShortAddress(wallet.walletAddress)
                    : "Not connected"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-300">
                    Transactions
                  </span>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {payment.transactions.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-300">
                    Escrows
                  </span>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {escrows.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-300">
                    Success rate
                  </span>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">
                    {payment.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <Button
                className="mt-auto w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                onClick={() =>
                  pushToast(
                    "Tip",
                    "Use sidebar actions to switch/disconnect wallet.",
                    "success",
                  )
                }>
                Quick wallet tip
              </Button>
            </>
          }
        </article>
      </div>

      <div className="mt-6 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <article
          id="quick-transfer"
          ref={quickTransferRef}
          className="h-full rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Quick transfer
            </h2>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setQuickTransferMode("send")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  quickTransferMode === "send" ?
                    "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                )}>
                Send
              </button>
              <button
                type="button"
                onClick={() => setQuickTransferMode("receive")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  quickTransferMode === "receive" ?
                    "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                )}>
                Receive
              </button>
            </div>
            {quickTransferMode === "send" ?
              <Button
                variant="ghost"
                className="rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                onClick={() => {
                  payment.setRecipientAddress("");
                  payment.setPaymentAmount("");
                }}>
                Clear
              </Button>
            : <div className="w-18" />}
          </div>

          {quickTransferMode === "send" ?
            <div className="mx-auto mt-4 w-full max-w-2xl rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/45">
              <div className="flex flex-wrap gap-2">
                {frequentContacts.length > 0 ?
                  frequentContacts.map((address) => (
                    <button
                      key={address}
                      type="button"
                      onClick={() => payment.setRecipientAddress(address)}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-700">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900">
                        {address.slice(2, 4).toUpperCase()}
                      </span>
                      {formatShortAddress(address)}
                    </button>
                  ))
                : <p className="text-sm text-slate-500 dark:text-slate-300">
                    No recent contacts yet. Complete a transfer to populate
                    quick contacts.
                  </p>
                }
              </div>

              <form
                className="mt-5 grid gap-3"
                onSubmit={payment.handlePaymentSubmit}>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Recipient address
                  </span>
                  <input
                    value={payment.recipientAddress}
                    onChange={(event) =>
                      payment.setRecipientAddress(event.target.value)
                    }
                    placeholder="G..."
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-500/20"
                  />
                </label>

                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Amount (XLM)
                  </span>
                  <input
                    value={payment.paymentAmount}
                    onChange={(event) =>
                      payment.setPaymentAmount(event.target.value)
                    }
                    type="number"
                    step="0.0000001"
                    min="0"
                    placeholder="0.00"
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-500/20"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-300">
                    Balance:{" "}
                    <strong>{formatXlm(wallet.walletBalance)} XLM</strong>
                  </span>
                  <span className="text-slate-500 dark:text-slate-300">
                    {payment.isCheckingRecipient ?
                      "Checking recipient..."
                    : payment.recipientAddress.trim() ?
                      payment.recipientExists === true ?
                        "Recipient account found"
                      : payment.recipientExists === false ?
                        "Recipient account not found"
                      : "Recipient status unavailable"
                    : "Enter recipient to validate"}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={!wallet.walletOnTestnet || payment.isSendingPayment}
                  className="h-10 rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                  {payment.isSendingPayment ?
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending payment...
                    </>
                  : <>
                      <Send className="mr-2 h-4 w-4" />
                      Send payment
                    </>
                  }
                </Button>
              </form>
            </div>
          : <div className="mx-auto mt-4 flex min-h-82 w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center dark:border-slate-700 dark:bg-slate-800/45">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-900">
                <QrCode className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
                Receive from Quick Transfer
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Share your wallet address or payment link directly from home.
              </p>

              {wallet.walletAddress ?
                <>
                  <p className="mt-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
                    {formatShortAddress(wallet.walletAddress)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                    {wallet.walletOnTestnet ?
                      "Testnet pay link ready"
                    : "Connect on testnet for app payments"}
                  </p>

                  <div className="mt-4 grid w-full max-w-md gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={() =>
                        payment.copyText(wallet.walletAddress ?? "")
                      }>
                      <Copy className="mr-2 h-4 w-4" />
                      Address
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 rounded-xl"
                      onClick={() => payment.copyText(receivePayLink)}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Pay link
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 h-10 rounded-xl"
                    onClick={() => router.push("/dashboard/transfer")}>
                    <QrCode className="mr-2 h-4 w-4" />
                    Open full receive QR
                  </Button>
                </>
              : <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">
                  Connect your wallet to enable receive actions.
                </p>
              }
            </div>
          }
        </article>

        <article className="h-full rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Statistics
            </h2>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setStatsRange("weekly")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  statsRange === "weekly" ?
                    "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                )}>
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setStatsRange("monthly")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  statsRange === "monthly" ?
                    "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                )}>
                Monthly
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Transferred volume
              </p>
              <span className="text-2xl font-bold text-slate-950 dark:text-white">
                {compactFormatter.format(periodIncome + periodExpense)} XLM
              </span>
            </div>

            <div className="mt-4 flex h-44 items-end gap-2">
              {statsBuckets.map((bucket) => (
                <div
                  key={bucket.key}
                  className="flex flex-1 flex-col items-center">
                  <div className="flex h-32 w-full max-w-8 items-end gap-1">
                    <span
                      className="w-1/2 rounded-t-md bg-sky-300 dark:bg-sky-400"
                      style={{
                        height: `${Math.max(8, (bucket.income / chartMax) * 100)}%`,
                      }}
                    />
                    <span
                      className="w-1/2 rounded-t-md bg-slate-950 dark:bg-white"
                      style={{
                        height: `${Math.max(8, (bucket.expense / chartMax) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-300">
                    {bucket.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/25 dark:bg-emerald-500/10">
              <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                <ArrowDown className="h-3.5 w-3.5" />
                Income
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                {formatXlm(periodIncome)} XLM
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-500/25 dark:bg-red-500/10">
              <p className="flex items-center gap-1 text-xs text-red-700 dark:text-red-300">
                <ArrowUp className="h-3.5 w-3.5" />
                Expenses
              </p>
              <p className="mt-1 text-lg font-semibold text-red-800 dark:text-red-200">
                {formatXlm(periodExpense)} XLM
              </p>
            </div>
          </div>
        </article>
      </div>

      <div
        id="transactions"
        className="mt-6 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <article className="h-full rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Transactions
            </h2>
            <Button
              variant="outline"
              className="rounded-xl border-slate-300 dark:border-slate-600"
              onClick={() => router.push("/dashboard/transfer")}>
              <Send className="mr-2 h-4 w-4" />
              New transfer
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {filteredTransactions.length > 0 ?
              filteredTransactions.slice(0, 7).map((tx) => {
                const incoming = tx.to.toLowerCase() === walletAddressLower;
                const counterparty = incoming ? tx.from : tx.to;
                const amount = Number.parseFloat(tx.amount);

                return (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/55">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {incoming ?
                          <ArrowDownRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        : <ArrowUpRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        }
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {incoming ? "From" : "To"}{" "}
                          {formatShortAddress(counterparty)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          {formatTimestamp(tx.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          incoming ?
                            "text-emerald-700 dark:text-emerald-300"
                          : "text-slate-900 dark:text-white",
                        )}>
                        {incoming ? "+" : "-"} {formatXlm(amount)} XLM
                      </p>
                      <a
                        href={`${EXPLORER_CONFIG.txBaseUrl}/${tx.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-500 underline-offset-2 hover:underline dark:text-slate-300">
                        View on explorer
                      </a>
                    </div>
                  </div>
                );
              })
            : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                No transactions found. Send your first payment from Quick
                Transfer.
              </div>
            }
          </div>
        </article>

        <aside id="settings" className="xl:h-full">
          <article className="h-full rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              Monthly snapshot
            </h3>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Confirmed transactions
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                  {confirmedTransactions} / {payment.transactions.length}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Escrow value locked
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                  {compactFormatter.format(escrowLocked)} XLM
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Net flow ({statsRange})
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                  {formatXlm(periodIncome - periodExpense)} XLM
                </p>
              </div>
            </div>
          </article>
        </aside>
      </div>

      <PaymentSuccessDialog
        hash={payment.paymentSuccessHash}
        explorerBaseUrl={EXPLORER_CONFIG.txBaseUrl}
        onClose={() => payment.setPaymentSuccessHash(null)}
        onCopy={payment.copyText}
      />
    </>
  );
}
