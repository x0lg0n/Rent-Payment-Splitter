# Quick Start: Escrow Integration

## 🎯 Immediate Action Items

### Step 1: Deploy Contract (5 minutes)

```bash
cd SplitRent
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source YOUR_TESTNET_ACCOUNT \
  --network testnet
```

**Save the output contract ID!** Example: `CBUMZ3VLJ3IINXLXTS72V6AMGPOFIYRDRQCDWV7BBYNIS4RAX2U6T2AM`

---

### Step 2: Update Environment (2 minutes)

**File:** `frontend/.env.local`

```bash
# Add these lines
NEXT_PUBLIC_ESCROW_CONTRACT_ID=<YOUR_DEPLOYED_CONTRACT_ID>
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

---

### Step 3: Upgrade SDK (2 minutes)

```bash
cd frontend
pnpm add @stellar/stellar-sdk@^15.0.0
```

---

### Step 4: Implementation Order

Follow this sequence for integration:

```
1. ✅ Deploy contract (Step 1)
2. ✅ Update .env.local (Step 2)  
3. ✅ Upgrade SDK (Step 3)
4. 📝 Create frontend/lib/stellar/soroban.ts
5. 📝 Create frontend/lib/contract-abi.ts
6. 📝 Update frontend/lib/stellar/contract.ts
7. 📝 Create frontend/lib/hooks/use-escrow.ts
8. 📝 Update frontend/app/escrow/create/page.tsx
9. 📝 Update frontend/app/escrow/[id]/page.tsx
10. 📝 Update frontend/app/escrow/page.tsx
11. 🧪 Test integration
```

---

## 📁 Files to Create/Modify

### New Files (Create These)

| File | Purpose | Lines of Code |
|------|---------|---------------|
| `frontend/lib/stellar/soroban.ts` | Soroban RPC utilities | ~100 |
| `frontend/lib/contract-abi.ts` | TypeScript types | ~150 |
| `frontend/lib/hooks/use-escrow.ts` | React hook | ~250 |

**Total: ~500 lines of new code**

### Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `frontend/lib/stellar/contract.ts` | Complete EscrowService | 🔴 Critical |
| `frontend/.env.local` | Add contract config | 🔴 Critical |
| `frontend/package.json` | Upgrade SDK | 🔴 Critical |
| `frontend/app/escrow/create/page.tsx` | Connect to service | 🟡 High |
| `frontend/app/escrow/[id]/page.tsx` | Add real actions | 🟡 High |
| `frontend/app/escrow/page.tsx` | Load from chain | 🟡 High |

---

## 🧪 Testing Checklist

After implementation, test these flows:

### Critical Path
- [ ] Connect wallet (Freighter/xBull/Albedo/Rabet)
- [ ] Create new escrow with 2 participants
- [ ] Participant 1 deposits
- [ ] Participant 2 deposits
- [ ] Escrow shows "Fully Funded"
- [ ] Landlord releases funds
- [ ] Escrow shows "Released"

### Edge Cases
- [ ] Refund after deadline (partial funding)
- [ ] Cannot release without full funding
- [ ] Cannot deposit twice
- [ ] Dispute and resolve flow
- [ ] Wallet rejection handling
- [ ] Insufficient balance error

---

## 🐛 Common Issues & Solutions

### Issue: "Contract ID not configured"
**Solution:** Check `.env.local` has `NEXT_PUBLIC_ESCROW_CONTRACT_ID`

### Issue: "Simulation failed"
**Solution:** 
1. Check contract is deployed to testnet
2. Verify Soroban RPC URL is correct
3. Ensure wallet has testnet XLM for fees

### Issue: "Token transfer failed"
**Solution:**
1. Deploy/use SAC token contract
2. Check participant has token balance
3. Verify token contract ID in escrow creation

### Issue: "Transaction confirmation timeout"
**Solution:**
1. Increase polling attempts in `sendTransaction()`
2. Check network congestion
3. Verify transaction was submitted (check hash on Stellar Expert)

---

## 📊 Current Status Dashboard

```
Smart Contract:        ✅ Complete (100%)
├─ Rust Code          ✅ Complete
├─ Unit Tests         ✅ 28 passing
└─ WASM Build         ✅ 16,242 bytes

Frontend UI:          ✅ Complete (100%)
├─ Components         ✅ All built
├─ Pages              ✅ All created
└─ State Management   ✅ Zustand store

Integration:          ⚠️ In Progress (~30%)
├─ Wallet Connection  ✅ Working
├─ Balance Fetching   ✅ Working
├─ Escrow Service     ⚠️ Partial (mock)
├─ Soroban RPC        ❌ Missing
└─ Token Transfers    ❌ Missing
```

---

## 🚀 Quick Test Command

After deployment, test with:

```bash
# Build and test contract
cd SplitRent && cargo test

# Test frontend
cd frontend && pnpm dev

# Open browser
# http://localhost:3000/escrow/create
```

---

## 📞 Need Help?

### Documentation
- Full integration plan: `docs/ESCROW-INTEGRATION-PLAN.md`
- Smart contract code: `SplitRent/contracts/escrow/src/lib.rs`
- Contract tests: `SplitRent/contracts/escrow/src/test.rs`

### Resources
- [Soroban Documentation](https://soroban.stellar.org/)
- [Stellar SDK v15 Docs](https://stellar.github.io/js-stellar-sdk/)
- [Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit)

### Contract Address (After Deployment)
```
NEXT_PUBLIC_ESCROW_CONTRACT_ID=<will be generated on deploy>
```

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Deploy contract | 5 min |
| Setup environment | 5 min |
| Create soroban.ts | 30 min |
| Create contract-abi.ts | 30 min |
| Update contract.ts | 60 min |
| Create use-escrow hook | 45 min |
| Update pages | 60 min |
| Testing | 60 min |
| **Total** | **~5 hours** |

---

**Last Updated:** 2026-03-07  
**Status:** Ready to Start 🚀
