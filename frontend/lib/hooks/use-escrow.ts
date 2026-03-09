/**
 * useEscrow - React Hook for Escrow Operations
 *
 * Provides a clean interface for interacting with the escrow smart contract.
 * Handles loading states, error handling, and toast notifications.
 */

"use client";

import { useCallback, useState } from "react";
import { escrowService, EscrowService } from "@/lib/stellar/contract";
import { useWallet } from "./use-wallet";
import { useToasts } from "./use-toasts";
import { EscrowData, InitializeParams } from "@/lib/contract-abi";

interface UseEscrowReturn {
  // State
  currentEscrow: EscrowData | null;
  isLoading: boolean;
  isCreating: boolean;
  isDepositing: boolean;
  isReleasing: boolean;
  isRefunding: boolean;
  isDisputing: boolean;
  isResolvingDispute: boolean;

  // Actions
  createEscrow: (params: InitializeParams) => Promise<bigint>;
  deposit: (escrowId: bigint) => Promise<string>;
  release: (escrowId: bigint) => Promise<string>;
  refund: (escrowId: bigint) => Promise<string>;
  dispute: (escrowId: bigint, reason: string) => Promise<string>;
  resolveDispute: (
    escrowId: bigint,
    outcome: "release" | "refund" | "cancel"
  ) => Promise<string>;
  refreshEscrow: (escrowId: bigint) => Promise<void>;
  canRefund: (escrowId: bigint) => Promise<boolean>;
  getEscrowById: (escrowId: bigint) => Promise<EscrowData>;
  setCurrentEscrow: (escrow: EscrowData | null) => void;
}

interface CreateEscrowParams extends InitializeParams {
  token: string;
}

export function useEscrow(): UseEscrowReturn {
  const { walletAddress } = useWallet();
  const { pushToast } = useToasts();

  const [currentEscrow, setCurrentEscrow] = useState<EscrowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [isResolvingDispute, setIsResolvingDispute] = useState(false);

  const createEscrow = useCallback(
    async (params: CreateEscrowParams): Promise<bigint> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      if (!escrowService) {
        throw new Error("Escrow service not initialized");
      }

      setIsCreating(true);
      try {
        pushToast(
          "Creating Escrow",
          "Please sign the transaction in your wallet...",
          "default" as any
        );

        const result = await escrowService.createEscrow({
          ...params,
          creator: walletAddress,
          walletAddress,
        });

        pushToast(
          "✅ Escrow Created",
          `Escrow ID: ${result.escrowId.toString()}`,
          "success" as any
        );

        // Fetch and store escrow details
        const escrow = await escrowService.getEscrowById(result.escrowId);
        setCurrentEscrow(escrow);

        return result.escrowId;
      } catch (error) {
        console.error("Failed to create escrow:", error);
        pushToast(
          "Failed to Create Escrow",
          error instanceof Error ? error.message : "Unknown error",
          "error"
        );
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [walletAddress, pushToast]
  );

  const deposit = useCallback(
    async (escrowId: bigint): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      if (!escrowService) {
        throw new Error("Escrow service not initialized");
      }

      setIsDepositing(true);
      try {
        pushToast(
          "💰 Depositing Funds",
          "Please sign the token transfer...",
          "default" as any
        );

        const result = await escrowService.deposit(escrowId, walletAddress);

        pushToast(
          "✅ Deposit Successful",
          `Transaction: ${result.hash.slice(0, 8)}...`,
          "success" as any
        );

        // Refresh escrow state
        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        console.error("Failed to deposit:", error);
        pushToast(
          "❌ Deposit Failed",
          error instanceof Error ? error.message : "Unknown error",
          "error"
        );
        throw error;
      } finally {
        setIsDepositing(false);
      }
    },
    [walletAddress, pushToast]
  );

  const release = useCallback(
    async (escrowId: bigint): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      if (!escrowService) {
        throw new Error("Escrow service not initialized");
      }

      setIsReleasing(true);
      try {
        pushToast(
          "🎉 Releasing Funds",
          "Landlord must sign to receive funds...",
          "default" as any
        );

        const escrow = currentEscrow || (await escrowService.getEscrowById(escrowId));
        const result = await escrowService.release(escrowId, escrow.landlord);

        pushToast(
          "✅ Funds Released",
          `Transaction: ${result.hash.slice(0, 8)}...`,
          "success" as any
        );

        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        console.error("Failed to release:", error);
        pushToast(
          "❌ Release Failed",
          error instanceof Error ? error.message : "Unknown error",
          "error"
        );
        throw error;
      } finally {
        setIsReleasing(false);
      }
    },
    [walletAddress, pushToast, currentEscrow]
  );

  const refund = useCallback(
    async (escrowId: bigint): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      if (!escrowService) {
        throw new Error("Escrow service not initialized");
      }

      setIsRefunding(true);
      try {
        pushToast(
          "💸 Processing Refund",
          "Please sign the refund transaction...",
          "default" as any
        );

        const result = await escrowService.refund(escrowId, walletAddress);

        pushToast(
          "✅ Refund Processed",
          `Transaction: ${result.hash.slice(0, 8)}...`,
          "success" as any
        );

        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        console.error("Failed to refund:", error);
        pushToast(
          "❌ Refund Failed",
          error instanceof Error ? error.message : "Unknown error",
          "error"
        );
        throw error;
      } finally {
        setIsRefunding(false);
      }
    },
    [walletAddress, pushToast]
  );

  const dispute = useCallback(
    async (escrowId: bigint, reason: string): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      if (!escrowService) {
        throw new Error("Escrow service not initialized");
      }

      setIsDisputing(true);
      try {
        pushToast(
          "⚠️ Raising Dispute",
          "Please sign to raise dispute...",
          "default" as any
        );

        const result = await escrowService.dispute(escrowId, walletAddress, reason);

        pushToast(
          "✅ Dispute Raised",
          `Transaction: ${result.hash.slice(0, 8)}...`,
          "success" as any
        );

        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        console.error("Failed to dispute:", error);
        pushToast(
          "❌ Dispute Failed",
          error instanceof Error ? error.message : "Unknown error",
          "error"
        );
        throw error;
      } finally {
        setIsDisputing(false);
      }
    },
    [walletAddress, pushToast]
  );

  const resolveDispute = useCallback(
    async (
      escrowId: bigint,
      outcome: "release" | "refund" | "cancel"
    ): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      if (!escrowService) {
        throw new Error("Escrow service not initialized");
      }

      setIsResolvingDispute(true);
      try {
        pushToast(
          "✅ Resolving Dispute",
          "Please sign to resolve dispute...",
          "default" as any
        );

        const result = await escrowService.resolveDispute(
          escrowId,
          walletAddress,
          outcome
        );

        pushToast(
          "✅ Dispute Resolved",
          `Outcome: ${outcome}`,
          "success" as any
        );

        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        console.error("Failed to resolve dispute:", error);
        pushToast(
          "❌ Resolution Failed",
          error instanceof Error ? error.message : "Unknown error",
          "error"
        );
        throw error;
      } finally {
        setIsResolvingDispute(false);
      }
    },
    [walletAddress, pushToast]
  );

  const refreshEscrow = useCallback(
    async (escrowId: bigint) => {
      if (!escrowService) return;

      setIsLoading(true);
      try {
        const escrow = await escrowService.getEscrowById(escrowId);
        setCurrentEscrow(escrow);
      } catch (error) {
        console.error("Failed to refresh escrow:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const canRefund = useCallback(
    async (escrowId: bigint): Promise<boolean> => {
      if (!escrowService) return false;
      return await escrowService.canRefund(escrowId);
    },
    []
  );

  const getEscrowById = useCallback(
    async (escrowId: bigint): Promise<EscrowData> => {
      if (!escrowService) {
        throw new Error("Escrow service not initialized");
      }
      return await escrowService.getEscrowById(escrowId);
    },
    []
  );

  return {
    currentEscrow,
    isLoading,
    isCreating,
    isDepositing,
    isReleasing,
    isRefunding,
    isDisputing,
    isResolvingDispute,
    createEscrow,
    deposit,
    release,
    refund,
    dispute,
    resolveDispute,
    refreshEscrow,
    canRefund,
    getEscrowById,
    setCurrentEscrow,
  };
}
