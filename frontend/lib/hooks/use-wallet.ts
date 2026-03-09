"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchTestnetXlmBalance } from "@/lib/stellar/horizon";
import { isMainnetNetwork, isTestnetNetwork } from "@/lib/stellar/network";
import { connectFreighter } from "@/lib/wallet/freighter";
import { connectWallet } from "@/lib/wallet/wallet-kit";
import { APP_CONFIG } from "@/lib/config";
import type { ToastLevel } from "@/components/dashboard/toast-stack";
import { useWalletStore } from "@/lib/store";

interface UseWalletOptions {
  pushToast: (title: string, description: string, level?: ToastLevel) => void;
}

export function useWallet({ pushToast }: UseWalletOptions) {
  // Use Zustand store for wallet state
  const {
    walletAddress,
    walletNetwork,
    walletBalance,
    isConnecting,
    setWallet,
    setBalance,
    setConnecting,
    disconnect,
  } = useWalletStore();

  // Local UI state (not persisted)
  const [lastBalanceUpdated, setLastBalanceUpdated] = useState<Date | null>(null);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Remember last connected wallet and current wallet
  const [lastWalletId, setLastWalletId] = useState<string | null>(null);
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);

  // AbortController for canceling pending balance fetch requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const skipNextRefreshRef = useRef(false);

  const walletOnTestnet = isTestnetNetwork(walletNetwork);
  const walletOnMainnet = isMainnetNetwork(walletNetwork);

  const shortAddress = useMemo(() => {
    if (!walletAddress) return null;
    return `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const refreshBalance = useCallback(
    async (address: string, network: string | null) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      if (!isTestnetNetwork(network)) {
        setBalance(0);
        return;
      }

      if (skipNextRefreshRef.current) {
        skipNextRefreshRef.current = false;
        return;
      }

      setIsRefreshingBalance(true);
      setWalletError(null);

      try {
        const nextBalance = await fetchTestnetXlmBalance(address, signal);
        setBalance(nextBalance);
        setLastBalanceUpdated(new Date());
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setWalletError(
          "Unable to fetch testnet balance. Make sure your account exists and is funded on testnet.",
        );
      } finally {
        setIsRefreshingBalance(false);
      }
    },
    [setBalance],
  );

  // Load last wallet preference (explicit connect only).
  useEffect(() => {
    try {
      const savedWalletId = localStorage.getItem("splitrent:lastWallet");
      if (savedWalletId) {
        setLastWalletId(savedWalletId);
      }
    } catch {
      setWalletError("Unable to load wallet preference.");
    }
  }, []);

  // Auto-refresh balance
  useEffect(() => {
    if (!walletAddress || !walletOnTestnet) return;

    void refreshBalance(walletAddress, walletNetwork);
    const timer = window.setInterval(() => {
      void refreshBalance(walletAddress, walletNetwork);
    }, APP_CONFIG.balanceRefreshInterval);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      window.clearInterval(timer);
    };
  }, [walletAddress, walletNetwork, walletOnTestnet, refreshBalance]);

  const handleConnect = async (walletId?: string) => {
    setWalletError(null);
    setConnecting(true);

    try {
      // Use provided wallet ID or last connected wallet
      const selectedWalletId = walletId || lastWalletId;

      if (selectedWalletId) {
        // Connect to specific wallet using the new connectWallet function
        const result = await connectWallet(selectedWalletId);

        if (result.address) {
          setWallet(result.address, result.network || "");
          setLastWalletId(selectedWalletId);
          setCurrentWalletId(selectedWalletId);

          // Save preference
          localStorage.setItem("splitrent:lastWallet", selectedWalletId);

          if (!isTestnetNetwork(result.network)) {
            setBalance(0);
            setWalletError(
              "Wallet connected on MAINNET. Switch Freighter to TESTNET for this app.",
            );
            pushToast(
              "Wrong network",
              "Freighter is connected to mainnet. Please switch to testnet.",
              "error",
            );
            return false;
          }

          await refreshBalance(result.address, result.network);
          pushToast(
            "Wallet connected",
            `${selectedWalletId === 'freighter' ? 'Freighter' : selectedWalletId} connected on Stellar testnet.`,
            "success"
          );
          return true;
        }
      } else {
        // Fallback to Freighter if no wallet specified
        const session = await connectFreighter();
        setWallet(session.address, session.network || "");
        setLastWalletId("freighter");
        setCurrentWalletId("freighter");
        localStorage.setItem("splitrent:lastWallet", "freighter");

        if (!isTestnetNetwork(session.network)) {
          setBalance(0);
          setWalletError(
            "Wallet connected on MAINNET. Switch Freighter to TESTNET for this app.",
          );
          pushToast(
            "Wrong network",
            "Freighter is connected to mainnet. Please switch to testnet.",
            "error",
          );
          return false;
        }

        await refreshBalance(session.address, session.network);
        pushToast("Wallet connected", "Freighter connected on Stellar testnet.", "success");
        return true;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to connect wallet. Please try again.";
      setWalletError(message);
      pushToast("Wallet connection failed", message, "error");
      return false;
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // DON'T clear lastWalletId - remember for next time!
    disconnect();
    setLastBalanceUpdated(null);
    setWalletError(null);
    setCurrentWalletId(null);

    pushToast("Wallet disconnected", "You can reconnect anytime", "success");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    walletAddress,
    walletNetwork,
    walletBalance,
    lastBalanceUpdated,
    isConnectingWallet: isConnecting,
    isRefreshingBalance,
    walletError,
    walletOnTestnet,
    walletOnMainnet,
    shortAddress,
    lastWalletId, // Expose last wallet for UI
    currentWalletId, // Expose current wallet for UI
    refreshBalance,
    handleConnect,
    handleDisconnect,
  };
}
