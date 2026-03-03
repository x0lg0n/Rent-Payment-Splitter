"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SUPPORTED_WALLETS } from "@/lib/wallet/wallet-kit";
import { X, RotateCcw, Check, ExternalLink, AlertCircle } from "lucide-react";
import { useState } from "react";

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (walletId: string) => void;
  lastWalletId?: string | null;
  currentWalletId?: string | null;
}

// Wallet installation URLs
const WALLET_INSTALL_URLS: Record<string, string> = {
  freighter: "https://www.freighter.app/",
  xbull: "https://xbull.app/",
  albedo: "https://albedo.link/",
  rabet: "https://rabet.app/",
};

// Wallet detection status
interface WalletStatus {
  isInstalled: boolean | null; // null = checking
  error?: string;
}

export function WalletSelector({ isOpen, onClose, onSelect, lastWalletId, currentWalletId }: WalletSelectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletStatuses, setWalletStatuses] = useState<Record<string, WalletStatus>>({});

  const handleQuickReconnect = () => {
    if (lastWalletId) {
      onSelect(lastWalletId);
    }
  };

  const handleWalletSelect = async (walletId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      await onSelect(walletId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const getWalletInstallUrl = (walletId: string) => {
    return WALLET_INSTALL_URLS[walletId] || "https://stellar.org/wallets";
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <div>
            <AlertDialogTitle>Connect Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Select your preferred Stellar wallet
            </AlertDialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogHeader>

        {/* Connection Info */}
        {!currentWalletId && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-500">
                  Wallet Connection Required
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Connect your wallet to access the dashboard and start sending payments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Wallet Status */}
        {currentWalletId && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-green-600">Currently Connected</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {SUPPORTED_WALLETS.find(w => w.id === currentWalletId)?.icon || "🔗"}
                </span>
                <span className="text-sm font-semibold">
                  {SUPPORTED_WALLETS.find(w => w.id === currentWalletId)?.name || "Wallet"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Reconnect if last wallet exists and different from current */}
        {lastWalletId && lastWalletId !== currentWalletId && (
          <div className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand)]/5 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Quick Reconnect</span>
              <RotateCcw className="h-4 w-4 text-[var(--brand)]" />
            </div>
            <Button
              variant="outline"
              className="w-full h-14 border-[var(--brand)]/50 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
              onClick={handleQuickReconnect}
              disabled={isConnecting}
            >
              <span className="text-2xl mr-3">
                {SUPPORTED_WALLETS.find(w => w.id === lastWalletId)?.icon || "🚀"}
              </span>
              <div className="text-left">
                <div className="font-semibold">
                  {SUPPORTED_WALLETS.find(w => w.id === lastWalletId)?.name || "Last Wallet"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Click to reconnect
                </div>
              </div>
            </Button>
          </div>
        )}

        {/* All Wallets */}
        <div className="grid grid-cols-1 gap-3 py-4">
          <div className="text-xs text-muted-foreground font-medium">
            All Available Wallets
          </div>
          {SUPPORTED_WALLETS.map((wallet) => {
            const isCurrentWallet = wallet.id === currentWalletId;
            const isLastWallet = wallet.id === lastWalletId;
            const installUrl = getWalletInstallUrl(wallet.id);

            return (
              <div key={wallet.id} className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className={`flex-1 h-14 items-center justify-start gap-4 px-4 text-left hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] ${
                    isCurrentWallet ? 'border-green-500/50 bg-green-500/5' : ''
                  }`}
                  onClick={() => handleWalletSelect(wallet.id)}
                  disabled={isConnecting}
                >
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{wallet.name}</span>
                      {isCurrentWallet && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Connected
                        </span>
                      )}
                      {isLastWallet && !isCurrentWallet && (
                        <span className="text-xs text-muted-foreground">(Last used)</span>
                      )}
                    </div>
                  </div>
                  {isCurrentWallet && (
                    <span className="text-xs text-muted-foreground">Click to switch</span>
                  )}
                </Button>
                {!isCurrentWallet && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(installUrl, '_blank')}
                    className="shrink-0"
                    title={`Install ${wallet.name}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Error Message with Recovery Options */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 p-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 mb-1">
                  Connection Failed
                </p>
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
            
            {/* Quick recovery tips */}
            <div className="space-y-2 text-xs text-red-600/80">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Make sure your wallet extension is installed and unlocked</li>
                <li>Check that you're on the testnet network</li>
                <li>Try refreshing the page and connecting again</li>
              </ul>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
