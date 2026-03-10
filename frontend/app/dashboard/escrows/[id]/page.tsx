"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";
import { useEscrowStore } from "@/lib/store";
import { EXPLORER_CONFIG, STELLAR_CONFIG } from "@/lib/config";

const STROOPS_PER_XLM = 10_000_000;
const FALLBACK_CONTRACT_ID = "CBUMZ3VLJ3IINXLXTS72V6AMGPOFIYRDRQCDWV7BBYNIS4RAX2U6T2AM";

function fromStroops(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed / STROOPS_PER_XLM;
}

function formatXlm(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function formatDate(value: string) {
  const date = new Date(Number(value) * 1000);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getDeadlineText(value: string) {
  const deadline = new Date(Number(value) * 1000);
  if (Number.isNaN(deadline.getTime())) return "Invalid deadline";

  const diffMs = deadline.getTime() - Date.now();
  if (diffMs <= 0) return "Deadline passed";

  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return `${totalMinutes}m remaining`;
}

function getExplorerContractUrl(contractId: string) {
  const base = EXPLORER_CONFIG.txBaseUrl.replace(/\/tx\/?$/, "");
  return `${base}/contract/${contractId}`;
}

export default function DashboardEscrowDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { wallet, pushToast } = useDashboardContext();
  const { escrows } = useEscrowStore();
  const [renderedAt] = useState(() => Date.now());

  const escrowIdString = params.id as string;
  const escrow = escrows.find((item) => item.id === escrowIdString);

  if (!escrow) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="Escrow not found"
          subtitle="The requested escrow doesn’t exist in your current workspace."
          badgeLabel="Escrow details"
          showSearch={false}
        />
        <Card className="rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Escrow not found</CardTitle>
            <CardDescription>Try returning to the escrows list and selecting another escrow.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/escrows")}>Back to escrows</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const depositedCount = escrow.participants.filter((participant) => participant.deposited).length;
  const totalCount = escrow.participants.length;
  const isFullyFunded = totalCount > 0 && depositedCount === totalCount;
  const totalAmountXlm = fromStroops(escrow.total_rent);
  const depositedAmountXlm = fromStroops(escrow.deposited_amount);
  const remainingAmountXlm = Math.max(0, totalAmountXlm - depositedAmountXlm);
  const progressPercent = totalAmountXlm > 0 ? Math.min(100, (depositedAmountXlm / totalAmountXlm) * 100) : 0;
  const deadlineDate = new Date(Number(escrow.deadline) * 1000);
  const isOverdue = !Number.isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < renderedAt;
  const contractId = STELLAR_CONFIG.escrowContractId ?? FALLBACK_CONTRACT_ID;
  const contractExplorerUrl = getExplorerContractUrl(contractId);

  const currentParticipant = wallet.walletAddress
    ? escrow.participants.find((participant) => participant.address === wallet.walletAddress)
    : undefined;

  const canDeposit = Boolean(wallet.walletAddress && currentParticipant && !currentParticipant.deposited);
  const canRelease = Boolean(
    wallet.walletAddress &&
      wallet.walletAddress === escrow.landlord &&
      isFullyFunded &&
      escrow.status !== "Released",
  );

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rent escrow",
          text: `Join escrow #${escrowIdString.slice(-6)}`,
          url: shareUrl,
        });
        pushToast("Shared", "Escrow link shared successfully", "success");
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      pushToast("Link copied", "Escrow link copied to clipboard", "success");
    } catch {
      pushToast("Copy failed", "Unable to copy escrow link", "error");
    }
  };

  const handleCopyEscrowId = async () => {
    try {
      await navigator.clipboard.writeText(escrow.id);
      pushToast("Copied", "Escrow ID copied", "success");
    } catch {
      pushToast("Copy failed", "Unable to copy escrow ID", "error");
    }
  };

  const handleCopyContractId = async () => {
    try {
      await navigator.clipboard.writeText(contractId);
      pushToast("Copied", "Contract ID copied", "success");
    } catch {
      pushToast("Copy failed", "Unable to copy contract ID", "error");
    }
  };

  const handleDeposit = () => {
    if (!wallet.walletAddress) {
      pushToast("Wallet required", "Please connect your wallet first.", "error");
      return;
    }

    const participant = escrow.participants.find((item) => item.address === wallet.walletAddress);

    if (!participant) {
      pushToast("Not a participant", "Your wallet is not in this escrow.", "error");
      return;
    }

    if (participant.deposited) {
      pushToast("Already deposited", "You already funded your share.", "success");
      return;
    }

    pushToast(
      "Deposit ready",
      `Smart contract action pending: deposit ${formatXlm(fromStroops(participant.share_amount))} XLM.`,
      "success",
    );
  };

  const handleRelease = () => {
    if (!wallet.walletAddress) {
      pushToast("Wallet required", "Please connect your wallet first.", "error");
      return;
    }

    if (wallet.walletAddress !== escrow.landlord) {
      pushToast("Unauthorized", "Only landlord can release this escrow.", "error");
      return;
    }

    if (!isFullyFunded) {
      pushToast("Not ready", "Escrow must be fully funded before release.", "error");
      return;
    }

    pushToast(
      "Release ready",
      "Smart contract action pending: release funds to landlord.",
      "success",
    );
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={`Escrow #${escrow.id.slice(-8)}`}
        subtitle="Monitor funding progress, participant deposits, and release readiness."
        badgeLabel="Escrow details"
        showSearch={false}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" className="rounded-xl" onClick={() => router.push("/dashboard/escrows")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to escrows
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={escrow.status === "Active" ? "default" : "secondary"}>{escrow.status}</Badge>
          <Button variant="outline" className="rounded-xl" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-(--brand)/20 p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Escrow balance</p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
                  {formatXlm(totalAmountXlm)} XLM
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyEscrowId}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                #{escrow.id.slice(-8)}
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-300">Funded</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  {formatXlm(depositedAmountXlm)} XLM
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-300">Remaining</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  {formatXlm(remainingAmountXlm)} XLM
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-300">Participants</p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  {depositedCount}/{totalCount} paid
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Funding progress</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/70 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-slate-950 transition-all dark:bg-white"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div
              className={cn(
                "mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                isOverdue
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
              )}
            >
              <Clock3 className="h-4 w-4" />
              <span>
                Deadline {formatDate(escrow.deadline)} · {getDeadlineText(escrow.deadline)}
              </span>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Participants</h3>
              <Badge variant="secondary">{totalCount}</Badge>
            </div>

            <div className="mt-4 space-y-2.5">
              {escrow.participants.map((participant, index) => {
                const isCurrentUser = participant.address === wallet.walletAddress;
                const isLandlord = participant.address === escrow.landlord;

                return (
                  <div
                    key={`${participant.address}-${index}`}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-3 py-2.5",
                      isCurrentUser
                        ? "border-sky-300 bg-sky-50 dark:border-sky-500/40 dark:bg-sky-500/10"
                        : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {participant.deposited ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                        )}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {isCurrentUser ? "You" : `Participant ${index + 1}`}
                          </p>
                          {isCurrentUser ? <Badge variant="secondary">You</Badge> : null}
                          {isLandlord ? <Badge variant="outline">Landlord</Badge> : null}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-300">
                          {formatShortAddress(participant.address)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatXlm(fromStroops(participant.share_amount))} XLM
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          participant.deposited
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-slate-500 dark:text-slate-300",
                        )}
                      >
                        {participant.deposited ? "Deposited" : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Actions</h3>

            <div className="mt-4 space-y-2">
              {currentParticipant ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-300">Your share</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {formatXlm(fromStroops(currentParticipant.share_amount))} XLM
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                  Your wallet is not listed as a participant.
                </div>
              )}

              <Button
                onClick={handleDeposit}
                disabled={!canDeposit}
                className="h-10 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Deposit your share
              </Button>

              <Button
                onClick={handleRelease}
                disabled={!canRelease}
                variant="outline"
                className="h-10 w-full rounded-xl"
              >
                Release funds to landlord
              </Button>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">
              Landlord can release only after every participant deposits.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Contract info</h3>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-300">Network</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-white">
                  {wallet.walletOnTestnet ? "Stellar Testnet" : "Network not confirmed"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-300">Landlord</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-white">{formatShortAddress(escrow.landlord)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-300">Creator</p>
                <p className="mt-1 font-medium text-slate-900 dark:text-white">{formatShortAddress(escrow.creator)}</p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={handleCopyEscrowId}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800"
              >
                <span className="truncate font-mono text-slate-700 dark:text-slate-200">Escrow: {escrow.id}</span>
                <Copy className="ml-2 h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-300" />
              </button>
              <button
                type="button"
                onClick={handleCopyContractId}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800"
              >
                <span className="truncate font-mono text-slate-700 dark:text-slate-200">
                  Contract: {formatShortAddress(contractId)}
                </span>
                <Copy className="ml-2 h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-300" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" className="h-10 flex-1 rounded-xl" asChild>
                <a href={contractExplorerUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Explorer
                </a>
              </Button>
              <Button variant="outline" className="h-10 flex-1 rounded-xl" asChild>
                <a href="https://lab.stellar.org" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Stellar Lab
                </a>
              </Button>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Users className="h-4 w-4" />
              Funding health
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {isFullyFunded
                ? "Escrow is fully funded and ready for release."
                : `${totalCount - depositedCount} participant(s) still pending.`}
            </p>
          </article>
        </aside>
      </div>
    </div>
  );
}
