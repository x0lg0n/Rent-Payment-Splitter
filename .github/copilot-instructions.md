# GitHub Copilot Instructions for SplitRent

## Project Overview

**SplitRent** is a decentralized rent payment splitter built on Stellar blockchain. The app helps roommates automate rent payments with transparent tracking and instant settlements.

**Target Users:** College students, young professionals, co-living spaces  
**Core Value:** "Never chase roommates for rent again"

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router, not Pages Router)
- **Language:** TypeScript (strict mode enabled)
- **Styling:** Tailwind CSS v3
- **Components:** shadcn/ui (Radix UI primitives)
- **State:** Zustand for global state, React hooks for local state
- **Icons:** lucide-react

### Blockchain
- **Network:** Stellar (testnet for development)
- **SDK:** @stellar/stellar-sdk v11+
- **Wallets:** @creit.tech/stellar-wallets-kit (Freighter, xBull, Albedo)
- **Smart Contracts:** Soroban (Rust)

### Backend (Optional)
- **API Routes:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Monitoring:** Sentry
- **Analytics:** Google Analytics 4

### Testing
- **Unit:** Jest
- **Component:** React Testing Library
- **E2E:** Playwright
- **Contract:** Soroban test framework (Rust)

### DevOps
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions
- **Monitoring:** UptimeRobot + Sentry

## Code Style & Patterns

### TypeScript
Always use strict TypeScript. Define interfaces for all data structures.

```typescript
// ✅ PREFERRED
interface RentGroup {
  id: string;
  name: string;
  totalRent: number;
  participants: Participant[];
  landlordAddress: string;
  dueDate: Date;
  contractAddress: string;
  status: 'active' | 'completed' | 'cancelled';
}

// ❌ AVOID
const group: any = { ... };
```

### React Patterns
Use functional components with hooks. No class components.

```typescript
// ✅ PREFERRED
export const WalletButton = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleConnect = async () => {
    // Implementation
  };
  
  return <Button onClick={handleConnect}>Connect Wallet</Button>;
};

// ❌ AVOID
class WalletButton extends React.Component { ... }
```

### Async Operations
Always use async/await. Never use `.then()` chains.

```typescript
// ✅ PREFERRED
const fetchBalance = async (address: string) => {
  try {
    const response = await fetch(`/api/balance/${address}`);
    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error('Balance fetch failed:', error);
    throw error;
  }
};

// ❌ AVOID
const fetchBalance = (address: string) => {
  return fetch(`/api/balance/${address}`)
    .then(res => res.json())
    .then(data => data.balance);
};
```

### Error Handling
All async operations must have try-catch blocks.

```typescript
// ✅ PREFERRED
const sendPayment = async (amount: number, recipient: string) => {
  try {
    setLoading(true);
    const result = await stellar.sendXLM(amount, recipient);
    toast.success('Payment sent!');
    return result;
  } catch (error) {
    toast.error(`Payment failed: ${error.message}`);
    throw error;
  } finally {
    setLoading(false);
  }
};
```

### Loading States
Always show loading states for async operations.

```typescript
// ✅ PREFERRED
export const BalanceCard = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  if (loading) return <Skeleton className="h-20" />;
  if (!balance) return <EmptyState />;
  
  return <div>{balance} XLM</div>;
};
```

### Mobile Responsive
All components must be mobile responsive (mobile-first).

```typescript
// ✅ PREFERRED
<div className="
  flex flex-col gap-4 p-4
  md:flex-row md:gap-6 md:p-6
  lg:max-w-6xl lg:mx-auto
">
  {/* Content */}
</div>
```

## Stellar Integration Best Practices

### Wallet Connection
```typescript
import { StellarWalletsKit, WalletNetwork } from '@creit.tech/stellar-wallets-kit';

const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWallet: 'freighter', // or 'xbull', 'albedo'
});

// Connect wallet
const { address } = await kit.openModal({
  onWalletSelected: async (option) => {
    kit.setWallet(option.id);
    const { address } = await kit.getAddress();
    return address;
  }
});
```

### Transaction Submission
```typescript
import { SorobanRpc, Transaction } from '@stellar/stellar-sdk';

const submitTransaction = async (tx: Transaction) => {
  try {
    // Sign transaction with wallet
    const signedTx = await walletKit.sign(tx);
    
    // Submit to network
    const server = new SorobanRpc.Server(HORIZON_URL);
    const result = await server.sendTransaction(signedTx);
    
    // Wait for confirmation
    if (result.status === 'PENDING') {
      let status;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = await server.getTransaction(result.hash);
      } while (status.status === 'PENDING');
    }
    
    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw new Error('Transaction submission failed');
  }
};
```

### Contract Invocation
```typescript
import { Contract, nativeToScVal } from '@stellar/stellar-sdk';

const callContract = async (contractId: string, method: string, args: any[]) => {
  const contract = new Contract(contractId);
  
  // Convert args to ScVal
  const scArgs = args.map(arg => nativeToScVal(arg));
  
  // Build operation
  const operation = contract.call(method, ...scArgs);
  
  // Build and submit transaction
  const tx = buildTransaction(operation);
  const result = await submitTransaction(tx);
  
  return result;
};
```

## Component Patterns

### Data Fetching
```typescript
// Use custom hooks for data fetching
export const useBalance = (address: string | null) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!address) return;
    
    const fetchBalance = async () => {
      setLoading(true);
      try {
        const bal = await getAccountBalance(address);
        setBalance(bal);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, [address]);
  
  return { balance, loading, error };
};
```

### Forms
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const groupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  totalRent: z.number().positive('Rent must be positive'),
  participants: z.array(z.string()).min(2, 'At least 2 participants required'),
});

export const CreateGroupForm = () => {
  const form = useForm({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      totalRent: 0,
      participants: [],
    },
  });
  
  const onSubmit = async (data: z.infer<typeof groupSchema>) => {
    // Handle form submission
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
};
```

### Modals/Dialogs
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const PaymentModal = ({ open, onOpenChange, group }) => {
  const [amount, setAmount] = useState('');
  
  const handlePay = async () => {
    // Payment logic
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Your Share</DialogTitle>
        </DialogHeader>
        {/* Modal content */}
      </DialogContent>
    </Dialog>
  );
};
```

## File Naming Conventions

- **Components:** PascalCase (e.g., `WalletButton.tsx`)
- **Utilities:** camelCase (e.g., `formatAddress.ts`)
- **Hooks:** camelCase with `use` prefix (e.g., `useWallet.ts`)
- **Types:** PascalCase (e.g., `RentGroup.ts`)
- **API Routes:** lowercase (e.g., `balance.ts`)

## Import Organization

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { toast } from 'sonner';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Local components
import { WalletButton } from '@/components/wallet/WalletButton';

// 5. Utilities
import { formatAddress } from '@/lib/utils';
import { sendXLM } from '@/lib/stellar/transactions';

// 6. Types
import type { RentGroup } from '@/types/groups';
```

## Common Tasks

### Add a New Component
```bash
# Create component file
touch components/groups/GroupCard.tsx

# Component structure
import type { RentGroup } from '@/types/groups';

interface GroupCardProps {
  group: RentGroup;
  onClick?: () => void;
}

export const GroupCard = ({ group, onClick }: GroupCardProps) => {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg">
      <h3>{group.name}</h3>
      <p>{group.totalRent} XLM</p>
    </Card>
  );
};
```

### Add a New Page
```bash
# Create page file (App Router)
touch app/groups/page.tsx

# Page structure
export default function GroupsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">My Groups</h1>
      {/* Page content */}
    </div>
  );
}
```

### Add a New API Route
```bash
# Create API route
touch app/api/balance/[address]/route.ts

# Route structure
import { NextRequest, NextResponse } from 'next/server';
import { getAccountBalance } from '@/lib/stellar/accounts';

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const balance = await getAccountBalance(params.address);
    return NextResponse.json({ balance });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_CONTRACT_ID=C...

# Optional (production)
DATABASE_URL=postgresql://...
SENTRY_DSN=https://...
```

## Testing Patterns

### Component Tests
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletButton } from './WalletButton';

describe('WalletButton', () => {
  it('should connect wallet when clicked', async () => {
    const onConnect = jest.fn();
    render(<WalletButton onConnect={onConnect} />);
    
    const button = screen.getByRole('button', { name: /connect/i });
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(onConnect).toHaveBeenCalled();
    });
  });
});
```

### Utility Tests
```typescript
import { calculateSplit } from './splitCalculator';

describe('calculateSplit', () => {
  it('should split rent equally', () => {
    const result = calculateSplit(1000, 4);
    expect(result).toEqual([250, 250, 250, 250]);
  });
  
  it('should handle uneven splits', () => {
    const result = calculateSplit(1000, 3);
    expect(result).toEqual([333.33, 333.33, 333.34]);
  });
});
```

## Commit Message Format

Use conventional commits:

```bash
feat: add wallet connection with Freighter
fix: handle insufficient balance error
docs: update README with setup instructions
test: add tests for split calculation
refactor: extract wallet logic to custom hook
style: format code with prettier
perf: optimize balance fetching with cache
```

## Common Stellar Operations

### Get Account Balance
```typescript
import { Server } from '@stellar/stellar-sdk';

const getBalance = async (address: string): Promise<number> => {
  const server = new Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(address);
  
  const xlmBalance = account.balances.find(
    (b) => b.asset_type === 'native'
  );
  
  return parseFloat(xlmBalance?.balance || '0');
};
```

### Send XLM Payment
```typescript
import { 
  Asset, 
  Keypair, 
  Operation, 
  Server, 
  TransactionBuilder 
} from '@stellar/stellar-sdk';

const sendXLM = async (
  sourceKeypair: Keypair,
  destination: string,
  amount: string
) => {
  const server = new Server('https://horizon-testnet.stellar.org');
  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
  
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: '10000',
    networkPassphrase: 'Test SDF Network ; September 2015',
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount,
      })
    )
    .setTimeout(30)
    .build();
  
  transaction.sign(sourceKeypair);
  
  const result = await server.submitTransaction(transaction);
  return result;
};
```

## Remember

- **Mobile-first:** Design for mobile, enhance for desktop
- **Accessibility:** Use semantic HTML and ARIA labels
- **Performance:** Code split, lazy load, optimize images
- **Security:** Never expose private keys, validate all inputs
- **Error handling:** User-friendly messages, log for debugging
- **Testing:** Write tests as you code, not after
- **Documentation:** Comment complex logic, update README

## Quick Links

- **Stellar Docs:** https://developers.stellar.org
- **Soroban Docs:** https://soroban.stellar.org
- **Next.js Docs:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs

---

Happy coding! Build something amazing! 🚀
