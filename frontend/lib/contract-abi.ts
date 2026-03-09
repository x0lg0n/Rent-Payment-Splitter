/**
 * Escrow Contract ABI and Type Definitions
 * 
 * TypeScript types matching the Soroban escrow contract structures.
 * Generated from: SplitRent/contracts/escrow/src/lib.rs
 */

// Contract ID from environment
export const ESCROW_CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID;

if (!ESCROW_CONTRACT_ID) {
  console.warn("⚠️ NEXT_PUBLIC_ESCROW_CONTRACT_ID not set in environment");
}

// ============================================================================
// Data Structures (matching Rust contract)
// ============================================================================

/**
 * Escrow status enumeration
 * Matches: EscrowStatus in lib.rs
 */
export type EscrowStatus =
  | "Active"
  | "FullyFunded"
  | "Released"
  | "Refunding"
  | "Refunded"
  | "Disputed";

/**
 * Participant status enumeration
 * Matches: ParticipantStatus in lib.rs
 */
export type ParticipantStatus =
  | "Pending"
  | "Deposited"
  | "Refunded"
  | "Released";

/**
 * Participant structure
 * Matches: Participant struct in lib.rs
 */
export interface Participant {
  address: string;
  share_amount: bigint;
  status: ParticipantStatus;
}

/**
 * Escrow data structure
 * Matches: EscrowData struct in lib.rs
 */
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

// ============================================================================
// Contract Events
// ============================================================================

/**
 * EscrowCreated event
 * Emitted when a new escrow is created
 */
export interface EscrowCreatedEvent {
  escrow_id: bigint;
  creator: string;
  landlord: string;
  token: string;
  total_rent: bigint;
}

/**
 * DepositMade event
 * Emitted when a participant deposits funds
 */
export interface DepositMadeEvent {
  escrow_id: bigint;
  participant: string;
  amount: bigint;
}

/**
 * EscrowReleased event
 * Emitted when funds are released to landlord
 */
export interface EscrowReleasedEvent {
  escrow_id: bigint;
  landlord: string;
  amount: bigint;
}

/**
 * RefundProcessed event
 * Emitted when a refund is processed
 */
export interface RefundProcessedEvent {
  escrow_id: bigint;
  participant: string;
  amount: bigint;
}

/**
 * StatusChanged event
 * Emitted when escrow status changes
 */
export interface StatusChangedEvent {
  escrow_id: bigint;
  old_status: EscrowStatus;
  new_status: EscrowStatus;
}

/**
 * DisputeRaised event
 * Emitted when a dispute is raised
 */
export interface DisputeRaisedEvent {
  escrow_id: bigint;
  raised_by: string;
  reason: string;
}

/**
 * DisputeResolved event
 * Emitted when a dispute is resolved
 */
export interface DisputeResolvedEvent {
  escrow_id: bigint;
  resolved_by: string;
  outcome: "release" | "refund" | "cancel";
}

// Union type for all events
export type EscrowEvent =
  | EscrowCreatedEvent
  | DepositMadeEvent
  | EscrowReleasedEvent
  | RefundProcessedEvent
  | StatusChangedEvent
  | DisputeRaisedEvent
  | DisputeResolvedEvent;

// ============================================================================
// Function Parameters and Return Types
// ============================================================================

/**
 * Parameters for initialize function
 */
export interface InitializeParams {
  creator: string;
  landlord: string;
  token: string;
  participants: string[];
  shares: bigint[];
  deadline: number; // Unix timestamp in seconds
}

/**
 * Return type for initialize function
 */
export interface InitializeResult {
  escrowId: bigint;
  hash: string;
}

/**
 * Parameters for deposit function
 */
export interface DepositParams {
  escrowId: bigint;
  participant: string;
}

/**
 * Return type for deposit function
 */
export interface DepositResult {
  success: boolean;
  hash: string;
}

/**
 * Parameters for release function
 */
export interface ReleaseParams {
  escrowId: bigint;
  landlord: string;
}

/**
 * Return type for release function
 */
export interface ReleaseResult {
  success: boolean;
  hash: string;
}

/**
 * Parameters for refund function
 */
export interface RefundParams {
  escrowId: bigint;
  participant: string;
}

/**
 * Return type for refund function
 */
export interface RefundResult {
  success: boolean;
  hash: string;
}

/**
 * Parameters for dispute function
 */
export interface DisputeParams {
  escrowId: bigint;
  creator: string;
  reason: string;
}

/**
 * Return type for dispute function
 */
export interface DisputeResult {
  success: boolean;
  hash: string;
}

/**
 * Parameters for resolveDispute function
 */
export interface ResolveDisputeParams {
  escrowId: bigint;
  arbiter: string;
  outcome: "release" | "refund" | "cancel";
}

/**
 * Return type for resolveDispute function
 */
export interface ResolveDisputeResult {
  success: boolean;
  hash: string;
}

/**
 * Return type for getParticipantStatus function
 */
export interface ParticipantStatusResult {
  status: ParticipantStatus;
  shareAmount: bigint;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert EscrowStatus string to enum type
 */
export function parseEscrowStatus(status: any): EscrowStatus {
  const validStatuses: EscrowStatus[] = [
    "Active",
    "FullyFunded",
    "Released",
    "Refunding",
    "Refunded",
    "Disputed",
  ];

  const statusStr = status.toString();
  
  if (validStatuses.includes(statusStr as EscrowStatus)) {
    return statusStr as EscrowStatus;
  }

  // Default to Active if unknown
  console.warn("Unknown escrow status:", statusStr);
  return "Active";
}

/**
 * Convert ParticipantStatus string to enum type
 */
export function parseParticipantStatus(status: any): ParticipantStatus {
  const validStatuses: ParticipantStatus[] = [
    "Pending",
    "Deposited",
    "Refunded",
    "Released",
  ];

  const statusStr = status.toString();
  
  if (validStatuses.includes(statusStr as ParticipantStatus)) {
    return statusStr as ParticipantStatus;
  }

  // Default to Pending if unknown
  console.warn("Unknown participant status:", statusStr);
  return "Pending";
}

/**
 * Parse escrow data from contract response
 */
export function parseEscrowData(data: any): EscrowData {
  return {
    id: BigInt(data.id?.value?.toString() || data.id?.toString() || 0),
    creator: data.creator?.toString() || "",
    landlord: data.landlord?.toString() || "",
    token: data.token?.toString() || "",
    participants: Array.isArray(data.participants)
      ? data.participants.map((p: any) => ({
          address: p.address?.toString() || "",
          share_amount: BigInt(p.share_amount?.value?.toString() || p.share_amount?.toString() || 0),
          status: parseParticipantStatus(p.status),
        }))
      : [],
    total_rent: BigInt(data.total_rent?.value?.toString() || data.total_rent?.toString() || 0),
    deposited_amount: BigInt(data.deposited_amount?.value?.toString() || data.deposited_amount?.toString() || 0),
    deadline: BigInt(data.deadline?.value?.toString() || data.deadline?.toString() || 0),
    status: parseEscrowStatus(data.status),
    created_at: BigInt(data.created_at?.value?.toString() || data.created_at?.toString() || 0),
  };
}

/**
 * Format address for display (truncate middle)
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2) {
    return address;
  }
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Convert bigint to human-readable number (for display)
 */
export function formatAmount(amount: bigint, decimals = 7): string {
  const str = amount.toString();
  const padded = str.padStart(decimals + 1, "0");
  const integerPart = padded.slice(0, -decimals) || "0";
  const decimalPart = padded.slice(-decimals).replace(/0+$/, "");
  
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

/**
 * Convert human-readable number to bigint (for contract calls)
 */
export function parseAmount(amount: string, decimals = 7): bigint {
  const [integerPart, decimalPart = ""] = amount.split(".");
  const paddedDecimal = decimalPart.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(`${integerPart}${paddedDecimal}`);
}
