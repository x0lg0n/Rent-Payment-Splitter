# SplitRent Development Guide

This guide provides everything you need to know to develop SplitRent effectively.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Testing Strategy](#testing-strategy)
5. [Smart Contract Development](#smart-contract-development)
6. [Frontend Development](#frontend-development)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** v20.x or higher
- **pnpm** v9.x or higher
- **Rust** latest stable version
- **Git** for version control

### Recommended Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Rust Analyzer
  - Next.js
  - Tailwind CSS IntelliSense
- **Freighter Wallet** browser extension
- **Soroban CLI** for smart contract development

### Installation

```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# Install pnpm
corepack enable

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Soroban CLI
curl -L https://github.com/stellar/stellar-cli/releases/latest/download/stellar-cli-x86_64-unknown-linux-gnu.tar.gz | tar xz -C ~/.cargo/bin stellar stellar-cli
```

---

## Getting Started

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/x0lg0n/Rent-Payment-Splitter.git
cd Rent-Payment-Splitter

# Install dependencies
pnpm install

# Copy environment variables
cp frontend/.env.example frontend/.env.local
```

### Start Development Server

```bash
# From root directory
pnpm dev

# Or navigate to frontend
cd frontend
pnpm dev
```

Visit `http://localhost:3000` to see the application.

---

## Development Workflow

### Branch Strategy

We use a level-based branching strategy:

```bash
# Create feature branch for a level
git checkout -b level/2-escrow-integration

# Regular feature branch
git checkout -b feat/wallet-switching
```

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

### Before Committing

Always run these checks before committing:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

For smart contracts:

```bash
cd SplitRent
cargo test
cargo clippy
cargo fmt
```

---

## Testing Strategy

### Frontend Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with coverage
pnpm test -- --coverage
```

### Writing Tests

Use Vitest for unit and integration tests:

```typescript
// Example test
import { describe, it, expect } from "vitest";

describe("PaymentForm", () => {
  it("should validate amount input", () => {
    // Test implementation
  });
});
```

### Smart Contract Tests

```bash
cd SplitRent

# Run all tests
cargo test

# Run specific test
cargo test test_initialize_escrow

# Run with output
cargo test -- --nocapture
```

---

## Smart Contract Development

### Project Structure

```
SplitRent/
├── contracts/
│   └── escrow/
│       ├── src/
│       │   ├── lib.rs      # Main contract code
│       │   └── test.rs     # Contract tests
│       └── Cargo.toml
└── target/                 # Build artifacts
```

### Build Contract

```bash
cd SplitRent

# Build WASM artifact
cargo build --target wasm32-unknown-unknown --release

# Optimize WASM (optional)
wasm-opt -Oz target/wasm32-unknown-unknown/release/escrow.wasm -o escrow.optimized.wasm
```

### Deploy to Testnet

```bash
# Using Soroban CLI
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source your-account \
  --network testnet
```

### Interact with Contract

```bash
# Invoke contract function
stellar contract invoke \
  --id CONTRACT_ID \
  --source your-account \
  --network testnet \
  -- function_name --arg1 value1
```

---

## Frontend Development

### Component Structure

Components follow this pattern:

```typescript
// components/ui/button.tsx
"use client";

import * as React from "react";

export interface ButtonProps {
  variant?: "default" | "outline";
  children: React.ReactNode;
}

export function Button({ variant = "default", children }: ButtonProps) {
  return <button>{children}</button>;
}
```

### Styling

We use Tailwind CSS with custom properties:

```css
/* globals.css */
@theme inline {
  --brand: oklch(0.7 0.15 250);
}
```

### State Management

- Use React hooks for local state
- Zustand for global state (if needed)
- React Query for server state

### Best Practices

1. **TypeScript**: Always use strict typing
2. **Accessibility**: Use semantic HTML and ARIA attributes
3. **Performance**: Implement lazy loading and code splitting
4. **Error Handling**: Use error boundaries and graceful degradation

---

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
pnpm i -g vercel

# Login
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Set these in Vercel dashboard:

```
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_EXPLORER_BASE_URL=https://stellar.expert/explorer/testnet/tx
```

### Manual Deployment

```bash
# Build production bundle
pnpm build

# Start production server
pnpm start
```

---

## Troubleshooting

### Common Issues

#### Wallet Not Detected

**Problem**: Freighter wallet not detected by the app

**Solution**:

1. Open Freighter extension settings
2. Enable site access for `localhost:3000`
3. Refresh the page
4. Check browser console for errors

#### Build Errors

**Problem**: TypeScript errors during build

**Solution**:

```bash
# Clear cache and rebuild
rm -rf node_modules .next
pnpm install
pnpm build
```

#### Contract Deployment Fails

**Problem**: Soroban deployment fails

**Solution**:

1. Ensure you have XLM in your account
2. Check network configuration (testnet vs mainnet)
3. Verify contract compiles without errors

### Getting Help

- Check existing issues on GitHub
- Review documentation in `docs/` folder
- Join Stellar Discord community
- Ask in GitHub Discussions

---

## Additional Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

Last Updated: March 3, 2026
