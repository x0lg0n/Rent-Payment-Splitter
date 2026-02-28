/**
 * Zustand Store for SplitRent
 * 
 * Install: pnpm add zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TransactionRecord } from "@/lib/types/transaction";
import type { EscrowData } from "@/lib/stellar/contract";

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
    { name: "splitrent-wallet" }
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
          set((state) => ({ transactions: [tx, ...state.transactions] }));
        }
      },
      
      setTransactions: (transactions) => set({ transactions }),
      clearTransactions: () => set({ transactions: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "splitrent-transactions" }
  )
);

// ============ ESCROW STATE ============

interface EscrowState {
  escrows: EscrowData[];
  currentEscrowId: bigint | null;
  isLoading: boolean;
  
  addEscrow: (escrow: EscrowData) => void;
  updateEscrow: (escrowId: bigint, updates: Partial<EscrowData>) => void;
  setCurrentEscrow: (escrowId: bigint | null) => void;
  setEscrows: (escrows: EscrowData[]) => void;
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
        if (!existingIds.has(escrow.id)) {
          set((state) => ({ escrows: [escrow, ...state.escrows] }));
        }
      },
      
      updateEscrow: (escrowId, updates) => {
        set((state) => ({
          escrows: state.escrows.map((e) =>
            e.id === escrowId ? { ...e, ...updates } : e
          ),
        }));
      },
      
      setCurrentEscrow: (escrowId) => set({ currentEscrowId: escrowId }),
      setEscrows: (escrows) => set({ escrows }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "splitrent-escrows" }
  )
);
