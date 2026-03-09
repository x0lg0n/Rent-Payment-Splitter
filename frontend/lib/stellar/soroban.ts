/**
 * Soroban RPC Utilities
 * 
 * Handles low-level Soroban RPC interactions including:
 * - Transaction simulation
 * - Auth entry handling
 * - Transaction submission and confirmation
 * - Event listening
 * 
 * Uses soroban-client package for Soroban RPC communication
 */

import {
  Server,
  Api as SorobanApi,
  TransactionBuilder as SorobanTransactionBuilder,
} from "soroban-client";
import {
  Transaction,
  TransactionBuilder,
  SorobanDataBuilder,
  Networks,
} from "@stellar/stellar-sdk";
import { config } from "../config";

// Initialize Soroban RPC server
const SOROBAN_RPC_URL = config.sorobanRpcUrl || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const sorobanServer = new Server(SOROBAN_RPC_URL, {
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
  const signedTransaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE) as Transaction;

  // Submit to network
  const sendResponse = await sorobanServer.sendTransaction(transaction);

  if (sendResponse.status !== "PENDING") {
    throw new Error(`Transaction submission failed: ${sendResponse.status}`);
  }

  console.log("📤 Transaction submitted:", sendResponse.hash);

  // Poll for confirmation
  let txResponse;
  const maxAttempts = 15;
  const pollInterval = 1000; // 1 second

  for (let i = 0; i < maxAttempts; i++) {
    txResponse = await sorobanServer.getTransaction(sendResponse.hash);

    if (txResponse.status === "SUCCESS") {
      console.log("✅ Transaction confirmed:", sendResponse.hash);
      return {
        hash: sendResponse.hash,
        confirmed: true,
        result: txResponse.result,
      };
    } else if (txResponse.status === "FAILED") {
      console.error("❌ Transaction failed:", txResponse.result?.resultCode);
      throw new Error(`Transaction failed: ${txResponse.result?.resultCode}`);
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error("Transaction confirmation timeout");
}

/**
 * Simulate transaction to get auth entries and resource usage
 */
export async function simulateTransaction(transaction: Transaction) {
  console.log("🔍 Simulating transaction...");
  const simulation = await sorobanServer.simulateTransaction(transaction);
  
  if (simulation.error) {
    console.error("❌ Simulation failed:", simulation.error);
    throw new Error(`Simulation failed: ${simulation.error}`);
  }

  console.log("✅ Simulation successful");
  return simulation;
}

/**
 * Add simulation data to transaction (auth entries + resource fees)
 */
export function addSimulationData(
  tx: Transaction,
  simulation: SorobanApi.SimulateTransactionResponse
): Transaction {
  // Add auth entries from simulation
  const authEntries = simulation.results?.[0]?.auth || [];
  
  // Add resource fees from simulation
  if (simulation.transactionData) {
    const sorobanData = new SorobanDataBuilder(simulation.transactionData).build();
    
    // Rebuild transaction with soroban data
    const txBuilder = new TransactionBuilder(
      TransactionBuilder.fromXDR(tx.toXDR(), NETWORK_PASSPHRASE) as Transaction,
      {
        fee: tx.fee,
        networkPassphrase: NETWORK_PASSPHRASE,
      }
    );
    
    txBuilder.setSorobanData(sorobanData);
    
    // Add operations back
    tx.operations.forEach((op) => {
      txBuilder.addOperation(op);
    });
    
    const timeout = (tx as any).timeoutAttr || 30;
    tx = txBuilder.setTimeout(timeout).build();
  }

  return tx;
}

/**
 * Get account details from Soroban RPC
 */
export async function getAccount(accountId: string) {
  return await sorobanServer.getAccount(accountId);
}

/**
 * Get latest ledger sequence
 */
export async function getLatestLedger(): Promise<number> {
  const status = await sorobanServer.getLatestLedger();
  return status.sequence;
}

/**
 * Listen to contract events
 */
export async function listenToContractEvents(
  contractId: string,
  escrowId: bigint | undefined,
  callback: (event: any) => void
): Promise<() => void> {
  // Build topics filter
  const topics = escrowId
    ? [["*", escrowId.toString()]] // Filter by escrow ID
    : undefined;

  try {
    // Create event source
    const eventSource = new Server.EventSource(sorobanServer, {
      contractIds: [contractId],
      topics,
    });

    eventSource.on("event", (event: any) => {
      console.log("📬 Contract event received:", event);
      callback(event);
    });

    eventSource.on("error", (error: any) => {
      console.error("❌ Event source error:", error);
    });

    // Return unsubscribe function
    return () => {
      eventSource.close();
      console.log("🔕 Event listener closed");
    };
  } catch (error) {
    console.error("Failed to create event source:", error);
    // Return empty unsubscribe function
    return () => {};
  }
}

/**
 * Parse contract event to TypeScript interface
 */
export function parseContractEvent(event: any): {
  type: string;
  data: any;
  contractId: string;
} {
  try {
    const type = event.topic[0]?.toString() || "unknown";
    const data = event.value;
    
    return {
      type,
      data,
      contractId: event.contractId,
    };
  } catch (error) {
    console.error("Failed to parse event:", error);
    return {
      type: "unknown",
      data: event,
      contractId: event.contractId,
    };
  }
}

/**
 * Extract return value from transaction result
 */
export function extractReturnValue(result: any): any {
  try {
    // Try to get return value from result
    if (result?.result?.value?.value) {
      const value = result.result.value.value;
      
      // Handle different types
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

export { Networks, SorobanApi };
