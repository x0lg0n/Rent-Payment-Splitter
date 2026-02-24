import Link from "next/link";
import { Loader2, LogOut, Wallet } from "lucide-react";
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

        <nav className="hidden items-center gap-5 md:flex">
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
          {connected ? (
            <Button variant="outline" onClick={onDisconnect}>
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <Button
              className="bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]"
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
    </header>
  );
}
