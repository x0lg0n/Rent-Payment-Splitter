"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Copy,
  Link2,
  Loader2,
  QrCode,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PaymentSuccessDialog } from "@/components/dashboard/payment-success-dialog";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";
import { usePayment } from "@/lib/hooks/use-payment";
import { EXPLORER_CONFIG } from "@/lib/config";

type TransferMode = "send" | "receive";

const MAX_SINGLE_PAYMENT_XLM = 10_000;
const SAFE_RESERVE_XLM = 1.01;
const QR_SERVICE_BASE_URL = "https://api.qrserver.com/v1/create-qr-code/";

function formatXlm(value: number | null) {
  if (value === null || Number.isNaN(value)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
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

function toAmountInput(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  return value
    .toFixed(7)
    .replace(/(?:\.0+|(\.\d+?)0+)$/, "$1");
}

function buildPayLink(input: {
  destination: string;
  amount: string;
  memo: string;
  includeTestnet: boolean;
}) {
  const params = new URLSearchParams();
  params.set("destination", input.destination);

  if (input.amount) params.set("amount", input.amount);
  if (input.memo) {
    params.set("memo", input.memo);
    params.set("memo_type", "text");
  }
  if (input.includeTestnet) params.set("network", "testnet");

  return `web+stellar:pay?${params.toString()}`;
}

interface TransferMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  tone?: "neutral" | "income" | "expense";
}

function TransferMetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "neutral",
}: TransferMetricCardProps) {
  const toneStyles =
    tone === "income"
      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
      : tone === "expense"
        ? "border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10"
        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900";

  return (
    <article className={cn("rounded-2xl border p-4", toneStyles)}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{helper}</p>
    </article>
  );
}

export default function TransferPage() {
  const [mode, setMode] = useState<TransferMode>("send");
  const [requestAmount, setRequestAmount] = useState("");
  const [requestMemo, setRequestMemo] = useState("");
  const [failedQrUrl, setFailedQrUrl] = useState<string | null>(null);
  const { wallet, pushToast } = useDashboardContext();

  const payment = usePayment({
    walletAddress: wallet.walletAddress,
    walletNetwork: wallet.walletNetwork,
    walletBalance: wallet.walletBalance,
    walletOnTestnet: wallet.walletOnTestnet,
    pushToast,
    refreshBalance: wallet.refreshBalance,
  });

  const walletAddressLower = wallet.walletAddress?.toLowerCase() ?? "";
  const frequentContacts = useMemo(() => {
    if (!walletAddressLower) return [];

    const contactFrequency = new Map<string, number>();
    for (const tx of payment.transactions) {
      const from = tx.from.toLowerCase();
      const to = tx.to.toLowerCase();
      const counterparty = from === walletAddressLower ? tx.to : to === walletAddressLower ? tx.from : null;
      if (!counterparty) continue;
      contactFrequency.set(counterparty, (contactFrequency.get(counterparty) ?? 0) + 1);
    }

    return Array.from(contactFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([address]) => address);
  }, [payment.transactions, walletAddressLower]);

  const sentCount = useMemo(
    () => payment.transactions.filter((tx) => tx.from.toLowerCase() === walletAddressLower).length,
    [payment.transactions, walletAddressLower],
  );
  const receivedCount = useMemo(
    () => payment.transactions.filter((tx) => tx.to.toLowerCase() === walletAddressLower).length,
    [payment.transactions, walletAddressLower],
  );

  const transferRows = useMemo(() => {
    return payment.transactions
      .map((tx) => {
        const incoming = tx.to.toLowerCase() === walletAddressLower;
        const amount = Number.parseFloat(tx.amount);
        if (!Number.isFinite(amount)) return null;
        const counterparty = incoming ? tx.from : tx.to;

        return {
          hash: tx.hash,
          amount,
          incoming,
          counterparty,
          createdAtLabel: formatTimestamp(tx.createdAt),
        };
      })
      .filter((row): row is { hash: string; amount: number; incoming: boolean; counterparty: string; createdAtLabel: string } => Boolean(row));
  }, [payment.transactions, walletAddressLower]);

  const requestAmountError = useMemo(() => {
    const raw = requestAmount.trim();
    if (!raw) return "";

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) return "Amount must be greater than 0.";
    if (parsed > MAX_SINGLE_PAYMENT_XLM) {
      return `Amount must be ${MAX_SINGLE_PAYMENT_XLM.toLocaleString()} XLM or less.`;
    }
    return "";
  }, [requestAmount]);

  const normalizedRequestAmount = useMemo(() => {
    if (requestAmountError) return "";
    const raw = requestAmount.trim();
    if (!raw) return "";
    const parsed = Number(raw);
    return toAmountInput(parsed);
  }, [requestAmount, requestAmountError]);

  const receivePayLink = useMemo(() => {
    if (!wallet.walletAddress) return "";
    return buildPayLink({
      destination: wallet.walletAddress,
      amount: normalizedRequestAmount,
      memo: requestMemo.trim(),
      includeTestnet: wallet.walletOnTestnet,
    });
  }, [wallet.walletAddress, wallet.walletOnTestnet, normalizedRequestAmount, requestMemo]);

  const receiveQrUrl = useMemo(() => {
    if (!receivePayLink) return "";
    return `${QR_SERVICE_BASE_URL}?size=320x320&margin=10&data=${encodeURIComponent(receivePayLink)}`;
  }, [receivePayLink]);

  const qrLoadFailed = Boolean(receiveQrUrl) && failedQrUrl === receiveQrUrl;

  const recipientStatus = useMemo(() => {
    if (payment.isCheckingRecipient) {
      return {
        label: "Checking recipient...",
        className: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
      };
    }

    if (!payment.recipientAddress.trim()) {
      return {
        label: "Enter recipient to validate",
        className: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
      };
    }

    if (payment.recipientExists === true) {
      return {
        label: "Recipient account found",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
      };
    }

    if (payment.recipientExists === false) {
      return {
        label: "Recipient account not found",
        className: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
      };
    }

    return {
      label: "Recipient status unavailable",
      className: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  }, [payment.isCheckingRecipient, payment.recipientAddress, payment.recipientExists]);

  const applyQuickAmount = (modeInput: "quarter" | "half" | "max") => {
    const balance = wallet.walletBalance ?? 0;
    if (!Number.isFinite(balance) || balance <= 0) {
      pushToast("No balance", "No available balance to prefill amount.", "error");
      return;
    }

    if (modeInput === "max") {
      const safeMax = Math.max(0, balance - SAFE_RESERVE_XLM);
      if (safeMax <= 0) {
        pushToast("Low balance", "Need more than 1.01 XLM to use max-safe transfer.", "error");
        return;
      }
      payment.setPaymentAmount(toAmountInput(safeMax));
      return;
    }

    const multiplier = modeInput === "quarter" ? 0.25 : 0.5;
    payment.setPaymentAmount(toAmountInput(balance * multiplier));
  };

  return (
    <>
      <DashboardPageHeader
        title="Payment transfer"
        subtitle="Send XLM instantly or receive money with your wallet QR request."
        badgeLabel="Transfer center"
        showSearch={false}
      />

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <TransferMetricCard
          icon={ArrowUpRight}
          label="Total sent"
          value={`${formatXlm(payment.totalSent)} XLM`}
          helper={`${sentCount} outgoing transfers`}
          tone="expense"
        />
        <TransferMetricCard
          icon={ArrowDownRight}
          label="Total received"
          value={`${formatXlm(payment.totalReceived)} XLM`}
          helper={`${receivedCount} incoming transfers`}
          tone="income"
        />
        <TransferMetricCard
          icon={ShieldCheck}
          label="Success rate"
          value={`${payment.successRate.toFixed(1)}%`}
          helper={`${payment.transactions.length} total transactions`}
        />
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Transfer actions</h2>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setMode("send")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    mode === "send"
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                  )}
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={() => setMode("receive")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    mode === "receive"
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                  )}
                >
                  Receive
                </button>
              </div>
            </div>

            {mode === "send" ? (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {frequentContacts.length > 0 ? (
                    frequentContacts.map((address) => (
                      <button
                        key={address}
                        type="button"
                        onClick={() => payment.setRecipientAddress(address)}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:bg-slate-700"
                      >
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900">
                          {address.slice(2, 4).toUpperCase()}
                        </span>
                        {formatShortAddress(address)}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      No frequent contacts yet. Send your first transfer to build quick picks.
                    </p>
                  )}
                </div>

                <form className="mt-5 grid gap-3" onSubmit={payment.handlePaymentSubmit}>
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Recipient address</span>
                    <Input
                      value={payment.recipientAddress}
                      onChange={(event) => payment.setRecipientAddress(event.target.value)}
                      placeholder="G..."
                      className="h-10 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </label>

                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Amount (XLM)</span>
                    <Input
                      value={payment.paymentAmount}
                      onChange={(event) => payment.setPaymentAmount(event.target.value)}
                      type="number"
                      step="0.0000001"
                      min="0"
                      placeholder="0.00"
                      className="h-10 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => payment.setPaymentAmount("10")}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      10 XLM
                    </button>
                    <button
                      type="button"
                      onClick={() => payment.setPaymentAmount("20")}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      20 XLM
                    </button>
                    <button
                      type="button"
                      onClick={() => payment.setPaymentAmount("30")}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      30 XLM
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickAmount("quarter")}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickAmount("half")}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickAmount("max")}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Max safe
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        payment.setRecipientAddress("");
                        payment.setPaymentAmount("");
                      }}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-300">
                      Balance: <strong>{formatXlm(wallet.walletBalance)} XLM</strong>
                    </span>
                    <span className={cn("rounded-full border px-2.5 py-1 font-medium", recipientStatus.className)}>
                      {recipientStatus.label}
                    </span>
                  </div>

                  {!wallet.walletOnTestnet && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
                      Switch wallet to testnet before sending payment.
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!wallet.walletOnTestnet || payment.isSendingPayment}
                    className="h-10 rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {payment.isSendingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending payment...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send payment
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : wallet.walletAddress ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Request amount (optional)</span>
                    <Input
                      value={requestAmount}
                      onChange={(event) => setRequestAmount(event.target.value)}
                      type="number"
                      step="0.0000001"
                      min="0"
                      placeholder="0.00"
                      className="h-10 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </label>

                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Memo (optional)</span>
                    <Input
                      value={requestMemo}
                      onChange={(event) => setRequestMemo(event.target.value)}
                      maxLength={28}
                      placeholder="Rent - March"
                      className="h-10 rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </label>
                </div>

                {requestAmountError ? (
                  <p className="text-xs text-orange-700 dark:text-orange-300">{requestAmountError}</p>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="grid place-items-center rounded-xl bg-white p-2 dark:bg-slate-900">
                      {receiveQrUrl && !qrLoadFailed ? (
                        <Image
                          key={receiveQrUrl}
                          src={receiveQrUrl}
                          width={248}
                          height={248}
                          alt="Wallet payment request QR code"
                          className="h-auto w-auto rounded-lg"
                          unoptimized
                          onError={() => setFailedQrUrl(receiveQrUrl)}
                        />
                      ) : (
                        <div className="grid h-62 w-62 place-items-center rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-500 dark:border-slate-600 dark:text-slate-300">
                          QR preview unavailable.
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-300">
                      Scan this QR to prefill destination and request details.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Wallet</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {formatShortAddress(wallet.walletAddress)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-300">
                        {wallet.walletOnTestnet ? "Testnet request" : "Network not confirmed"}
                      </p>
                    </div>

                    <label className="grid gap-1.5 text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-200">Payment request link</span>
                      <Input
                        value={receivePayLink}
                        readOnly
                        className="h-10 rounded-xl border-slate-200 font-mono text-xs dark:border-slate-700"
                      />
                    </label>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() => payment.copyText(wallet.walletAddress ?? "")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Address
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() => payment.copyText(receivePayLink)}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Pay link
                      </Button>
                    </div>

                    <Button asChild variant="outline" className="h-10 w-full rounded-xl">
                      <a href={receiveQrUrl} target="_blank" rel="noreferrer">
                        <QrCode className="mr-2 h-4 w-4" />
                        Open QR in new tab
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                Connect your wallet to generate your receive QR code.
              </div>
            )}
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Transaction history</h3>
            <div className="mt-4 space-y-2">
              {transferRows.length > 0 ? (
                transferRows.slice(0, 8).map((row) => (
                  <div
                    key={row.hash}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/55"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {row.incoming ? (
                          <ArrowDownRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {row.incoming ? "From" : "To"} {formatShortAddress(row.counterparty)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">{row.createdAtLabel}</p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        row.incoming ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white",
                      )}
                    >
                      {row.incoming ? "+" : "-"} {formatXlm(row.amount)} XLM
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                  No transfers yet.
                </div>
              )}
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
