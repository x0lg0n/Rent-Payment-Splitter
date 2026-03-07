# SplitRent - Project Context

## Project Overview

**SplitRent** is a Stellar-based decentralized application (dApp) that helps roommates send, track, and verify rent payments on-chain. Built with Next.js and Soroban smart contracts, it provides transparent, secure, and automated rent payment splitting using blockchain technology.

### Core Purpose
- Solve the common problem of splitting rent among roommates
- Provide transparent, on-chain transaction verification
- Enable automated payment distribution via smart contracts
- Offer a user-friendly interface for blockchain interactions

### Current Status
- **Phase 1 (Foundation)**: ✅ Complete - Wallet integration, payment system, modern UI
- **Phase 2 (Escrow System)**: 🔄 In Progress - Smart contract development for escrow management

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router |
| TypeScript | 5.x | Type-safe development |
| React | 19.2.3 | UI library |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | - | UI components |
| Vitest | 4.0.18 | Testing framework |
| Zustand | 5.0.11 | State management |
| Zod | 4.3.6 | Schema validation |

### Blockchain
| Technology | Version | Purpose |
|------------|---------|---------|
| Stellar SDK | 14.5.0 | Blockchain interaction |
| Soroban SDK | 25 | Smart contracts (Rust) |
| Stellar Wallets Kit | 2.0.0 | Multi-wallet support |

### Supported Wallets
- Freighter
- xBull
- Albedo
- Rabet

### DevOps & Tools
- **Package Manager**: pnpm 9.x
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel
- **Code Quality**: ESLint 9, TypeScript strict mode
- **Error Tracking**: Sentry

---

## Project Structure

```
Rent Payment Splitter/
├── frontend/                          # Next.js application
│   ├── app/                           # App Router pages
│   │   ├── page.tsx                   # Landing page
│   │   ├── dashboard/page.tsx         # Dashboard
│   │   ├── escrow/                    # Escrow management pages
│   │   └── api/                       # API routes
│   ├── components/
│   │   ├── landing/                   # Landing page components
│   │   ├── dashboard/                 # Dashboard components
│   │   ├── shared/                    # Shared components
│   │   └── ui/                        # UI primitives (shadcn)
│   ├── lib/
│   │   ├── stellar/                   # Stellar utilities
│   │   ├── wallet/                    # Wallet integration
│   │   ├── hooks/                     # React hooks
│   │   └── types/                     # TypeScript types
│   ├── __tests__/                     # Unit tests
│   ├── .env.example                   # Environment template
│   ├── package.json                   # Dependencies & scripts
│   └── tsconfig.json                  # TypeScript config
│
├── SplitRent/                         # Smart contracts
│   ├── contracts/
│   │   └── escrow/
│   │       ├── src/
│   │       │   ├── lib.rs             # Contract logic
│   │       │   └── test.rs            # Contract tests
│   │       └── Cargo.toml
│   ├── Cargo.toml                     # Workspace config
│   └── frontend-integration/          # Contract-FE integration
│
├── docs/                              # Documentation
│   ├── DEVELOPMENT.md                 # Development guide
│   ├── ROADMAP.md                     # Project roadmap
│   ├── PRD.md                         # Product requirements
│   ├── screenshots/                   # App screenshots
│   └── videos/                        # Demo videos
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # CI/CD pipeline
│
└── QWEN.md                            # This file
```

---

## Building and Running

### Prerequisites
- Node.js 20.x or higher
- pnpm 9.x or higher
- Rust (latest stable) - for smart contract development
- Git

### Installation

```bash
# Clone and install dependencies
git clone https://github.com/x0lg0n/Rent-Payment-Splitter.git
cd Rent-Payment-Splitter
pnpm install

# Set up environment variables
cp frontend/.env.example frontend/.env.local
```

### Development Commands

```bash
# Start development server (port 3000)
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Run ESLint
pnpm lint

# Run TypeScript typecheck
pnpm typecheck

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Smart Contract Commands

```bash
cd SplitRent

# Build WASM artifact
cargo build --target wasm32-unknown-unknown --release

# Run contract tests
cargo test

# Format and lint
cargo fmt
cargo clippy

# Deploy to testnet (requires Soroban CLI)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source YOUR_ACCOUNT \
  --network testnet
```

### Pre-commit Checklist

Always run these checks before committing:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

---

## Development Conventions

### Code Style
- **TypeScript**: Strict mode enabled, no implicit any
- **Formatting**: Consistent with ESLint rules
- **Imports**: Organized with path aliases (`@/*` → `./`)
- **Components**: Functional components with TypeScript interfaces
- **Naming**: PascalCase for components, camelCase for functions/variables

### Testing Practices
- **Framework**: Vitest for frontend, Rust tests for contracts
- **Coverage**: Focus on critical flows (wallet connection, payments, escrow)
- **Test Files**: Located in `__tests__/` directory
- **Naming**: Mirror source file structure in test directory

### Commit Messages
Follow Conventional Commits specification:

```
feat: add multi-wallet support
fix: resolve wallet connection timeout
docs: update README with setup instructions
test: add unit tests for payment form
refactor: extract wallet utilities to separate module
chore: update dependencies
```

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `level/<n>-<feature>` - Level-based feature branches
- `feat/<feature-name>` - Feature branches
- `fix/<issue-name>` - Bug fix branches

### Component Pattern

```typescript
"use client";

import * as React from "react";

export interface ComponentProps {
  variant?: "default" | "outline";
  children: React.ReactNode;
}

export function Component({ variant = "default", children }: ComponentProps) {
  return <div>{children}</div>;
}
```

### Environment Variables

Default configuration (Stellar testnet):

```bash
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_EXPLORER_BASE_URL=https://stellar.expert/explorer/testnet/tx
NEXT_PUBLIC_FRIENDBOT_URL=https://laboratory.stellar.org/#account-creator?network=test
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

---

## Key Architecture Concepts

### Smart Contract Architecture

1. **Escrow Creation**: User sets up escrow with participants and amounts
2. **Deposit Phase**: All participants deposit their share via token transfer
3. **Distribution**: Contract automatically splits and distributes funds to landlord
4. **Refund**: If deadline passes without full funding, participants can refund
5. **Verification**: All transactions recorded on Stellar blockchain

### Escrow States
```
Active → FullyFunded → Released (success path)
Active → Refunding → Refunded (failure path)
Active/FullyFunded → Disputed → Resolved (exception path)
```

### Frontend Architecture
- **Pages**: Next.js App Router with server/client components
- **State**: Zustand for global state, React hooks for local state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Wallet**: Multi-wallet support via Stellar Wallets Kit

---

## Contributing

### Ways to Contribute
- 🐛 Report bugs via GitHub Issues
- 💡 Suggest features
- 📝 Improve documentation
- 💻 Submit PRs
- 🧪 Write tests

### PR Requirements
1. Descriptive title following conventional commits
2. Link to related issue if exists
3. Description of changes made
4. Screenshots for UI changes
5. All checks passing (`pnpm lint && pnpm typecheck && pnpm test`)

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Project overview and quick start |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Complete development guide |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Project timeline and milestones |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community guidelines |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## Current Development Focus (Phase 2)

### In Progress
- 🔄 Soroban smart contract for escrow management
- 🔄 Create and manage rent-splitting escrows
- 🔄 Multi-participant support
- 🔄 Automated payment distribution
- 🔄 Real-time escrow status tracking

### Next Steps
- Complete escrow smart contract deposit/release logic
- Design and implement escrow creation UI
- Add participant management interface
- Deploy escrow contract to testnet

---

## Troubleshooting

### Wallet Not Detected
1. Open wallet extension settings
2. Enable site access for `localhost:3000`
3. Refresh the page
4. Check browser console for errors

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules .next
pnpm install
pnpm build
```

### Contract Deployment Fails
1. Ensure you have XLM in your account
2. Check network configuration (testnet vs mainnet)
3. Verify contract compiles without errors

---

## External Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
