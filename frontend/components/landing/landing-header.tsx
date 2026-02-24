import Link from "next/link";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "FAQ", href: "#faq" },
];

export function LandingHeader() {
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
          <Button asChild className="bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
