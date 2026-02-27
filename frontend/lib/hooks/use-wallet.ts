"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchTestnetXlmBalance } from "@/lib/stellar/horizon";
import { isMainnetNetwork, isTestnetNetwork } from "@/lib/stellar/network";
import { connectFreighter, getFreighterSession } from "@/lib/wallet/freighter";
import { APP_CONFIG } from "@/lib/config";
import type { ToastLevel } from "@/components/dashboard/toast-stack";

interface UseWalletOptions {
  pushToast: (title: string, description: string, level?: ToastLevel) => void;
}

export function useWallet({ pushToast }: UseWalletOptions) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [lastBalanceUpdated, setLastBalanceUpdated] = useState<Date | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // AbortController for canceling pending balance fetch requests
  const abortControllerRef = useRef<AbortController | null>(null);
  // Ref to track if we should skip the next balance refresh (prevents race conditions)
  const skipNextRefreshRef = useRef(false);

  const walletOnTestnet = isTestnetNetwork(walletNetwork);
  const walletOnMainnet = isMainnetNetwork(walletNetwork);

  const shortAddress = useMemo(() => {
    if (!walletAddress) return null;
    return `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const refreshBalance = useCallback(
    async (address: string, network: string | null) => {
      // Cancel any pending balance fetch request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      if (!isTestnetNetwork(network)) {
        setWalletBalance(null);
        return;
      }

      // Check if this refresh should be skipped (prevents duplicate requests)
      if (skipNextRefreshRef.current) {
        skipNextRefreshRef.current = false;
        return;
      }

      setIsRefreshingBalance(true);
      setWalletError(null);
      
      try {
        const nextBalance = await fetchTestnetXlmBalance(address, signal);
        setWalletBalance(nextBalance);
        setLastBalanceUpdated(new Date());
      } catch (error) {
        // Ignore abort errors
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
    [],
  );

  // Restore session on mount
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

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!walletAddress || !walletOnTestnet) return;

    // Initial refresh
    void refreshBalance(walletAddress, walletNetwork);
    
    const timer = window.setInterval(() => {
      void refreshBalance(walletAddress, walletNetwork);
    }, APP_CONFIG.balanceRefreshInterval);

    // Cleanup: abort pending requests and clear interval
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      window.clearInterval(timer);
    };
  }, [walletAddress, walletNetwork, walletOnTestnet, refreshBalance]);

  const handleConnect = async () => {
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

  const handleDisconnect = () => {
    // Abort any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setWalletAddress(null);
    setWalletNetwork(null);
    setWalletBalance(null);
    setLastBalanceUpdated(null);
    setWalletError(null);
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
    isConnectingWallet,
    isRefreshingBalance,
    walletError,
    walletOnTestnet,
    walletOnMainnet,
    shortAddress,
    refreshBalance,
    handleConnect,
    handleDisconnect,
  };
}
