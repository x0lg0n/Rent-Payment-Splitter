# 🎨 Escrow UI & Workflow Guide

## Overview

This document explains **what the UI looks like**, **how it works**, **what needs to be built**, and **what features to add next** for the SplitRent escrow system.

---

## 📱 Current UI Screens

### 1. Create Escrow Page

**Location:** `/escrow/create`

**Current State:** ✅ Built (needs contract integration)

**UI Components:**
```
┌────────────────────────────────────────────────────┐
│  ← Back                                            │
│  Create Rent Escrow                                │
│  Set up a rent splitting escrow on Stellar         │
├────────────────────────────────────────────────────┤
│                                                    │
│  Landlord Address *                                │
│  [GABC...________________________________]        │
│                                                    │
│  Participants & Shares                             │
│  ┌──────────────────────────────────────────┐     │
│  │ Participant 1                            │     │
│  │ Address: [GXYZ...______________________] │     │
│  │ Share:   [500_________________________]  │  ✕  │
│  └──────────────────────────────────────────┘     │
│                                                    │
│  ┌──────────────────────────────────────────┐     │
│  │ Participant 2                            │     │
│  │ Address: [GDEF...______________________] │     │
│  │ Share:   [500_________________________]  │  ✕  │
│  └──────────────────────────────────────────┘     │
│                                                    │
│  [+ Add Participant]                               │
│                                                    │
│  Deadline *                                        │
│  [📅 Select Date] [⏰ Select Time]                │
│                                                    │
│  ┌──────────────────────────────────────────┐     │
│  │ Summary                                  │     │
│  │ Total Rent: 1,000 XLM                    │     │
│  │ Participants: 2                          │     │
│  │ Deadline: Mar 15, 2026 12:00 PM          │     │
│  └──────────────────────────────────────────┘     │
│                                                    │
│  [Cancel]          [Create Escrow →]              │
│                                                    │
├────────────────────────────────────────────────────┤
│ ℹ️ How Escrow Works                                │
│ 1. Create escrow - Transaction signed              │
│ 2. Share link with roommates                       │
│ 3. When fully funded - Landlord releases           │
│ 4. If deadline passes - Request refunds            │
└────────────────────────────────────────────────────┘
```

**User Flow:**
1. User connects wallet (Freighter/xBull/Albedo/Rabet)
2. Enters landlord address
3. Adds participants with their share amounts
4. Sets deadline
5. Clicks "Create Escrow"
6. Wallet popup appears to sign transaction
7. On success → Redirects to escrow detail page

**What Needs Integration:**
- ✅ Form validation (complete)
- ✅ UI components (complete)
- ⏳ Connect to `escrowService.createEscrow()` (needs SDK v15)
- ⏳ Show real transaction progress
- ⏳ Handle contract errors

---

### 2. Escrow Detail Page

**Location:** `/escrow/[id]`

**Current State:** ✅ Built (needs contract integration)

**UI Components:**
```
┌────────────────────────────────────────────────────┐
│  ← Back                        [Share] [Active]   │
│  Escrow Details                                    │
│  ID: ABC123...                                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌─ Escrow Status ───────────────────────────┐   │
│  │ 👥 2 of 2 participants deposited           │   │
│  │ [Fully Funded ✓]                           │   │
│  │                                            │   │
│  │ Progress: ████████████████████ 100%       │   │
│  │ 1,000 / 1,000 XLM                          │   │
│  │                                            │   │
│  │ ⏰ Deadline: Mar 15, 2026                  │   │
│  │ Ready to release to landlord               │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  ┌─ Participants ────────────────────────────┐   │
│  │ ✓ You (Landlord)                          │   │
│  │   GABC...1234                             │   │
│  │   500 XLM  [Deposited ✓]                  │   │
│  │                                           │   │
│  │ ✓ Participant 2                           │   │
│  │   GDEF...5678                             │   │
│  │   500 XLM  [Deposited ✓]                  │   │
│  │                                           │   │
│  │ [Release Funds to Landlord]               │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  ┌─ Contract Information ────────────────────┐   │
│  │ Contract: CBUMZ3VLJ3IINXLXTS72V6AM...    │   │
│  │ Network: Stellar Testnet                  │   │
│  │ Escrow ID: 1234567890                     │   │
│  │                                           │   │
│  │ [View on Explorer] [Open Stellar Lab]    │   │
│  └────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

**User Flow (Participant):**
1. User opens escrow link
2. Sees funding progress
3. If not deposited → Shows "Deposit Your Share" button
4. Clicks deposit → Wallet signs transaction
5. UI updates to show "Deposited ✓"

**User Flow (Landlord):**
1. See all participants deposited
2. "Release Funds" button becomes enabled
3. Clicks release → Wallet signs transaction
4. Funds transferred to landlord
5. Status changes to "Released"

**What Needs Integration:**
- ✅ Display escrow data (needs real contract fetch)
- ✅ Progress bar (needs real deposit status)
- ⏳ Deposit button → `escrowService.deposit()`
- ⏳ Release button → `escrowService.release()`
- ⏳ Real-time status updates (contract events)

---

### 3. Dashboard Page

**Location:** `/dashboard`

**Current State:** ✅ Built

**Features:**
- Wallet connection status
- Balance display
- Quick actions (Create Escrow, View All)
- Transaction history
- Escrow count summary

**What Needs Integration:**
- ⏳ Show real escrow count from contract
- ⏳ Load user's escrows from chain
- ⏳ Real-time balance updates

---

## 🔄 Complete Workflow

### Workflow 1: Create Escrow

```
User (Creator)                Frontend                    Smart Contract
    │                            │                              │
    ├──1. Connect Wallet────────>│                              │
    │                            │                              │
    ├──2. Fill Form─────────────>│                              │
    │   - Landlord               │                              │
    │   - Participants           │                              │
    │   - Shares                 │                              │
    │   - Deadline               │                              │
    │                            │                              │
    ├──3. Create Escrow─────────>│                              │
    │                            ├──4. Build Transaction───────>│
    │                            │   - Call initialize()        │
    │                            │   - Simulate                 │
    │                            │   - Get auth entries         │
    │                            │                              │
    │<──5. Sign Tx (Wallet)──────│                              │
    │                            │                              │
    │                            ├──6. Submit Tx───────────────>│
    │                            │                              │
    │                            │<──7. Escrow ID Created───────│
    │                            │                              │
    │<──8. Success + Redirect────│                              │
    │   - Show escrow ID         │                              │
    │   - Navigate to detail     │                              │
    │                            │                              │
```

### Workflow 2: Deposit Funds

```
User (Participant)           Frontend                    Smart Contract
    │                            │                              │
    ├──1. Open Escrow Link──────>│                              │
    │                            │                              │
    │                            ├──2. Fetch Escrow Data───────>│
    │                            │   - Call get_escrow_by_id()  │
    │<───────────────────────────│                              │
    │   - Show participants      │                              │
    │   - Show deposit status    │                              │
    │                            │                              │
    ├──3. Click "Deposit"───────>│                              │
    │                            │                              │
    │                            ├──4. Build Transaction───────>│
    │                            │   - Call deposit()           │
    │                            │   - Transfer tokens          │
    │                            │                              │
    │<──5. Sign Tx (Wallet)──────│                              │
    │                            │                              │
    │                            ├──6. Submit Tx───────────────>│
    │                            │                              │
    │                            │<──7. Deposit Success─────────│
    │                            │   - Update status            │
    │                            │   - Emit event               │
    │                            │                              │
    │<──8. Update UI─────────────│                              │
    │   - Show "Deposited ✓"     │                              │
    │   - Update progress bar    │                              │
    │                            │                              │
```

### Workflow 3: Release Funds

```
User (Landlord)              Frontend                    Smart Contract
    │                            │                              │
    ├──1. Open Escrow───────────>│                              │
    │                            │                              │
    │                            ├──2. Check Status────────────>│
    │                            │   - Call get_escrow_by_id()  │
    │<───────────────────────────│                              │
    │   - Show "Fully Funded"    │                              │
    │   - Enable "Release" btn   │                              │
    │                            │                              │
    ├──3. Click "Release"───────>│                              │
    │                            │                              │
    │                            ├──4. Build Transaction───────>│
    │                            │   - Call release()           │
    │                            │   - Transfer to landlord     │
    │                            │                              │
    │<──5. Sign Tx (Wallet)──────│                              │
    │                            │                              │
    │                            ├──6. Submit Tx───────────────>│
    │                            │                              │
    │                            │<──7. Release Success─────────│
    │                            │   - Status = Released        │
    │                            │   - Emit event               │
    │                            │                              │
    │<──8. Success Message───────│                              │
    │   - "Funds Released"       │                              │
    │   - Navigate to dashboard  │                              │
    │                            │                              │
```

### Workflow 4: Refund (After Deadline)

```
User (Participant)           Frontend                    Smart Contract
    │                            │                              │
    ├──1. Open Escrow───────────>│                              │
    │                            │                              │
    │                            ├──2. Check Deadline──────────>│
    │                            │   - Call can_refund()        │
    │<───────────────────────────│                              │
    │   - Show "Can Refund"      │                              │
    │   - Enable "Refund" btn    │                              │
    │                            │                              │
    ├──3. Click "Refund"────────>│                              │
    │                            │                              │
    │                            ├──4. Build Transaction───────>│
    │                            │   - Call refund()            │
    │                            │   - Transfer back            │
    │                            │                              │
    │<──5. Sign Tx (Wallet)──────│                              │
    │                            │                              │
    │                            ├──6. Submit Tx───────────────>│
    │                            │                              │
    │                            │<──7. Refund Success──────────│
    │                            │   - Status = Refunded        │
    │                            │                              │
    │<──8. Refund Received───────│                              │
    │   - Show success           │                              │
    │   - Update UI              │                              │
    │                            │                              │
```

---

## 🛠️ What Needs to Be Built

### Priority 1: Core Integration (High Priority)

#### 1. Fix Contract Service
**Files:** `lib/stellar/contract.ts`, `lib/stellar/soroban.ts`

**Tasks:**
- [ ] Wait for/upgrade to SDK v15+
- [ ] Remove `soroban-client` dependency
- [ ] Use `SorobanRpc.Server` from SDK
- [ ] Fix simulation response types
- [ ] Test all contract methods

**Estimated Time:** 2-4 hours (when SDK available)

#### 2. Update UI Components
**Files:** `app/escrow/create/page.tsx`, `app/escrow/[id]/page.tsx`

**Tasks:**
- [ ] Update `createEscrow()` API call (fix parameter mismatch)
- [ ] Add real loading states during transactions
- [ ] Show transaction hash in toast
- [ ] Add link to Stellar Expert
- [ ] Handle contract errors gracefully

**Estimated Time:** 1-2 hours

#### 3. Add Real-Time Updates
**Files:** `lib/hooks/use-escrow.ts`, `app/escrow/[id]/page.tsx`

**Tasks:**
- [ ] Listen to contract events
- [ ] Auto-refresh escrow status
- [ ] Show live deposit updates
- [ ] WebSocket connection for events

**Estimated Time:** 2-3 hours

---

### Priority 2: Enhanced Features (Medium Priority)

#### 4. Token Integration
**What:** Support USDC or other SAC tokens (not just XLM)

**Files to Create:**
- `lib/stellar/token.ts` - Token service
- `components/escrow/token-selector.tsx` - Token selection UI

**Tasks:**
- [ ] Deploy/test with SAC token
- [ ] Add token approval flow
- [ ] Update create escrow form to select token
- [ ] Show token balances

**Estimated Time:** 4-6 hours

#### 5. Multi-Escrow Dashboard
**What:** View and manage all escrows from dashboard

**Files to Update:**
- `app/dashboard/page.tsx`
- `components/dashboard/escrow-list.tsx` (new)

**Tasks:**
- [ ] Fetch all user's escrows from contract
- [ ] Display in table with filters
- [ ] Quick actions (deposit, release, refund)
- [ ] Pagination

**Estimated Time:** 3-4 hours

#### 6. Notifications System
**What:** Email/push notifications for escrow events

**Files to Create:**
- `lib/notifications.ts` - Notification service
- `app/api/notify/route.ts` - API endpoint

**Tasks:**
- [ ] Listen to contract events
- [ ] Send email on deposit/release/refund
- [ ] Push notifications (optional)
- [ ] Notification preferences

**Estimated Time:** 4-6 hours

---

### Priority 3: Advanced Features (Low Priority)

#### 7. Dispute Resolution UI
**What:** Interface for raising and resolving disputes

**Files to Create:**
- `components/escrow/dispute-modal.tsx`
- `app/escrow/[id]/dispute/page.tsx`

**Tasks:**
- [ ] Add "Raise Dispute" button
- [ ] Dispute reason selection
- [ ] Arbiter interface for resolution
- [ ] Status updates

**Estimated Time:** 3-4 hours

#### 8. Recurring Rent
**What:** Automatic monthly escrow creation

**Files to Create:**
- `lib/scheduler.ts` - Recurring job scheduler
- `components/escrow/recurring-settings.tsx`

**Tasks:**
- [ ] Set up recurring schedule
- [ ] Auto-create escrow each month
- [ ] Notify participants
- [ ] Manage recurring settings

**Estimated Time:** 6-8 hours

#### 9. Analytics Dashboard
**What:** Track rent payment history and metrics

**Files to Create:**
- `app/analytics/page.tsx`
- `components/analytics/payment-history.tsx`

**Tasks:**
- [ ] Payment history chart
- [ ] On-time payment rate
- [ ] Total rent paid
- [ ] Export to CSV

**Estimated Time:** 4-5 hours

---

## 📋 Feature Roadmap

### Phase 1: Core Functionality (Now)
- ✅ Smart contract deployed
- ✅ UI components built
- ⏳ Contract integration (waiting for SDK v15)
- ⏳ Basic deposit/release/refund flows

**Timeline:** 1-2 weeks (dependent on SDK)

### Phase 2: Enhanced UX (2-4 weeks)
- Token support (USDC, etc.)
- Multi-escrow dashboard
- Real-time notifications
- Better error handling

**Timeline:** 2-4 weeks

### Phase 3: Advanced Features (1-2 months)
- Dispute resolution
- Recurring rent
- Analytics dashboard
- Mobile app (React Native)

**Timeline:** 1-2 months

### Phase 4: Production Ready (2-3 months)
- Security audit
- Mainnet deployment
- Performance optimization
- User testing

**Timeline:** 2-3 months

---

## 🎯 Next Immediate Actions

### This Week
1. **Monitor SDK v15 release**
   ```bash
   npm view @stellar/stellar-sdk versions
   ```

2. **Fix remaining type errors** (8 errors, ~1 hour)
   - Update UI component imports
   - Fix use-escrow.ts API call

3. **Test with Soroban CLI**
   ```bash
   stellar contract invoke \
     --id CBA5V42PSZBF5EIDTFEVSBPPUWXIT6QNOVHBJM6BBDM4U33JLZ3MOGIC \
     --network testnet \
     --source YOUR_ACCOUNT \
     -- \
     get_escrow_by_id --id 0
   ```

### Next Week
4. **When SDK v15 releases:**
   ```bash
   pnpm add @stellar/stellar-sdk@^15.0.0
   pnpm remove soroban-client
   ```

5. **Test full integration:**
   - Create escrow
   - Deposit funds
   - Release to landlord
   - Test refund flow

6. **Deploy to staging** (Vercel)

---

## 📊 Current Status Summary

| Component | Status | Progress | Next Step |
|-----------|--------|----------|-----------|
| Smart Contract | ✅ Complete | 100% | Deploy to mainnet |
| UI Components | ✅ Complete | 100% | Connect to contract |
| Contract Service | ⏳ Blocked | 90% | Wait for SDK v15 |
| React Hook | ⏳ Needs Update | 85% | Fix API call |
| Documentation | ✅ Complete | 100% | - |

**Overall Progress:** 85% complete

---

## 🎨 UI Screenshots Reference

### What the UI Currently Looks Like

The UI is **fully built and styled** with:
- Modern, clean design
- Responsive layout (mobile-friendly)
- Wallet connection (4 wallets supported)
- Form validation
- Toast notifications
- Progress indicators
- Status badges

**What's Missing:**
- Real contract data (currently using mock data)
- Live transaction updates
- Actual deposit/release functionality

**When SDK v15 is ready:**
- Just connect the existing UI to the contract service
- Everything else is done!

---

**Document Created:** 2026-03-07  
**Status:** UI Ready, Waiting for SDK v15 🚀  
**Next Action:** Fix remaining type errors, monitor SDK release
