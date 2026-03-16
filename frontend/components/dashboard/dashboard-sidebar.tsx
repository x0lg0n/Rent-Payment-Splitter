"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Copy,
  FolderOpen,
  House,
  PlusSquare,
  Power,
  RefreshCw,
  Send,
  Settings,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  walletAddress: string | null;
  shortAddress: string | null;
  walletOnTestnet: boolean;
  walletOnMainnet: boolean;
  isRefreshingBalance: boolean;
  onRefreshBalance: () => void;
  onOpenWalletSelector: () => void;
  onDisconnect: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: House },
  { label: "Transfer", href: "/dashboard/transfer", icon: Send },
  { label: "Escrows", href: "/dashboard/escrows", icon: FolderOpen },
  {
    label: "Create Escrow",
    href: "/dashboard/escrow-create",
    icon: PlusSquare,
  },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname.startsWith(href);
}

export function DashboardSidebar({
  isCollapsed,
  onToggleCollapse,
  walletAddress,
  shortAddress,
  walletOnTestnet,
  walletOnMainnet,
  isRefreshingBalance,
  onRefreshBalance,
  onOpenWalletSelector,
  onDisconnect,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    if (!addressCopied) return;
    const timer = window.setTimeout(() => setAddressCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [addressCopied]);

  const handleCopyWalletAddress = async () => {
    if (!walletAddress) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(walletAddress);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = walletAddress;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setAddressCopied(true);
    } catch {
      // Keep UI silent on clipboard failure.
    }
  };

  return (
    <aside
      className={cn(
        "z-30 flex w-full flex-col rounded-[30px] border border-white/70 bg-[#b8c4e9]/78 p-4 shadow-[0_20px_60px_rgba(60,88,163,0.18)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/78 lg:fixed lg:top-6 lg:left-[max(0.75rem,calc((100vw-1500px)/2+0.75rem))] lg:h-[calc(100vh-3rem)]",
        isCollapsed ? "lg:w-24 lg:p-3" : "lg:w-65 lg:p-5"
      )}>
      <div
        className={cn(
          "relative flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "gap-3"
          )}>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Wallet className="h-5 w-5" />
          </div>
          <div className={cn("transition-opacity", isCollapsed && "lg:hidden")}>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              SplitRent
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Dashboard
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "hidden rounded-xl text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white lg:inline-flex",
            isCollapsed && "lg:absolute lg:right-5"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggleCollapse}>
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => void handleCopyWalletAddress()}
        disabled={!walletAddress}
        aria-label={
          walletAddress ? "Copy wallet address" : "Wallet not connected"
        }
        className={cn(
          "mt-5 rounded-2xl border border-white/70 bg-white/70 p-4 text-left transition dark:border-white/10 dark:bg-slate-900/60",
          walletAddress
            ? "cursor-copy hover:bg-white/85 dark:hover:bg-slate-900/75"
            : "cursor-not-allowed opacity-85",
          isCollapsed && "lg:hidden"
        )}>
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Wallet
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            {shortAddress ?? "Not connected"}
          </p>
          {walletAddress ? (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {addressCopied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          {walletOnTestnet
            ? "Testnet Connected"
            : walletOnMainnet
            ? "Mainnet Connected"
            : "No network"}
        </p>
      </button>

      <nav
        className={cn(
          "mt-5 grid gap-2",
          isCollapsed && "lg:justify-items-center"
        )}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                isCollapsed && "lg:h-11 lg:w-11 lg:justify-center lg:px-0",
                active
                  ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                  : "text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-800/70"
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className={cn(isCollapsed && "lg:sr-only")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto space-y-3 pt-4", isCollapsed && "lg:hidden")}>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-white/70 bg-white/70 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={onRefreshBalance}>
            <RefreshCw
              className={cn(
                "mr-2 h-4 w-4",
                isRefreshingBalance && "animate-spin"
              )}
            />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-white/70 bg-white/70 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={onOpenWalletSelector}>
            Switch
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
            onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "mt-auto hidden flex-col items-center gap-2 pt-4 lg:flex",
          !isCollapsed && "lg:hidden"
        )}>
        <ThemeToggle />
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-white/70 bg-white/70 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-800"
          aria-label="Refresh balance"
          onClick={onRefreshBalance}>
          <RefreshCw
            className={cn("h-4 w-4", isRefreshingBalance && "animate-spin")}
          />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-white/70 bg-white/70 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-800"
          aria-label="Switch wallet"
          onClick={onOpenWalletSelector}>
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
          aria-label="Disconnect wallet"
          onClick={onDisconnect}>
          <Power className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
