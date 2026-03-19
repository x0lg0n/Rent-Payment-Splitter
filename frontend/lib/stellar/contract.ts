/**
 * Escrow Smart Contract Service - ON-CHAIN INTEGRATION
 *
 * Contract: CBA5V42PSZBF5EIDTFEVSBPPUWXIT6QNOVHBJM6BBDM4U33JLZ3MOGIC
 * Network: Stellar Testnet
 * SDK: v14.6.1 with soroban-client for RPC
 */

// @ts-nocheck

import {
  Contract,
  Address,
  TransactionBuilder,
  Networks,
  xdr,
  Account,
} from "@stellar/stellar-sdk";
import { sorobanServer, sendTransaction, simulateTransaction, addSimulationData } from "./soroban";
import { signWithSelectedWallet } from "@/lib/wallet/wallet-kit";
import { config } from "@/lib/config";
import {
  EscrowData,
  Participant,
  EscrowStatus,
  InitializeParams,
  InitializeResult,
  DepositResult,
  ReleaseResult,
  RefundResult,
  DisputeResult,
  ResolveDisputeResult,
  parseEscrowData,
} from "@/lib/contract-abi";

// Contract ID from environment
const CONTRACT_ID = config.escrowContractId;

if (!CONTRACT_ID) {
  console.warn("⚠️ Escrow contract ID not configured in environment");
}

export class EscrowService {
  private contract: Contract;
  private contractId: string;

  constructor(contractId?: string) {
    this.contractId = contractId || CONTRACT_ID || "";
    if (!this.contractId) {
      throw new Error("Escrow contract ID not configured. Set NEXT_PUBLIC_ESCROW_CONTRACT_ID in .env.local");
    }
    this.contract = new Contract(this.contractId);
    console.log("✅ Escrow contract initialized:", this.contractId);
  }

  // Helper to create U64 ScVal (works around TypeScript type issues)
  private scvU64(value: bigint | number | string): any {
    return xdr.ScVal.scvU64(value.toString());
  }

  // Helper to create I128 ScVal (works around TypeScript type issues)
  private scvI128(value: bigint | number | string): any {
    return xdr.ScVal.scvI128(value.toString());
  }

  /**
   * Create a new escrow ON-CHAIN
   */
  async createEscrow(
    params: InitializeParams & { walletAddress: string }
  ): Promise<InitializeResult> {
    const { walletAddress, ...escrowParams } = params;

    console.log("📝 Creating escrow...", escrowParams);

    // Get account from Soroban
    const account = await sorobanServer.getAccount(walletAddress);

    // Build contract call operation with proper ScVal conversion
    const operation = this.contract.call(
      "initialize",
      new Address(escrowParams.creator).toScVal(),
      new Address(escrowParams.landlord).toScVal(),
      new Address(escrowParams.token).toScVal(),
      xdr.ScVal.scvVec(
        escrowParams.participants.map((p) => new Address(p).toScVal())
      ),
      xdr.ScVal.scvVec(
        escrowParams.shares.map((s) => this.scvI128(s))
      ),
      this.scvU64(escrowParams.deadline)
    );

    // Build transaction
    const tx = new TransactionBuilder(account, {
      fee: "100000", // Base fee
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // Simulate to get auth entries and resource usage
    const simulation = await simulateTransaction(tx);

    // Add simulation data to transaction
    const modifiedTx = addSimulationData(tx, simulation);

    // Sign transaction with wallet
    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      walletAddress
    );

    // Submit transaction
    const result = await sendTransaction(modifiedTx, signedXdr);

    // Extract escrow ID from result
    const escrowId = this.extractReturnValue(result.result);

    return {
      escrowId: BigInt(escrowId),
      hash: result.hash,
    };
  }

  /**
   * Deposit into escrow ON-CHAIN
   */
  async deposit(
    escrowId: bigint,
    participant: string
  ): Promise<DepositResult> {
    console.log("💰 Depositing to escrow:", escrowId.toString());

    const account = await sorobanServer.getAccount(participant);

    const operation = this.contract.call(
      "deposit",
      this.scvU64(escrowId),
      new Address(participant).toScVal()
    );

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);
    const modifiedTx = addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      participant
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return {
      success: result.confirmed,
      hash: result.hash,
    };
  }

  /**
   * Release funds to landlord ON-CHAIN
   */
  async release(
    escrowId: bigint,
    landlord: string
  ): Promise<ReleaseResult> {
    console.log("🎉 Releasing escrow funds:", escrowId.toString());

    const account = await sorobanServer.getAccount(landlord);

    const operation = this.contract.call(
      "release",
      this.scvU64(escrowId)
    );

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);
    const modifiedTx = addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      landlord
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return {
      success: result.confirmed,
      hash: result.hash,
    };
  }

  /**
   * Refund participant after deadline ON-CHAIN
   */
  async refund(
    escrowId: bigint,
    participant: string
  ): Promise<RefundResult> {
    console.log("💸 Processing refund:", escrowId.toString());

    const account = await sorobanServer.getAccount(participant);

    const operation = this.contract.call(
      "refund",
      this.scvU64(escrowId),
      new Address(participant).toScVal()
    );

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);
    const modifiedTx = addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      participant
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return {
      success: result.confirmed,
      hash: result.hash,
    };
  }

  /**
   * Raise dispute on escrow ON-CHAIN
   */
  async dispute(
    escrowId: bigint,
    creator: string,
    reason: string
  ): Promise<DisputeResult> {
    console.log("⚠️ Raising dispute:", escrowId.toString());

    const account = await sorobanServer.getAccount(creator);

    const operation = this.contract.call(
      "dispute",
      this.scvU64(escrowId),
      xdr.ScVal.scvSymbol(reason)
    );

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);
    const modifiedTx = addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      creator
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return {
      success: result.confirmed,
      hash: result.hash,
    };
  }

  /**
   * Resolve dispute ON-CHAIN (arbiter only)
   */
  async resolveDispute(
    escrowId: bigint,
    arbiter: string,
    outcome: "release" | "refund" | "cancel"
  ): Promise<ResolveDisputeResult> {
    console.log("✅ Resolving dispute:", escrowId.toString(), outcome);

    const account = await sorobanServer.getAccount(arbiter);

    const operation = this.contract.call(
      "resolve_dispute",
      this.scvU64(escrowId),
      xdr.ScVal.scvSymbol(outcome),
      new Address(arbiter).toScVal()
    );

    const tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);
    const modifiedTx = addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      arbiter
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return {
      success: result.confirmed,
      hash: result.hash,
    };
  }

  /**
   * Get escrow details by ID
   */
  async getEscrowById(escrowId: bigint): Promise<EscrowData> {
    console.log("📖 Fetching escrow:", escrowId.toString());

    const operation = this.contract.call(
      "get_escrow_by_id",
      this.scvU64(escrowId)
    );

    const tx = new TransactionBuilder(new Account(this.contractId, '0'), {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    // Check if simulation failed
    if (!simulation || !simulation.results || simulation.results.length === 0) {
      throw new Error(`Simulation failed: No results returned`);
    }

    const result = simulation.results[0].returnValue;
    return parseEscrowData(result);
  }

  /**
   * Get all escrow IDs (paginated)
   */
  async getAllEscrowIds(
    offset: bigint,
    limit: bigint
  ): Promise<bigint[]> {
    console.log("📋 Fetching escrow IDs...", offset.toString(), limit.toString());

    const operation = this.contract.call(
      "get_all_escrow_ids_paginated",
      this.scvU64(offset),
      this.scvU64(limit)
    );

    const tx = new TransactionBuilder(new Account(this.contractId, '0'), {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    // Check if simulation failed
    if (!simulation || !simulation.results || simulation.results.length === 0) {
      throw new Error(`Simulation failed: No results returned`);
    }

    const result = simulation.results[0].returnValue;
    
    // Parse Vec<u64> from result
    if (result?.value?.values) {
      return result.value.values.map((v: any) => {
        const val = v.value || v;
        return BigInt(val.toString ? val.toString() : val);
      });
    }
    
    return [];
  }

  /**
   * Get escrow count
   */
  async getEscrowCount(): Promise<bigint> {
    console.log("📊 Fetching escrow count...");

    const operation = this.contract.call("get_escrow_count");

    const tx = new TransactionBuilder(new Account(this.contractId, '0'), {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    // Check if simulation failed
    if (!simulation || !simulation.results || simulation.results.length === 0) {
      throw new Error(`Failed to fetch count: No results returned`);
    }

    const result = simulation.results[0].returnValue;
    
    // Parse u64 from result
    if (result?.value?.toBigInt) {
      return result.value.toBigInt();
    } else if (result?.value?.toNumber) {
      return BigInt(result.value.toNumber());
    } else if (result?.value?.value) {
      return BigInt(result.value.value.toString());
    }
    
    return BigInt(0);
  }

  /**
   * Get participant status
   */
  async getParticipantStatus(
    escrowId: bigint,
    participant: string
  ): Promise<{ status: string; shareAmount: bigint }> {
    console.log("👤 Fetching participant status:", participant);

    const operation = this.contract.call(
      "get_participant_status",
      this.scvU64(escrowId),
      new Address(participant).toScVal()
    );

    const tx = new TransactionBuilder(new Account(this.contractId, '0'), {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    // Check if simulation failed
    if (!simulation || !simulation.results || simulation.results.length === 0) {
      throw new Error(`Failed to fetch status: No results returned`);
    }

    const result = simulation.results[0].returnValue;
    
    // Parse tuple (ParticipantStatus, i128)
    if (result?.value?.values && result.value.values.length === 2) {
      const statusVal = result.value.values[0];
      const amountVal = result.value.values[1];
      
      return {
        status: statusVal.toString(),
        shareAmount: BigInt(amountVal.value?.toString() || amountVal.toString()),
      };
    }
    
    throw new Error("Failed to parse participant status");
  }

  /**
   * Check if escrow can be refunded
   */
  async canRefund(escrowId: bigint): Promise<boolean> {
    console.log("🤔 Checking if escrow can be refunded:", escrowId.toString());

    const operation = this.contract.call(
      "can_refund",
      this.scvU64(escrowId)
    );

    const tx = new TransactionBuilder(new Account(this.contractId, '0'), {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    // Check if simulation failed
    if (!simulation || !simulation.results || simulation.results.length === 0) {
      throw new Error(`Failed to check refund status: No results returned`);
    }

    const result = simulation.results[0].returnValue;
    
    // Parse bool from result
    if (result?.value?.value !== undefined) {
      return result.value.value === true;
    }
    
    return false;
  }

  /**
   * Listen to contract events
   */
  async listenToEvents(
    escrowId: bigint | undefined,
    callback: (event: any) => void
  ): Promise<() => void> {
    const { listenToContractEvents } = await import("./soroban");
    
    return listenToContractEvents(
      this.contractId,
      escrowId,
      callback
    );
  }

  /**
   * Get participants for an escrow
   */
  async getParticipants(escrowId: bigint): Promise<Participant[]> {
    console.log("👥 Fetching participants:", escrowId.toString());

    const operation = this.contract.call(
      "get_participants",
      this.scvU64(escrowId)
    );

    const tx = new TransactionBuilder(new Account(this.contractId, '0'), {
      fee: "100000",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    // Check if simulation failed
    if (!simulation || !simulation.results || simulation.results.length === 0) {
      throw new Error(`Failed to fetch participants: No results returned`);
    }

    const result = simulation.results[0].returnValue;
    
    // Parse Vec<Participant> from result
    if (result?.value?.values) {
      return result.value.values.map((p: any) => {
        const val = p.value || p;
        return {
          address: val.address?.toString() || "",
          share_amount: BigInt(val.share_amount?.value?.toString() || val.share_amount?.toString() || 0),
          status: (val.status?.toString() as any) || "Pending",
        };
      });
    }
    
    return [];
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private extractReturnValue(result: any): any {
    try {
      if (result?.result?.value?.value) {
        const value = result.result.value.value;
        
        if (value.toBigInt) {
          return value.toBigInt();
        } else if (value.toNumber) {
          return value.toNumber();
        } else if (value.toString) {
          return value.toString();
        }
        
        return value;
      }
      
      return result;
    } catch (error) {
      console.error("Failed to extract return value:", error);
      return null;
    }
  }
}

// Export singleton instance
export const escrowService = CONTRACT_ID ? new EscrowService() : null;

/**
 * Initialize escrow service with a specific contract ID
 */
export function initializeEscrowService(contractId?: string) {
  return new EscrowService(contractId);
}

export type { EscrowData, EscrowStatus, Participant };
