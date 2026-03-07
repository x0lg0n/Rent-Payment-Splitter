# Escrow Smart Contract Integration Plan

## Executive Summary

This document outlines the complete integration plan for connecting the frontend Next.js application with the Soroban escrow smart contract. The contract is **complete and tested** (28 passing tests), while the frontend has **partial implementation** requiring Soroban RPC integration.

---

## Current Status

| Component | Status | Completion |
|-----------|--------|------------|
| Smart Contract (Rust) | ✅ Complete | 100% |
| Contract Tests | ✅ Complete | 28 tests passing |
| Frontend UI Components | ✅ Complete | 100% |
| Wallet Integration | ✅ Complete | Multi-wallet support |
| Escrow Service (TS) | ⚠️ Partial | ~30% (mock implementations) |
| Soroban RPC Integration | ❌ Missing | 0% |
| Token Contract Integration | ❌ Missing | 0% |

---

## Phase 1: Infrastructure Setup

### 1.1 Deploy Smart Contract to Testnet

**Location:** `SplitRent/contracts/escrow/`

```bash
# Navigate to contract directory
cd SplitRent

# Build WASM artifact (already done)
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source YOUR_TESTNET_ACCOUNT \
  --network testnet

# Save the deployed contract ID
# Example: CBUMZ3VLJ3IINXLXTS72V6AMGPOFIYRDRQCDWV7BBYNIS4RAX2U6T2AM
```

**Output:** Contract ID to be used in frontend configuration

---

### 1.2 Update Environment Configuration

**File:** `frontend/.env.local`

```bash
# Existing variables
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_EXPLORER_BASE_URL=https://stellar.expert/explorer/testnet/tx
NEXT_PUBLIC_FRIENDBOT_URL=https://laboratory.stellar.org/#account-creator?network=test
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# NEW: Escrow contract configuration
NEXT_PUBLIC_ESCROW_CONTRACT_ID=<DEPLOYED_CONTRACT_ID>
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org

# Token contract (SAC - Stellar Asset Classic)
# Deploy or use existing testnet token
NEXT_PUBLIC_TEST_TOKEN_CONTRACT_ID=<TOKEN_CONTRACT_ID>
```

**File:** `frontend/.env.example`
- Add the same variables as template for new developers

---

### 1.3 Upgrade Stellar SDK

**File:** `frontend/package.json`

```json
{
  "dependencies": {
    "@stellar/stellar-sdk": "^15.0.0",
    "@creit.tech/stellar-wallets-kit": "^2.0.0"
  }
}
```

**Reason:** SDK v15+ has full Soroban RPC support including:
- `SorobanRpc.Server` for contract interactions
- Transaction simulation
- Auth entry handling
- Event parsing

**Command:**
```bash
cd frontend
pnpm add @stellar/stellar-sdk@^15.0.0
```

---

## Phase 2: Soroban Infrastructure Layer

### 2.1 Create Soroban RPC Utility

**File:** `frontend/lib/stellar/soroban.ts` (NEW)

```typescript
import { SorobanRpc, Networks, Transaction, SorobanDataBuilder } from "@stellar/stellar-sdk";
import { config } from "../config";

const SOROBAN_RPC_URL = config.sorobanRpcUrl;
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const sorobanServer = new SorobanRpc.Server(SOROBAN_RPC_URL, {
  allowHttp: SOROBAN_RPC_URL.startsWith("http://"),
});

/**
 * Send transaction and wait for confirmation
 */
export async function sendTransaction(
  transaction: Transaction,
  signedXdr: string
): Promise<{ hash: string; confirmed: boolean; result?: any }> {
  // Parse signed transaction
  const signedTransaction = Transaction.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  // Submit to network
  const sendResponse = await sorobanServer.sendTransaction(transaction);

  if (sendResponse.status !== "PENDING") {
    throw new Error(`Transaction submission failed: ${sendResponse.status}`);
  }

  // Poll for confirmation
  let txResponse;
  const maxAttempts = 15;
  for (let i = 0; i < maxAttempts; i++) {
    txResponse = await sorobanServer.getTransaction(sendResponse.hash);

    if (txResponse.status === "SUCCESS") {
      return {
        hash: sendResponse.hash,
        confirmed: true,
        result: txResponse.result,
      };
    } else if (txResponse.status === "FAILED") {
      throw new Error(`Transaction failed: ${txResponse.result?.resultCode}`);
    }

    // Wait 1 second before polling again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Transaction confirmation timeout");
}

/**
 * Simulate transaction to get auth entries and resource usage
 */
export async function simulateTransaction(transaction: Transaction) {
  return await sorobanServer.simulateTransaction(transaction);
}

/**
 * Extend contract TTL to prevent expiration
 */
export async function extendContractTTL(contractId: string, ledgersToExtend: number = 100000) {
  // Implementation for extending storage TTL
  const contract = new Contract(contractId);
  const tx = await sorobanServer
    .transactionBuilder()
    .addOperation(
      contract.extendTTL({
        key: sorobanServer.addressToScKey(contractId),
        extendTo: ledgersToExtend,
      })
    )
    .build();

  return await simulateTransaction(tx);
}

export { Networks, SorobanRpc };
```

---

### 2.2 Generate Contract Type Definitions

**File:** `frontend/lib/contract-abi.ts` (NEW)

```typescript
import { ContractSpec } from "@stellar/stellar-sdk";

// Contract ID from environment
export const ESCROW_CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID;

// Contract spec (generated from WASM)
// Run: stellar contract info spec --wasm path/to/escrow.wasm
export const ESCROW_CONTRACT_SPEC = [
  {
    name: "initialize",
    inputs: [
      { name: "creator", type: { address: {} } },
      { name: "landlord", type: { address: {} } },
      { name: "token", type: { address: {} } },
      { name: "participants", type: { vec: { address: {} } } },
      { name: "shares", type: { vec: { i128: {} } } },
      { name: "deadline", type: { u64: {} } },
    ],
    outputs: [{ type: { u64: {} } }],
  },
  {
    name: "deposit",
    inputs: [
      { name: "escrow_id", type: { u64: {} } },
      { name: "participant", type: { address: {} } },
    ],
    outputs: [{ type: { bool: {} } }],
  },
  {
    name: "release",
    inputs: [{ name: "escrow_id", type: { u64: {} } }],
    outputs: [{ type: { bool: {} } }],
  },
  {
    name: "refund",
    inputs: [
      { name: "escrow_id", type: { u64: {} } },
      { name: "participant", type: { address: {} } },
    ],
    outputs: [{ type: { bool: {} } }],
  },
  {
    name: "dispute",
    inputs: [
      { name: "escrow_id", type: { u64: {} } },
      { name: "reason", type: { symbol: {} } },
    ],
    outputs: [{ type: { bool: {} } }],
  },
  {
    name: "resolve_dispute",
    inputs: [
      { name: "escrow_id", type: { u64: {} } },
      { name: "outcome", type: { symbol: {} } },
      { name: "arbiter", type: { address: {} } },
    ],
    outputs: [{ type: { bool: {} } }],
  },
  {
    name: "get_escrow_by_id",
    inputs: [{ name: "escrow_id", type: { u64: {} } }],
    outputs: [{ type: { struct: "EscrowData" } }],
  },
  // ... add all other functions
] as const;

// TypeScript types matching contract structs
export interface EscrowData {
  id: bigint;
  creator: string;
  landlord: string;
  token: string;
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
  status: ParticipantStatus;
}

export type EscrowStatus =
  | "Active"
  | "FullyFunded"
  | "Released"
  | "Refunding"
  | "Refunded"
  | "Disputed";

export type ParticipantStatus = "Pending" | "Deposited" | "Refunded" | "Released";

// Contract events
export interface EscrowCreatedEvent {
  escrow_id: bigint;
  creator: string;
  landlord: string;
  token: string;
  total_rent: bigint;
}

export interface DepositMadeEvent {
  escrow_id: bigint;
  participant: string;
  amount: bigint;
}

export interface EscrowReleasedEvent {
  escrow_id: bigint;
  landlord: string;
  amount: bigint;
}

export interface RefundProcessedEvent {
  escrow_id: bigint;
  participant: string;
  amount: bigint;
}

export interface StatusChangedEvent {
  escrow_id: bigint;
  old_status: EscrowStatus;
  new_status: EscrowStatus;
}

export interface DisputeRaisedEvent {
  escrow_id: bigint;
  raised_by: string;
  reason: string;
}

export interface DisputeResolvedEvent {
  escrow_id: bigint;
  resolved_by: string;
  outcome: string;
}
```

**Alternative:** Auto-generate using Soroban CLI:
```bash
stellar contract bindings typescript \
  --wasm SplitRent/target/wasm32-unknown-unknown/release/escrow.wasm \
  --output-dir frontend/lib/contract-abi \
  --network testnet
```

---

## Phase 3: Complete Escrow Service Implementation

### 3.1 Update Contract Service

**File:** `frontend/lib/stellar/contract.ts` (COMPLETE REWRITE)

```typescript
import {
  Contract,
  Address,
  Transaction,
  SorobanRpc,
  xdr,
} from "@stellar/stellar-sdk";
import { sorobanServer, sendTransaction, simulateTransaction } from "./soroban";
import { signWithSelectedWallet } from "../wallet/wallet-kit";
import { useWallet } from "../hooks/use-wallet";
import { ESCROW_CONTRACT_ID, EscrowData, Participant } from "../contract-abi";
import { config } from "../config";

export class EscrowService {
  private contract: Contract;
  private contractId: string;

  constructor(contractId?: string) {
    this.contractId = contractId || ESCROW_CONTRACT_ID || "";
    if (!this.contractId) {
      throw new Error("Escrow contract ID not configured");
    }
    this.contract = new Contract(this.contractId);
  }

  /**
   * Create a new escrow
   */
  async createEscrow(
    creator: string,
    landlord: string,
    token: string,
    participants: string[],
    shares: bigint[],
    deadline: number
  ): Promise<{ escrowId: bigint; hash: string }> {
    const walletAddress = creator;

    // Build contract invocation
    const tx = await sorobanServer
      .transactionBuilder(walletAddress)
      .addOperation(
        this.contract.call(
          "initialize",
          new Address(creator),
          new Address(landlord),
          new Address(token),
          participants.map((p) => new Address(p)),
          shares,
          BigInt(deadline)
        )
      )
      .setTimeout(30)
      .build();

    // Simulate to get auth entries and resource usage
    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    // Add auth entries from simulation
    const authEntries = simulation.results?.[0]?.auth || [];
    // Add resource fees from simulation
    const modifiedTx = this.addSimulationData(tx, simulation);

    // Sign transaction
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
   * Deposit tokens into escrow
   */
  async deposit(
    escrowId: bigint,
    participant: string,
    tokenAddress: string
  ): Promise<{ hash: string }> {
    const tx = await sorobanServer
      .transactionBuilder(participant)
      .addOperation(
        this.contract.call("deposit", escrowId, new Address(participant))
      )
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    const modifiedTx = this.addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      participant
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return { hash: result.hash };
  }

  /**
   * Release funds to landlord
   */
  async release(
    escrowId: bigint,
    landlord: string
  ): Promise<{ hash: string }> {
    const tx = await sorobanServer
      .transactionBuilder(landlord)
      .addOperation(this.contract.call("release", escrowId))
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    const modifiedTx = this.addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      landlord
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return { hash: result.hash };
  }

  /**
   * Refund participant after deadline
   */
  async refund(
    escrowId: bigint,
    participant: string
  ): Promise<{ hash: string }> {
    const tx = await sorobanServer
      .transactionBuilder(participant)
      .addOperation(
        this.contract.call("refund", escrowId, new Address(participant))
      )
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    const modifiedTx = this.addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      participant
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return { hash: result.hash };
  }

  /**
   * Raise dispute on escrow
   */
  async dispute(
    escrowId: bigint,
    creator: string,
    reason: string
  ): Promise<{ hash: string }> {
    const tx = await sorobanServer
      .transactionBuilder(creator)
      .addOperation(
        this.contract.call("dispute", escrowId, { symbol: reason })
      )
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    const modifiedTx = this.addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      creator
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return { hash: result.hash };
  }

  /**
   * Resolve dispute (arbiter only)
   */
  async resolveDispute(
    escrowId: bigint,
    arbiter: string,
    outcome: "release" | "refund" | "cancel"
  ): Promise<{ hash: string }> {
    const tx = await sorobanServer
      .transactionBuilder(arbiter)
      .addOperation(
        this.contract.call("resolve_dispute", escrowId, { symbol: outcome }, new Address(arbiter))
      )
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    const modifiedTx = this.addSimulationData(tx, simulation);

    const signedXdr = await signWithSelectedWallet(
      modifiedTx.toXDR(),
      config.networkPassphrase,
      arbiter
    );

    const result = await sendTransaction(modifiedTx, signedXdr);

    return { hash: result.hash };
  }

  /**
   * Get escrow details by ID
   */
  async getEscrowById(escrowId: bigint): Promise<EscrowData> {
    const tx = await sorobanServer
      .transactionBuilder(this.contractId)
      .addOperation(this.contract.call("get_escrow_by_id", escrowId))
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Failed to fetch escrow: ${simulation.error}`);
    }

    const result = simulation.results?.[0]?.returnValue;
    return this.parseEscrowData(result);
  }

  /**
   * Get all escrow IDs (paginated)
   */
  async getAllEscrowIds(
    offset: bigint = 0n,
    limit: bigint = 100n
  ): Promise<bigint[]> {
    const tx = await sorobanServer
      .transactionBuilder(this.contractId)
      .addOperation(
        this.contract.call("get_all_escrow_ids_paginated", offset, limit)
      )
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Failed to fetch escrows: ${simulation.error}`);
    }

    const result = simulation.results?.[0]?.returnValue;
    return this.parseVecU64(result);
  }

  /**
   * Get escrow count
   */
  async getEscrowCount(): Promise<bigint> {
    const tx = await sorobanServer
      .transactionBuilder(this.contractId)
      .addOperation(this.contract.call("get_escrow_count"))
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Failed to fetch count: ${simulation.error}`);
    }

    const result = simulation.results?.[0]?.returnValue;
    return this.parseU64(result);
  }

  /**
   * Get participant status
   */
  async getParticipantStatus(
    escrowId: bigint,
    participant: string
  ): Promise<{ status: string; shareAmount: bigint }> {
    const tx = await sorobanServer
      .transactionBuilder(this.contractId)
      .addOperation(
        this.contract.call(
          "get_participant_status",
          escrowId,
          new Address(participant)
        )
      )
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Failed to fetch status: ${simulation.error}`);
    }

    const result = simulation.results?.[0]?.returnValue;
    return this.parseParticipantStatus(result);
  }

  /**
   * Check if escrow can be refunded
   */
  async canRefund(escrowId: bigint): Promise<boolean> {
    const tx = await sorobanServer
      .transactionBuilder(this.contractId)
      .addOperation(this.contract.call("can_refund", escrowId))
      .setTimeout(30)
      .build();

    const simulation = await simulateTransaction(tx);

    if (simulation.error) {
      throw new Error(`Failed to check refund status: ${simulation.error}`);
    }

    const result = simulation.results?.[0]?.returnValue;
    return this.parseBool(result);
  }

  /**
   * Listen to contract events
   */
  async listenToEvents(
    escrowId?: bigint,
    callback: (event: any) => void
  ): Promise<() => void> {
    const topics = escrowId
      ? [["deposit", escrowId.toString()]]
      : undefined;

    const eventSource = new SorobanRpc.EventSource(sorobanServer, {
      contractIds: [this.contractId],
      topics,
    });

    eventSource.on("event", (event) => {
      callback(this.parseEvent(event));
    });

    return () => eventSource.close();
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private addSimulationData(tx: Transaction, simulation: SorobanRpc.Api.SimulateTransactionResponse): Transaction {
    // Add auth entries
    const authEntries = simulation.results?.[0]?.auth || [];
    authEntries.forEach((entry, index) => {
      tx.operations[index].auth = entry;
    });

    // Add resource fees
    if (simulation.transactionData) {
      tx = TransactionBuilder.fromXDR(tx.toXDR(), config.networkPassphrase) as Transaction;
      tx = tx.setSorobanData(new SorobanDataBuilder(simulation.transactionData).build());
    }

    return tx;
  }

  private extractReturnValue(result: any): any {
    // Extract return value from transaction result
    // This depends on the specific XDR structure
    return result?.result?.value?.value?.toBigInt?.() || result;
  }

  private parseEscrowData(result: any): EscrowData {
    // Parse XDR struct to TypeScript object
    // Implementation depends on SDK version
    return result as EscrowData;
  }

  private parseVecU64(result: any): bigint[] {
    // Parse XDR vec<u64> to array
    return result as bigint[];
  }

  private parseU64(result: any): bigint {
    return result as bigint;
  }

  private parseBool(result: any): boolean {
    return result as boolean;
  }

  private parseParticipantStatus(result: any): { status: string; shareAmount: bigint } {
    // Parse tuple (ParticipantStatus, i128)
    return result as { status: string; shareAmount: bigint };
  }

  private parseEvent(event: any): any {
    // Parse contract event to TypeScript interface
    return event;
  }
}

// Export singleton instance
export const escrowService = new EscrowService();
```

---

## Phase 4: React Hooks for Escrow Operations

### 4.1 Create useEscrow Hook

**File:** `frontend/lib/hooks/use-escrow.ts` (NEW)

```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import { escrowService } from "../stellar/contract";
import { useWallet } from "./use-wallet";
import { useToasts } from "./use-toasts";
import { EscrowData, Participant } from "../contract-abi";
import { useEscrowStore } from "../store";

interface UseEscrowReturn {
  // State
  currentEscrow: EscrowData | null;
  isLoading: boolean;
  isCreating: boolean;
  isDepositing: boolean;
  isReleasing: boolean;
  isRefunding: boolean;
  isDisputing: boolean;

  // Actions
  createEscrow: (params: CreateEscrowParams) => Promise<bigint>;
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
}

interface CreateEscrowParams {
  landlord: string;
  token: string;
  participants: string[];
  shares: bigint[];
  deadline: number;
}

export function useEscrow(): UseEscrowReturn {
  const { walletAddress } = useWallet();
  const { addToast } = useToasts();
  const { currentEscrow, setCurrentEscrow, updateEscrow } = useEscrowStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);

  const createEscrow = useCallback(
    async (params: CreateEscrowParams): Promise<bigint> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      setIsCreating(true);
      try {
        addToast({
          title: "Creating Escrow",
          description: "Please sign the transaction in your wallet...",
          type: "loading",
        });

        const result = await escrowService.createEscrow(
          walletAddress,
          params.landlord,
          params.token,
          params.participants,
          params.shares,
          params.deadline
        );

        addToast({
          title: "Escrow Created",
          description: `Escrow ID: ${result.escrowId.toString()}`,
          type: "success",
        });

        // Fetch and store escrow details
        const escrow = await escrowService.getEscrowById(result.escrowId);
        setCurrentEscrow(escrow);

        return result.escrowId;
      } catch (error) {
        addToast({
          title: "Failed to Create Escrow",
          description: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [walletAddress, addToast, setCurrentEscrow]
  );

  const deposit = useCallback(
    async (escrowId: bigint): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      setIsDepositing(true);
      try {
        addToast({
          title: "Depositing Funds",
          description: "Please sign the token transfer...",
          type: "loading",
        });

        const escrow = currentEscrow || (await escrowService.getEscrowById(escrowId));
        
        const result = await escrowService.deposit(
          escrowId,
          walletAddress,
          escrow.token
        );

        addToast({
          title: "Deposit Successful",
          description: `Transaction: ${result.hash.slice(0, 8)}...`,
          type: "success",
        });

        // Refresh escrow state
        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        addToast({
          title: "Deposit Failed",
          description: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        throw error;
      } finally {
        setIsDepositing(false);
      }
    },
    [walletAddress, addToast, currentEscrow]
  );

  const release = useCallback(
    async (escrowId: bigint): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      setIsReleasing(true);
      try {
        addToast({
          title: "Releasing Funds",
          description: "Landlord must sign to receive funds...",
          type: "loading",
        });

        const escrow = currentEscrow || (await escrowService.getEscrowById(escrowId));

        const result = await escrowService.release(escrowId, escrow.landlord);

        addToast({
          title: "Funds Released",
          description: `Transaction: ${result.hash.slice(0, 8)}...`,
          type: "success",
        });

        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        addToast({
          title: "Release Failed",
          description: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        throw error;
      } finally {
        setIsReleasing(false);
      }
    },
    [walletAddress, addToast, currentEscrow]
  );

  const refund = useCallback(
    async (escrowId: bigint): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      setIsRefunding(true);
      try {
        addToast({
          title: "Processing Refund",
          description: "Please sign the refund transaction...",
          type: "loading",
        });

        const result = await escrowService.refund(escrowId, walletAddress);

        addToast({
          title: "Refund Processed",
          description: `Transaction: ${result.hash.slice(0, 8)}...`,
          type: "success",
        });

        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        addToast({
          title: "Refund Failed",
          description: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        throw error;
      } finally {
        setIsRefunding(false);
      }
    },
    [walletAddress, addToast]
  );

  const dispute = useCallback(
    async (escrowId: bigint, reason: string): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      setIsDisputing(true);
      try {
        addToast({
          title: "Raising Dispute",
          description: "Please sign to raise dispute...",
          type: "loading",
        });

        const result = await escrowService.dispute(escrowId, walletAddress, reason);

        addToast({
          title: "Dispute Raised",
          description: `Transaction: ${result.hash.slice(0, 8)}...`,
          type: "success",
        });

        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        addToast({
          title: "Dispute Failed",
          description: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        throw error;
      } finally {
        setIsDisputing(false);
      }
    },
    [walletAddress, addToast]
  );

  const resolveDispute = useCallback(
    async (
      escrowId: bigint,
      outcome: "release" | "refund" | "cancel"
    ): Promise<string> => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      setIsDisputing(true);
      try {
        addToast({
          title: "Resolving Dispute",
          description: "Please sign to resolve dispute...",
          type: "loading",
        });

        const result = await escrowService.resolveDispute(
          escrowId,
          walletAddress,
          outcome
        );

        addToast({
          title: "Dispute Resolved",
          description: `Outcome: ${outcome}`,
          type: "success",
        });

        await refreshEscrow(escrowId);

        return result.hash;
      } catch (error) {
        addToast({
          title: "Resolution Failed",
          description: error instanceof Error ? error.message : "Unknown error",
          type: "error",
        });
        throw error;
      } finally {
        setIsDisputing(false);
      }
    },
    [walletAddress, addToast]
  );

  const refreshEscrow = useCallback(
    async (escrowId: bigint) => {
      setIsLoading(true);
      try {
        const escrow = await escrowService.getEscrowById(escrowId);
        updateEscrow(escrow);
      } catch (error) {
        console.error("Failed to refresh escrow:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [updateEscrow]
  );

  const canRefund = useCallback(async (escrowId: bigint): Promise<boolean> => {
    return await escrowService.canRefund(escrowId);
  }, []);

  return {
    currentEscrow,
    isLoading,
    isCreating,
    isDepositing,
    isReleasing,
    isRefunding,
    isDisputing,
    createEscrow,
    deposit,
    release,
    refund,
    dispute,
    resolveDispute,
    refreshEscrow,
    canRefund,
  };
}
```

---

## Phase 5: Update Frontend Pages

### 5.1 Update Create Escrow Page

**File:** `frontend/app/escrow/create/page.tsx`

**Changes Required:**
1. Replace mock `escrowService.createEscrow()` call with real implementation
2. Add token selection (use test token or deploy SAC)
3. Add transaction confirmation polling
4. Redirect to escrow detail page on success

```typescript
// In CreateEscrowForm component
const { createEscrow, isCreating } = useEscrow();
const router = useRouter();

const handleSubmit = async (data: FormData) => {
  try {
    const escrowId = await createEscrow({
      landlord: data.landlord,
      token: data.token,
      participants: data.participants,
      shares: data.shares,
      deadline: data.deadline.getTime() / 1000,
    });

    // Navigate to escrow detail page
    router.push(`/escrow/${escrowId.toString()}`);
  } catch (error) {
    // Error handled by hook
  }
};
```

---

### 5.2 Update Escrow Detail Page

**File:** `frontend/app/escrow/[id]/page.tsx`

**Changes Required:**
1. Fetch real escrow data from contract on mount
2. Implement deposit/release/refund buttons with `useEscrow` hook
3. Add real-time status updates via event listening
4. Show participant deposit status from contract

```typescript
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useEscrow } from "@/lib/hooks/use-escrow";
import { EscrowStatusCard, DepositProgress, ParticipantList } from "@/components/escrow";

export default function EscrowDetailPage() {
  const params = useParams();
  const escrowId = BigInt(params.id as string);
  
  const { 
    currentEscrow, 
    refreshEscrow, 
    deposit, 
    release, 
    refund,
    isDepositing,
    isReleasing,
    isRefunding,
  } = useEscrow();

  useEffect(() => {
    refreshEscrow(escrowId);
    
    // Optional: Set up event listener for real-time updates
    const unsubscribe = await escrowService.listenToEvents(escrowId, (event) => {
      refreshEscrow(escrowId);
    });

    return () => unsubscribe();
  }, [escrowId]);

  const handleDeposit = async () => {
    await deposit(escrowId);
  };

  const handleRelease = async () => {
    await release(escrowId);
  };

  const handleRefund = async () => {
    await refund(escrowId);
  };

  if (!currentEscrow) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <EscrowStatusCard 
        escrow={currentEscrow}
        onRelease={handleRelease}
        isLoading={isReleasing}
      />
      
      <DepositProgress 
        deposited={currentEscrow.deposited_amount}
        total={currentEscrow.total_rent}
        onDeposit={handleDeposit}
        isLoading={isDepositing}
      />
      
      <ParticipantList 
        participants={currentEscrow.participants}
        onRefund={handleRefund}
        isLoading={isRefunding}
      />
    </div>
  );
}
```

---

### 5.3 Update Escrow List Page

**File:** `frontend/app/escrow/page.tsx`

**Changes Required:**
1. Fetch all escrow IDs from contract
2. Fetch details for each escrow
3. Implement pagination using `get_all_escrow_ids_paginated`

```typescript
"use client";

import { useEffect, useState } from "react";
import { escrowService } from "@/lib/stellar/contract";
import { EscrowData } from "@/lib/contract-abi";

export default function EscrowsPage() {
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEscrows() {
      try {
        const escrowIds = await escrowService.getAllEscrowIds(0n, 100n);
        
        const escrowData = await Promise.all(
          escrowIds.map((id) => escrowService.getEscrowById(id))
        );

        setEscrows(escrowData);
      } catch (error) {
        console.error("Failed to load escrows:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadEscrows();
  }, []);

  if (isLoading) {
    return <div>Loading escrows...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Escrows</h1>
      <div className="grid gap-4">
        {escrows.map((escrow) => (
          <EscrowCard key={escrow.id.toString()} escrow={escrow} />
        ))}
      </div>
    </div>
  );
}
```

---

## Phase 6: Testing & Validation

### 6.1 Integration Test Checklist

| Test Case | Description | Status |
|-----------|-------------|--------|
| Create Escrow | Verify escrow creation with real contract | ⬜ |
| Deposit Tokens | Verify token transfer and status update | ⬜ |
| Multiple Deposits | Verify multiple participants can deposit | ⬜ |
| Release Funds | Verify landlord can receive funds | ⬜ |
| Refund After Deadline | Verify refund works after deadline | ⬜ |
| Dispute & Resolve | Verify dispute flow | ⬜ |
| Event Listening | Verify real-time updates | ⬜ |
| Wallet Rejection | Handle user rejecting transaction | ⬜ |
| Insufficient Balance | Handle insufficient token balance | ⬜ |
| Network Errors | Handle RPC timeouts/failures | ⬜ |

---

### 6.2 Test Token Setup

**Option A: Deploy Test SAC Token**

```bash
# Deploy Stellar Asset Classic token
stellar contract deploy \
  --wasm $(soroban env wasm --spec sac) \
  --source YOUR_ACCOUNT \
  --network testnet

# Or use existing testnet token
# Example: USDC testnet: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

**Option B: Use Mock Mode (Development Only)**

Keep the current test mode where token transfers are simulated:

```typescript
// In contract.ts
const SKIP_TOKEN_TRANSFER = process.env.NODE_ENV === "development";

if (!SKIP_TOKEN_TRANSFER) {
  // Actual token transfer
}
```

---

## Phase 7: Deployment & Monitoring

### 7.1 Production Deployment Checklist

- [ ] Deploy contract to mainnet (if ready)
- [ ] Update `CONTRACT_ID` in production env
- [ ] Configure mainnet RPC endpoint
- [ ] Update wallet network to `PUBLIC`
- [ ] Test with small amounts first
- [ ] Set up monitoring for contract events
- [ ] Add error tracking (Sentry)
- [ ] Document contract address for users

---

## Required Frontend Suggestions/Changes Summary

### Critical Requirements

1. **Upgrade Stellar SDK** → v15.0.0+ for Soroban support
2. **Add Environment Variables** → Contract ID, Soroban RPC URL
3. **Implement EscrowService** → Complete all methods with real Soroban calls
4. **Add Soroban Utilities** → Transaction simulation, auth handling, confirmation polling
5. **Create Contract ABI** → Type-safe TypeScript types for contract functions
6. **Add useEscrow Hook** → React hook for escrow operations with loading states
7. **Update Pages** → Connect UI to real contract calls
8. **Event Listening** → Real-time updates via contract events

### Recommended Improvements

1. **Transaction Queue** → Handle multiple pending transactions
2. **Gas Estimation** → Show users estimated fees before signing
3. **Retry Logic** → Auto-retry failed transactions with backoff
4. **Contract Verification** → Verify contract hash matches source
5. **Batch Operations** → Allow bulk deposit/refund for multiple escrows
6. **Export Functions** → Download escrow data as CSV/PDF
7. **Notifications** → Email/push notifications for escrow events
8. **Mobile Optimization** → Ensure wallet connection works on mobile

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| Phase 1: Infrastructure | Deploy contract, env setup | 1-2 hours |
| Phase 2: Soroban Layer | Create utilities, ABI | 4-6 hours |
| Phase 3: Service Implementation | Complete EscrowService | 8-10 hours |
| Phase 4: React Hooks | Create useEscrow hook | 3-4 hours |
| Phase 5: Page Updates | Update 3 pages | 6-8 hours |
| Phase 6: Testing | Integration tests | 4-6 hours |
| Phase 7: Deployment | Production setup | 2-3 hours |
| **Total** | | **28-39 hours** |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Contract bugs | High | Comprehensive tests (28 passing), audit before mainnet |
| Token transfer failures | High | Mock mode for dev, thorough testing |
| Wallet compatibility | Medium | Test all 4 supported wallets |
| RPC rate limits | Medium | Implement rate limiting, caching |
| User experience | Medium | Clear error messages, loading states |

---

## Next Steps

1. **Deploy contract to testnet** and get contract ID
2. **Create `.env.local`** with contract configuration
3. **Upgrade Stellar SDK** to v15+
4. **Implement Phase 2-3** (Soroban layer + Service)
5. **Test integration** with existing UI components
6. **Deploy to Vercel** for staging review

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-07  
**Author:** Integration Planning  
**Status:** Ready for Implementation
