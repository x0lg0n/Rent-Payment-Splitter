/**
 * Zustand Store for SplitRent
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TransactionRecord } from "@/lib/types/transaction";

// Custom storage that handles BigInt serialization
const createBigIntSafeStorage = () => {
  return {
    getItem: (name: string) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      return JSON.parse(str);
    },
    setItem: (name: string, value: unknown) => {
      // Convert BigInt to string for serialization
      const serialized = JSON.stringify(value, (key, val) => {
        if (typeof val === 'bigint') {
          return val.toString();
        }
        return val;
      });
      localStorage.setItem(name, serialized);
    },
    removeItem: (name: string) => {
      localStorage.removeItem(name);
    },
  };
};

// ============ WALLET STATE ============

interface WalletState {
  walletAddress: string | null;
  walletNetwork: string | null;
  walletBalance: number | null;
  isConnecting: boolean;
  
  setWallet: (address: string, network: string) => void;
  setBalance: (balance: number) => void;
  setConnecting: (connecting: boolean) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      walletAddress: null,
      walletNetwork: null,
      walletBalance: null,
      isConnecting: false,
      
      setWallet: (address, network) => set({ 
        walletAddress: address, 
        walletNetwork: network,
        isConnecting: false 
      }),
      
      setBalance: (balance) => set({ walletBalance: balance }),
      setConnecting: (connecting) => set({ isConnecting: connecting }),
      
      disconnect: () => set({ 
        walletAddress: null, 
        walletNetwork: null, 
        walletBalance: null 
      }),
    }),
    {
      name: "splitrent-wallet",
      version: 2,
      migrate: () => ({
        walletAddress: null,
        walletNetwork: null,
        walletBalance: null,
        isConnecting: false,
      }),
      partialize: () => ({}),
      storage: createJSONStorage(() => createBigIntSafeStorage()),
    }
  )
);

// ============ TRANSACTION STATE ============

interface TransactionState {
  transactions: TransactionRecord[];
  isLoading: boolean;
  
  addTransaction: (tx: TransactionRecord) => void;
  setTransactions: (transactions: TransactionRecord[]) => void;
  clearTransactions: () => void;
  setLoading: (loading: boolean) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      
      addTransaction: (tx) => {
        const existingHashes = new Set(get().transactions.map(t => t.hash));
        if (!existingHashes.has(tx.hash)) {
          set((state) => ({
            transactions: [tx, ...state.transactions]
          }));
        }
      },
      
      setTransactions: (transactions) => set({ transactions }),
      clearTransactions: () => set({ transactions: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "splitrent-transactions",
      storage: createJSONStorage(() => createBigIntSafeStorage()),
    }
  )
);

// ============ ESCROW STATE ============

// Convert BigInt fields to string for storage
interface EscrowDataStorage {
  id: string;
  creator: string;
  landlord: string;
  participants: Array<{
    address: string;
    share_amount: string;
    deposited: boolean;
  }>;
  total_rent: string;
  deposited_amount: string;
  deadline: string;
  status: string;
  created_at: string;
}

interface EscrowState {
  escrows: EscrowDataStorage[];
  currentEscrowId: string | null;
  isLoading: boolean;
  
  addEscrow: (escrow: {
    id: bigint | string;
    creator: string;
    landlord: string;
    participants: Array<{
      address: string;
      share_amount: bigint | string;
      deposited: boolean;
    }>;
    total_rent: bigint | string;
    deposited_amount: bigint | string;
    deadline: bigint | string;
    status: string;
    created_at: bigint | string;
  }) => void;
  updateEscrow: (escrowId: bigint, updates: Partial<EscrowDataStorage>) => void;
  setCurrentEscrow: (escrowId: bigint | null) => void;
  setEscrows: (escrows: EscrowDataStorage[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useEscrowStore = create<EscrowState>()(
  persist(
    (set, get) => ({
      escrows: [],
      currentEscrowId: null,
      isLoading: false,
      
      addEscrow: (escrow) => {
        const existingIds = new Set(get().escrows.map(e => e.id));
        if (!existingIds.has(escrow.id.toString())) {
          // Convert to storage format
          const storageEscrow: EscrowDataStorage = {
            id: escrow.id.toString(),
            creator: escrow.creator,
            landlord: escrow.landlord,
            participants: escrow.participants.map((p: { address: string; share_amount: bigint; deposited: boolean }) => ({
              address: p.address,
              share_amount: p.share_amount.toString(),
              deposited: p.deposited,
            })),
            total_rent: escrow.total_rent.toString(),
            deposited_amount: escrow.deposited_amount.toString(),
            deadline: escrow.deadline.toString(),
            status: escrow.status,
            created_at: escrow.created_at.toString(),
          };

          set((state) => ({
            escrows: [storageEscrow, ...state.escrows]
          }));
        }
      },
      
      updateEscrow: (escrowId, updates) => {
        const idStr = escrowId.toString();
        set((state) => ({
          escrows: state.escrows.map((e) =>
            e.id === idStr ? { ...e, ...updates } : e
          ),
        }));
      },
      
      setCurrentEscrow: (escrowId) => {
        const idStr = escrowId ? escrowId.toString() : null;
        set({ currentEscrowId: idStr });
      },
      
      setEscrows: (escrows) => set({ escrows }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "splitrent-escrows",
      storage: createJSONStorage(() => createBigIntSafeStorage()),
    }
  )
);
