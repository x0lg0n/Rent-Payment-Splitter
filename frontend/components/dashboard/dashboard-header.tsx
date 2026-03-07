import Link from "next/link";
import { useState } from "react";
import {
  Loader2,
  LogOut,
  Menu,
  Wallet,
  RefreshCcw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { WalletSelector } from "./wallet-selector";
import { SUPPORTED_WALLETS } from "@/lib/wallet/wallet-kit";

interface DashboardHeaderProps {
  connected: boolean;
  connecting: boolean;
  onConnect: (walletId?: string) => void;
  onDisconnect: () => void;
  lastWalletId?: string | null;
  currentWalletId?: string | null;
}

const navItems = [
  { label: "Balance", href: "#balance" },
  { label: "Send Payment", href: "#payment" },
  { label: "History", href: "#history" },
];

export function DashboardHeader({
  connected,
  connecting,
  onConnect,
  onDisconnect,
  lastWalletId,
  currentWalletId,
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);

  const handleConnectClick = () => {
    setWalletSelectorOpen(true);
  };

  const handleWalletSelect = (walletId: string) => {
    setWalletSelectorOpen(false);
    onConnect(walletId);
  };

  const handleDisconnect = () => {
    onDisconnect();
    // Clear localStorage to ensure complete disconnect
    localStorage.removeItem("splitrent:lastWallet");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/35 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/35">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand-soft)]">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">
                SplitRent Dashboard
              </p>
              <p className="text-[11px] text-muted-foreground">
                Testnet payments
              </p>
            </div>
          </Link>

          <nav
            aria-label="Dashboard navigation"
            className="hidden items-center gap-5 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}>
              <Menu className="h-5 w-5" />
            </Button>

            {connected ? (
              <>
                {/* Wallet Status Display */}
                <Button
                  variant="outline"
                  onClick={handleConnectClick}
                  className="hidden md:flex">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Switch Wallet
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  className="hidden md:flex">
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnectClick}
                disabled={connecting}
                className="hidden md:flex">
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/35 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
            <nav
              className="flex flex-col gap-1 p-4"
              aria-label="Mobile navigation">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
              <div className="my-2 border-t border-border" />
              {connected ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleConnectClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start mb-2">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Switch Wallet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDisconnect();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    handleConnectClick();
                    setMobileMenuOpen(false);
                  }}
                  disabled={connecting}
                  className="w-full justify-start">
                  {connecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Wallet Selector Dialog */}
      <WalletSelector
        isOpen={walletSelectorOpen}
        onClose={() => setWalletSelectorOpen(false)}
        onSelect={handleWalletSelect}
        lastWalletId={lastWalletId}
        currentWalletId={currentWalletId}
      />
    </>
  );
}
