"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  isValidStellarAddress,
  isValidXlmAmount,
  sendTestnetXlmPayment,
  validateAmountAgainstBalance,
  checkAccountExists,
} from "@/lib/stellar/payment";
import { rateLimiters } from "@/lib/utils/rate-limit";
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
  const [isCheckingRecipient, setIsCheckingRecipient] = useState(false);
  const [recipientExists, setRecipientExists] = useState<boolean | null>(null);

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

  // Check if recipient account exists (debounced)
  useEffect(() => {
    const cleanRecipient = recipientAddress.trim();
    
    if (!cleanRecipient || !isValidStellarAddress(cleanRecipient)) {
      setRecipientExists(null);
      setIsCheckingRecipient(false);
      return;
    }

    setIsCheckingRecipient(true);
    const timeoutId = setTimeout(async () => {
      try {
        const exists = await checkAccountExists(cleanRecipient);
        setRecipientExists(exists);
      } catch {
        setRecipientExists(null);
      } finally {
        setIsCheckingRecipient(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [recipientAddress]);

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

      // Validate recipient address
      if (!isValidStellarAddress(cleanRecipient)) {
        pushToast(
          "Invalid recipient address",
          "Address must be a valid Stellar public key starting with G.",
        );
        return;
      }

      // Check for self-send
      if (cleanRecipient === walletAddress) {
        pushToast(
          "Cannot send to yourself",
          "Please use a different recipient address.",
        );
        return;
      }

      // Validate amount
      if (!isValidXlmAmount(cleanAmount)) {
        pushToast(
          "Invalid amount",
          "Amount must be between 0.0000001 and 10,000 XLM.",
        );
        return;
      }

      // Validate amount against balance with fees
      const balanceValidation = validateAmountAgainstBalance(cleanAmount, walletBalance);
      if (!balanceValidation.valid) {
        pushToast("Insufficient balance", balanceValidation.error || "Insufficient balance.");
        return;
      }

      // Rate limit payment submissions
      try {
        await rateLimiters.paymentSubmit.acquire();
      } catch {
        pushToast(
          "Please wait",
          "Please wait a moment before sending another payment.",
          "error"
        );
        return;
      }

      setIsSendingPayment(true);
      try {
        const result = await sendTestnetXlmPayment({
          sourceAddress: walletAddress,
          destinationAddress: cleanRecipient,
          amount: cleanAmount,
        });

        const tx: TransactionRecord = {
          id: `${Date.now()}-${result.hash.slice(0, 6)}`,
          hash: result.hash,
          from: walletAddress,
          to: cleanRecipient,
          amount: cleanAmount,
          network: "testnet",
          createdAt: new Date().toISOString(),
          confirmed: result.confirmed,
        };
        
        setTransactions((prev) => [tx, ...prev]);
        
        if (result.confirmed) {
          setPaymentSuccessHash(result.hash);
          setRecipientAddress("");
          setPaymentAmount("");
          pushToast(
            "Payment successful",
            `Transaction confirmed on ledger ${result.ledger}`,
            "success"
          );
          await refreshBalance(walletAddress, walletNetwork);
        } else {
          pushToast(
            "Payment submitted",
            "Transaction submitted but not yet confirmed. Check the explorer for status.",
            "success"
          );
        }
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
    isCheckingRecipient,
    recipientExists,
    setRecipientAddress,
    setPaymentAmount,
    setPaymentSuccessHash,
    clearTransactions,
    handlePaymentSubmit,
    copyText,
  };
}
