"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Service", href: "#service-info" },
  { label: "FAQ", href: "#faq" },
];

interface LandingHeaderProps {
  onConnectClick?: () => void;
}

export function LandingHeader({ onConnectClick }: LandingHeaderProps) {
  return (
    <header className="border-b border-white/35 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/45">
      <div className="mx-auto flex w-full items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand-soft)]">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">SplitRent</p>
            <p className="text-[11px] text-muted-foreground">Rent Payment Splitter</p>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 md:flex dark:border-slate-700 dark:bg-slate-900/80">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button 
            variant="outline" 
            className="hidden md:flex"
            onClick={onConnectClick}
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}
