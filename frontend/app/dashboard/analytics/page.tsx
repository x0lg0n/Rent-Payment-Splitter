"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Download,
  Filter,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";
import { useTransactionStore, useEscrowStore } from "@/lib/store";
import { EXPLORER_CONFIG } from "@/lib/config";

type RangeType = "weekly" | "monthly";
type DirectionFilter = "all" | "incoming" | "outgoing";
type TransferTypeFilter = "all" | "direct" | "escrow";

interface Bucket {
  key: string;
  label: string;
  income: number;
  expense: number;
  incomeCount: number;
  expenseCount: number;
  totalCount: number;
}

interface NormalizedTransaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  createdAt: Date;
  createdAtLabel: string;
  direction: "incoming" | "outgoing";
  counterparty: string;
  type: "direct" | "escrow";
  dayKey: string;
  monthKey: string;
}

interface PeriodTotals {
  income: number;
  expense: number;
  net: number;
  count: number;
}

interface CounterpartyStat {
  address: string;
  amount: number;
  count: number;
}

const xlmFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatXlm(value: number) {
  return xlmFormatter.format(value);
}

function formatShortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getPercentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    if (current === 0) return 0;
    return null;
  }
  return ((current - previous) / previous) * 100;
}

function formatDelta(delta: number | null) {
  if (delta === null) return "New";
  if (delta === 0) return "0.0%";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

function csvEscape(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

function parseAmountInput(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return Number.NaN;
  return parsed;
}

function computePeriodTotals(
  transactions: NormalizedTransaction[],
  start: Date,
  end: Date,
): PeriodTotals {
  let income = 0;
  let expense = 0;
  let count = 0;

  for (const tx of transactions) {
    const ts = tx.createdAt.getTime();
    if (ts < start.getTime() || ts >= end.getTime()) continue;
    count += 1;
    if (tx.direction === "incoming") income += tx.amount;
    else expense += tx.amount;
  }

  return { income, expense, net: income - expense, count };
}

function CounterpartyList({
  title,
  items,
  tone,
}: {
  title: string;
  items: CounterpartyStat[];
  tone: "incoming" | "outgoing";
}) {
  const icon = tone === "incoming" ? ArrowDownRight : ArrowUpRight;
  const toneClass =
    tone === "incoming"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-orange-600 dark:text-orange-400";
  const maxAmount = Math.max(1, ...items.map((item) => item.amount));

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{title}</p>
      <div className="mt-2 space-y-2">
        {items.length > 0 ? (
          items.map((item) => {
            const Icon = icon;
            return (
              <div
                key={item.address}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", toneClass)} />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{formatShortAddress(item.address)}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-300">{item.count} tx</p>
                    <div className="mt-1 h-1.5 w-28 rounded-full bg-slate-200 dark:bg-slate-700">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          tone === "incoming" ? "bg-emerald-500" : "bg-orange-500",
                        )}
                        style={{ width: `${Math.max(8, (item.amount / maxAmount) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatXlm(item.amount)} XLM</p>
              </div>
            );
          })
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
            No data yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { wallet, pushToast } = useDashboardContext();
  const { transactions } = useTransactionStore();
  const { escrows } = useEscrowStore();

  const [range, setRange] = useState<RangeType>("weekly");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [transferTypeFilter, setTransferTypeFilter] = useState<TransferTypeFilter>("all");
  const [minAmountInput, setMinAmountInput] = useState("");
  const [maxAmountInput, setMaxAmountInput] = useState("");
  const [selectedBucketKey, setSelectedBucketKey] = useState<string | null>(null);
  const [hoveredBucketKey, setHoveredBucketKey] = useState<string | null>(null);

  const walletAddressLower = wallet.walletAddress?.toLowerCase() ?? "";

  const escrowAddressSet = useMemo(() => {
    const set = new Set<string>();
    for (const escrow of escrows) {
      if (escrow.landlord) set.add(escrow.landlord.toLowerCase());
      if (escrow.creator) set.add(escrow.creator.toLowerCase());
      for (const participant of escrow.participants) {
        if (participant.address) set.add(participant.address.toLowerCase());
      }
    }
    return set;
  }, [escrows]);

  const normalizedTransactions = useMemo<NormalizedTransaction[]>(() => {
    if (!walletAddressLower) return [];

    const rows: NormalizedTransaction[] = [];

    for (const tx of transactions) {
      const createdAt = new Date(tx.createdAt);
      if (Number.isNaN(createdAt.getTime())) continue;

      const amount = Number.parseFloat(tx.amount);
      if (!Number.isFinite(amount) || amount <= 0) continue;

      const from = tx.from.toLowerCase();
      const to = tx.to.toLowerCase();

      let direction: "incoming" | "outgoing" | null = null;
      let counterparty = "";
      if (to === walletAddressLower) {
        direction = "incoming";
        counterparty = tx.from;
      } else if (from === walletAddressLower) {
        direction = "outgoing";
        counterparty = tx.to;
      }
      if (!direction) continue;

      const type = escrowAddressSet.has(counterparty.toLowerCase()) ? "escrow" : "direct";

      rows.push({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount,
        createdAt,
        createdAtLabel: formatTimestamp(createdAt),
        direction,
        counterparty,
        type,
        dayKey: getDayKey(createdAt),
        monthKey: getMonthKey(createdAt),
      });
    }

    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return rows;
  }, [transactions, walletAddressLower, escrowAddressSet]);

  const buckets = useMemo<Bucket[]>(() => {
    const now = new Date();
    const result: Bucket[] = [];
    const bucketMap = new Map<string, Bucket>();

    if (range === "weekly") {
      const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(now.getDate() - offset);
        const key = getDayKey(date);
        const bucket: Bucket = {
          key,
          label: formatter.format(date),
          income: 0,
          expense: 0,
          incomeCount: 0,
          expenseCount: 0,
          totalCount: 0,
        };
        result.push(bucket);
        bucketMap.set(key, bucket);
      }
    } else {
      const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
      for (let offset = 5; offset >= 0; offset -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const key = getMonthKey(date);
        const bucket: Bucket = {
          key,
          label: formatter.format(date),
          income: 0,
          expense: 0,
          incomeCount: 0,
          expenseCount: 0,
          totalCount: 0,
        };
        result.push(bucket);
        bucketMap.set(key, bucket);
      }
    }

    for (const tx of normalizedTransactions) {
      const key = range === "weekly" ? tx.dayKey : tx.monthKey;
      const bucket = bucketMap.get(key);
      if (!bucket) continue;

      bucket.totalCount += 1;
      if (tx.direction === "incoming") {
        bucket.income += tx.amount;
        bucket.incomeCount += 1;
      } else {
        bucket.expense += tx.amount;
        bucket.expenseCount += 1;
      }
    }

    return result;
  }, [range, normalizedTransactions]);

  const maxValue = useMemo(() => {
    return Math.max(1, ...buckets.flatMap((bucket) => [bucket.income, bucket.expense]));
  }, [buckets]);

  const hoveredOrSelectedBucket = useMemo(() => {
    const key = hoveredBucketKey ?? selectedBucketKey;
    if (!key) return null;
    return buckets.find((bucket) => bucket.key === key) ?? null;
  }, [buckets, hoveredBucketKey, selectedBucketKey]);

  const minAmount = useMemo(() => parseAmountInput(minAmountInput), [minAmountInput]);
  const maxAmount = useMemo(() => parseAmountInput(maxAmountInput), [maxAmountInput]);

  const amountError = useMemo(() => {
    if (Number.isNaN(minAmount) || Number.isNaN(maxAmount)) return "Amount filters must be valid positive numbers.";
    if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
      return "Min amount cannot be greater than max amount.";
    }
    return "";
  }, [minAmount, maxAmount]);

  const filteredTransactions = useMemo(() => {
    if (amountError) return [];

    return normalizedTransactions.filter((tx) => {
      if (directionFilter !== "all" && tx.direction !== directionFilter) return false;
      if (transferTypeFilter !== "all" && tx.type !== transferTypeFilter) return false;
      if (minAmount !== null && tx.amount < minAmount) return false;
      if (maxAmount !== null && tx.amount > maxAmount) return false;
      if (selectedBucketKey) {
        const txBucketKey = range === "weekly" ? tx.dayKey : tx.monthKey;
        if (txBucketKey !== selectedBucketKey) return false;
      }
      return true;
    });
  }, [
    normalizedTransactions,
    directionFilter,
    transferTypeFilter,
    minAmount,
    maxAmount,
    selectedBucketKey,
    range,
    amountError,
  ]);

  const filteredIncome = useMemo(
    () => filteredTransactions.filter((tx) => tx.direction === "incoming").reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  );
  const filteredExpense = useMemo(
    () => filteredTransactions.filter((tx) => tx.direction === "outgoing").reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  );
  const filteredNet = filteredIncome - filteredExpense;
  const totalFlowAmount = filteredIncome + filteredExpense;
  const incomingShare = totalFlowAmount > 0 ? (filteredIncome / totalFlowAmount) * 100 : 0;
  const outgoingShare = totalFlowAmount > 0 ? (filteredExpense / totalFlowAmount) * 100 : 0;

  const activeEscrows = escrows.filter((escrow) => escrow.status === "Active").length;

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const currentWeekStart = new Date(todayStart);
  currentWeekStart.setDate(todayStart.getDate() - 6);
  const currentWeekEnd = new Date(todayStart);
  currentWeekEnd.setDate(todayStart.getDate() + 1);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);
  const previousWeekEnd = new Date(currentWeekStart);

  const weeklyComparison = {
    current: computePeriodTotals(normalizedTransactions, currentWeekStart, currentWeekEnd),
    previous: computePeriodTotals(normalizedTransactions, previousWeekStart, previousWeekEnd),
  };

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyComparison = {
    current: computePeriodTotals(normalizedTransactions, currentMonthStart, currentMonthEnd),
    previous: computePeriodTotals(normalizedTransactions, previousMonthStart, previousMonthEnd),
  };

  const daysElapsed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const netSoFar = monthlyComparison.current.net;
  const projectedNet = daysElapsed > 0 ? (netSoFar / daysElapsed) * daysInMonth : netSoFar;
  const monthProgress = {
    daysElapsed,
    daysInMonth,
    progress: (daysElapsed / daysInMonth) * 100,
    projectedNet,
    netSoFar,
  };

  const directAmount = useMemo(
    () => filteredTransactions.filter((tx) => tx.type === "direct").reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  );
  const escrowAmount = useMemo(
    () => filteredTransactions.filter((tx) => tx.type === "escrow").reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions],
  );
  const typeTotal = directAmount + escrowAmount;
  const directShare = typeTotal > 0 ? (directAmount / typeTotal) * 100 : 0;
  const escrowShare = typeTotal > 0 ? (escrowAmount / typeTotal) * 100 : 0;

  const counterpartyStats = useMemo(() => {
    const incomingMap = new Map<string, CounterpartyStat>();
    const outgoingMap = new Map<string, CounterpartyStat>();

    for (const tx of normalizedTransactions) {
      const map = tx.direction === "incoming" ? incomingMap : outgoingMap;
      const existing = map.get(tx.counterparty);
      if (existing) {
        existing.amount += tx.amount;
        existing.count += 1;
      } else {
        map.set(tx.counterparty, {
          address: tx.counterparty,
          amount: tx.amount,
          count: 1,
        });
      }
    }

    const sortByAmount = (items: CounterpartyStat[]) =>
      items.sort((a, b) => b.amount - a.amount).slice(0, 3);

    return {
      incoming: sortByAmount(Array.from(incomingMap.values())),
      outgoing: sortByAmount(Array.from(outgoingMap.values())),
    };
  }, [normalizedTransactions]);

  const exportCsv = () => {
    if (filteredTransactions.length === 0) {
      pushToast("No data", "No rows available to export for current filters.", "error");
      return;
    }

    const headers = [
      "date",
      "hash",
      "direction",
      "counterparty",
      "amount_xlm",
      "type",
      "range_bucket",
      "explorer_url",
    ];
    const rows = filteredTransactions.map((tx) => {
      const rangeBucket = range === "weekly" ? tx.dayKey : tx.monthKey;
      return [
        tx.createdAt.toISOString(),
        tx.hash,
        tx.direction,
        tx.counterparty,
        tx.amount.toFixed(7),
        tx.type,
        rangeBucket,
        `${EXPLORER_CONFIG.txBaseUrl}/${tx.hash}`,
      ].map((value) => csvEscape(value));
    });

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    const nowKey = new Date().toISOString().replace(/[:.]/g, "-");
    anchor.href = url;
    anchor.download = `splitrent-analytics-${range}-${nowKey}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    pushToast("Export ready", "CSV downloaded with current filters.", "success");
  };

  const shareSummary = async () => {
    const summary = [
      `SplitRent analytics (${range})`,
      `Transactions: ${filteredTransactions.length}`,
      `Income: ${formatXlm(filteredIncome)} XLM`,
      `Expense: ${formatXlm(filteredExpense)} XLM`,
      `Net flow: ${formatXlm(filteredNet)} XLM`,
      `Direction filter: ${directionFilter}`,
      `Type filter: ${transferTypeFilter}`,
      selectedBucketKey ? `Bucket: ${selectedBucketKey}` : "Bucket: all",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      pushToast("Copied", "Analytics summary copied to clipboard.", "success");
    } catch {
      pushToast("Copy failed", "Unable to copy summary.", "error");
    }
  };

  const resetFilters = () => {
    setDirectionFilter("all");
    setTransferTypeFilter("all");
    setMinAmountInput("");
    setMaxAmountInput("");
    setSelectedBucketKey(null);
  };

  return (
    <div>
      <DashboardPageHeader
        title="Analytics"
        subtitle="Compare periods, inspect flow trends, and drill into transactions with filters."
        badgeLabel="Insights"
        showSearch={false}
      />

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">This week vs last week</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {weeklyComparison.current.count} tx vs {weeklyComparison.previous.count} tx
              </p>
            </div>
            <Badge variant="secondary">7-day</Badge>
          </div>
          <div className="mt-2 grid gap-1.5 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-300">Income</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatXlm(weeklyComparison.current.income)} XLM
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-300">
                  {formatDelta(getPercentChange(weeklyComparison.current.income, weeklyComparison.previous.income))}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-300">Expense</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatXlm(weeklyComparison.current.expense)} XLM
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-300">
                  {formatDelta(getPercentChange(weeklyComparison.current.expense, weeklyComparison.previous.expense))}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-300">Net</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatXlm(weeklyComparison.current.net)} XLM
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-300">
                  {formatDelta(getPercentChange(weeklyComparison.current.net, weeklyComparison.previous.net))}
                </span>
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">This month vs last month</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {monthlyComparison.current.count} tx vs {monthlyComparison.previous.count} tx
              </p>
            </div>
            <Badge variant="secondary">Monthly</Badge>
          </div>
          <div className="mt-2 grid gap-1.5 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-300">Income</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatXlm(monthlyComparison.current.income)} XLM
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-300">
                  {formatDelta(getPercentChange(monthlyComparison.current.income, monthlyComparison.previous.income))}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-300">Expense</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatXlm(monthlyComparison.current.expense)} XLM
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-300">
                  {formatDelta(getPercentChange(monthlyComparison.current.expense, monthlyComparison.previous.expense))}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-300">Net</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatXlm(monthlyComparison.current.net)} XLM
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-300">
                  {formatDelta(getPercentChange(monthlyComparison.current.net, monthlyComparison.previous.net))}
                </span>
              </span>
            </div>
          </div>
        </article>
      </section>

      <div className="mt-4 grid items-stretch gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Flow chart</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setRange("weekly");
                      setSelectedBucketKey(null);
                    }}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition",
                      range === "weekly"
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                    )}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRange("monthly");
                      setSelectedBucketKey(null);
                    }}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition",
                      range === "monthly"
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                    )}
                  >
                    Monthly
                  </button>
                </div>

                <Button type="button" variant="outline" className="rounded-xl" onClick={exportCsv}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => void shareSummary()}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-xs dark:bg-slate-900">
                {hoveredOrSelectedBucket ? (
                  <>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {hoveredOrSelectedBucket.label}: {hoveredOrSelectedBucket.totalCount} tx
                    </p>
                    <p className="text-slate-500 dark:text-slate-300">
                      Income {formatXlm(hoveredOrSelectedBucket.income)} XLM · Expense{" "}
                      {formatXlm(hoveredOrSelectedBucket.expense)} XLM
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500 dark:text-slate-300">Hover a bar for details. Click a bar to filter the list below.</p>
                )}
              </div>

              <div className="flex h-48 items-end gap-2">
                {buckets.map((bucket) => {
                  const active = selectedBucketKey === bucket.key;
                  const hovered = hoveredBucketKey === bucket.key;
                  const hasValues = bucket.income > 0 || bucket.expense > 0;

                  return (
                    <button
                      key={bucket.key}
                      type="button"
                      onClick={() => setSelectedBucketKey((previous) => (previous === bucket.key ? null : bucket.key))}
                      onMouseEnter={() => setHoveredBucketKey(bucket.key)}
                      onMouseLeave={() => setHoveredBucketKey(null)}
                      title={`${bucket.label}: income ${formatXlm(bucket.income)} XLM, expense ${formatXlm(bucket.expense)} XLM, ${bucket.totalCount} tx`}
                      className={cn(
                        "group flex flex-1 flex-col items-center rounded-xl border border-transparent px-1 py-1 transition",
                        (active || hovered) && "border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/10",
                      )}
                    >
                      <div className="flex h-36 w-full max-w-10 items-end gap-1">
                        <span
                          className="w-1/2 rounded-t-md bg-sky-300 transition-all group-hover:bg-sky-400 dark:bg-sky-400"
                          style={{ height: `${Math.max(hasValues ? 14 : 22, (bucket.income / maxValue) * 100)}%` }}
                        />
                        <span
                          className="w-1/2 rounded-t-md bg-slate-950 transition-all group-hover:bg-slate-700 dark:bg-white dark:group-hover:bg-slate-200"
                          style={{ height: `${Math.max(hasValues ? 14 : 22, (bucket.expense / maxValue) * 100)}%` }}
                        />
                      </div>
                      <span className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-300">{bucket.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Transaction explorer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Filter transactions by direction, type, amount, and selected chart bucket.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedBucketKey ? (
                  <Button variant="ghost" className="rounded-xl" onClick={() => setSelectedBucketKey(null)}>
                    Clear bucket
                  </Button>
                ) : null}
                <Button variant="ghost" className="rounded-xl" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_150px_150px]">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Direction</p>
                  <div className="flex flex-wrap gap-1">
                    {(["all", "incoming", "outgoing"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDirectionFilter(value)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                          directionFilter === value
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                            : "bg-white text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white",
                        )}
                      >
                        {value === "all" ? "All" : value === "incoming" ? "Incoming" : "Outgoing"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Type</p>
                  <div className="flex flex-wrap gap-1">
                    {(["all", "direct", "escrow"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTransferTypeFilter(value)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                          transferTypeFilter === value
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-900"
                            : "bg-white text-slate-600 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white",
                        )}
                      >
                        {value === "all" ? "All" : value === "direct" ? "Direct" : "Escrow"}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="grid gap-1 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Min XLM</span>
                  <Input
                    value={minAmountInput}
                    onChange={(event) => setMinAmountInput(event.target.value)}
                    type="number"
                    min="0"
                    step="0.0000001"
                    placeholder="0"
                    className="h-9 rounded-xl bg-white dark:bg-slate-900"
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Max XLM</span>
                  <Input
                    value={maxAmountInput}
                    onChange={(event) => setMaxAmountInput(event.target.value)}
                    type="number"
                    min="0"
                    step="0.0000001"
                    placeholder="1000"
                    className="h-9 rounded-xl bg-white dark:bg-slate-900"
                  />
                </label>
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  <Filter className="h-3.5 w-3.5" />
                  {filteredTransactions.length} results
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Income {formatXlm(filteredIncome)} XLM
                  </span>
                  <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                    Expense {formatXlm(filteredExpense)} XLM
                  </span>
                </div>
              </div>
            </div>

            {amountError ? (
              <p className="mt-1 text-sm text-destructive">{amountError}</p>
            ) : null}

            <div className="mt-4 space-y-2">
              {normalizedTransactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-slate-600 dark:bg-slate-800/50">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    No transaction history yet. Send or receive your first payment to populate analytics.
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button className="rounded-xl" onClick={() => router.push("/dashboard/transfer")}>
                      Go to transfer
                    </Button>
                    <Button variant="outline" className="rounded-xl" onClick={() => router.push("/dashboard/escrow-create")}>
                      Create escrow
                    </Button>
                  </div>
                </div>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.slice(0, 18).map((tx) => (
                  <div
                    key={tx.hash}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/55"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          {tx.direction === "incoming" ? (
                            <ArrowDownRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {tx.direction === "incoming" ? "From" : "To"} {formatShortAddress(tx.counterparty)}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-300">
                            {tx.createdAtLabel} · {tx.hash.slice(0, 6)}...{tx.hash.slice(-6)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {tx.direction === "incoming" ? "+" : "-"} {formatXlm(tx.amount)} XLM
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 sm:justify-end">
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {tx.type}
                          </Badge>
                          <a
                            href={`${EXPLORER_CONFIG.txBaseUrl}/${tx.hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-500 underline-offset-2 hover:underline dark:text-slate-300"
                          >
                            Explorer
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center dark:border-slate-600 dark:bg-slate-800/50">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    No transactions match current filters. Try resetting filters or another chart bucket.
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={resetFilters}>
                      Reset filters
                    </Button>
                    <Button className="rounded-xl" onClick={() => router.push("/dashboard/transfer")}>
                      New transfer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Summary</h3>
            <div className="mt-3 grid gap-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/25 dark:bg-emerald-500/10">
                <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                  <ArrowDown className="h-3.5 w-3.5" />
                  Income
                </p>
                <p className="mt-1 text-xl font-semibold text-emerald-800 dark:text-emerald-200">{formatXlm(filteredIncome)} XLM</p>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-500/25 dark:bg-red-500/10">
                <p className="flex items-center gap-1 text-xs text-red-700 dark:text-red-300">
                  <ArrowUp className="h-3.5 w-3.5" />
                  Expenses
                </p>
                <p className="mt-1 text-xl font-semibold text-red-800 dark:text-red-200">{formatXlm(filteredExpense)} XLM</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-300">Net flow</p>
                <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{formatXlm(filteredNet)} XLM</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-300">Active escrows</p>
                <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{activeEscrows}</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Flow mix</p>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <span className="h-full bg-emerald-500" style={{ width: `${Math.max(incomingShare, 0)}%` }} />
                <span className="h-full bg-orange-500" style={{ width: `${Math.max(outgoingShare, 0)}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>In {incomingShare.toFixed(1)}%</span>
                <span>Out {outgoingShare.toFixed(1)}%</span>
              </div>

              <div className="mt-3 grid grid-cols-[84px_1fr] items-center gap-3">
                <div
                  className="relative h-20 w-20 rounded-full"
                  style={{
                    background: `conic-gradient(#0f172a 0% ${directShare}%, #64748b ${directShare}% 100%)`,
                  }}
                >
                  <div className="absolute inset-[10px] grid place-items-center rounded-full bg-white text-[11px] font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {typeTotal > 0 ? `${directShare.toFixed(0)}%` : "0%"}
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Direct</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatXlm(directAmount)} XLM</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Escrow</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatXlm(escrowAmount)} XLM</span>
                  </div>
                  <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-300">
                    Type split: {directShare.toFixed(1)}% direct / {escrowShare.toFixed(1)}% escrow
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Month projection</h3>
              <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-300" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              {formatXlm(monthProgress.projectedNet)} XLM
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              Projected net for month-end based on current pace.
            </p>
            <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <span
                className="block h-full rounded-full bg-slate-950 dark:bg-white"
                style={{ width: `${Math.min(100, monthProgress.progress)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
              Day {monthProgress.daysElapsed} of {monthProgress.daysInMonth} · Net so far {formatXlm(monthProgress.netSoFar)} XLM
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Top counterparties</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              Escrow/direct tag is inferred from known escrow participant addresses.
            </p>
            <div className="mt-3 space-y-3">
              <CounterpartyList title="Most received from" items={counterpartyStats.incoming} tone="incoming" />
              <CounterpartyList title="Most sent to" items={counterpartyStats.outgoing} tone="outgoing" />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Insights</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <BarChart3 className="mt-0.5 h-4 w-4 text-slate-500 dark:text-slate-300" />
                Click bars to isolate spikes and inspect exact transactions below.
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 text-slate-500 dark:text-slate-300" />
                Use escrow/direct filter to compare recurring rent flow vs ad-hoc transfers.
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="mt-0.5 h-4 w-4 text-slate-500 dark:text-slate-300" />
                Export filtered rows to review spend with roommates offline.
              </li>
            </ul>
          </article>
        </aside>
      </div>
    </div>
  );
}
