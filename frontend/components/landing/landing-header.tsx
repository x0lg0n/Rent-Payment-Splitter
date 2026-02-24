"use client";

import Link from "next/link";
import { LogOut, Menu, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useCallback, useEffect, useState } from "react";
import { connectFreighter, getFreighterSession } from "@/lib/wallet/freighter";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "FAQ", href: "#faq" },
];

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const session = await getFreighterSession();
        if (session) setWalletAddress(session.address);
      } catch {
        /* silently ignore */
      }
    };
    void restore();
  }, []);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const session = await connectFreighter();
      setWalletAddress(session.address);
    } catch {
      /* connection failed — user sees no change */
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    setWalletAddress(null);
  }, []);

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/35 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/35">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand-soft)]">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">SplitRent</p>
            <p className="text-[11px] text-muted-foreground">Rent Payment Splitter</p>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
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
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop CTA */}
          {walletAddress ? (
            <Button
              onClick={handleDisconnect}
              className="hidden gap-2 bg-destructive text-white hover:bg-destructive/90 md:inline-flex"
            >
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="hidden bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)] md:inline-flex"
            >
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <nav aria-label="Mobile navigation" className="border-t border-white/35 px-6 py-3 md:hidden dark:border-white/10">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </a>
            ))}

            {walletAddress ? (
              <Button
                onClick={() => { handleDisconnect(); setMobileMenuOpen(false); }}
                className="mt-1 gap-2 bg-destructive text-white hover:bg-destructive/90"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={() => { void handleConnect(); setMobileMenuOpen(false); }}
                disabled={isConnecting}
                className="mt-1 bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]"
              >
                {isConnecting ? "Connecting…" : "Connect Wallet"}
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
