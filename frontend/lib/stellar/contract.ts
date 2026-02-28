/**
 * Escrow Smart Contract Service
 * 
 * Interfaces with the Soroban escrow contract on Stellar testnet
 * Contract: SplitRent/contracts/escrow
 */

import {
  Contract,
  SorobanRpc,
  Networks,
  Address,
  xdr,
} from "@stellar/stellar-sdk";
import { HORIZON_TESTNET_URL, STELLAR_TESTNET_PASSPHRASE } from "./network";
import { signWithFreighter } from "@/lib/wallet/freighter";

const server = new SorobanRpc.Server(HORIZON_TESTNET_URL, {
  allowHttp: true,
});

// Contract types matching the Rust contract
export interface EscrowData {
  id: bigint;
  creator: string;
  landlord: string;
  participants: Participant[];
  total_rent: bigint;
  deposited_amount: bigint;
  deadline: bigint;
  status: EscrowStatus;
  created_at: bigint;
}

export interface Participant {
  address: string;
  share_amount: bigint;
  deposited: boolean;
}

export enum EscrowStatus {
  Active = "Active",
  FullyFunded = "FullyFunded",
  Released = "Released",
  Refunding = "Refunding",
  Refunded = "Refunded",
  Disputed = "Disputed",
}

export interface CreateEscrowParams {
  creator: string;
  landlord: string;
  participants: string[];
  shares: bigint[];
  deadline: bigint;
}

export interface DepositParams {
  escrowId: bigint;
  participant: string;
}

export class EscrowService {
  private contract: Contract | null = null;
  private contractId: string | null = null;

  /**
   * Initialize the escrow service with a contract address
   */
  public initialize(contractId: string) {
    this.contractId = contractId;
    this.contract = new Contract(contractId);
  }

  /**
   * Get the contract ID
   */
  public getContractId(): string | null {
    return this.contractId;
  }

  /**
   * Create a new escrow
   */
  public async createEscrow(
    params: CreateEscrowParams,
    walletAddress: string
  ): Promise<bigint> {
    if (!this.contract) {
      throw new Error("Contract not initialized. Call initialize() first.");
    }

    try {
      // Build the contract call
      const transaction = await server.transaction({
        source: walletAddress,
      });

      const contractCall = this.contract.call(
        "initialize",
        new Address(walletAddress),
        new Address(params.landlord),
        params.participants.map((p) => new Address(p)),
        params.shares,
        params.deadline
      );

      const builtTransaction = transaction
        .addOperation(contractCall)
        .setTimeout(180)
        .build();

      // Get fee bump transaction if needed
      const simulated = await server.simulateTransaction(builtTransaction);

      // Sign with Freighter
      const signedXdr = await signWithFreighter(
        builtTransaction.toXDR(),
        STELLAR_TESTNET_PASSPHRASE,
        walletAddress
      );

      const signedTransaction = TransactionBuilder.fromXDR(
        signedXdr,
        Networks.TESTNET
      );

      // Submit transaction
      const result = await server.sendTransaction(signedTransaction);

      if (result.status === "PENDING") {
        // Wait for transaction to be included
        const txHash = result.hash;
        let txResponse;
        
        // Poll for transaction result
        for (let i = 0; i < 30; i++) {
          try {
            txResponse = await server.getTransaction(txHash);
            if (txResponse.status === "SUCCESS") {
              // Extract escrow ID from result
              const escrowId = this.extractEscrowId(txResponse);
              return escrowId;
            } else if (txResponse.status === "FAILED") {
              throw new Error("Transaction failed on-chain");
            }
          } catch (e) {
            // Transaction not found yet, continue polling
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        
        throw new Error("Transaction confirmation timeout");
      }

      throw new Error("Transaction submission failed");
    } catch (error) {
      console.error("Failed to create escrow:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create escrow"
      );
    }
  }

  /**
   * Deposit funds into an escrow
   */
  public async depositToEscrow(
    params: DepositParams,
    walletAddress: string
  ): Promise<boolean> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const transaction = await server.transaction({
        source: walletAddress,
      });

      const contractCall = this.contract.call(
        "deposit",
        params.escrowId,
        new Address(params.participant)
      );

      const builtTransaction = transaction
        .addOperation(contractCall)
        .setTimeout(180)
        .build();

      const signedXdr = await signWithFreighter(
        builtTransaction.toXDR(),
        STELLAR_TESTNET_PASSPHRASE,
        walletAddress
      );

      const signedTransaction = TransactionBuilder.fromXDR(
        signedXdr,
        Networks.TESTNET
      );

      const result = await server.sendTransaction(signedTransaction);

      if (result.status === "PENDING") {
        // Wait for confirmation
        const txHash = result.hash;
        for (let i = 0; i < 30; i++) {
          try {
            const txResponse = await server.getTransaction(txHash);
            if (txResponse.status === "SUCCESS") {
              return true;
            } else if (txResponse.status === "FAILED") {
              throw new Error("Deposit transaction failed");
            }
          } catch (e) {
            // Continue polling
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      throw new Error("Deposit submission failed");
    } catch (error) {
      console.error("Failed to deposit:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to deposit"
      );
    }
  }

  /**
   * Get escrow status
   */
  public async getEscrowStatus(escrowId: bigint): Promise<EscrowData> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const rpcResponse = await server.request("getLedgerEntries", {
        keys: [
          this.contract.getFootprint().getLedgerKey(xdr.LedgerEntryType.ContractData),
        ],
      });

      // For now, return mock data until we have a real contract deployed
      // In production, this would read from the contract storage
      return {
        id: escrowId,
        creator: "",
        landlord: "",
        participants: [],
        total_rent: 0n,
        deposited_amount: 0n,
        deadline: 0n,
        status: EscrowStatus.Active,
        created_at: 0n,
      };
    } catch (error) {
      console.error("Failed to get escrow status:", error);
      throw new Error("Failed to fetch escrow status");
    }
  }

  /**
   * Get participant deposit status
   */
  public async getParticipantStatus(
    escrowId: bigint,
    participant: string
  ): Promise<{ deposited: boolean; shareAmount: bigint }> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      // Mock implementation - replace with actual contract call
      return {
        deposited: false,
        shareAmount: 0n,
      };
    } catch (error) {
      console.error("Failed to get participant status:", error);
      throw new Error("Failed to fetch participant status");
    }
  }

  /**
   * Check if escrow can be refunded
   */
  public async canRefund(escrowId: bigint): Promise<boolean> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      // Mock implementation - replace with actual contract call
      return false;
    } catch (error) {
      console.error("Failed to check refund eligibility:", error);
      return false;
    }
  }

  /**
   * Release funds to landlord
   */
  public async releaseEscrow(
    escrowId: bigint,
    walletAddress: string
  ): Promise<boolean> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const transaction = await server.transaction({
        source: walletAddress,
      });

      const contractCall = this.contract.call("release", escrowId);

      const builtTransaction = transaction
        .addOperation(contractCall)
        .setTimeout(180)
        .build();

      const signedXdr = await signWithFreighter(
        builtTransaction.toXDR(),
        STELLAR_TESTNET_PASSPHRASE,
        walletAddress
      );

      const signedTransaction = TransactionBuilder.fromXDR(
        signedXdr,
        Networks.TESTNET
      );

      const result = await server.sendTransaction(signedTransaction);

      if (result.status === "PENDING") {
        const txHash = result.hash;
        for (let i = 0; i < 30; i++) {
          try {
            const txResponse = await server.getTransaction(txHash);
            if (txResponse.status === "SUCCESS") {
              return true;
            }
          } catch (e) {
            // Continue polling
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return false;
    } catch (error) {
      console.error("Failed to release escrow:", error);
      throw new Error("Failed to release escrow");
    }
  }

  /**
   * Helper: Extract escrow ID from transaction result
   */
  private extractEscrowId(txResponse: any): bigint {
    // Extract from transaction result
    // This is a simplified implementation
    return BigInt(Date.now());
  }
}

// Export singleton instance
export const escrowService = new EscrowService();

/**
 * Initialize escrow service with contract address
 * Call this once at app startup
 */
export function initializeEscrowService(contractId: string) {
  escrowService.initialize(contractId);
  console.log("Escrow service initialized with contract:", contractId);
}
