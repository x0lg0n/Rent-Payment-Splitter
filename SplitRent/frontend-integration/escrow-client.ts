/**
 * Escrow Contract Client
 * 
 * TypeScript client for interacting with the Rent Payment Splitter Escrow contract
 */

import {
  Contract,
  SorobanRpc,
  Address,
  xdr,
  Networks,
  Transaction,
  TransactionBuilder,
} from '@stellar/stellar-sdk';
import type {
  EscrowData,
  EscrowStatus,
  ParticipantStatus,
  TransactionResult,
} from './types';

export class EscrowClient {
  private contract: Contract;
  private server: SorobanRpc.Server;
  private networkPassphrase: string;

  constructor(
    contractId: string,
    rpcUrl: string,
    networkPassphrase: string = Networks.FUTURENET
  ) {
    this.contract = new Contract(contractId);
    this.server = new SorobanRpc.Server(rpcUrl, {
      allowHttp: rpcUrl.startsWith('http://'),
    });
    this.networkPassphrase = networkPassphrase;
  }

  // ====================
  // Read Operations (No transaction required)
  // ====================

  /**
   * Get escrow details by ID
   */
  async getEscrowById(escrowId: bigint): Promise<EscrowData> {
    try {
      const result = await this.server.simulateTransaction(
        this.contract.call('get_escrow_by_id', escrowId)
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return this.parseEscrowData(result.result!);
    } catch (error: any) {
      throw new Error(`Failed to get escrow: ${error.message}`);
    }
  }

  /**
   * Get all participants for an escrow
   */
  async getParticipants(escrowId: bigint): Promise<Array<{
    address: string;
    shareAmount: bigint;
    status: ParticipantStatus;
  }>> {
    try {
      const result = await this.server.simulateTransaction(
        this.contract.call('get_participants', escrowId)
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return this.parseParticipants(result.result!);
    } catch (error: any) {
      throw new Error(`Failed to get participants: ${error.message}`);
    }
  }

  /**
   * Get participant status
   */
  async getParticipantStatus(
    escrowId: bigint,
    participant: string
  ): Promise<{ status: ParticipantStatus; shareAmount: bigint }> {
    try {
      const result = await this.server.simulateTransaction(
        this.contract.call(
          'get_participant_status',
          escrowId,
          new Address(participant)
        )
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return this.parseParticipantStatus(result.result!);
    } catch (error: any) {
      throw new Error(`Failed to get participant status: ${error.message}`);
    }
  }

  /**
   * Check if escrow can be refunded
   */
  async canRefund(escrowId: bigint): Promise<boolean> {
    try {
      const result = await this.server.simulateTransaction(
        this.contract.call('can_refund', escrowId)
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.result as boolean;
    } catch (error: any) {
      throw new Error(`Failed to check refund status: ${error.message}`);
    }
  }

  /**
   * Get all escrow IDs (paginated)
   */
  async getAllEscrowIdsPaginated(
    offset: bigint = 0n,
    limit: bigint = 10n
  ): Promise<bigint[]> {
    try {
      const result = await this.server.simulateTransaction(
        this.contract.call('get_all_escrow_ids_paginated', offset, limit)
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return this.parseEscrowIds(result.result!);
    } catch (error: any) {
      throw new Error(`Failed to get escrow IDs: ${error.message}`);
    }
  }

  /**
   * Get total escrow count
   */
  async getEscrowCount(): Promise<bigint> {
    try {
      const result = await this.server.simulateTransaction(
        this.contract.call('get_escrow_count')
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.result as bigint;
    } catch (error: any) {
      throw new Error(`Failed to get escrow count: ${error.message}`);
    }
  }

  /**
   * Get vault address for an escrow
   */
  async getVaultAddress(escrowId: bigint): Promise<string> {
    try {
      const result = await this.server.simulateTransaction(
        this.contract.call('get_vault_address_public', escrowId)
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      return (result.result as any).toString();
    } catch (error: any) {
      throw new Error(`Failed to get vault address: ${error.message}`);
    }
  }

  // ====================
  // Write Operations (Transaction required)
  // ====================

  /**
   * Initialize a new escrow
   */
  async initialize(
    params: {
      landlord: string;
      token: string;
      participants: string[];
      shares: bigint[];
      deadline: bigint;
    },
    signerPublicKey: string,
    signTransaction: (tx: string) => Promise<string>
  ): Promise<TransactionResult> {
    try {
      const source = await this.server.getAccount(new Address(signerPublicKey));

      const transaction = new TransactionBuilder(source, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            'initialize',
            new Address(signerPublicKey),
            new Address(params.landlord),
            new Address(params.token),
            params.participants.map(p => new Address(p)),
            params.shares,
            params.deadline
          )
        )
        .setTimeout(30)
        .build();

      const prepared = await this.server.prepareTransaction(transaction);
      const signed = await signTransaction(prepared.toXDR());
      const signedTx = TransactionBuilder.fromXDR(signed, this.networkPassphrase);

      const response = await this.server.sendTransaction(signedTx as Transaction);

      if (response.status === 'PENDING') {
        // Wait for transaction to complete
        let txResponse = await this.server.getTransaction(response.hash);

        while (txResponse.status === 'NOT_FOUND') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          txResponse = await this.server.getTransaction(response.hash);
        }

        if (txResponse.status === 'SUCCESS') {
          // Extract escrow ID from result
          const escrowId = this.parseEscrowIdFromResult(txResponse);
          return {
            success: true,
            transactionHash: response.hash,
            escrowId,
          };
        } else {
          return {
            success: false,
            transactionHash: response.hash,
            error: 'Transaction failed',
          };
        }
      }

      return {
        success: false,
        error: response.error?.result?.value?.attributes?.v?.value?.switch?.name || 'Unknown error',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Deposit to escrow
   */
  async deposit(
    escrowId: bigint,
    participant: string,
    signTransaction: (tx: string) => Promise<string>
  ): Promise<TransactionResult> {
    try {
      const source = await this.server.getAccount(new Address(participant));

      const transaction = new TransactionBuilder(source, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          this.contract.call('deposit', escrowId, new Address(participant))
        )
        .setTimeout(30)
        .build();

      return await this.submitTransaction(transaction, signTransaction);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Release funds to landlord
   */
  async release(
    escrowId: bigint,
    landlord: string,
    signTransaction: (tx: string) => Promise<string>
  ): Promise<TransactionResult> {
    try {
      const source = await this.server.getAccount(new Address(landlord));

      const transaction = new TransactionBuilder(source, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(this.contract.call('release', escrowId))
        .setTimeout(30)
        .build();

      return await this.submitTransaction(transaction, signTransaction);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refund participant
   */
  async refund(
    escrowId: bigint,
    participant: string,
    signTransaction: (tx: string) => Promise<string>
  ): Promise<TransactionResult> {
    try {
      const source = await this.server.getAccount(new Address(participant));

      const transaction = new TransactionBuilder(source, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          this.contract.call('refund', escrowId, new Address(participant))
        )
        .setTimeout(30)
        .build();

      return await this.submitTransaction(transaction, signTransaction);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Raise a dispute
   */
  async dispute(
    escrowId: bigint,
    reason: string,
    caller: string,
    signTransaction: (tx: string) => Promise<string>
  ): Promise<TransactionResult> {
    try {
      const source = await this.server.getAccount(new Address(caller));

      const transaction = new TransactionBuilder(source, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            'dispute',
            escrowId,
            this.stringToSymbol(reason),
            new Address(caller)
          )
        )
        .setTimeout(30)
        .build();

      return await this.submitTransaction(transaction, signTransaction);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Resolve a dispute (arbiter only)
   */
  async resolveDispute(
    escrowId: bigint,
    outcome: 'release' | 'refund' | 'cancel',
    arbiter: string,
    signTransaction: (tx: string) => Promise<string>
  ): Promise<TransactionResult> {
    try {
      const source = await this.server.getAccount(new Address(arbiter));

      const transaction = new TransactionBuilder(source, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            'resolve_dispute',
            escrowId,
            this.stringToSymbol(outcome),
            new Address(arbiter)
          )
        )
        .setTimeout(30)
        .build();

      return await this.submitTransaction(transaction, signTransaction);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extend TTL for escrow storage
   */
  async extendTTL(
    escrowId: bigint,
    extension: number,
    signerPublicKey: string,
    signTransaction: (tx: string) => Promise<string>
  ): Promise<TransactionResult> {
    try {
      const source = await this.server.getAccount(new Address(signerPublicKey));

      const transaction = new TransactionBuilder(source, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          this.contract.call('extend_ttl', escrowId, extension)
        )
        .setTimeout(30)
        .build();

      return await this.submitTransaction(transaction, signTransaction);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ====================
  // Private Helper Methods
  // ====================

  private async submitTransaction(
    transaction: Transaction,
    signTransaction: (tx: string) => Promise<string>
  ): Promise<TransactionResult> {
    try {
      const prepared = await this.server.prepareTransaction(transaction);
      const signed = await signTransaction(prepared.toXDR());
      const signedTx = TransactionBuilder.fromXDR(signed, this.networkPassphrase);

      const response = await this.server.sendTransaction(signedTx as Transaction);

      if (response.status === 'PENDING') {
        let txResponse = await this.server.getTransaction(response.hash);

        while (txResponse.status === 'NOT_FOUND') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          txResponse = await this.server.getTransaction(response.hash);
        }

        if (txResponse.status === 'SUCCESS') {
          return {
            success: true,
            transactionHash: response.hash,
          };
        } else {
          return {
            success: false,
            transactionHash: response.hash,
            error: 'Transaction failed',
          };
        }
      }

      return {
        success: false,
        error: response.error?.result?.value?.attributes?.v?.value?.switch?.name || 'Unknown error',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private parseEscrowData(result: any): EscrowData {
    // Parse Soroban XDR result to EscrowData
    // This is a simplified version - you may need to adjust based on actual response format
    return {
      id: BigInt(result.id),
      creator: result.creator.toString(),
      landlord: result.landlord.toString(),
      token: result.token.toString(),
      participants: this.parseParticipants(result.participants),
      totalRent: BigInt(result.total_rent),
      depositedAmount: BigInt(result.deposited_amount),
      deadline: BigInt(result.deadline),
      status: this.parseEscrowStatus(result.status),
      createdAt: BigInt(result.created_at),
    };
  }

  private parseParticipants(result: any): Array<{
    address: string;
    shareAmount: bigint;
    status: ParticipantStatus;
  }> {
    return result.map((p: any) => ({
      address: p.address.toString(),
      shareAmount: BigInt(p.share_amount),
      status: this.parseParticipantStatus(p.status),
    }));
  }

  private parseEscrowStatus(status: any): EscrowStatus {
    const statusMap: Record<string, EscrowStatus> = {
      Active: EscrowStatus.Active,
      FullyFunded: EscrowStatus.FullyFunded,
      Released: EscrowStatus.Released,
      Refunding: EscrowStatus.Refunding,
      Refunded: EscrowStatus.Refunded,
      Disputed: EscrowStatus.Disputed,
    };
    return statusMap[status as string] || EscrowStatus.Active;
  }

  private parseParticipantStatus(status: any): ParticipantStatus {
    const statusMap: Record<string, ParticipantStatus> = {
      Pending: ParticipantStatus.Pending,
      Deposited: ParticipantStatus.Deposited,
      Refunded: ParticipantStatus.Refunded,
      Released: ParticipantStatus.Released,
    };
    return statusMap[status as string] || ParticipantStatus.Pending;
  }

  private parseEscrowIds(result: any): bigint[] {
    return result.map((id: any) => BigInt(id));
  }

  private stringToSymbol(str: string): any {
    return { symbol: str };
  }

  private parseEscrowIdFromResult(result: any): bigint {
    // Extract escrow ID from transaction result
    // Implementation depends on actual response format
    return BigInt(0); // Placeholder
  }
}

export default EscrowClient;
