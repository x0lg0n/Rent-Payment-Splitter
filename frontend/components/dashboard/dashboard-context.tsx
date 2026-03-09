"use client";

import { createContext, useContext } from "react";
import type { useWallet as useWalletHook } from "@/lib/hooks/use-wallet";
import type { ToastLevel } from "@/components/dashboard/toast-stack";

type WalletState = ReturnType<typeof useWalletHook>;

interface DashboardContextValue {
  wallet: WalletState;
  pushToast: (title: string, description: string, level?: ToastLevel) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardContextProviderProps {
  value: DashboardContextValue;
  children: React.ReactNode;
}

export function DashboardContextProvider({ value, children }: DashboardContextProviderProps) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within DashboardContextProvider");
  }
  return context;
}
