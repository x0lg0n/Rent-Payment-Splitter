# Technical Specification: Escrow Service Interface

## Overview

This document specifies the interface between the frontend TypeScript code and the Soroban escrow smart contract.

---

## Contract Information

**Contract ID:** `NEXT_PUBLIC_ESCROW_CONTRACT_ID` (from env)  
**Network:** Stellar Testnet  
**RPC Endpoint:** `https://soroban-testnet.stellar.org`  
**Network Passphrase:** `Test SDF Network ; September 2015`

---

## Smart Contract Functions

### 1. initialize

Creates a new escrow for rent splitting.

**Signature:**
```rust
pub fn initialize(
    env: Env,
    creator: Address,
    landlord: Address,
    token: Address,
    participants: Vec<Address>,
    shares: Vec<i128>,
    deadline: u64,
) -> u64
```

**TypeScript Interface:**
```typescript
interface InitializeParams {
  creator: string;        // Stellar address (G...)
  landlord: string;       // Stellar address (G...)
  token: string;          // Token contract address (SAC)
  participants: string[]; // Array of Stellar addresses
  shares: bigint[];       // Array of share amounts (in token decimals)
  deadline: number;       // Unix timestamp (seconds)
}

interface InitializeResult {
  escrowId: bigint;       // Unique escrow identifier
  hash: string;           // Transaction hash
}
```

**Example Usage:**
```typescript
const result = await escrowService.createEscrow({
  creator: "GABC...",
  landlord: "GDEF...",
  token: "USDC_CONTRACT_ID",
  participants: ["GABC...", "GXYZ..."],
  shares: [500_0000000n, 500_0000000n], // 500.0000000 each
  deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours
});
```

**Errors:**
- `"Must have at least one participant"` - Empty participants array
- `"Participants and shares length mismatch"` - Array length mismatch
- `"Deadline must be in the future"` - Deadline <= current timestamp
- `"Share amount must be greater than 0"` - Zero or negative share
- `"Total rent overflow protection"` - Sum exceeds i128::MAX / 2

---

### 2. deposit

Deposits tokens into escrow from a participant.

**Signature:**
```rust
pub fn deposit(env: Env, escrow_id: u64, participant: Address) -> bool
```

**TypeScript Interface:**
```typescript
interface DepositParams {
  escrowId: bigint;
  participant: string;  // Must be in participants list
}

interface DepositResult {
  success: boolean;
  hash: string;
}
```

**Example Usage:**
```typescript
const result = await escrowService.deposit(escrowId, participantAddress);
```

**Errors:**
- `"Escrow is not active"` - Status != Active
- `"Escrow deadline passed"` - Current time > deadline
- `"Participant already deposited"` - Already deposited
- `"Participant not found in escrow"` - Address not in participants

**State Changes:**
- Participant status: `Pending` → `Deposited`
- Escrow `deposited_amount` increases
- Escrow status may change to `FullyFunded` if fully funded

---

### 3. release

Releases funds to landlord when fully funded.

**Signature:**
```rust
pub fn release(env: Env, escrow_id: u64) -> bool
```

**TypeScript Interface:**
```typescript
interface ReleaseParams {
  escrowId: bigint;
}

interface ReleaseResult {
  success: boolean;
  hash: string;
}
```

**Example Usage:**
```typescript
const result = await escrowService.release(escrowId);
```

**Authorization:**
- Requires landlord signature

**Errors:**
- `"Escrow not fully funded"` - deposited_amount < total_rent
- `"Escrow already released"` - Status == Released

**State Changes:**
- Escrow status: `FullyFunded` → `Released`
- Tokens transferred to landlord

---

### 4. refund

Refunds participant after deadline if not fully funded.

**Signature:**
```rust
pub fn refund(env: Env, escrow_id: u64, participant: Address) -> bool
```

**TypeScript Interface:**
```typescript
interface RefundParams {
  escrowId: bigint;
  participant: string;
}

interface RefundResult {
  success: boolean;
  hash: string;
}
```

**Example Usage:**
```typescript
const result = await escrowService.refund(escrowId, participantAddress);
```

**Preconditions:**
- Status == Active OR Refunding
- Current time > deadline
- deposited_amount < total_rent

**Errors:**
- `"Escrow is not in refundable state"` - Invalid status
- `"Deadline has not passed yet"` - Time <= deadline
- `"Escrow is fully funded"` - Cannot refund fully funded escrow
- `"Participant has not deposited"` - Status != Deposited

**State Changes:**
- Participant status: `Deposited` → `Refunded`
- Escrow `deposited_amount` decreases
- Status may change to `Refunding` or `Refunded`

---

### 5. dispute

Raises a dispute on the escrow.

**Signature:**
```rust
pub fn dispute(env: Env, escrow_id: u64, reason: Symbol) -> bool
```

**TypeScript Interface:**
```typescript
interface DisputeParams {
  escrowId: bigint;
  reason: string;  // Symbol string (max 10 chars)
}

interface DisputeResult {
  success: boolean;
  hash: string;
}
```

**Example Usage:**
```typescript
const result = await escrowService.dispute(escrowId, "quality");
```

**Authorization:**
- Requires creator signature

**Errors:**
- `"Can only dispute Active or FullyFunded escrows"` - Invalid status

**State Changes:**
- Escrow status: `Active`/`FullyFunded` → `Disputed`

---

### 6. resolve_dispute

Resolves a dispute (arbiter only).

**Signature:**
```rust
pub fn resolve_dispute(env: Env, escrow_id: u64, outcome: Symbol, arbiter: Address) -> bool
```

**TypeScript Interface:**
```typescript
interface ResolveDisputeParams {
  escrowId: bigint;
  outcome: "release" | "refund" | "cancel";
  arbiter: string;
}

interface ResolveDisputeResult {
  success: boolean;
  hash: string;
}
```

**Example Usage:**
```typescript
const result = await escrowService.resolveDispute(escrowId, "release", arbiterAddress);
```

**Authorization:**
- Requires arbiter signature

**Errors:**
- `"Escrow is not disputed"` - Status != Disputed
- `"Invalid outcome"` - Outcome not in [release, refund, cancel]

**State Changes:**
- `"release"` → Status: `FullyFunded`
- `"refund"` → Status: `Refunding`
- `"cancel"` → Status: `Active`

---

### 7. get_escrow_by_id

Retrieves escrow details.

**Signature:**
```rust
pub fn get_escrow_by_id(env: Env, escrow_id: u64) -> EscrowData
```

**TypeScript Interface:**
```typescript
interface GetEscrowByIdParams {
  escrowId: bigint;
}

// Returns EscrowData
```

**Example Usage:**
```typescript
const escrow = await escrowService.getEscrowById(escrowId);
```

**Returns:**
```typescript
{
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
```

**Errors:**
- `"Escrow not found"` - Invalid escrow ID

---

### 8. get_participants

Gets all participants for an escrow.

**Signature:**
```rust
pub fn get_participants(env: Env, escrow_id: u64) -> Vec<Participant>
```

**TypeScript Interface:**
```typescript
interface GetParticipantsParams {
  escrowId: bigint;
}

// Returns Participant[]
```

**Example Usage:**
```typescript
const participants = await escrowService.getParticipants(escrowId);
```

**Returns:**
```typescript
[
  {
    address: string;
    share_amount: bigint;
    status: ParticipantStatus;
  }
]
```

---

### 9. get_participant_status

Gets individual participant status.

**Signature:**
```rust
pub fn get_participant_status(
    env: Env,
    escrow_id: u64,
    participant: Address,
) -> (ParticipantStatus, i128)
```

**TypeScript Interface:**
```typescript
interface GetParticipantStatusParams {
  escrowId: bigint;
  participant: string;
}

interface GetParticipantStatusResult {
  status: ParticipantStatus;
  shareAmount: bigint;
}
```

**Example Usage:**
```typescript
const { status, shareAmount } = await escrowService.getParticipantStatus(
  escrowId,
  participantAddress
);
```

**Errors:**
- `"Participant not found"` - Address not in participants

---

### 10. can_refund

Checks if escrow is refundable.

**Signature:**
```rust
pub fn can_refund(env: Env, escrow_id: u64) -> bool
```

**TypeScript Interface:**
```typescript
interface CanRefundParams {
  escrowId: bigint;
}

// Returns boolean
```

**Example Usage:**
```typescript
const canRefund = await escrowService.canRefund(escrowId);
```

**Returns `true` when:**
- Status == Active OR Refunding
- Current time > deadline
- deposited_amount < total_rent

---

### 11. get_all_escrow_ids_paginated

Gets escrow IDs with pagination.

**Signature:**
```rust
pub fn get_all_escrow_ids_paginated(env: Env, offset: u64, limit: u64) -> Vec<u64>
```

**TypeScript Interface:**
```typescript
interface GetAllEscrowIdsParams {
  offset?: bigint;  // Default: 0
  limit?: bigint;   // Default: 100
}

// Returns bigint[]
```

**Example Usage:**
```typescript
// First page
const page1 = await escrowService.getAllEscrowIds(0n, 10n);

// Second page
const page2 = await escrowService.getAllEscrowIds(10n, 10n);
```

---

### 12. get_escrow_count

Gets total number of escrows.

**Signature:**
```rust
pub fn get_escrow_count(env: Env) -> u64
```

**TypeScript Interface:**
```typescript
// Returns bigint
const count = await escrowService.getEscrowCount();
```

---

## Data Types

### EscrowStatus

```typescript
type EscrowStatus =
  | "Active"         // Escrow created, accepting deposits
  | "FullyFunded"    // All participants deposited
  | "Released"       // Funds released to landlord
  | "Refunding"      // Refunds in progress
  | "Refunded"       // All funds refunded
  | "Disputed";      // Dispute raised
```

### ParticipantStatus

```typescript
type ParticipantStatus =
  | "Pending"    // Not yet deposited
  | "Deposited"  // Has deposited funds
  | "Refunded"   // Received refund
  | "Released";  // Funds released (as part of group)
```

### EscrowData

```typescript
interface EscrowData {
  id: bigint;              // Unique identifier
  creator: string;         // Creator address
  landlord: string;        // Landlord address
  token: string;           // Token contract address
  participants: Participant[];
  total_rent: bigint;      // Total expected amount
  deposited_amount: bigint; // Current deposited amount
  deadline: bigint;        // Unix timestamp
  status: EscrowStatus;
  created_at: bigint;      // Creation timestamp
}
```

### Participant

```typescript
interface Participant {
  address: string;         // Stellar address
  share_amount: bigint;    // Expected share
  status: ParticipantStatus;
}
```

---

## Contract Events

### EscrowCreated

```typescript
interface EscrowCreatedEvent {
  escrow_id: bigint;
  creator: string;
  landlord: string;
  token: string;
  total_rent: bigint;
}
```

### DepositMade

```typescript
interface DepositMadeEvent {
  escrow_id: bigint;
  participant: string;
  amount: bigint;
}
```

### EscrowReleased

```typescript
interface EscrowReleasedEvent {
  escrow_id: bigint;
  landlord: string;
  amount: bigint;
}
```

### RefundProcessed

```typescript
interface RefundProcessedEvent {
  escrow_id: bigint;
  participant: string;
  amount: bigint;
}
```

### StatusChanged

```typescript
interface StatusChangedEvent {
  escrow_id: bigint;
  old_status: EscrowStatus;
  new_status: EscrowStatus;
}
```

### DisputeRaised

```typescript
interface DisputeRaisedEvent {
  escrow_id: bigint;
  raised_by: string;
  reason: string;  // Symbol
}
```

### DisputeResolved

```typescript
interface DisputeResolvedEvent {
  escrow_id: bigint;
  resolved_by: string;
  outcome: string;  // Symbol
}
```

---

## Event Listening

```typescript
// Listen to all events for an escrow
const unsubscribe = await escrowService.listenToEvents(escrowId, (event) => {
  console.log("Event received:", event);
  
  switch (event.type) {
    case "deposit_made":
      // Update UI with new deposit
      break;
    case "status_changed":
      // Update escrow status
      break;
    case "escrow_released":
      // Show success message
      break;
  }
});

// Stop listening
unsubscribe();
```

---

## Error Handling

### Transaction Errors

```typescript
try {
  await escrowService.deposit(escrowId, participant);
} catch (error) {
  if (error.name === "UserRejectedError") {
    // User rejected transaction in wallet
  } else if (error.name === "SimulationError") {
    // Contract simulation failed
    console.error("Simulation error:", error.message);
  } else if (error.name === "TimeoutError") {
    // Transaction confirmation timeout
  } else {
    // Unknown error
  }
}
```

### Contract Errors

Contract errors are returned as strings in panic messages:

```typescript
// Always check error.message for contract panic reason
assert!(condition, "Error message here");
```

---

## Rate Limiting

Recommended rate limits for frontend:

| Operation | Rate Limit | Reason |
|-----------|-----------|--------|
| Read operations | 10/sec | Horizon/RPC limits |
| Write operations | 1/5sec | User needs to sign |
| Event polling | 1/10sec | Avoid excessive RPC calls |
| Balance refresh | 1/5sec | Network limits |

---

## Gas/Fees

Estimated fees per operation (testnet):

| Operation | Estimated Fee (XLM) |
|-----------|---------------------|
| initialize | 0.0001 - 0.001 |
| deposit | 0.0001 - 0.001 |
| release | 0.0001 - 0.001 |
| refund | 0.0001 - 0.001 |
| dispute | 0.0001 - 0.001 |
| resolve_dispute | 0.0001 - 0.001 |

**Note:** Fees vary based on network congestion and computational complexity.

---

## Security Considerations

### Frontend

1. **Never store private keys** - Use wallet signing only
2. **Validate all inputs** - Check addresses, amounts before sending
3. **Handle auth properly** - Ensure user signs correct transactions
4. **Rate limit API calls** - Prevent abuse
5. **Use HTTPS** - Always in production

### Contract

1. **Reentrancy protection** - Implemented via transfer guard
2. **Overflow protection** - Checked arithmetic
3. **Access control** - Auth required for sensitive operations
4. **Deadline enforcement** - Time-based checks
5. **State validation** - Status checks before operations

---

## Testing Strategy

### Unit Tests (Contract)

```bash
cd SplitRent && cargo test
# 28 tests passing
```

### Integration Tests (Frontend)

```typescript
describe("EscrowService Integration", () => {
  it("should create escrow", async () => {
    const result = await escrowService.createEscrow(params);
    expect(result.escrowId).toBeDefined();
  });

  it("should deposit tokens", async () => {
    const result = await escrowService.deposit(escrowId, participant);
    expect(result.success).toBe(true);
  });

  // ... more tests
});
```

### E2E Tests

```typescript
describe("Full Escrow Flow", () => {
  it("should complete full rent payment flow", async () => {
    // 1. Create escrow
    // 2. All participants deposit
    // 3. Landlord releases
    // 4. Verify final state
  });
});
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-07  
**Status:** Ready for Implementation
