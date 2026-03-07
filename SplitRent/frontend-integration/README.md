# Frontend Integration Kit

This directory contains ready-to-use TypeScript/JavaScript components for integrating the Rent Payment Splitter Escrow contract with your frontend.

## 📦 Files

- `types.ts` - TypeScript type definitions
- `escrow-client.ts` - Complete contract client
- `README.md` - This file

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @stellar/stellar-sdk soroban-client
```

### 2. Copy Files to Your Project

```bash
# Copy integration files to your frontend
cp -r frontend-integration/ your-frontend/src/lib/escrow/
```

### 3. Configure Environment

Create `.env` file:

```bash
NEXT_PUBLIC_ESCROW_CONTRACT_ID=CAXYZ...  # Your deployed contract ID
NEXT_PUBLIC_STELLAR_RPC_URL=https://rpc-futurenet.stellar.org:443
NEXT_PUBLIC_NETWORK_PASSPHRASE=Future Network ; October 2022
```

### 4. Initialize Client

```typescript
import EscrowClient from '@/lib/escrow/escrow-client';

const client = new EscrowClient(
  process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID!,
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL!,
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE
);
```

### 5. Use in Components

```typescript
// Create escrow
const result = await client.initialize(
  {
    landlord: 'GABC...',
    token: 'CAXYZ...',  // Token contract address
    participants: ['GDEF...', 'GHIJ...'],
    shares: [5000000000n, 5000000000n],  // In token decimals
    deadline: BigInt(Date.now() / 1000 + 30 * 86400),  // 30 days
  },
  userPublicKey,
  signTransaction  // From Freighter or other wallet
);

// Get escrow details
const escrow = await client.getEscrowById(1n);

// Deposit
await client.deposit(1n, participantAddress, signTransaction);

// Release (landlord only)
await client.release(1n, landlordAddress, signTransaction);
```

## 📖 API Reference

### Read Operations (No Signature Required)

| Method | Description | Parameters |
|--------|-------------|------------|
| `getEscrowById(id)` | Get escrow details | `escrowId: bigint` |
| `getParticipants(id)` | Get all participants | `escrowId: bigint` |
| `getParticipantStatus(id, addr)` | Get participant status | `escrowId, participantAddress` |
| `canRefund(id)` | Check if refundable | `escrowId: bigint` |
| `getAllEscrowIdsPaginated(offset, limit)` | List escrows | `offset, limit: bigint` |
| `getEscrowCount()` | Total escrows | None |
| `getVaultAddress(id)` | Get vault address | `escrowId: bigint` |

### Write Operations (Signature Required)

| Method | Description | Parameters |
|--------|-------------|------------|
| `initialize(params, pubkey, signTx)` | Create escrow | Params + signer |
| `deposit(id, participant, signTx)` | Deposit funds | Escrow ID + participant |
| `release(id, landlord, signTx)` | Release to landlord | Escrow ID + landlord |
| `refund(id, participant, signTx)` | Refund participant | Escrow ID + participant |
| `dispute(id, reason, caller, signTx)` | Raise dispute | Escrow ID + reason |
| `resolveDispute(id, outcome, arbiter, signTx)` | Resolve dispute | Escrow ID + outcome + arbiter |
| `extendTTL(id, extension, pubkey, signTx)` | Extend storage | Escrow ID + extension |

## 🔧 Integration Examples

### React Hook

```typescript
// hooks/useEscrow.ts
import { useState, useEffect } from 'react';
import EscrowClient from '@/lib/escrow/escrow-client';

export function useEscrow() {
  const [client, setClient] = useState<EscrowClient | null>(null);

  useEffect(() => {
    const escrowClient = new EscrowClient(
      process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID!,
      process.env.NEXT_PUBLIC_STELLAR_RPC_URL!
    );
    setClient(escrowClient);
  }, []);

  return { client };
}
```

### With Freighter Wallet

```typescript
import { signTransaction, getPublicKey } from '@stellar/freighter-api';

async function createEscrowWithFreighter() {
  const publicKey = await getPublicKey();
  
  const result = await client.initialize(
    {
      landlord: landlordAddress,
      token: tokenAddress,
      participants: [participant1, participant2],
      shares: [5000000000n, 5000000000n],
      deadline: BigInt(Date.now() / 1000 + 2592000),
    },
    publicKey,
    signTransaction
  );

  if (result.success) {
    console.log('Escrow created:', result.escrowId);
  } else {
    console.error('Failed:', result.error);
  }
}
```

### Error Handling

```typescript
try {
  const result = await client.deposit(escrowId, participant, signTx);
  
  if (!result.success) {
    if (result.error?.includes('Participant already deposited')) {
      // Handle duplicate deposit
    } else if (result.error?.includes('deadline passed')) {
      // Handle expired deadline
    }
    throw new Error(result.error);
  }
  
  console.log('Deposit successful:', result.transactionHash);
} catch (error) {
  console.error('Deposit failed:', error);
}
```

## 🎨 UI Component Examples

### Escrow Card Component

```typescript
function EscrowCard({ escrowId }: { escrowId: number }) {
  const { client } = useEscrow();
  const [escrow, setEscrow] = useState<EscrowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client?.getEscrowById(BigInt(escrowId))
      .then(setEscrow)
      .finally(() => setLoading(false));
  }, [escrowId]);

  if (loading) return <div>Loading...</div>;
  if (!escrow) return <div>Escrow not found</div>;

  return (
    <div className="escrow-card">
      <h3>Escrow #{escrow.id.toString()}</h3>
      <p>Status: {escrow.status}</p>
      <p>Deposited: {escrow.depositedAmount} / {escrow.totalRent}</p>
      <p>Deadline: {new Date(Number(escrow.deadline) * 1000).toLocaleDateString()}</p>
      
      {escrow.status === 'FullyFunded' && (
        <button onClick={() => handleRelease(escrow.id)}>
          Release to Landlord
        </button>
      )}
    </div>
  );
}
```

## 🧪 Testing

```typescript
// __tests__/escrow.test.ts
describe('EscrowClient', () => {
  let client: EscrowClient;

  beforeEach(() => {
    client = new EscrowClient(
      TEST_CONTRACT_ID,
      TEST_RPC_URL,
      Networks.FUTURENET
    );
  });

  it('should get escrow by ID', async () => {
    const escrow = await client.getEscrowById(1n);
    expect(escrow.id).toBe(1n);
    expect(escrow.status).toBe('Active');
  });

  it('should create escrow', async () => {
    const result = await client.initialize(
      {
        landlord: LANDLORD_ADDRESS,
        token: TOKEN_ADDRESS,
        participants: [PARTICIPANT_1],
        shares: [1000000000n],
        deadline: BigInt(Date.now() / 1000 + 86400),
      },
      CREATOR_ADDRESS,
      mockSignTransaction
    );
    
    expect(result.success).toBe(true);
    expect(result.escrowId).toBeDefined();
  });
});
```

## 📝 Notes

1. **Token Decimals**: Ensure you're using correct token decimals (usually 7 for Stellar tokens)
2. **Deadlines**: Unix timestamp in seconds
3. **Amounts**: All amounts are in token smallest units (like lamports)
4. **Network**: Make sure frontend and contract are on same network

## 🔐 Security

- Never expose private keys in frontend code
- Always validate contract addresses
- Use environment variables for sensitive config
- Implement transaction timeout handling
- Add retry logic for failed transactions

## 📚 Resources

- [Stellar Docs](https://developers.stellar.org/docs)
- [Soroban Docs](https://soroban.stellar.org/docs)
- [Freighter API](https://www.freighter.app/api)
