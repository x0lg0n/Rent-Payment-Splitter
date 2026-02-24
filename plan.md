# SplitRent `plan.md` (Levels 1-6 + PR-Style Commit History)

## 1) Project Context and Objective

Create this file as the single execution source of truth for Levels 1-6 from `PRD.md`, with strict level-wise milestone tracking and auditable GitHub commit history.

This plan enforces:
- One milestone PR per level.
- Non-squash merge policy.
- Minimum commit counts per PRD.
- Clear entry/exit criteria so progress is measurable and reviewable.

## 2) Working Agreements

- Scope is fixed to Levels 1-6 unless explicitly updated.
- Every implementation task must map to a PRD requirement or deliverable.
- Every level must ship with evidence artifacts (screenshots, tx hashes, test output, docs).
- No level is marked complete until all Definition of Done checks pass.
- Decisions that change interfaces, level scope, or quality gates must be documented in this file before implementation.
- Dependency policy: use latest stable versions for framework/tooling/blockchain packages unless a compatibility issue is documented.
- Version pinning policy: lock exact versions via lockfiles and record major-version upgrades in changelog/PR notes.

## 3) Global GitHub Workflow Rules

1. Branch naming: `level/<n>-<slug>` (example: `level/2-multi-wallet-escrow`).
2. PR naming: `Level <n>: <milestone title>`.
3. Merge policy: `Create a merge commit` only (no squash, no rebase merge).
4. Commit style: Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`).
5. Each commit must map to one checklist item in this `plan.md`.
6. Each PR must include: scope, linked PRD lines, test evidence, screenshots/tx hashes where relevant.
7. Tag after each level merge: `v0.<level>.0`.
8. Changelog update after each level completion.

## 4) Level-Wise Execution Matrix (L1 to L6)

| Level | Goal | Timeline | Required Output | Commit Policy | PR Gate |
|---|---|---|---|---|---|
| 1 | Wallet connect, balance, single payment | Week 1 (3-4d) | Working testnet payment flow + README + screenshots | 5 commits target | PR merged + deployed demo |
| 2 | Multi-wallet + escrow contract + realtime status | Week 1 (4d) | Deployed contract + frontend integration + explorer proof | 6 commits target (PRD min: 2) | Contract calls verifiable |
| 3 | Complete mini-dApp (groups, split logic, history, reminders, tests) | Week 2-3 (7d) | Complete dApp + tests + demo video + docs | 8 commits target (PRD min: 3) | 3+ tests passing + deploy |
| 4 | Production readiness + CI/CD + performance | Week 3-4 (10d) | CI/CD, responsive UI, perf evidence, advanced contract pattern | 10 commits target (PRD min: 8) | Lighthouse/perf gate passed |
| 5 | MVP launch with real users | Week 4-6 (14d) | Mentor-approved architecture + 5+ users + iteration evidence | 12 commits target (PRD min: 10) | User proof + feedback loop |
| 6 | Scale + demo day readiness | Week 7-12 (30d) | 30+ users, monitoring, security checklist, pitch assets | 30+ commits required (PRD min: 30) | Demo-day package complete |

## 5) Public Interfaces and API/Type Evolution by Level

### Level 2 Contracts and Frontend State

- Contract interface:
  - `initialize(participants, amounts, landlord, deadline)`
  - `deposit(participant, amount)`
  - `release()`
  - `refund()`
  - `get_status()`
- Frontend escrow state model fields:
  - participant status
  - collected amount
  - required amount
  - deadline
  - escrow status (`pending`, `complete`, `refunded`)

### Level 3 Domain Models and Export Interfaces

- `RentGroup` domain type with split modes:
  - `equal`
  - `percentage`
  - `fixed`
- Participant share model with validation constraints.
- Transaction record schema for:
  - UI history table
  - CSV export
  - PDF receipt generation

### Levels 3-4 Automation Interfaces

- Reminder schedule status fields.
- Snooze state.
- Overdue state and escalation metadata.

### Levels 4-6 Ops Interfaces

- CI status badge contract (source and expected status checks).
- Monitoring event payload shape (errors, uptime, critical alerts).
- Metrics snapshot schema for dashboard/reporting.

## 6) Quality Gates and Test Strategy

### Test Cases and Acceptance Scenarios

1. Level 1:
   - Wallet connection.
   - Balance fetch.
   - Successful XLM transfer.
   - Error handling (`invalid address`, `insufficient funds`).
2. Level 2:
   - Multi-wallet switching.
   - Escrow deposit/release/refund flow.
   - Realtime escrow status updates.
3. Level 3:
   - Group create/edit/delete.
   - Split validation (`100%` / total amount integrity).
   - Payment history filter/export.
   - End-to-end happy path.
4. Level 4:
   - CI pipeline success.
   - Mobile responsiveness checks.
   - Performance budget checks.
   - Inter-contract or multi-token behavior.
5. Level 5:
   - Onboarding flow for 5+ users.
   - Feedback capture.
   - Iteration regression tests after feedback changes.
6. Level 6:
   - Scale checks for user/activity targets.
   - Monitoring alert verification.
   - Security checklist verification.
   - Demo flow rehearsal script validation.

### Gate Policy

- A level PR cannot merge until its test and artifact gates pass.
- Failing quality gates require fix commits in the same level branch and PR.
- Evidence links must be included in PR description and this file's level checklist.

## 7) Documentation and Demo Evidence Checklist

For every level PR, include:
- [ ] Scope summary linked to PRD requirements.
- [ ] Test evidence (logs/screenshots/reports).
- [ ] UI screenshots where applicable.
- [ ] Explorer links / transaction hashes where applicable.
- [ ] Updated `README.md` section for new user-visible functionality.
- [ ] Changelog update entry.

Additional artifacts by level:
- Level 3: Demo video link.
- Level 5: Mentor review artifacts + user feedback record.
- Level 6: Metrics dashboard evidence + monitoring screenshots + pitch deck assets.

## 8) Definition of Done Per Level

1. All level checklist items marked complete in `plan.md`.
2. Minimum commit count and PR checklist satisfied.
3. Required artifacts linked in PR (screenshots, tx hashes, videos, docs).
4. Deployment and verification steps passed.
5. Level tag created and changelog entry added.

## 9) Risks, Dependencies, and Mitigation

1. Wallet/provider instability:
   - Mitigation: abstract wallet adapter and ship fallback messaging early.
2. Contract integration delays:
   - Mitigation: freeze ABI per level and provide mock-mode UI to unblock frontend.
3. User acquisition risk (Levels 5/6):
   - Mitigation: pre-commit recruitment pipeline and weekly funnel review.
4. Performance regressions:
   - Mitigation: enforce bundle and Lighthouse thresholds in CI.
5. Demo risk:
   - Mitigation: maintain pre-recorded backup demo and scripted dry-runs.

## 10) Release, Tagging, and Traceability Map

### Tagging and Release Cadence

- Level 1 merged -> tag `v0.1.0`
- Level 2 merged -> tag `v0.2.0`
- Level 3 merged -> tag `v0.3.0`
- Level 4 merged -> tag `v0.4.0`
- Level 5 merged -> tag `v0.5.0`
- Level 6 merged -> tag `v0.6.0`

### Traceability Rules

- Every PR must link:
  - related `PRD.md` sections/lines
  - checklist items from this `plan.md`
  - produced evidence artifacts
- Every merge commit message should include level identifier (example: `merge: level-3 mini-dapp`).
- Every level completion must update:
  - Changelog
  - `plan.md` completion state
  - release tag

## Level Checklists

### Level 1 Checklist
- [ ] Branch created: `level/1-foundation-wallet-payment`
- [ ] Wallet connect/disconnect complete.
- [ ] Balance display + refresh complete.
- [ ] Simple payment + transaction feedback complete.
- [ ] README + screenshots updated.
- [ ] Tests/checks passed.
- [ ] PR created and merged with merge commit.
- [ ] Tag `v0.1.0` created.

### Level 2 Checklist
- [ ] Branch created: `level/2-multi-wallet-escrow`
- [ ] Multi-wallet support integrated.
- [ ] Error handling improvements complete.
- [ ] Escrow contract deployed and verified.
- [ ] Frontend contract integration + realtime status complete.
- [ ] Explorer proof artifacts attached.
- [ ] PR created and merged with merge commit.
- [ ] Tag `v0.2.0` created.

### Level 3 Checklist
- [ ] Branch created: `level/3-mini-dapp-groups`
- [ ] Group creation/management complete.
- [ ] Unequal split support complete.
- [ ] Payment history + export complete.
- [ ] Reminder/notification system complete.
- [ ] Minimum test suite complete (3+ tests passing).
- [ ] Demo video + full docs attached.
- [ ] PR created and merged with merge commit.
- [ ] Tag `v0.3.0` created.

### Level 4 Checklist
- [ ] Branch created: `level/4-production-readiness`
- [ ] Advanced contract pattern (inter-contract or equivalent) complete.
- [ ] CI/CD pipeline integrated.
- [ ] Responsive behavior validated.
- [ ] Performance gates achieved (Lighthouse/perf budget evidence).
- [ ] PR created and merged with merge commit.
- [ ] Tag `v0.4.0` created.

### Level 5 Checklist
- [ ] Branch created: `level/5-mvp-users`
- [ ] Mentor review and approval artifacts attached.
- [ ] 5+ verified users onboarded.
- [ ] User feedback collected and at least one iteration shipped.
- [ ] Architecture documentation updated.
- [ ] PR created and merged with merge commit.
- [ ] Tag `v0.5.0` created.

### Level 6 Checklist
- [ ] Branch created: `level/6-scale-demo-day`
- [ ] 30+ verified active users achieved.
- [ ] Monitoring + security checklist evidence attached.
- [ ] Metrics dashboard and data indexing evidence attached.
- [ ] Community contribution evidence attached.
- [ ] Demo Day package complete.
- [ ] PR created and merged with merge commit.
- [ ] Tag `v0.6.0` created.

## Assumptions and Defaults

1. Target project is `Rent Payment Splitter`.
2. `plan.md` is located at project root.
3. Scope includes Levels 1-6.
4. Commit-history style is PR milestone-based, with feature-level commits inside each level PR.
5. If PRD does not specify minimum commits for a level (Level 1), default target is 5 meaningful commits.
