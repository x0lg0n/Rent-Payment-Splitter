"use client";

import Image from "next/image";
import { Bell, Search, Sparkles } from "lucide-react";

interface DashboardPageHeaderProps {
  title: string;
  subtitle: string;
  badgeLabel?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function DashboardPageHeader({
  title,
  subtitle,
  badgeLabel = "Dashboard overview",
  showSearch = true,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search by hash or address",
}: DashboardPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
          <Sparkles className="h-3.5 w-3.5" />
          {badgeLabel}
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>

      <div className="flex w-full items-center justify-end gap-2 md:w-auto">
        {showSearch && (
          <label className="relative flex-1 md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-sky-500 dark:focus:ring-sky-500/20"
            />
          </label>
        )}
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="User profile"
        >
          <Image
            src="/user-avatar.svg"
            alt="User profile"
            fill
            sizes="40px"
            className="h-full w-full object-cover"
          />
          <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>
      </div>
    </header>
  );
}
