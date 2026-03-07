# Production Deployment & Frontend Integration Guide

## Quick Answer: Yes, Redeploy Required

**Why?**
- Contract bytecode has changed significantly
- New functions added (`dispute`, `resolve_dispute`, `extend_ttl`, etc.)
- Function signatures changed (e.g., `initialize()` now requires `token` parameter)
- Storage structures are incompatible with previous version

---

## Part 1: Deploy Updated Contract

### Prerequisites

```bash
# Install Soroban CLI if not already installed
cargo install --locked soroban-cli

# Verify installation
soroban --version
```

### Step 1: Build Contract for Production

```bash
cd "SplitRent/contracts/escrow"

# Build optimized release version
cargo build --release

# The WASM file will be at:
# target/wasm32-unknown-unknown/release/escrow.wasm
```

### Step 2: Prepare for Deployment

```bash
# Navigate to contract directory
cd /path/to/RISEIN\ /Rent\ Payment\ Splitter/SplitRent

# Check available networks
soroban network ls

# If using Futurenet (testnet):
# Network: futurenet
# RPC URL: https://rpc-futurenet.stellar.org:443
```

### Step 3: Deploy to Stellar

```bash
# 1. Upload WASM to get WASM hash
soroban contract upload \
  --source YOUR_ALIAS \
  --network futurenet \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm

# This returns a WASM hash like: abc123...

# 2. Deploy contract instance
soroban contract deploy \
  --source YOUR_ALIAS \
  --network futurenet \
  --wasm-hash abc123...

# This returns your CONTRACT_ID like: CAXYZ...
```

### Step 4: Save Contract ID

**Important:** Save the deployed contract ID - you'll need it for frontend integration.

```bash
# Save to environment file
echo "ESCROW_CONTRACT_ID=CAXYZ..." >> .env

# Or save to a config file
cat > contract_config.json << EOF
{
  "futurenet": "CAXYZ...",
  "testnet": "CAXYZ...",
  "mainnet": "CAXYZ..."
}
EOF
```

---

## Part 2: Frontend Integration

### Option A: Using @stellar/freighter (Recommended)

#### Install Dependencies

```bash
cd frontend
npm install @stellar/freighter-api @stellar/stellar-sdk soroban-client
```

#### Create Contract Client

```typescript
// src/lib/escrow-client.ts
import { Contract, SorobanRpc, Address } from '@stellar/stellar-sdk';
import { getNetwork, signTransaction } from '@stellar/freighter-api';

export class EscrowClient {
  private contract: Contract;
  private server: SorobanRpc.Server;
  private networkPassphrase: string;

  constructor(contractId: string, rpcUrl: string, networkPassphrase: string) {
    this.contract = new Contract(contractId);
    this.server = new SorobanRpc.Server(rpcUrl);
    this.networkPassphrase = networkPassphrase;
  }

  // Initialize a new escrow
  async initializeEscrow(
    creator: string,
    landlord: string,
    token: string,
    participants: string[],
    shares: bigint[],
    deadline: bigint
  ) {
    const transaction = await this.server.getTransaction(
      await this.server.getAccount(new Address(creator))
    );

    const operation = this.contract.call(
      'initialize',
      new Address(creator),
      new Address(landlord),
      new Address(token),
      participants.map(p => new Address(p)),
      shares,
      deadline
    );

    transaction.addOperation(operation);

    const prepared = await this.server.prepareTransaction(transaction);
    const signed = await signTransaction(prepared.toXDR(), {
      networkPassphrase: this.networkPassphrase
    });

    return await this.server.sendTransaction(
      SorobanRpc.TransactionBuilder.fromXDR(signed, this.networkPassphrase)
    );
  }

  // Deposit to escrow
  async deposit(escrowId: bigint, participant: string) {
    const operation = this.contract.call(
      'deposit',
      escrowId,
      new Address(participant)
    );
    // ... submit transaction (same pattern as above)
  }

  // Release funds to landlord
  async release(escrowId: bigint) {
    const operation = this.contract.call('release', escrowId);
    // ... submit transaction
  }

  // Refund participant
  async refund(escrowId: bigint, participant: string) {
    const operation = this.contract.call(
      'refund',
      escrowId,
      new Address(participant)
    );
    // ... submit transaction
  }

  // Get escrow details (read-only, no transaction needed)
  async getEscrowById(escrowId: bigint): Promise<EscrowData> {
    const result = await this.server.simulateTransaction(
      this.contract.call('get_escrow_by_id', escrowId)
    );
    
    return this.parseEscrowData(result);
  }

  // Get participant status
  async getParticipantStatus(
    escrowId: bigint,
    participant: string
  ): Promise<{ status: string; shareAmount: bigint }> {
    const result = await this.server.simulateTransaction(
      this.contract.call(
        'get_participant_status',
        escrowId,
        new Address(participant)
      )
    );
    
    return this.parseParticipantStatus(result);
  }

  // Check if can refund
  async canRefund(escrowId: bigint): Promise<boolean> {
    const result = await this.server.simulateTransaction(
      this.contract.call('can_refund', escrowId)
    );
    return result.result as boolean;
  }

  // Get all escrow IDs (paginated)
  async getAllEscrowIdsPaginated(
    offset: bigint,
    limit: bigint
  ): Promise<bigint[]> {
    const result = await this.server.simulateTransaction(
      this.contract.call(
        'get_all_escrow_ids_paginated',
        offset,
        limit
      )
    );
    return result.result as bigint[];
  }

  // Get escrow count
  async getEscrowCount(): Promise<bigint> {
    const result = await this.server.simulateTransaction(
      this.contract.call('get_escrow_count')
    );
    return result.result as bigint;
  }

  // Dispute escrow
  async dispute(escrowId: bigint, reason: string, caller: string) {
    const operation = this.contract.call(
      'dispute',
      escrowId,
      this.stringToSymbol(reason),
      new Address(caller)
    );
    // ... submit transaction
  }

  // Resolve dispute (arbiter only)
  async resolveDispute(
    escrowId: bigint,
    outcome: string,
    arbiter: string
  ) {
    const operation = this.contract.call(
      'resolve_dispute',
      escrowId,
      this.stringToSymbol(outcome),
      new Address(arbiter)
    );
    // ... submit transaction
  }

  // Extend TTL
  async extendTTL(escrowId: bigint, extension: number) {
    const operation = this.contract.call(
      'extend_ttl',
      escrowId,
      extension
    );
    // ... submit transaction
  }

  // Helper methods
  private parseEscrowData(result: any): EscrowData {
    // Parse Soroban response to EscrowData object
    // Implementation depends on response format
  }

  private parseParticipantStatus(result: any) {
    // Parse participant status response
  }

  private stringToSymbol(str: string): any {
    // Convert string to Soroban symbol
    return { symbol: str };
  }
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

export interface Participant {
  address: string;
  shareAmount: bigint;
  status: ParticipantStatus;
}

export enum EscrowStatus {
  Active = 'Active',
  FullyFunded = 'FullyFunded',
  Released = 'Released',
  Refunding = 'Refunding',
  Refunded = 'Refunded',
  Disputed = 'Disputed'
}

export enum ParticipantStatus {
  Pending = 'Pending',
  Deposited = 'Deposited',
  Refunded = 'Refunded',
  Released = 'Released'
}
```

#### React Hook Example

```typescript
// src/hooks/useEscrow.ts
import { useState, useEffect } from 'react';
import { EscrowClient } from '../lib/escrow-client';

const CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID!;
const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL!;
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE!;

export function useEscrow() {
  const [client, setClient] = useState<EscrowClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const escrowClient = new EscrowClient(
      CONTRACT_ID,
      RPC_URL,
      NETWORK_PASSPHRAGE
    );
    setClient(escrowClient);
    setLoading(false);
  }, []);

  const createEscrow = async (
    landlord: string,
    token: string,
    participants: string[],
    shares: number[],
    deadlineDays: number
  ) => {
    if (!client) throw new Error('Client not initialized');

    const creator = await window.freighterApi?.getPublicKey();
    const deadline = BigInt(Date.now() / 1000 + deadlineDays * 86400);
    const sharesBig = shares.map(s => BigInt(s * 10_000_000)); // Assuming 7 decimals

    return await client.initializeEscrow(
      creator!,
      landlord,
      token,
      participants,
      sharesBig,
      deadline
    );
  };

  const depositToEscrow = async (escrowId: number, participant: string) => {
    if (!client) throw new Error('Client not initialized');
    return await client.deposit(BigInt(escrowId), participant);
  };

  const releaseEscrow = async (escrowId: number) => {
    if (!client) throw new Error('Client not initialized');
    return await client.release(BigInt(escrowId));
  };

  const getEscrowDetails = async (escrowId: number) => {
    if (!client) throw new Error('Client not initialized');
    return await client.getEscrowById(BigInt(escrowId));
  };

  return {
    loading,
    createEscrow,
    depositToEscrow,
    releaseEscrow,
    getEscrowDetails,
  };
}
```

### Option B: Using Albedo

```bash
npm install @albedo-link/intent
```

```typescript
import { contract } from '@albedo-link/intent';

async function callEscrow(functionName: string, ...args: any[]) {
  const result = await contract({
    contract_id: CONTRACT_ID,
    function: functionName,
    args: args,
  });
  return result;
}
```

---

## Part 3: Environment Configuration

### Frontend Environment Variables

```bash
# .env.local or .env
NEXT_PUBLIC_ESCROW_CONTRACT_ID=CAXYZ...
NEXT_PUBLIC_STELLAR_RPC_URL=https://rpc-futurenet.stellar.org:443
NEXT_PUBLIC_NETWORK_PASSPHRASE=Future Network ; October 2022
NEXT_PUBLIC_TOKEN_CONTRACT_ID=CAXYZ... # Your token contract
```

### Backend Environment Variables (if applicable)

```bash
# .env
STELLAR_SECRET_KEY=SC...
STELLAR_RPC_URL=https://rpc-futurenet.stellar.org:443
ESCROW_CONTRACT_ID=CAXYZ...
NETWORK=futurenet
```

---

## Part 4: Migration from Old Contract

### If You Have Existing Escrows

**Option 1: Migrate Users** (Recommended)

```typescript
// Migration script
async function migrateEscrows() {
  // 1. Get all escrow IDs from old contract
  const oldEscrowIds = await oldContract.getAllEscrowIds();

  // 2. For each escrow, recreate in new contract
  for (const id of oldEscrowIds) {
    const escrow = await oldContract.getEscrowById(id);
    
    // Skip completed escrows
    if (escrow.status === 'Released' || escrow.status === 'Refunded') {
      continue;
    }

    // Recreate in new contract
    await newContract.initialize(
      escrow.creator,
      escrow.landlord,
      escrow.token || DEFAULT_TOKEN, // New field
      escrow.participants.map(p => p.address),
      escrow.participants.map(p => p.shareAmount),
      escrow.deadline
    );
  }

  // 3. Notify users to re-deposit
  // Send notifications/emails to participants
}
```

**Option 2: Keep Old Contract Running**

- Keep old contract deployed for existing escrows
- Use new contract for all new escrows
- Gradually phase out old contract

---

## Part 5: Testing Before Production

### Deploy to Testnet First

```bash
# Deploy to testnet
soroban contract deploy \
  --source YOUR_ALIAS \
  --network testnet \
  --wasm-hash abc123...

# Save testnet contract ID
echo "NEXT_PUBLIC_ESCROW_CONTRACT_ID_TESTNET=CAXYZ..." >> .env
```

### Integration Testing

```typescript
// __tests__/escrow-integration.test.ts
describe('Escrow Integration', () => {
  it('should create and fund escrow', async () => {
    const { createEscrow, getEscrowDetails } = useEscrow();
    
    const tx = await createEscrow(
      landlordAddress,
      tokenAddress,
      [participant1, participant2],
      [500, 500],
      30
    );
    
    expect(tx.status).toBe('SUCCESS');
  });
});
```

---

## Part 6: Production Checklist

### Before Mainnet Deployment

- [ ] Contract audited by security firm
- [ ] All tests passing (unit + integration)
- [ ] Deployed and tested on testnet
- [ ] Frontend error handling implemented
- [ ] Transaction status monitoring
- [ ] User notifications for status changes
- [ ] Backup/rollback plan ready
- [ ] Monitoring and alerting configured
- [ ] Documentation updated
- [ ] Team trained on dispute resolution

### Mainnet Deployment

```bash
# Deploy to mainnet
soroban contract deploy \
  --source YOUR_ALIAS \
  --network public \
  --wasm-hash abc123...

# Update production environment
NEXT_PUBLIC_ESCROW_CONTRACT_ID=CAXYZ...
NEXT_PUBLIC_STELLAR_RPC_URL=https://rpc.stellar.org:443
NEXT_PUBLIC_NETWORK_PASSPHRASE=Public Global Stellar Network ; September 2015
```

---

## Part 7: Common Issues & Solutions

### Issue: "Contract not found"
**Solution:** Ensure contract is deployed to the correct network

### Issue: "Transaction simulation failed"
**Solution:** Check function arguments match contract expectations

### Issue: "Insufficient funds"
**Solution:** Ensure user has enough XLM for fees + token balance

### Issue: "Token transfer failed"
**Solution:** Verify token contract address and user approvals

---

## Quick Start Summary

```bash
# 1. Build
cd SplitRent/contracts/escrow
cargo build --release

# 2. Deploy
soroban contract upload --source ALIAS --network futurenet --wasm target/wasm32-unknown-unknown/release/escrow.wasm
soroban contract deploy --source ALIAS --network futurenet --wasm-hash HASH

# 3. Configure Frontend
echo "NEXT_PUBLIC_ESCROW_CONTRACT_ID=CAXYZ..." >> frontend/.env

# 4. Install frontend SDK
cd frontend
npm install @stellar/freighter-api @stellar/stellar-sdk soroban-client

# 5. Use in components
import { useEscrow } from '@/hooks/useEscrow';
```

---

## Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Developer Portal](https://developers.stellar.org/docs)
- [Freighter API](https://www.freighter.app/api)
- [Soroban Examples](https://github.com/StellarCN/soroban-examples)
