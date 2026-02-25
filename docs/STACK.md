## 🛠️ Recommended Tech Stack

### Frontend Stack

#### Core Framework
**Next.js 16** (React Framework)
- **Why:** Server-side rendering, built-in routing, API routes, excellent performance
- **Actual version used:** 16.1.6 (App Router)

**TypeScript**
- **Why:** Type safety, better IDE support, catch bugs early
- **Required for:** Professional code quality

#### UI Framework
**Tailwind CSS v4** + **shadcn/ui**
- **Why:** Rapid styling, copy-paste components, professional look
- **Components:** Buttons, modals, forms, cards from shadcn/ui
- **Actual version used:** Tailwind CSS 4.x, shadcn 3.8.5

#### State Management
**Zustand** or **React Context**
- **Why:** Simple, lightweight, easy to learn
- **Use for:** Wallet state, user data, group data
- **Alternative:** Redux (overkill for this project)

#### Stellar Integration
**@stellar/stellar-sdk** (Official SDK)
- **Why:** Core library for Stellar interactions
- **Required for:** All blockchain operations

**@stellar/freighter-api**
- **Why:** Wallet connection (Freighter)
- **Required for:** Level 1+

**@creit.tech/stellar-wallets-kit**
- **Why:** Multi-wallet support (Freighter, xBull, Albedo)
- **Required for:** Level 2+

**Soroban SDK** (@stellar/soroban-client)
- **Why:** Smart contract interactions
- **Required for:** Level 2+

---

### Backend/Smart Contract Stack

#### Smart Contracts
**Rust** + **Soroban**
- **Why:** Official Stellar smart contract platform
- **Required for:** Level 2+
- **Learning curve:** Moderate (Rust is challenging but well-documented)

**Soroban CLI**
- **Why:** Deploy, test, interact with contracts
- **Install:** `cargo install soroban-cli`

#### Backend (Optional for Advanced Features)
**Node.js** + **Express** OR **Next.js API Routes**
- **Why:** For features like email notifications, data indexing
- **Use when:** Level 4+ (monitoring, analytics)

**Supabase** or **Firebase**
- **Why:** Free tier, realtime database, authentication
- **Use for:** User profiles, payment history indexing
- **Alternative:** PostgreSQL + Prisma (more control)

---

### Testing Stack

**Vitest** + **React Testing Library**
- **Why:** Fast Vite-native test runner, drop-in Jest-compatible API
- **Actual version used:** Vitest 4.0.18
- **Required for:** Level 1+ (unit tests for validators/config)

**Playwright** or **Cypress**
- **Why:** E2E testing (simulate user flows)
- **Required for:** Level 3+ (recommended)

**Soroban Test Framework**
- **Why:** Test smart contracts in Rust
- **Required for:** Level 2+ (contract testing)

---

### DevOps & Deployment

**Vercel** (Frontend Deployment)
- **Why:** Free tier, auto-deploy from GitHub, excellent Next.js support
- **Alternative:** Netlify, Cloudflare Pages

**GitHub Actions** (CI/CD)
- **Why:** Free, integrates with GitHub, easy YAML config
- **Required for:** Level 4+

**Sentry** (Error Tracking)
- **Why:** Free tier, catch production errors
- **Required for:** Level 6

**UptimeRobot** (Uptime Monitoring)
- **Why:** Free, simple, reliable
- **Required for:** Level 6

---

### Analytics & Monitoring

**Google Analytics 4** or **Mixpanel**
- **Why:** Track user behavior, conversions
- **Required for:** Level 6 (metrics dashboard)

**Stellar Explorer API**
- **Why:** Verify transactions, fetch on-chain data
- **Use for:** User verification, transaction history

---

## 📚 Complete Tech Stack by Level

### Level 1 (White Belt):
```json
{
  "frontend": ["Next.js 16", "TypeScript", "Tailwind CSS v4", "shadcn/ui"],
  "stellar": ["@stellar/stellar-sdk 14.x", "@stellar/freighter-api 6.x"],
  "testing": ["Vitest 4.x"],
  "deployment": ["Vercel"]
}
```

### Level 2 (Yellow Belt):
```json
{
  "frontend": ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  "stellar": [
    "@stellar/stellar-sdk",
    "@creit.tech/stellar-wallets-kit",
    "@stellar/soroban-client"
  ],
  "smart-contracts": ["Rust", "Soroban SDK"],
  "deployment": ["Vercel"]
}
```

### Level 3 (Orange Belt):
```json
{
  "frontend": ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Zustand"],
  "stellar": [
    "@stellar/stellar-sdk",
    "@creit.tech/stellar-wallets-kit",
    "@stellar/soroban-client"
  ],
  "smart-contracts": ["Rust", "Soroban SDK"],
  "testing": ["Jest", "React Testing Library", "Playwright"],
  "deployment": ["Vercel"]
}
```

### Level 4 (Green Belt):
```json
{
  "frontend": ["Next.js 14", "TypeScript", "Tailwind CSS", "shadcn/ui", "Zustand"],
  "stellar": [
    "@stellar/stellar-sdk",
    "@creit.tech/stellar-wallets-kit",
    "@stellar/soroban-client"
  ],
  "smart-contracts": ["Rust", "Soroban SDK"],
  "backend": ["Next.js API Routes", "Supabase"],
  "testing": ["Jest", "React Testing Library", "Playwright"],
  "ci-cd": ["GitHub Actions"],
  "deployment": ["Vercel"]
}
```

### Level 5-6 (Blue/Black Belt):
```json
{
  "frontend": ["Next.js 14", "TypeScript", "Tailwind CSS", "shadcn/ui", "Zustand"],
  "stellar": [
    "@stellar/stellar-sdk",
    "@creit.tech/stellar-wallets-kit",
    "@stellar/soroban-client"
  ],
  "smart-contracts": ["Rust", "Soroban SDK"],
  "backend": ["Next.js API Routes", "Supabase/Firebase"],
  "testing": ["Jest", "React Testing Library", "Playwright"],
  "ci-cd": ["GitHub Actions"],
  "monitoring": ["Sentry", "UptimeRobot", "Google Analytics"],
  "deployment": ["Vercel"]
}
```
