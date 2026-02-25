# Rent Payment Splitter - Product Requirements Document (PRD)

## 📋 Executive Summary

**Product Name:** SplitRent  
**Tagline:** "Never chase roommates for rent again"  
**Problem:** Roommates struggle with splitting rent/utilities, leading to awkward conversations, late payments, and friendship strain  
**Solution:** Automated rent-splitting platform on Stellar blockchain with instant settlements and transparent tracking

**Target Users:**
- Primary: College students & young professionals (18-30) sharing apartments
- Secondary: Property managers wanting streamlined rent collection
- Tertiary: Co-living spaces & shared housing communities

**Unique Value Proposition:**
- ✅ Set-and-forget monthly automation
- ✅ Instant settlement (no 3-5 day bank transfers)
- ✅ Transparent payment tracking (no "did you pay?" questions)
- ✅ 0.5% fee vs 3-5% Venmo/PayPal for rent amounts
- ✅ Automatic receipts for tax purposes

---

## 🎯 Success Metrics (KPIs)

### Level 5 (Blue Belt) - MVP Launch:
- 5+ active apartment groups
- 15+ monthly transactions
- <5% payment failure rate
- 100% user retention month-over-month

### Level 6 (Black Belt) - Scale:
- 30+ verified users
- 10+ apartment groups
- 120+ monthly transactions
- Net Promoter Score (NPS) > 40

### Post-Launch (SCF Target):
- 200+ users in 3 months
- 50+ apartment groups
- $50K+ monthly transaction volume
- Landlord partnerships in 2+ cities

---

## 📱 Feature Breakdown by Level

---

## ⚪️ LEVEL 1 - White Belt: Foundation
**Timeline:** Week 1 (3-4 days)  
**Goal:** Basic wallet connection and single payment

### Core Features:

#### 1.1 Wallet Connection
**User Story:** As a user, I want to connect my Freighter wallet so I can send payments

**Requirements:**
- [ ] Install & configure Freighter wallet detection
- [ ] "Connect Wallet" button on landing page
- [ ] Display connected wallet address (truncated: `GABC...XYZ`)
- [ ] "Disconnect" functionality
- [ ] Handle wallet not installed state (show install link)
- [ ] Use Stellar Testnet only

**UI Components:**
- Landing page with hero section
- Connect wallet button (prominent CTA)
- Wallet status indicator (connected/disconnected)
- Freighter install prompt modal

#### 1.2 Balance Display
**User Story:** As a user, I want to see my XLM balance so I know if I have enough to pay rent

**Requirements:**
- [ ] Fetch XLM balance from connected wallet
- [ ] Display balance prominently (with XLM symbol)
- [ ] Auto-refresh balance every 30 seconds
- [ ] Show loading state while fetching
- [ ] Handle zero balance state

**UI Components:**
- Balance card showing XLM amount
- Last updated timestamp
- Refresh button (manual)

#### 1.3 Simple Payment Flow
**User Story:** As a user, I want to send XLM to my roommate's wallet so I can pay my share

**Requirements:**
- [ ] Input field for recipient address
- [ ] Input field for amount (XLM)
- [ ] "Send Payment" button
- [ ] Transaction submission to Stellar testnet
- [ ] Success confirmation with transaction hash
- [ ] Error handling (insufficient balance, invalid address, network errors)
- [ ] Link to Stellar Explorer to view transaction

**UI Components:**
- Payment form with validation
- Amount input with XLM denomination
- Address input with validation
- Success modal with transaction hash
- Error toast notifications

#### 1.4 Transaction Feedback
**User Story:** As a user, I want to know if my payment succeeded so I have proof of payment

**Requirements:**
- [ ] Loading state during transaction
- [ ] Success state with checkmark animation
- [ ] Display transaction hash (clickable link to explorer)
- [ ] Failure state with error message
- [ ] Copy transaction hash button

**Technical Requirements:**
- Stellar SDK for JavaScript
- Freighter wallet integration
- Horizon testnet endpoint
- Transaction signing and submission
- Error handling for all wallet operations

**Deliverables:**
- Working demo on Vercel/Netlify
- GitHub repo with README
- Screenshots: wallet connected, balance shown, successful payment

---

## 🟡 LEVEL 2 - Yellow Belt: Multi-Wallet & Smart Contract
**Timeline:** Week 1 (4 days)  
**Goal:** Support multiple wallets and deploy escrow contract

### Core Features:

#### 2.1 Multi-Wallet Support (StellarWalletsKit)
**User Story:** As a user, I want to choose my preferred wallet (Freighter, xBull, Albedo) so I'm not limited to one option

**Requirements:**
- [ ] Integrate StellarWalletsKit library
- [ ] Wallet selection modal showing 3+ options
- [ ] Support Freighter, xBull, Albedo wallets
- [ ] Persist wallet selection in localStorage
- [ ] Auto-reconnect on page reload
- [ ] Wallet switching functionality

**UI Components:**
- Wallet selection modal with wallet logos
- "Change Wallet" button when connected
- Wallet type indicator (show which wallet is connected)

#### 2.2 Advanced Error Handling
**User Story:** As a user, I want clear error messages so I know what went wrong

**Requirements:**
- [ ] Wallet not found error (with install links)
- [ ] User rejected transaction error
- [ ] Insufficient balance error (show required vs available)
- [ ] Network timeout error (with retry button)
- [ ] Invalid address error (with format hint)
- [ ] Generic error fallback with error code

**Error Types to Handle:**
1. **Wallet Not Found:** "Freighter wallet not detected. [Install Now]"
2. **User Rejected:** "Transaction cancelled. Please try again."
3. **Insufficient Balance:** "Need 100 XLM, but only have 50 XLM. [Add Funds]"
4. **Network Error:** "Connection failed. [Retry]"
5. **Invalid Address:** "Wallet address must start with G and be 56 characters"

**UI Components:**
- Error toast system (dismissible)
- Error modal for critical failures
- Inline validation errors on forms

#### 2.3 Escrow Smart Contract Deployment
**User Story:** As a user, I want my rent payment held in escrow until all roommates pay

**Contract Requirements:**
- [ ] Create Stellar Soroban smart contract
- [ ] Escrow initialization (set participants, amounts, deadline)
- [ ] Deposit function (roommate contributes their share)
- [ ] Release function (all paid → forward to landlord)
- [ ] Refund function (deadline missed → refund all)
- [ ] Query function (check escrow status)

**Contract Functions:**
```rust
// Pseudocode for contract structure
initialize(participants: Vec<Address>, amounts: Vec<i128>, landlord: Address, deadline: u64)
deposit(participant: Address, amount: i128) -> Result
release() -> Result  // Called when all paid
refund() -> Result   // Called after deadline if incomplete
get_status() -> EscrowStatus
```

**Business Logic:**
- Each roommate deposits their share
- Contract holds funds until all shares received
- Auto-release to landlord when complete
- Auto-refund after 7 days if incomplete

#### 2.4 Frontend Contract Integration
**User Story:** As a user, I want to see real-time payment status from all roommates

**Requirements:**
- [ ] Call contract `deposit()` function from UI
- [ ] Display escrow status (pending/complete/refunded)
- [ ] Show which roommates have paid (checkmarks)
- [ ] Show amounts deposited vs required
- [ ] Progress bar (e.g., "2 of 4 roommates paid")
- [ ] Transaction status tracking (pending → confirmed)

**UI Components:**
- Escrow card showing:
  - Total rent amount
  - Amount collected so far
  - List of participants with payment status
  - Progress bar
  - "Deposit My Share" CTA
- Transaction status indicator (pending/success/failed)

#### 2.5 Real-time Event Handling
**User Story:** As a user, I want to see updates when roommates pay without refreshing

**Requirements:**
- [ ] Listen to contract events (deposits, releases)
- [ ] Update UI in real-time when event detected
- [ ] Toast notification when roommate pays
- [ ] Confetti animation when all paid
- [ ] Auto-refresh escrow status every 15 seconds

**Technical Requirements:**
- Deploy contract to Stellar testnet
- Stellar SDK contract invocation
- Event listening setup
- WebSocket or polling for real-time updates
- Minimum 2 meaningful git commits

**Deliverables:**
- Deployed contract address
- Frontend calling contract functions
- Screenshot showing multi-wallet options
- Transaction hash of contract call (verifiable on explorer)

---

## 🟠 LEVEL 3 - Orange Belt: Complete Mini-dApp
**Timeline:** Week 2-3 (7 days)  
**Goal:** Full-featured escrow app with group management and testing

### Core Features:

#### 3.1 Group Creation & Management
**User Story:** As a user, I want to create a rent group with my roommates

**Requirements:**
- [ ] "Create Group" flow
- [ ] Input: Group name, total rent, split type (equal/custom)
- [ ] Add roommates by wallet address or invite link
- [ ] Set rent due date (monthly recurring)
- [ ] Edit group settings (before first payment)
- [ ] Delete group (if creator)

**Group Data Model:**
```typescript
interface RentGroup {
  id: string;
  name: string;
  totalRent: number;
  landlordAddress: string;
  participants: {
    address: string;
    name?: string;
    share: number; // percentage or fixed amount
    hasPaid: boolean;
  }[];
  dueDate: Date;
  status: 'active' | 'completed' | 'refunded';
  contractAddress: string;
  createdAt: Date;
}
```

**UI Components:**
- Group creation wizard (multi-step form)
- Group dashboard showing all groups
- Group detail page with member list
- Edit group modal
- Invite link generator

#### 3.2 Unequal Split Support
**User Story:** As a user, I want to split rent unevenly if I have a bigger room

**Requirements:**
- [ ] Choose split method: "Equal" or "Custom"
- [ ] For custom: set percentage or fixed amount per person
- [ ] Auto-calculate remaining amount
- [ ] Visual breakdown showing each person's share
- [ ] Validation: total must equal 100% or total rent
- [ ] Save custom split to contract

**Split Types:**
1. **Equal Split:** Total rent ÷ number of roommates
2. **Percentage Split:** Each person pays % of total (must sum to 100%)
3. **Fixed Amount Split:** Manually set each person's amount (must sum to total)

**UI Components:**
- Split method selector (radio buttons)
- Per-person amount/percentage input
- Visual pie chart showing split
- Validation errors if total ≠ 100%

#### 3.3 Payment History
**User Story:** As a user, I want to see all past payments for record-keeping

**Requirements:**
- [ ] List all transactions for a group
- [ ] Filter by: month, person, status
- [ ] Show: date, amount, payer, status, transaction hash
- [ ] Export to CSV for tax purposes
- [ ] Search functionality
- [ ] Receipt generation (PDF)

**History Data Display:**
- Date
- Payer wallet address (truncated + name if set)
- Amount paid
- Transaction hash (link to explorer)
- Status (success/failed/pending)

**UI Components:**
- Payment history table (sortable, filterable)
- Date range picker
- Export button (CSV download)
- Individual receipt view/download

#### 3.4 Automated Reminders
**User Story:** As a user, I want reminders so I don't forget to pay rent

**Requirements:**
- [ ] Email/push notification 3 days before due date
- [ ] In-app notification badge (unpaid rents)
- [ ] Reminder frequency settings (daily/weekly)
- [ ] Snooze option (remind me tomorrow)
- [ ] Mark as paid (dismiss reminder)

**Reminder Logic:**
- 7 days before due date: First reminder
- 3 days before: Second reminder
- Due date: Final reminder
- 1 day overdue: Overdue notice

**UI Components:**
- Notification bell icon with badge count
- Notification dropdown list
- Reminder settings page

#### 3.5 Loading States & Caching
**User Story:** As a user, I want fast loading so the app feels responsive

**Requirements:**
- [ ] Skeleton loaders for all data-fetching components
- [ ] Cache wallet balance (refresh every 30s)
- [ ] Cache group data (refresh every 60s)
- [ ] Cache transaction history (refresh on new payment)
- [ ] Optimistic UI updates (assume success, rollback on failure)
- [ ] Loading spinner for transactions
- [ ] Progress indicator for multi-step operations

**Caching Strategy:**
- **Balance:** 30-second TTL, refresh on payment
- **Groups:** 60-second TTL, refresh on group change
- **History:** 5-minute TTL, refresh on new payment
- Use localStorage for offline-first experience

**UI Components:**
- Skeleton cards (mimicking content structure)
- Shimmer effect on loading placeholders
- Progress bar for multi-step flows

#### 3.6 Testing Suite
**User Story:** As a developer, I want automated tests so I catch bugs early

**Requirements:**
- [ ] Unit tests for utility functions (split calculations, validation)
- [ ] Integration tests for contract calls
- [ ] E2E test for complete payment flow
- [ ] Minimum 3 tests passing
- [ ] Code coverage >60%

**Test Cases:**
1. **Split Calculation Test:** Equal split divides correctly
2. **Contract Deposit Test:** Depositing funds updates contract state
3. **E2E Payment Test:** User can connect wallet → create group → deposit → see confirmation

**Testing Tools:**
- Jest for unit tests
- React Testing Library for component tests
- Playwright or Cypress for E2E tests

#### 3.7 Complete Documentation
**User Story:** As a new developer, I want clear docs so I can run the project

**Requirements:**
- [ ] README with:
  - Project description
  - Features list
  - Tech stack
  - Setup instructions (step-by-step)
  - Environment variables needed
  - How to run locally
  - How to run tests
  - Deployment instructions
  - Screenshots (wallet connected, group created, payment made)
- [ ] Code comments for complex logic
- [ ] API documentation (if applicable)

#### 3.8 Demo Video
**User Story:** As a reviewer, I want a demo video so I understand the app quickly

**Requirements:**
- [ ] 1-minute demo video showing:
  - Wallet connection
  - Group creation
  - Adding roommates
  - Making a payment
  - Viewing payment status
  - Payment confirmation
- [ ] Voiceover or captions explaining each step
- [ ] Upload to YouTube/Loom

**Technical Requirements:**
- Minimum 3 passing tests
- README with setup instructions & screenshots
- Demo video (1 minute)
- Minimum 3 meaningful commits
- Deployed on Vercel/Netlify

**Deliverables:**
- Complete mini-dApp deployed
- Test output screenshot (3+ passing tests)
- Demo video link
- Comprehensive README

---

## 🟢 LEVEL 4 - Green Belt: Advanced Features & Production Readiness
**Timeline:** Week 3-4 (10 days)  
**Goal:** Advanced contract patterns and production deployment

### Core Features:

#### 4.1 Inter-Contract Calls (Advanced Pattern)
**User Story:** As a user, I want automatic currency conversion if I pay in USDC instead of XLM

**Requirements:**
- [ ] Deploy token swap contract (or integrate Stellar DEX)
- [ ] Main escrow contract calls swap contract
- [ ] Accept payments in XLM, USDC, or other Stellar assets
- [ ] Auto-convert to landlord's preferred currency
- [ ] Show conversion rate in UI
- [ ] Slippage protection (max 2% deviation)

**Contract Architecture:**
```
EscrowContract ──calls──> SwapContract ──calls──> Stellar DEX
                                                    
User pays USDC → Swap to XLM → Deposit in escrow
```

**Inter-Contract Call Flow:**
1. User deposits USDC
2. Escrow contract calls SwapContract.swap(USDC, XLM, amount)
3. SwapContract executes trade on Stellar DEX
4. XLM returned to escrow contract
5. Escrow updated with XLM amount

**UI Components:**
- Currency selector (XLM, USDC, EUR, etc.)
- Real-time exchange rate display
- Estimated amount after conversion
- Slippage tolerance setting

#### 4.2 Custom Token Creation (Optional)
**User Story:** As a user, I want to earn loyalty points for on-time payments

**Requirements:**
- [ ] Deploy SPLIT token (loyalty points)
- [ ] Award 10 SPLIT tokens per on-time payment
- [ ] Token balance display in user profile
- [ ] Redeem tokens for fee discounts (100 SPLIT = 1 month free)
- [ ] Leaderboard showing top earners

**Token Economics:**
- On-time payment: +10 SPLIT
- Refer a friend: +50 SPLIT
- 100 SPLIT = waive 1 month fee
- 500 SPLIT = premium features unlock

**UI Components:**
- Token balance widget
- Earn history (how tokens were earned)
- Redemption page
- Leaderboard (top 10 earners)

#### 4.3 Recurring Payment Automation
**User Story:** As a user, I want to set up auto-pay so I never miss rent

**Requirements:**
- [ ] Enable monthly recurring payments
- [ ] User approves upfront (like subscription)
- [ ] Contract auto-charges on due date
- [ ] Email confirmation 24 hours before charge
- [ ] Cancel anytime
- [ ] Pause for 1 month (e.g., traveling)

**Automation Logic:**
- User grants contract permission to withdraw monthly
- Contract checks balance on due date
- If sufficient: auto-deduct and deposit
- If insufficient: send notification
- User can cancel authorization anytime

**UI Components:**
- "Enable Auto-Pay" toggle
- Auto-pay status indicator
- Payment schedule calendar
- Cancel/pause buttons
- Transaction history for auto-payments

#### 4.4 CI/CD Pipeline
**User Story:** As a developer, I want automated deployment so I ship faster

**Requirements:**
- [ ] GitHub Actions or GitLab CI setup
- [ ] Auto-run tests on every PR
- [ ] Auto-deploy to staging on merge to `develop`
- [ ] Auto-deploy to production on merge to `main`
- [ ] Slack/Discord notification on deploy success/failure
- [ ] Automatic contract deployment on testnet/mainnet

**Pipeline Stages:**
1. **Lint:** ESLint, Prettier checks
2. **Test:** Run full test suite
3. **Build:** Create production build
4. **Deploy:** Push to Vercel/Netlify
5. **Notify:** Send status to Slack

**CI/CD Configuration:**
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    - run: npm test
  deploy:
    - run: npm run build
    - deploy to Vercel
```

#### 4.5 Mobile Responsive Design
**User Story:** As a user, I want to use the app on my phone

**Requirements:**
- [ ] Fully responsive layout (mobile-first)
- [ ] Touch-friendly UI (large tap targets)
- [ ] Mobile wallet support (WalletConnect)
- [ ] Progressive Web App (PWA) installable
- [ ] Offline mode (cache critical data)
- [ ] Mobile-optimized forms (number keyboards, autocomplete)

**Responsive Breakpoints:**
- Mobile: <640px
- Tablet: 640px - 1024px
- Desktop: >1024px

**Mobile-Specific Features:**
- Bottom navigation bar (mobile)
- Swipe gestures (e.g., swipe to delete group)
- Native share API (share invite links)
- Push notifications (via PWA)

**UI Components:**
- Hamburger menu (mobile)
- Tab bar navigation (mobile)
- Touch-optimized buttons (min 44px height)
- Modal sheets (instead of modals on mobile)

#### 4.6 Advanced Event Streaming
**User Story:** As a user, I want real-time updates when roommates pay

**Requirements:**
- [ ] WebSocket connection to Stellar Horizon
- [ ] Subscribe to contract events
- [ ] Real-time UI updates (no refresh needed)
- [ ] Toast notifications for new payments
- [ ] Sound effect on payment received
- [ ] Activity feed showing recent actions

**Event Types to Stream:**
- Payment deposited
- All roommates paid (escrow complete)
- Refund initiated
- Group created/updated

**UI Components:**
- Live activity feed (last 10 events)
- Real-time payment status badges
- Notification toasts with undo option
- Sound toggle (mute/unmute notifications)

#### 4.7 Performance Optimization
**User Story:** As a user, I want the app to load instantly

**Requirements:**
- [ ] Code splitting (load only needed code)
- [ ] Image optimization (WebP, lazy loading)
- [ ] Bundle size <200KB (initial load)
- [ ] Lighthouse score >90 (performance)
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s

**Optimization Techniques:**
- Lazy load routes (React.lazy)
- Compress images (WebP format)
- Tree-shaking (remove unused code)
- CDN for static assets
- Service worker caching

**Technical Requirements:**
- Inter-contract calls working (or multi-token support)
- CI/CD pipeline running (badge in README)
- Mobile responsive (screenshot required)
- Minimum 8 meaningful commits
- Lighthouse performance score >85

**Deliverables:**
- Production-ready app deployed
- CI/CD badge in README
- Mobile responsive screenshots
- Contract addresses (if inter-contract calls)
- Performance metrics screenshot

---

## 🔵 LEVEL 5 - Blue Belt: Real MVP with Users
**Timeline:** Week 4-6 (14 days)  
**Goal:** Launch MVP and onboard 5 real users

### Pre-Development Requirements:

#### 5.1 Mentor Review & Approval
**CRITICAL:** Must complete BEFORE building or onboarding users

**Requirements:**
- [ ] Submit idea to mentor for review
- [ ] Present technical architecture
- [ ] Demonstrate market fit research
- [ ] Get written approval to proceed
- [ ] Address any mentor concerns

**Mentor Review Checklist:**
- [ ] Technical soundness verified
- [ ] Market fit validated
- [ ] User acquisition plan approved
- [ ] Security concerns addressed
- [ ] Scope is realistic for timeline

**What to Prepare:**
1. **Technical Architecture Doc:**
   - System diagram
   - Smart contract design
   - Database schema (if applicable)
   - API endpoints (if applicable)
   - Security considerations

2. **Market Fit Evidence:**
   - User interviews (minimum 3)
   - Competitor analysis
   - Unique value proposition
   - Target user persona
   - Go-to-market strategy

3. **User Acquisition Plan:**
   - Where will you find 5 users?
   - How will you onboard them?
   - What's your timeline?
   - Contingency plan if acquisition is slow

**Submission Format:**
- Google Doc with architecture + market fit
- 10-minute Loom video explaining the plan
- Submit to mentor via program dashboard

### Core Features:

#### 5.2 Full MVP Development
**User Story:** As a real user, I want a polished app that works reliably

**Requirements:**
- [ ] All L1-L4 features fully functional
- [ ] No critical bugs (app doesn't crash)
- [ ] Data persistence (users don't lose data)
- [ ] Secure authentication (if needed)
- [ ] Privacy controls (hide wallet addresses optionally)
- [ ] Help/FAQ section
- [ ] Onboarding tutorial (first-time user flow)

**MVP Feature Checklist:**
✅ Wallet connection (multi-wallet)  
✅ Create rent groups  
✅ Invite roommates  
✅ Set custom splits  
✅ Make payments (XLM + USDC)  
✅ View payment status  
✅ Payment history  
✅ Auto-reminders  
✅ Mobile responsive  
✅ Real-time updates  

**New Features for L5:**
- User profiles (name, avatar, bio)
- Landlord mode (receive payments from multiple groups)
- Receipt generation (PDF export)
- Dispute resolution (if payment contested)
- Customer support chat (or contact form)

#### 5.3 User Onboarding Flow
**User Story:** As a new user, I want an easy setup process

**Requirements:**
- [ ] Welcome screen explaining the app
- [ ] Interactive tutorial (3-step walkthrough)
- [ ] Sample group pre-populated (demo mode)
- [ ] "Invite friends" prompt after first group created
- [ ] Contextual tooltips (highlight key features)
- [ ] Progress checklist (e.g., "3 of 5 steps complete")

**Onboarding Steps:**
1. **Welcome:** "Split rent with roommates instantly"
2. **Connect Wallet:** "Connect your Stellar wallet to get started"
3. **Create First Group:** "Add your roommates and total rent"
4. **Make Payment:** "Try sending your share (testnet)"
5. **Invite Friends:** "Invite your roommates to join"

**UI Components:**
- Welcome modal (dismissible)
- Step-by-step tutorial overlay
- Progress bar (onboarding completion)
- Skip tutorial button

#### 5.4 User Acquisition (5+ Real Users)
**User Story:** As a builder, I need to find actual users to validate my product

**Requirements:**
- [ ] Onboard 5 REAL users (not friends, not test wallets)
- [ ] Users must complete full flow: create group → invite others → make payment
- [ ] Each user's wallet address must be verifiable on Stellar Explorer
- [ ] Users must use the app for REAL rent (even if testnet)
- [ ] Collect user feedback after each use

**Where to Find Users:**
1. **College Housing Facebook Groups** (post in 3-5 groups)
2. **Reddit:** r/college, r/StudentLoans, r/personalfinance
3. **Co-living Spaces:** Reach out to WeWork Residential, Common, etc.
4. **Apartment Complex Bulletin Boards:** Post flyers
5. **Nextdoor App:** Post in local neighborhoods

**Acquisition Strategy:**
- Create landing page with signup form
- Offer incentive: "First 10 users get free premium features"
- Post in 5+ online communities
- Send cold emails to property managers
- Run small Facebook ad ($20 budget)

**User Validation:**
- Must have real Stellar wallet (not created by you)
- Must complete actual transaction (verifiable on-chain)
- Must use app for actual rent payment (or realistic test)

#### 5.5 Feedback Collection & Iteration
**User Story:** As a builder, I want user feedback to improve the product

**Requirements:**
- [ ] Collect feedback from each of 5 users
- [ ] Document feedback in structured format
- [ ] Identify top 3 pain points
- [ ] Implement 1 iteration based on feedback
- [ ] Show before/after comparison

**Feedback Collection Methods:**
1. **In-App Survey:** Pop-up after first payment
2. **Email Survey:** Send after 1 week of use
3. **User Interviews:** 15-minute Zoom calls
4. **Usage Analytics:** Track where users drop off

**Feedback Documentation Template:**
```markdown
## User Feedback Summary

### User 1: Alex (College Student)
- **Pain Point:** "Couldn't figure out how to invite roommates"
- **Suggestion:** "Add a copy-link button instead of typing addresses"
- **Rating:** 7/10

### User 2: Jordan (Young Professional)
- **Pain Point:** "Transaction took too long to confirm"
- **Suggestion:** "Show estimated wait time"
- **Rating:** 8/10

[... 3 more users ...]

### Top 3 Pain Points:
1. Inviting roommates is confusing (3/5 users)
2. No confirmation email after payment (2/5 users)
3. Mobile UI is cramped (2/5 users)

### Iteration Plan:
✅ Implemented: "Copy invite link" button  
📋 Backlog: Email confirmations (requires backend)  
📋 Backlog: Improve mobile spacing  
```

#### 5.6 Architecture Documentation
**User Story:** As a developer, I want clear architecture docs for future maintenance

**Requirements:**
- [ ] System architecture diagram
- [ ] Smart contract flow diagram
- [ ] Database schema (if applicable)
- [ ] API documentation (if applicable)
- [ ] Deployment architecture
- [ ] Security considerations document

**Architecture Document Sections:**
1. **High-Level Overview:** What the system does
2. **Component Diagram:** Frontend, contracts, external services
3. **Data Flow:** How data moves through the system
4. **Smart Contract Logic:** Functions, state, events
5. **Security:** Authentication, authorization, data encryption
6. **Scalability:** How to handle 100+ users

**Example Diagram:**
```
┌─────────────┐
│  React App  │
│  (Frontend) │
└──────┬──────┘
       │
       ├─────> Stellar Horizon API (balance, history)
       │
       └─────> Soroban Contract
                ├─> Escrow Logic
                ├─> Token Swaps
                └─> Event Emissions
```

**Technical Requirements:**
- MVP fully functional (no critical bugs)
- 5+ verified real users
- User feedback documented
- 1 iteration completed based on feedback
- Architecture document included
- Minimum 10 meaningful commits

**Deliverables:**
- Live demo link (production app)
- Demo video showing full MVP functionality
- List of 5+ user wallet addresses (verifiable on Stellar Explorer)
- User feedback document or link
- Architecture documentation
- Before/after screenshots showing iteration

---

## ⚫️ LEVEL 6 - Black Belt: Production Scale
**Timeline:** Week 7-12 (30 days)  
**Goal:** Scale to 30 users and Demo Day presentation

### Core Features:

#### 6.1 Scale to 30+ Active Users
**User Story:** As a product, I want to serve 30+ users reliably

**Requirements:**
- [ ] Onboard 30 verified active users
- [ ] Each user must complete at least 1 transaction
- [ ] Users must be from at least 3 different groups/buildings
- [ ] All wallet addresses must be verifiable on Stellar Explorer
- [ ] User retention: at least 20/30 users return after first use

**User Acquisition Tactics:**
1. **Referral Program:** Give $5 XLM for each friend invited
2. **Property Manager Partnerships:** Partner with 2-3 landlords
3. **Campus Ambassadors:** Recruit 2-3 college students to promote
4. **Content Marketing:** Write blog post, share on social media
5. **Paid Ads:** Run $50 Facebook/Instagram ad campaign

**Scaling Challenges to Address:**
- Onboarding flow optimization (reduce drop-off)
- Customer support (respond to user questions quickly)
- Bug fixes (prioritize critical issues)
- Performance (ensure app stays fast with more users)

#### 6.2 Metrics Dashboard
**User Story:** As a builder, I want to track product metrics in real-time

**Requirements:**
- [ ] Track Daily Active Users (DAU)
- [ ] Track total transactions per day/week/month
- [ ] Track user retention (day 1, day 7, day 30)
- [ ] Track average transaction value
- [ ] Track conversion funnel (signup → first payment)
- [ ] Track error rates (failed transactions)
- [ ] Display metrics in admin dashboard

**Metrics to Track:**
1. **User Metrics:**
   - Total signups
   - Active users (last 7 days)
   - Retention rate (% returning after 7 days)
   - Churn rate (% who stop using)

2. **Transaction Metrics:**
   - Total transaction volume (XLM)
   - Transactions per day
   - Average transaction size
   - Failed transaction rate

3. **Engagement Metrics:**
   - Groups created
   - Payments per group
   - Average time to first payment
   - Feature usage (% using auto-pay, etc.)

**Dashboard Tools:**
- Google Analytics (free)
- Mixpanel (free tier)
- Custom dashboard (React + Chart.js)
- Stellar Explorer API (on-chain data)

**UI Components:**
- Admin dashboard with charts
- Real-time metrics widgets
- Export to CSV button
- Date range filter

#### 6.3 Security Checklist Completion
**User Story:** As a user, I want my funds to be secure

**Requirements:**
- [ ] Smart contract audit (self-audit + checklist)
- [ ] Input validation on all forms
- [ ] SQL injection prevention (if using database)
- [ ] XSS prevention (sanitize user inputs)
- [ ] CSRF protection
- [ ] Rate limiting (prevent spam)
- [ ] Secure key storage (never expose private keys)
- [ ] HTTPS only (no HTTP)
- [ ] Content Security Policy (CSP) headers

**Security Checklist:**
✅ Smart contract tested for reentrancy attacks  
✅ All user inputs validated and sanitized  
✅ Private keys never stored in frontend  
✅ API rate limiting enabled  
✅ HTTPS enforced  
✅ Dependencies scanned for vulnerabilities (npm audit)  
✅ Error messages don't leak sensitive info  
✅ Transaction signing happens client-side only  

**Security Audit:**
- Use Soroban security best practices guide
- Run static analysis tools (Clippy for Rust)
- Manual code review (peer review if possible)
- Penetration testing (try to break your own app)

#### 6.4 Production Monitoring & Logging
**User Story:** As a developer, I want to catch errors before users report them

**Requirements:**
- [ ] Error tracking (Sentry or LogRocket)
- [ ] Performance monitoring (Web Vitals)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Transaction monitoring (alert if >10% fail)
- [ ] User activity logs (for debugging)
- [ ] Automated alerts (Slack/email on critical errors)

**Monitoring Tools:**
1. **Sentry:** Track JavaScript errors, React errors
2. **LogRocket:** Session replay (see what user saw when error occurred)
3. **UptimeRobot:** Ping app every 5 minutes, alert if down
4. **Stellar Horizon:** Monitor contract events, failed transactions

**Alerts to Set Up:**
- App downtime (>5 minutes)
- Error rate spike (>5 errors/minute)
- Failed transaction rate (>20%)
- Slow page load (>3 seconds)

**UI Components:**
- Status page (uptime.splitrent.com)
- Error reporting modal ("Something went wrong? [Report]")
- Performance metrics page (admin)

#### 6.5 Data Indexing (Advanced)
**User Story:** As a user, I want to search my payment history quickly

**Requirements:**
- [ ] Index all transactions in database
- [ ] Full-text search on payment history
- [ ] Filter by: date range, user, amount, status
- [ ] Export filtered results to CSV
- [ ] API endpoint for querying indexed data

**Indexing Strategy:**
- Use Stellar indexer (Mercury or custom)
- Store transactions in PostgreSQL/MongoDB
- Index fields: timestamp, payer, amount, status
- Sync every 15 seconds with on-chain data

**Why Indexing Matters:**
- Stellar Horizon API is slow for complex queries
- Users want instant search results
- Need historical data for analytics

**Implementation:**
1. Set up database (Supabase or MongoDB Atlas)
2. Run background job to fetch new transactions
3. Store in database with indexed columns
4. Query database (not Horizon) for user-facing features

#### 6.6 Advanced Feature Implementation
**User Story:** As a user, I want advanced features that make my life easier

**Choose ONE advanced feature:**

**Option A: Fee Sponsorship (Gasless Transactions)**
- User pays no fees
- App sponsors fees using fee bump transactions
- Absorb fee cost or pass to landlord (business model)

**Option B: Multi-Signature Logic**
- Require 2+ roommates to approve before releasing funds
- Useful for dispute resolution
- Implement Stellar multi-sig account

**Option C: Account Abstraction (Smart Wallet)**
- Email/SMS login (no wallet needed)
- App manages wallet in background
- Recover account with email/phone

**Option D: Cross-Border Flows (SEP-24/SEP-31)**
- Integrate with anchors for fiat on/off ramps
- Users can pay rent in USD, landlord receives USD
- Use Stellar rails for settlement

**Recommendation:** Implement **Fee Sponsorship** (easiest, biggest UX win)

**Fee Sponsorship Implementation:**
```javascript
// Frontend submits transaction
const tx = buildTransaction();

// Backend adds fee bump
const feeBumpTx = new FeeBumpTransaction(tx, sponsorKeypair);

// Submit to Stellar
await server.submitTransaction(feeBumpTx);
```

#### 6.7 Technical Documentation & User Guide
**User Story:** As a new user, I want a guide to help me get started

**Requirements:**
- [ ] User guide (how to use the app)
- [ ] Technical documentation (for developers)
- [ ] FAQ (common questions)
- [ ] Video tutorials (3-5 minutes each)
- [ ] API documentation (if applicable)

**User Guide Sections:**
1. Getting Started (wallet setup, first group)
2. Creating Groups (step-by-step with screenshots)
3. Making Payments (how to deposit share)
4. Viewing History (where to find receipts)
5. Troubleshooting (common issues)

**Technical Documentation:**
- README (setup, deployment)
- Architecture guide (how system works)
- Smart contract documentation (functions, events)
- API reference (endpoints, parameters)
- Contributing guide (for open source)

#### 6.8 Community Contribution
**User Story:** As a builder, I want to give back to the Stellar community

**Requirements:**
- [ ] Write blog post about your journey
- [ ] Post on Twitter/LinkedIn about your product
- [ ] Share on Stellar Discord/Telegram
- [ ] Present at community call (optional)
- [ ] Open source your code (or key components)

**Community Contribution Ideas:**
1. **Blog Post:** "How I Built a Rent Splitter on Stellar in 6 Weeks"
2. **Twitter Thread:** "🧵 My journey building @SplitRent on Stellar..."
3. **Tutorial:** "How to Build a Multi-Signature Escrow on Stellar"
4. **Video:** Demo Day presentation (upload to YouTube)
5. **Open Source:** Publish reusable components (e.g., wallet kit wrapper)

**Where to Share:**
- Stellar developers Discord
- r/Stellar subreddit
- Twitter with #StellarDevelopers hashtag
- Dev.to blog post
- Stellar community call

#### 6.9 Demo Day Preparation
**User Story:** As a builder, I want to present my product professionally

**Requirements:**
- [ ] 5-minute pitch deck (problem, solution, traction)
- [ ] Live demo (working app)
- [ ] Metrics slide (30 users, X transactions, Y volume)
- [ ] Roadmap slide (next 3-6 months)
- [ ] Q&A prep (anticipate questions)

**Pitch Deck Structure:**
1. **Problem:** "Roommates waste hours chasing rent payments"
2. **Solution:** "SplitRent automates rent splitting on Stellar"
3. **Demo:** Live walkthrough of app
4. **Traction:** "30 users, 120 transactions, $15K volume in 2 months"
5. **Business Model:** "0.5% fee per transaction = $75/month revenue"
6. **Roadmap:** "Landlord dashboard, fiat on/off ramps, 500 users by Q2"
7. **Ask:** "Applying for $90K SCF grant to scale to 10 cities"

**Demo Tips:**
- Rehearse 3+ times
- Have backup plan (pre-recorded video if live demo fails)
- Use production data (not staging/test)
- Show real user testimonials

**Technical Requirements:**
- 30+ verified active users
- Metrics dashboard live
- Security checklist completed
- Monitoring active (Sentry, UptimeRobot)
- Data indexing implemented
- Full documentation (user guide + technical docs)
- 1 community contribution (blog/tweet/video)
- 1 advanced feature implemented
- Minimum 30 meaningful commits
- Demo Day presentation prepared

**Deliverables:**
- Production app deployed
- List of 30+ user wallet addresses (verifiable on Stellar Explorer)
- Screenshot/link to metrics dashboard
- Screenshot of monitoring dashboard (Sentry, UptimeRobot)
- Link to completed security checklist
- Link to community contribution (Twitter post, blog, etc.)
- Advanced feature description + proof of implementation
- Data indexing approach + endpoint/dashboard
- Demo Day pitch deck
- GitHub repo with 30+ commits

---

## 🚀 POST-LEVEL 6: Scaling & SCF Application

### Continuous Improvement (Black Belt Recurring Rewards)
**Goal:** Earn $150/month by shipping features and onboarding users

**Requirements for Monthly Rewards:**
- [ ] Ship 1+ major feature per month
- [ ] Onboard 30+ new users per month
- [ ] Maintain >80% user retention
- [ ] Keep error rate <5%
- [ ] Respond to user feedback within 48 hours

**Feature Ideas for Ongoing Development:**
- Landlord dashboard (manage multiple properties)
- Rent insurance (cover late payments)
- Credit score integration (report on-time payments to credit bureaus)
- International support (multi-currency, multi-language)
- Mobile app (React Native)

### Stellar Community Fund (SCF) Application
**Goal:** Secure $50K-$100K grant to scale

**SCF Application Requirements:**
- [ ] Proven traction (200+ users)
- [ ] Clear roadmap (next 12 months)
- [ ] Team (or hiring plan)
- [ ] Financial projections (revenue, expenses)
- [ ] Impact metrics (how many people helped)
- [ ] Ecosystem contribution (open source, education)

**Application Timeline:**
- Month 6: Finish Black Belt
- Month 7-8: Scale to 200 users
- Month 9: Prepare SCF application
- Month 10: Submit application
- Month 11-12: Interview process
- Month 13: Grant awarded 🎉

**SCF Application Sections:**
1. **Problem:** Rent payment friction costs roommates time & money
2. **Solution:** Automated, transparent, instant rent splitting
3. **Traction:** 200+ users, $50K monthly volume, 85% retention
4. **Market Size:** 40M US renters, 50% share apartments
5. **Business Model:** 0.5% fee = $250K annual revenue at scale
6. **Use of Funds:** Hire 2 developers, 1 marketer, expand to 10 cities
7. **Impact:** Help 10,000 users save $500K in fees over 2 years
8. **Roadmap:** Landlord partnerships, fiat integration, mobile app

---

## 📊 Success Criteria Summary

### Level 1 (White Belt) - Week 1:
✅ Wallet connected  
✅ Balance displayed  
✅ Single payment sent  
✅ Transaction confirmed  

### Level 2 (Yellow Belt) - Week 1:
✅ Multi-wallet support  
✅ Contract deployed  
✅ Contract called from frontend  
✅ Error handling for 3+ scenarios  

### Level 3 (Orange Belt) - Week 2-3:
✅ Full group management  
✅ Payment history  
✅ 3+ tests passing  
✅ Demo video recorded  

### Level 4 (Green Belt) - Week 3-4:
✅ Advanced contract patterns  
✅ CI/CD running  
✅ Mobile responsive  
✅ Production deployed  

### Level 5 (Blue Belt) - Week 4-6:
✅ Mentor approval received  
✅ 5+ real users onboarded  
✅ Feedback documented  
✅ 1 iteration completed  

### Level 6 (Black Belt) - Week 7-12:
✅ 30+ users onboarded  
✅ Metrics dashboard live  
✅ Security audit complete  
✅ Monitoring active  
✅ Advanced feature shipped  
✅ Demo Day presentation delivered  

---

## 🎯 Next Steps

After completing this PRD:
1. Review tech stack recommendations (see Tech Stack section)
2. Set up development environment
3. Start Level 1 (target: 3 days)
4. Follow week-by-week execution plan
5. Join Stellar Discord for support
6. Submit to program dashboard monthly

**Estimated Timeline:**
- Levels 1-3: 3 weeks
- Level 4: 2 weeks
- Level 5: 3 weeks
- Level 6: 4-6 weeks
- **Total: 12-14 weeks to Black Belt**

Good luck! 🚀