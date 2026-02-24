import Link from "next/link";
import { useState } from "react";
import { Loader2, LogOut, Menu, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface DashboardHeaderProps {
  connected: boolean;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
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
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/35 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/35">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand-soft)]">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">SplitRent Dashboard</p>
            <p className="text-[11px] text-muted-foreground">Testnet payments</p>
          </div>
        </Link>

        <nav aria-label="Dashboard navigation" className="hidden items-center gap-5 md:flex">
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
          {connected ? (
            <Button variant="outline" className="hidden md:inline-flex" onClick={onDisconnect}>
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <Button
              className="hidden bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)] md:inline-flex"
              onClick={onConnect}
              disabled={connecting}
            >
              {connecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-4 w-4" />
              )}
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <nav aria-label="Mobile dashboard navigation" className="border-t border-white/35 px-6 py-3 md:hidden dark:border-white/10">
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
            {connected ? (
              <Button variant="outline" className="mt-1" onClick={onDisconnect}>
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button
                className="mt-1 bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]"
                onClick={onConnect}
                disabled={connecting}
              >
                {connecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="mr-2 h-4 w-4" />
                )}
                Connect Wallet
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
