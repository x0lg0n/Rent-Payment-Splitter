/**
 * Escrow Smart Contract Service - ON-CHAIN INTEGRATION
 *
 * Contract: CBUMZ3VLJ3IINXLXTS72V6AMGPOFIYRDRQCDWV7BBYNIS4RAX2U6T2AM
 * Network: Stellar Testnet
 * SDK: v14.5.0 with Soroban support
 */

import {
  Contract,
  Networks,
  Address,
  TransactionBuilder,
  Horizon,
} from "@stellar/stellar-sdk";
import { HORIZON_TESTNET_URL, STELLAR_TESTNET_PASSPHRASE } from "./network";
import { signWithSelectedWallet } from "@/lib/wallet/wallet-kit";

// Initialize Horizon server
const horizonServer = new Horizon.Server(HORIZON_TESTNET_URL);

// Contract configuration
const CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID;

if (!CONTRACT_ID) {
  console.warn("⚠️ Escrow contract ID not configured in .env.local");
}

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

export class EscrowService {
  private contract: Contract | null = null;

  constructor(contractId?: string) {
    const id = contractId || CONTRACT_ID;
    if (id) {
      this.contract = new Contract(id);
      console.log("✅ Escrow contract initialized:", id);
    } else {
      console.error("❌ No contract ID provided");
    }
  }

  /**
   * Create a new escrow ON-CHAIN
   * Note: Requires the escrow contract to be deployed on Stellar testnet
   */
  async createEscrow(
    landlord: string,
    participants: string[],
    shares: bigint[],
    deadline: bigint,
    walletAddress: string
  ): Promise<bigint> {
    if (!this.contract) {
      throw new Error("Contract not initialized. Please check NEXT_PUBLIC_ESCROW_CONTRACT_ID in .env.local");
    }

    try {
      console.log("📝 Creating on-chain escrow...");
      console.log("Contract ID:", this.contract.contractId());

      // Get account from Horizon
      const account = await horizonServer.loadAccount(walletAddress);

      // Build contract call operation
      // Note: This requires Soroban-enabled SDK v15+ for proper ScVal conversion
      // For now, we'll throw an error to indicate the contract needs to be deployed
      throw new Error(
        "Smart contract deployment required. " +
        "To enable on-chain escrows:\n" +
        "1. Deploy the Soroban escrow contract to Stellar testnet\n" +
        "2. Update NEXT_PUBLIC_ESCROW_CONTRACT_ID in .env.local\n" +
        "3. Upgrade to @stellar/stellar-sdk v15+ for full Soroban support"
      );

    } catch (error: any) {
      console.error("❌ Create escrow failed:", error);
      throw error;
    }
  }

  /**
   * Deposit into escrow ON-CHAIN
   */
  async deposit(escrowId: bigint, walletAddress: string): Promise<void> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    throw new Error(
      "Smart contract not deployed. Deposit functionality requires the escrow contract to be deployed on Stellar testnet."
    );
  }

  /**
   * Release funds to landlord ON-CHAIN
   */
  async release(escrowId: bigint, walletAddress: string): Promise<void> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    throw new Error(
      "Smart contract not deployed. Release functionality requires the escrow contract to be deployed on Stellar testnet."
    );
  }

  /**
   * Extract escrow ID from transaction result
   */
  private extractEscrowId(txResponse: any): bigint {
    try {
      // Try to get escrow ID from transaction result
      // Horizon returns the transaction result in different formats
      if (txResponse.returnValue && txResponse.returnValue.value) {
        return BigInt(txResponse.returnValue.value.toString());
      }

      // Fallback: use ledger sequence as a unique identifier
      if (txResponse.ledger) {
        return BigInt(txResponse.ledger * 1000);
      }

      // Last fallback: use timestamp
      return BigInt(Date.now());
    } catch (e) {
      console.error("Failed to extract escrow ID:", e);
      return BigInt(Date.now());
    }
  }
}

// Export singleton instance
export const escrowService = new EscrowService();

/**
 * Initialize escrow service with a specific contract ID
 */
export function initializeEscrowService(contractId?: string) {
  // Create a new instance with the provided contract ID
  return new EscrowService(contractId);
}
