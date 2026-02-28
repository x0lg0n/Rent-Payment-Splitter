"use client";

import { useState, useCallback, useEffect } from "react";
import { escrowService, initializeEscrowService } from "@/lib/stellar/contract";
import type { EscrowData, Participant, CreateEscrowParams, EscrowStatus } from "@/lib/stellar/contract";

interface UseEscrowOptions {
  walletAddress: string | null;
  pushToast: (title: string, description: string, level?: "error" | "success") => void;
}

interface CreateEscrowResult {
  success: boolean;
  escrowId?: bigint;
  error?: string;
}

interface DepositResult {
  success: boolean;
  error?: string;
}

export function useEscrow({ walletAddress, pushToast }: UseEscrowOptions) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCreatingEscrow, setIsCreatingEscrow] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [currentEscrow, setCurrentEscrow] = useState<EscrowData | null>(null);
  const [escrowError, setEscrowError] = useState<string | null>(null);

  /**
   * Initialize escrow service with contract address
   */
  const initializeEscrow = useCallback(async (contractId: string) => {
    setIsInitializing(true);
    try {
      initializeEscrowService(contractId);
      pushToast("Escrow initialized", "Ready to create escrows", "success");
    } catch (error) {
      setEscrowError("Failed to initialize escrow service");
      pushToast("Initialization failed", "Could not connect to escrow contract", "error");
    } finally {
      setIsInitializing(false);
    }
  }, [pushToast]);

  /**
   * Create a new escrow
   */
  const createEscrow = useCallback(async (
    params: Omit<CreateEscrowParams, "creator">
  ): Promise<CreateEscrowResult> => {
    if (!walletAddress) {
      return { success: false, error: "Wallet not connected" };
    }

    setIsCreatingEscrow(true);
    setEscrowError(null);

    try {
      const escrowId = await escrowService.createEscrow(
        { ...params, creator: walletAddress },
        walletAddress
      );

      setCurrentEscrow({
        id: escrowId,
        creator: walletAddress,
        landlord: params.landlord,
        participants: params.participants.map((address, i) => ({
          address,
          share_amount: params.shares[i],
          deposited: false,
        })),
        total_rent: params.shares.reduce((a, b) => a + b, 0n),
        deposited_amount: 0n,
        deadline: params.deadline,
        status: "Active" as EscrowStatus,
        created_at: BigInt(Date.now()),
      });

      pushToast(
        "Escrow created",
        `Escrow ID: ${escrowId.toString()}`,
        "success"
      );

      return { success: true, escrowId };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create escrow";
      setEscrowError(message);
      pushToast("Creation failed", message, "error");
      return { success: false, error: message };
    } finally {
      setIsCreatingEscrow(false);
    }
  }, [walletAddress, pushToast]);

  /**
   * Deposit into an escrow
   */
  const depositToEscrow = useCallback(async (
    escrowId: bigint
  ): Promise<DepositResult> => {
    if (!walletAddress) {
      return { success: false, error: "Wallet not connected" };
    }

    setIsDepositing(true);
    setEscrowError(null);

    try {
      const success = await escrowService.depositToEscrow(
        { escrowId, participant: walletAddress },
        walletAddress
      );

      if (success) {
        pushToast("Deposit successful", "Your share has been deposited", "success");
        
        // Update local escrow state
        if (currentEscrow && currentEscrow.id === escrowId) {
          setCurrentEscrow(prev => prev ? {
            ...prev,
            participants: prev.participants.map(p =>
              p.address === walletAddress ? { ...p, deposited: true } : p
            ),
          } : null);
        }
      }

      return { success };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to deposit";
      setEscrowError(message);
      pushToast("Deposit failed", message, "error");
      return { success: false, error: message };
    } finally {
      setIsDepositing(false);
    }
  }, [walletAddress, currentEscrow, pushToast]);

  /**
   * Release escrow to landlord
   */
  const releaseEscrow = useCallback(async (escrowId: bigint): Promise<boolean> => {
    if (!walletAddress) {
      pushToast("Release failed", "Wallet not connected", "error");
      return false;
    }

    setIsReleasing(true);
    setEscrowError(null);

    try {
      const success = await escrowService.releaseEscrow(escrowId, walletAddress);
      
      if (success) {
        pushToast("Escrow released", "Funds transferred to landlord", "success");
      } else {
        pushToast("Release failed", "Could not release escrow", "error");
      }

      return success;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to release escrow";
      setEscrowError(message);
      pushToast("Release failed", message, "error");
      return false;
    } finally {
      setIsReleasing(false);
    }
  }, [walletAddress, pushToast]);

  /**
   * Get escrow status
   */
  const getEscrowStatus = useCallback(async (escrowId: bigint): Promise<EscrowData | null> => {
    try {
      const status = await escrowService.getEscrowStatus(escrowId);
      setCurrentEscrow(status);
      return status;
    } catch (error) {
      console.error("Failed to get escrow status:", error);
      return null;
    }
  }, []);

  /**
   * Check if participant has deposited
   */
  const getParticipantStatus = useCallback(async (
    escrowId: bigint,
    participant: string
  ): Promise<{ deposited: boolean; shareAmount: bigint } | null> => {
    try {
      return await escrowService.getParticipantStatus(escrowId, participant);
    } catch (error) {
      console.error("Failed to get participant status:", error);
      return null;
    }
  }, []);

  /**
   * Check if escrow can be refunded
   */
  const checkRefundEligibility = useCallback(async (escrowId: bigint): Promise<boolean> => {
    try {
      return await escrowService.canRefund(escrowId);
    } catch (error) {
      console.error("Failed to check refund eligibility:", error);
      return false;
    }
  }, []);

  /**
   * Clear current escrow
   */
  const clearCurrentEscrow = useCallback(() => {
    setCurrentEscrow(null);
    setEscrowError(null);
  }, []);

  return {
    // State
    currentEscrow,
    escrowError,
    isInitializing,
    isCreatingEscrow,
    isDepositing,
    isReleasing,

    // Actions
    initializeEscrow,
    createEscrow,
    depositToEscrow,
    releaseEscrow,
    getEscrowStatus,
    getParticipantStatus,
    checkRefundEligibility,
    clearCurrentEscrow,
  };
}
