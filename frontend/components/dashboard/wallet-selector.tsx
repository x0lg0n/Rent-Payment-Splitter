"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WalletKit, SUPPORTED_WALLETS } from "@/lib/wallet/wallet-kit";
import {
  AlertCircle,
  Check,
  ExternalLink,
  Loader2,
  RotateCcw,
  Wallet2,
  X,
} from "lucide-react";

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (walletId: string) => void | boolean | Promise<void | boolean>;
  lastWalletId?: string | null;
  currentWalletId?: string | null;
}

interface WalletStatus {
  isInstalled: boolean | null;
  installUrl: string;
}

const WALLET_INSTALL_URLS: Record<string, string> = {
  freighter: "https://www.freighter.app/",
  xbull: "https://xbull.app/",
  albedo: "https://albedo.link/",
  rabet: "https://rabet.app/",
};

const getWalletInstallUrl = (walletId: string) =>
  WALLET_INSTALL_URLS[walletId] || "https://stellar.org/wallets";

export function WalletSelector({
  isOpen,
  onClose,
  onSelect,
  lastWalletId,
  currentWalletId,
}: WalletSelectorProps) {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(
    currentWalletId ?? lastWalletId ?? SUPPORTED_WALLETS[0]?.id ?? null
  );
  const [walletStatuses, setWalletStatuses] = useState<
    Record<string, WalletStatus>
  >({});
  const [isCheckingWallets, setIsCheckingWallets] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstWalletButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSelectedWalletId(
      currentWalletId ?? lastWalletId ?? SUPPORTED_WALLETS[0]?.id ?? null
    );
  }, [isOpen, currentWalletId, lastWalletId]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const loadWalletStatuses = async () => {
      setIsCheckingWallets(true);

      const fallback = Object.fromEntries(
        SUPPORTED_WALLETS.map((wallet) => [
          wallet.id,
          { isInstalled: null, installUrl: getWalletInstallUrl(wallet.id) },
        ])
      ) as Record<string, WalletStatus>;
      setWalletStatuses(fallback);

      try {
        const availableWallets = await WalletKit.refreshSupportedWallets();
        if (cancelled) return;

        const next = Object.fromEntries(
          SUPPORTED_WALLETS.map((wallet) => {
            const match = availableWallets.find(
              (item) => item.id === wallet.id
            );
            return [
              wallet.id,
              {
                isInstalled: match ? match.isAvailable : null,
                installUrl: match?.url || getWalletInstallUrl(wallet.id),
              },
            ];
          })
        ) as Record<string, WalletStatus>;

        setWalletStatuses(next);

        setSelectedWalletId((current) => {
          if (current && next[current]?.isInstalled !== false) {
            return current;
          }
          const firstInstalled = SUPPORTED_WALLETS.find(
            (wallet) => next[wallet.id]?.isInstalled !== false
          );
          return (
            firstInstalled?.id ?? current ?? SUPPORTED_WALLETS[0]?.id ?? null
          );
        });
      } catch {
        if (!cancelled) {
          setWalletStatuses(fallback);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingWallets(false);
        }
      }
    };

    void loadWalletStatuses();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const selectedWallet = useMemo(
    () =>
      SUPPORTED_WALLETS.find((wallet) => wallet.id === selectedWalletId) ??
      null,
    [selectedWalletId]
  );

  const selectedStatus = selectedWalletId
    ? walletStatuses[selectedWalletId]
    : undefined;
  const selectedWalletUnavailable = selectedStatus?.isInstalled === false;

  const openInstallLink = (walletId: string) => {
    const url =
      walletStatuses[walletId]?.installUrl || getWalletInstallUrl(walletId);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getInstallDomain = (walletId: string) => {
    const url =
      walletStatuses[walletId]?.installUrl || getWalletInstallUrl(walletId);
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "wallet site";
    }
  };

  const connectWithWallet = async (walletId: string | null) => {
    if (!walletId) return;

    if (walletStatuses[walletId]?.isInstalled === false) {
      openInstallLink(walletId);
      setError(
        `${
          SUPPORTED_WALLETS.find((wallet) => wallet.id === walletId)?.name ||
          "Selected wallet"
        } is not detected. Install it and try again.`
      );
      return;
    }

    setError(null);
    setIsConnecting(true);

    try {
      const result = await onSelect(walletId);
      if (result !== false) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    await connectWithWallet(selectedWalletId);
  };

  const handleQuickReconnect = async () => {
    if (!lastWalletId) return;
    setSelectedWalletId(lastWalletId);
    await connectWithWallet(lastWalletId);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent
        className="w-[calc(100vw-2rem)] max-w-xl border border-[#cfdaf5] bg-[#f4f7ff] p-0 shadow-[0_20px_60px_rgba(15,23,42,0.2)] dark:border-slate-700 dark:bg-slate-950"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          window.setTimeout(() => firstWalletButtonRef.current?.focus(), 0);
        }}>
        <div className="rounded-[18px] border border-transparent p-5 md:p-6">
          <AlertDialogHeader className="flex flex-row items-start justify-between gap-4 text-left">
            <div>
              <AlertDialogTitle className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Connect wallet
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Choose one Stellar wallet and connect directly.
              </AlertDialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogHeader>

          {currentWalletId && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <p className="font-medium text-emerald-700 dark:text-emerald-300">
                Currently connected
              </p>
              <p className="mt-0.5 text-emerald-800 dark:text-emerald-200">
                {SUPPORTED_WALLETS.find(
                  (wallet) => wallet.id === currentWalletId
                )?.name || "Wallet"}
              </p>
            </div>
          )}

          {lastWalletId && lastWalletId !== currentWalletId && (
            <button
              type="button"
              onClick={handleQuickReconnect}
              disabled={isConnecting || isCheckingWallets}
              className="group mt-4 flex w-full items-center justify-between rounded-2xl border border-[#c9d7f7] bg-white/85 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-900">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  Quick reconnect
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {SUPPORTED_WALLETS.find(
                    (wallet) => wallet.id === lastWalletId
                  )?.name || "Last wallet"}
                </p>
              </div>
              <RotateCcw
                className={cn(
                  "h-4 w-4 text-slate-600 transition-transform duration-500 group-hover:rotate-220 dark:text-slate-300",
                  isConnecting && "animate-spin"
                )}
              />
            </button>
          )}

          <div className="mt-4 rounded-2xl border border-[#c9d7f7] bg-white/75 p-3 dark:border-slate-700 dark:bg-slate-900/70">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
                Available wallets
              </p>
              {isCheckingWallets && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Detecting
                </span>
              )}
            </div>

            <div className="space-y-2">
              {SUPPORTED_WALLETS.map((wallet, index) => {
                const status = walletStatuses[wallet.id];
                const isSelected = wallet.id === selectedWalletId;
                const isCurrent = wallet.id === currentWalletId;
                const isInstalled = status?.isInstalled;

                return (
                  <div
                    key={wallet.id}
                    role="button"
                    tabIndex={0}
                    ref={index === 0 ? firstWalletButtonRef : undefined}
                    onClick={() => {
                      setError(null);
                      setSelectedWalletId(wallet.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setError(null);
                        setSelectedWalletId(wallet.id);
                      }
                    }}
                    className={cn(
                      "group flex min-h-14 items-center justify-between rounded-xl border px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                        : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500"
                    )}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-lg dark:bg-slate-800">
                        {wallet.icon}
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{wallet.name}</p>
                        {isInstalled === false ? (
                          <a
                            href={
                              status?.installUrl ||
                              getWalletInstallUrl(wallet.id)
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className={cn(
                              "mt-0.5 inline-flex items-center gap-1 text-xs underline underline-offset-2",
                              isSelected
                                ? "text-white/85 dark:text-slate-700"
                                : "text-sky-700 dark:text-sky-300"
                            )}>
                            Install from {getInstallDomain(wallet.id)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <p
                            className={cn(
                              "text-xs",
                              isSelected
                                ? "text-white/80 dark:text-slate-700"
                                : "text-slate-500 dark:text-slate-300"
                            )}>
                            {isInstalled === true
                              ? "Installed"
                              : "Detection pending"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                            isSelected
                              ? "bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          )}>
                          <Check className="h-3 w-3" />
                          Connected
                        </span>
                      )}
                      {isSelected && !isCurrent && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            isSelected
                              ? "bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900"
                              : ""
                          )}>
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-300 bg-red-50/95 px-4 py-3 text-sm dark:border-red-900/50 dark:bg-red-950/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="rounded-full border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
              onClick={onClose}
              disabled={isConnecting}>
              Cancel
            </Button>
            <Button
              className="rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              disabled={!selectedWalletId || isConnecting || isCheckingWallets}
              onClick={handleConnect}>
              {isConnecting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </span>
              ) : selectedWalletUnavailable ? (
                <span className="inline-flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Install {selectedWallet?.name || "wallet"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Wallet2 className="h-4 w-4" />
                  Continue with {selectedWallet?.name || "wallet"}
                </span>
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
