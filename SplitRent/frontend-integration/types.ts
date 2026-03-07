/**
 * Escrow Contract Types
 * 
 * Type definitions for the Rent Payment Splitter Escrow contract
 */

export enum EscrowStatus {
  Active = 'Active',
  FullyFunded = 'FullyFunded',
  Released = 'Released',
  Refunding = 'Refunding',
  Refunded = 'Refunded',
  Disputed = 'Disputed',
}

export enum ParticipantStatus {
  Pending = 'Pending',
  Deposited = 'Deposited',
  Refunded = 'Refunded',
  Released = 'Released',
}

export interface Participant {
  address: string;
  shareAmount: bigint;
  status: ParticipantStatus;
}

export interface EscrowData {
  id: bigint;
  creator: string;
  landlord: string;
  token: string;
  participants: Participant[];
  totalRent: bigint;
  depositedAmount: bigint;
  deadline: bigint;
  status: EscrowStatus;
  createdAt: bigint;
}

export interface EscrowVault {
  escrowId: bigint;
  token: string;
  vaultAddress: string;
}

export interface InitializeEscrowParams {
  landlord: string;
  token: string;
  participants: string[];
  shares: bigint[];
  deadline: bigint;
}

export interface DepositParams {
  escrowId: bigint;
  participant: string;
}

export interface RefundParams {
  escrowId: bigint;
  participant: string;
}

export interface DisputeParams {
  escrowId: bigint;
  reason: string;
}

export interface ResolveDisputeParams {
  escrowId: bigint;
  outcome: 'release' | 'refund' | 'cancel';
  arbiter: string;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  escrowId?: bigint;
}
