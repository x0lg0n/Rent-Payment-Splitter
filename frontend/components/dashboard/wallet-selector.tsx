"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  SUPPORTED_WALLETS,
} from "@/lib/wallet/wallet-kit";
import { X } from "lucide-react";

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (walletId: string) => void;
}

export function WalletSelector({ isOpen, onClose, onSelect }: WalletSelectorProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <div>
            <AlertDialogTitle>Connect Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              Select your preferred Stellar wallet
            </AlertDialogDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogHeader>
        
        <div className="grid grid-cols-1 gap-3 py-4">
          {SUPPORTED_WALLETS.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="flex h-14 items-center justify-start gap-4 px-4 text-left hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
              onClick={() => onSelect(wallet.id)}
            >
              <span className="text-2xl">{wallet.icon}</span>
              <span className="font-semibold">{wallet.name}</span>
            </Button>
          ))}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
