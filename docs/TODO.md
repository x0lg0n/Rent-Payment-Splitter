# SplitRent TODO & Task Tracker

This document tracks completed work, current priorities, and upcoming tasks. For the complete project roadmap with timelines, see [ROADMAP.md](ROADMAP.md).

---

## ✅ Phase 1: Foundation - COMPLETE

### Core Features

- [x] Wallet connection (Freighter, xBull, Albedo, Rabet)
- [x] Balance display with auto-refresh (30s intervals)
- [x] Manual balance refresh functionality
- [x] Payment sending with validation
- [x] Transaction history display
- [x] Transaction verification via Stellar Explorer links
- [x] Dark/light mode theme toggle
- [x] Landing page with features and FAQ
- [x] Dashboard with wallet status and payment forms
- [x] Onboarding checklist with progress tracking
- [x] Error boundary implementation
- [x] Toast notifications for user feedback
- [x] Mobile-responsive layout

### Testing & Quality

- [x] Vitest test setup
- [x] ESLint configuration
- [x] TypeScript typecheck script
- [x] Basic unit tests for config and utilities
- [x] GitHub Actions CI pipeline

### Documentation

- [x] README.md (comprehensive)
- [x] CONTRIBUTING.md
- [x] CODE_OF_CONDUCT.md
- [x] SECURITY.md
- [x] CHANGELOG.md
- [x] ROADMAP.md
- [x] PRD.md
- [x] STACK.md
- [x] DEVELOPMENT.md
- [x] Screenshots directory structure
- [x] Videos directory structure

---

## 🚧 Phase 2: Escrow System - IN PROGRESS (Current Focus)

### Smart Contract Development

- [x] Basic escrow contract structure
- [x] Initialize escrow function
- [x] Deposit function with deadline check
- [x] Refund mechanism
- [ ] Split and distribute funds function
- [ ] Participant approval workflow
- [ ] Event emission for frontend tracking
- [ ] Comprehensive contract tests
- [ ] Security audit preparation

### Escrow Integration

- [ ] Deploy Soroban escrow contract to testnet
- [ ] Create escrow from frontend UI
- [ ] Display escrow details and status
- [ ] Participant management (add/remove participants)
- [ ] Deposit tracking and confirmation
- [ ] Automatic rent splitting logic
- [ ] Withdrawal functionality
- [ ] Escrow timeline visualization

### Frontend Escrow UI

- [ ] Create escrow form with validation
- [ ] Escrow dashboard showing active escrows
- [ ] Individual escrow detail page
- [ ] Real-time status updates
- [ ] Participant list with contribution status
- [ ] Payment history per escrow
- [ ] Notifications for escrow events

### Enhanced Wallet Experience

- [ ] Improved multi-wallet switching UX
- [ ] Persist wallet selection in localStorage
- [ ] Handle wallet disconnection gracefully
- [ ] Show connected wallet address in UI

### Testing

- [ ] End-to-end tests for escrow flow
- [ ] Contract integration tests
- [ ] Wallet switching tests
- [ ] Error scenario testing

**Timeline**: March - May 2026  
**Status**: 🔄 In Progress (40% complete)

---

## 📋 Phase 3: Advanced Features - PLANNED

### Recurring Payments

- [ ] Monthly recurring escrow creation
- [ ] Automatic re-creation of escrows
- [ ] Payment schedule management
- [ ] Pause/resume recurring payments
- [ ] Edit recurring payment amounts

### Notifications & Alerts

- [ ] Email notifications (via Resend or SendGrid)
- [ ] Push notifications for wallet events
- [ ] In-app notification center
- [ ] Payment due reminders
- [ ] Escrow status updates
- [ ] Notification preferences/settings

### Enhanced UX

- [ ] Loading skeletons for all async operations
- [ ] Optimistic UI updates
- [ ] Better error messages with recovery suggestions
- [ ] Mobile-responsive improvements
- [ ] Accessibility (WCAG AA compliance)

### Additional Payment Features

- [ ] Partial payment support
- [ ] Late fee calculation
- [ ] Payment disputes mechanism
- [ ] Mediation workflow
- [ ] Bulk participant import
- [ ] Template escrows (presets)
- [ ] Custom split ratios (not equal division)

**Timeline**: June - August 2026

---

## 🔮 Phase 4: Analytics & Reporting - FUTURE

### Analytics Dashboard

- [ ] Payment analytics dashboard
- [ ] Spending insights and charts
- [ ] Rent payment history reports
- [ ] Success rate metrics
- [ ] User activity tracking
- [ ] Escrow statistics

### Export & Reporting

- [ ] Export transaction data (CSV, PDF)
- [ ] Tax documentation generation
- [ ] Payment receipts
- [ ] Annual summary reports

### Admin Features

- [ ] Admin dashboard for platform monitoring
- [ ] User management (if authentication added)
- [ ] Dispute resolution mechanism
- [ ] Platform fee collection (optional)
- [ ] Analytics on escrow success rates

**Timeline**: September - November 2026

---

## 🎨 Phase 5: Mobile & Internationalization - FUTURE

### Mobile Optimization

- [ ] Progressive Web App (PWA) support
- [ ] Mobile-first responsive design
- [ ] Touch-optimized interactions
- [ ] Mobile wallet deep linking
- [ ] QR code scanning for addresses
- [ ] Native app consideration (React Native/Flutter)

### Internationalization

- [ ] i18n framework setup
- [ ] Multi-language support (Spanish, French, German)
- [ ] RTL language support (Arabic, Hebrew)
- [ ] Currency formatting by locale
- [ ] Date/time localization

### Additional Use Cases

- [ ] Utility bill splitting
- [ ] Groceries expense sharing
- [ ] Shared purchase escrows
- [ ] Group trip expense management

**Timeline**: December 2026 - February 2027

---

## 🚀 Phase 6: Production Ready - FUTURE

### Mainnet Deployment

- [ ] Smart contract audit by third-party firm
- [ ] Mainnet deployment of contracts
- [ ] Production environment setup
- [ ] Domain and SSL configuration
- [ ] CDN setup for static assets
- [ ] Load balancing setup

### Performance Optimization

- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] Database/indexing solution for queries
- [ ] Caching strategy (Redis/Memcached)
- [ ] Load testing and optimization

### Monitoring & Observability

- [ ] Sentry error tracking in production
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Log aggregation (Logtail/Datadog)
- [ ] Alert system for critical issues

### Legal & Compliance

- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] GDPR compliance measures
- [ ] KYC/AML considerations (if needed)
- [ ] Insurance coverage exploration

**Timeline**: March - May 2027

---

## 🐛 Known Issues & Technical Debt

### Current Issues

- [ ] React hooks best practices - ensure no setState in useEffect bodies (FIXED in onboarding-checklist.tsx)
- [ ] Performance: Consider implementing pagination for transaction history if it grows large
- [ ] Security: Rate limiting on API routes (if backend is added)
- [ ] Add actual screenshots to docs/screenshots/
- [ ] Record demo video for docs/videos/

### Bug Reports

(Add bug reports here as they're discovered)

---

## 💡 Ideas Backlog

Features we're considering for future versions:

- [ ] Split requests for non-rent expenses (utilities, groceries)
- [ ] Chat/messaging between escrow participants
- [ ] Integration with property management software
- [ ] Credit score reporting for consistent payments
- [ ] Gamification (badges for on-time payments)
- [ ] Referral program
- [ ] API for third-party integrations
- [ ] NFT rent payments
- [ ] DeFi integrations (yield-bearing escrows)
- [ ] Voice assistant integration
- [ ] AR/VR property viewing + rent payment
- [ ] Carbon offset integration
- [ ] Charitable giving options

---

## 📊 Metrics to Track

### Development Velocity

- Tasks completed per week
- Pull requests merged
- Issues resolved
- Test coverage percentage

### User Adoption (Post-Launch)

- Active users
- Transactions processed
- Total value locked (TVL)
- User retention rate

---

## 🎯 Current Priorities

### This Week

- [ ] Complete escrow smart contract deposit logic
- [ ] Design escrow creation UI mockups
- [ ] Fix any outstanding wallet reconnection issues
- [ ] Add screenshots to documentation

### This Month

- [ ] Deploy escrow contract to testnet
- [ ] Implement escrow creation form
- [ ] Add participant management UI
- [ ] Record demo video

### This Quarter

- [ ] Full escrow system operational
- [ ] Beta testing with real users
- [ ] Collect feedback and iterate
- [ ] Prepare for Phase 3 development

---

## 📝 Contribution Guidelines

When working on tasks:

1. **Pick a task** from the appropriate phase
2. **Create an issue** if one doesn't exist
3. **Branch off** using conventional naming
4. **Implement and test** thoroughly
5. **Submit a PR** following to template
6. **Update this doc** when merged

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full guidelines.

---

Last Updated: March 3, 2026  
Next Review: Weekly (every Monday)
