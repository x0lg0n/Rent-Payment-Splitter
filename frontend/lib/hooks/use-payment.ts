"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  isValidStellarAddress,
  isValidXlmAmount,
  sendTestnetXlmPayment,
} from "@/lib/stellar/payment";
import type { TransactionRecord } from "@/lib/types/transaction";
import type { ToastLevel } from "@/components/dashboard/toast-stack";

interface UsePaymentOptions {
  walletAddress: string | null;
  walletNetwork: string | null;
  walletBalance: number | null;
  walletOnTestnet: boolean;
  pushToast: (title: string, description: string, level?: ToastLevel) => void;
  refreshBalance: (address: string, network: string | null) => Promise<void>;
}

export function usePayment({
  walletAddress,
  walletNetwork,
  walletBalance,
  walletOnTestnet,
  pushToast,
  refreshBalance,
}: UsePaymentOptions) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSendingPayment, setIsSendingPayment] = useState(false);
  const [paymentSuccessHash, setPaymentSuccessHash] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const historyStorageKey = useMemo(() => {
    if (!walletAddress) return null;
    return `splitrent:tx-history:${walletAddress}`;
  }, [walletAddress]);

  // Load transaction history from localStorage
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

  // Persist transaction history to localStorage
  useEffect(() => {
    if (!historyStorageKey) return;
    localStorage.setItem(historyStorageKey, JSON.stringify(transactions));
  }, [historyStorageKey, transactions]);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  const handlePaymentSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

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
    },
    [
      walletAddress,
      walletOnTestnet,
      recipientAddress,
      paymentAmount,
      walletBalance,
      walletNetwork,
      pushToast,
      refreshBalance,
    ],
  );

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      pushToast("Copied", "Copied to clipboard.", "success");
    } catch {
      pushToast("Copy failed", "Unable to copy to clipboard.");
    }
  };

  return {
    recipientAddress,
    paymentAmount,
    isSendingPayment,
    paymentSuccessHash,
    transactions,
    setRecipientAddress,
    setPaymentAmount,
    setPaymentSuccessHash,
    clearTransactions,
    handlePaymentSubmit,
    copyText,
  };
}
