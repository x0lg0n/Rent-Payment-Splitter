# SplitRent

SplitRent is a Stellar-based rent payment dApp that helps roommates send, track, and verify rent payments on **Stellar Testnet**.

Current product status:
- Level 1: complete (wallet connect, balance, send payment, tx feedback/history).
- Level 2: in progress (multi-wallet support and escrow contract flow).

## What You Can Do Today

- Connect wallet from landing page (`/`) and dashboard (`/dashboard`).
- See wallet status and network state (testnet/mainnet warning).
- View XLM balance with auto-refresh (30s) and manual refresh.
- Send XLM payments with validation and clear error/success feedback.
- View transaction history and verify each transaction on Stellar Explorer.
- Use dark/light mode.

## Tech Stack

- Next.js `16.1.6` (App Router)
- React `19.2.3`
- TypeScript `5.x`
- Tailwind CSS `4.x`
- shadcn/ui
- `@stellar/stellar-sdk` `14.5.0`
- `@stellar/freighter-api` `6.0.1`
- `@creit.tech/stellar-wallets-kit` `2.0.0`
- Vitest `4.0.18`

## Routes

- `/` -> marketing/landing page + wallet CTA
- `/dashboard` -> wallet status, balance, payment form, transaction history

## Project Structure

```text
Rent Payment Splitter/
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   └── dashboard/page.tsx
│   ├── components/
│   │   ├── landing/
│   │   ├── dashboard/
│   │   ├── shared/
│   │   └── ui/
│   ├── lib/
│   │   ├── config.ts
│   │   ├── hooks/
│   │   ├── stellar/
│   │   ├── wallet/
│   │   └── types/
│   └── __tests__/
├── SplitRent/                 # Soroban contract workspace
└── docs/                      # PRD, plan, stack, todo
```

## Quick Start

```bash
git clone https://github.com/x0lg0n/Rent-Payment-Splitter.git
cd Rent-Payment-Splitter/frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

```bash
pnpm dev          # run local dev server
pnpm build        # production build
pnpm start        # run production server
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
pnpm test:watch   # vitest watch
```

## Environment

Defaults are already set for testnet in [`frontend/lib/config.ts`](frontend/lib/config.ts).

Optional overrides:

```bash
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_EXPLORER_BASE_URL=https://stellar.expert/explorer/testnet/tx
NEXT_PUBLIC_FRIENDBOT_URL=https://laboratory.stellar.org/#account-creator?network=test
```

## Wallet and Network Notes

- Supported wallets (via WalletsKit): Freighter, xBull, Albedo, Rabet.
- App is intended for **Stellar Testnet** for current development levels.
- If Freighter is installed but not detected:
  - open Freighter extension settings,
  - enable site access for your local URL (for example `http://localhost:3000`),
  - make sure the extension is enabled in the active browser profile,
  - refresh the page and reconnect.

## Testing and Quality

Current checks:
- Unit tests with Vitest
- ESLint
- TypeScript typecheck

Run before pushing:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

## Delivery Plan and Docs

- Product requirements: [`docs/PRD.md`](docs/PRD.md)
- Execution plan (Levels 1-6): [`docs/plan.md`](docs/plan.md)
- Task breakdown: [`docs/todo.md`](docs/todo.md)
- Tech recommendations: [`docs/STACK.md`](docs/STACK.md)

## Git Workflow (Level-Based)

- Branch format: `level/<n>-<slug>`
- PR title format: `Level <n>: <milestone title>`
- Merge strategy: **Create a merge commit only**
- Commit style: Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`)
- Tag after each level merge: `v0.<level>.0`

## Current Focus (Level 2)

- Multi-wallet UX hardening and switching
- Escrow contract deployment + integration
- Realtime escrow status and participant progress
- Evidence collection (explorer links, screenshots, test traces)

## License

MIT - see [`LICENSE`](LICENSE).
