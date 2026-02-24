# SplitRent TODO Breakdown (Small Tasks)

This file is the day-to-day execution checklist derived from `plan.md` and `PRD.md`.

## 0) Setup and Baseline (Start Here)

- [x] Confirm repo layout:
  - [x] `frontend/` Next.js app boots.
  - [x] Smart contract workspace path created (`contracts/` or agreed equivalent).
  - [x] Docs files present: `PRD.md`, `STACK.md`, `plan.md`, `todo.md`.
- [x] Tooling baseline:
  - [x] Install dependencies with `pnpm`.
  - [x] Verify `pnpm dev` works.
  - [x] Verify `pnpm lint` works.
  - [x] Add `pnpm typecheck` script (if missing).
- [x] Environment baseline:
  - [x] Create `.env.example` with required variables.
  - [x] Add network config defaults to Stellar testnet.
  - [x] Add explorer base URL config.
- [x] Dependency policy execution:
  - [x] Use latest stable package versions.
  - [x] Commit lockfile after install/update.
  - [x] Document any version pin exceptions in PR notes.

## 1) Level 1 - White Belt (Micro Tasks)

### 1.1 App Skeleton and UI Shell
- [x] Replace starter `app/page.tsx` with SplitRent landing shell.
- [x] Add sections: hero, wallet status, balance card, payment form.
- [x] Add reusable UI primitives (`Button`, `Card`, `Input`, `Toast`).

### 1.2 Wallet Connection (Freighter first)
- [x] Create wallet adapter folder: `frontend/lib/wallet/`.
- [x] Implement `connectWallet()`.
- [x] Implement `disconnectWallet()`.
- [x] Implement `getPublicKey()` state hydration on reload.
- [x] Add wallet-not-installed state with install link.

### 1.3 Balance
- [x] Create Stellar service: `frontend/lib/stellar/horizon.ts`.
- [x] Implement `getXlmBalance(address)`.
- [x] Add loading/empty/error states in UI.
- [x] Add 30-second auto-refresh + manual refresh button.

### 1.4 Simple Payment Flow
- [x] Add form validation:
  - [x] Recipient format validation (`G...` and expected length).
  - [x] Amount > 0 validation.
- [x] Implement `sendPayment(recipient, amount)` service.
- [x] Add pending/success/failure transaction UI states.
- [x] Show transaction hash + copy button + explorer link.

### 1.5 Level 1 Hardening
- [x] Centralize error-to-message mapping.
- [ ] Add telemetry hooks placeholder for tx failures.
- [x] Add screenshot checklist for deliverables.

### 1.6 Level 1 Tests and Docs
- [x] Unit tests for validators.
- [ ] Component tests for wallet/balance/payment states.
- [x] Update `frontend/README.md` with setup and run steps.
- [x] Add Level 1 evidence section to root `README.md`.

### 1.7 Level 1 Commit Plan (target: 5 commits)
- [x] `feat(ui): replace starter page with SplitRent level-1 shell`
- [x] `feat(wallet): implement freighter connect/disconnect and status`
- [x] `feat(balance): add xlm balance fetch with auto-refresh`
- [x] `feat(payment): implement xlm transfer flow with tx feedback`
- [x] `test/docs: add level-1 tests and update setup/evidence docs`

## 2) Level 2 - Yellow Belt (Micro Tasks)

### 2.1 Multi-Wallet
- [ ] Integrate StellarWalletsKit.
- [ ] Add wallet selection modal (Freighter/xBull/Albedo).
- [ ] Persist selected wallet in local storage.
- [ ] Add wallet switch action.

### 2.2 Error Handling Upgrade
- [ ] Implement typed error catalog.
- [ ] Map wallet/network/validation failures to UX-safe messages.
- [ ] Add retry paths for recoverable failures.

### 2.3 Soroban Escrow Contract
- [ ] Scaffold escrow contract.
- [ ] Implement `initialize`.
- [ ] Implement `deposit`.
- [ ] Implement `release`.
- [ ] Implement `refund`.
- [ ] Implement `get_status`.

### 2.4 Frontend Contract Integration
- [ ] Add contract client wrapper.
- [ ] Wire deposit action from UI.
- [ ] Show per-participant payment status.
- [ ] Add polling/realtime refresh (15s).

### 2.5 Level 2 Commit Plan (target: 6 commits)
- [ ] Multi-wallet integration.
- [ ] Error handling framework.
- [ ] Contract scaffold + initialize/deposit.
- [ ] Release/refund/status contract logic.
- [ ] Frontend contract integration and status UI.
- [ ] Docs + explorer evidence + tests.

## 3) Level 3 - Orange Belt (Micro Tasks)

- [ ] Group CRUD model and screens.
- [ ] Equal/percentage/fixed split engines + validations.
- [ ] Payment history table + filter + search.
- [ ] CSV export + receipt PDF generation.
- [ ] Reminder model and notification UI.
- [ ] Caching strategy implementation.
- [ ] Minimum 3 passing tests and E2E happy path.
- [ ] Demo video + comprehensive docs.
- [ ] Commit target: 8.

## 4) Level 4 - Green Belt (Micro Tasks)

- [ ] Advanced contract pattern (inter-contract or approved alternative).
- [ ] Multi-asset payment flow in UI.
- [ ] CI/CD workflows with required checks.
- [ ] Performance optimization pass + Lighthouse evidence.
- [ ] Mobile responsiveness QA and screenshots.
- [ ] Commit target: 10 (PRD min: 8).

## 5) Level 5 - Blue Belt (Micro Tasks)

- [ ] Mentor review pack (architecture + market fit + acquisition plan).
- [ ] MVP launch hardening and bugfix sprint.
- [ ] Onboard 5+ verified users.
- [ ] Collect and analyze user feedback.
- [ ] Ship one product iteration from feedback.
- [ ] Commit target: 12 (PRD min: 10).

## 6) Level 6 - Black Belt (Micro Tasks)

- [ ] Scale onboarding to 30+ verified users.
- [ ] Monitoring, alerts, and incident response checklist.
- [ ] Metrics dashboard and indexing evidence.
- [ ] Security checklist completion.
- [ ] Demo Day deck and rehearsal package.
- [ ] Commit target: 30+.

## 7) Weekly Operating Cadence

- [ ] Monday: plan sprint tasks and branch strategy.
- [ ] Daily: close 3-5 checklist items and push atomic commits.
- [ ] Friday: evidence collection, README/changelog sync, PR grooming.
- [ ] End of level: merge-commit PR, tag release, update `plan.md` and `todo.md`.

## 8) Immediate Next 10 Tasks (Do These First)

- [x] 1. Replace `frontend/app/page.tsx` starter UI with Level 1 layout shell.
- [x] 2. Add `frontend/lib/wallet/freighter.ts`.
- [x] 3. Add `frontend/lib/stellar/horizon.ts`.
- [x] 4. Build connect/disconnect wallet UI states.
- [x] 5. Add balance card with auto-refresh.
- [x] 6. Build payment form + client-side validation.
- [x] 7. Implement testnet payment transaction service.
- [x] 8. Add transaction feedback UI (pending/success/error).
- [x] 9. Add validator tests.
- [x] 10. Update docs and capture Level 1 evidence screenshots.
