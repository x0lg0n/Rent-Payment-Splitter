# SplitRent — Rent Payment Splitter on Stellar

A decentralized rent-payment splitting dApp built on the **Stellar testnet**. Connect your Freighter wallet, check your XLM balance, and send payments — all from a single dashboard.

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/x0lg0n/Rent-Payment-Splitter.git
cd Rent-Payment-Splitter/frontend

# 2. Install dependencies
pnpm install

# 3. Copy environment template (optional — defaults point to testnet)
cp .env.example .env.local

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser with the **Freighter** wallet extension installed.

## Available Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint check |
| `pnpm typecheck` | TypeScript type-check (`tsc --noEmit`) |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:watch` | Run tests in watch mode |

## Tech Stack (Level 1)

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS v4 + shadcn/ui | 4.x |
| Blockchain | Stellar SDK | 14.x |
| Wallet | Freighter API | 6.x |
| Testing | Vitest | 4.x |

## Project Structure

```
frontend/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   └── dashboard/page.tsx
├── components/
│   ├── dashboard/        # Dashboard UI components
│   ├── landing/          # Landing page sections
│   ├── shared/           # Theme toggle, etc.
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── config.ts         # Centralized env config
│   ├── hooks/            # Custom React hooks
│   ├── stellar/          # Horizon, network, payment utils
│   ├── wallet/           # Freighter adapter
│   └── types/            # Domain types
├── __tests__/            # Vitest unit tests
└── .env.example          # Environment variable template
```

## Level 1 — White Belt (Complete)

### Features Delivered
- Freighter wallet connect / disconnect with session restore
- XLM balance display with 30-second auto-refresh
- Testnet XLM payment with address & amount validation
- Transaction history (localStorage) with explorer links
- Success dialog with tx hash & copy-to-clipboard
- Toast notification system
- Responsive landing page + dashboard with mobile navigation
- Dark / light theme toggle
- Accessibility: form labels, `aria-live` regions, descriptive `aria-label`s

### Evidence
- **22 unit tests passing** — validators for Stellar addresses, network detection, XLM amounts, config shape
- **Testnet transactions** — send XLM to any testnet `G…` address via Freighter signing

## License

[MIT](LICENSE)