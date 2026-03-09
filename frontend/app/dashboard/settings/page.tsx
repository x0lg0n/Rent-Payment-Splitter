"use client";

import { useState } from "react";
import { Bell, Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";

interface ToggleRowProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-300">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition ${
          enabled ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-slate-600"
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            enabled ? "left-6 dark:bg-slate-900" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { wallet, pushToast } = useDashboardContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [securityAlertsEnabled, setSecurityAlertsEnabled] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  return (
    <>
      <DashboardPageHeader
        title="Settings"
        subtitle="Control dashboard preferences, notifications, and wallet behavior."
        badgeLabel="Workspace settings"
        showSearch={false}
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Preferences</h2>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Notifications"
              description="Enable wallet and payment notification banners."
              enabled={notificationsEnabled}
              onToggle={() => setNotificationsEnabled((value) => !value)}
            />
            <ToggleRow
              label="Security alerts"
              description="Get alerts for failed transactions or network mismatch."
              enabled={securityAlertsEnabled}
              onToggle={() => setSecurityAlertsEnabled((value) => !value)}
            />
            <ToggleRow
              label="Auto refresh"
              description="Automatically refresh wallet balance every 30 seconds."
              enabled={autoRefreshEnabled}
              onToggle={() => setAutoRefreshEnabled((value) => !value)}
            />
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Appearance</h3>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Theme mode</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">Switch light/dark dashboard theme.</p>
              </div>
              <ThemeToggle />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Account</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <Wallet className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <span className="text-slate-600 dark:text-slate-300">Wallet: {wallet.shortAddress ?? "Not connected"}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <Bell className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <span className="text-slate-600 dark:text-slate-300">Notifications: {notificationsEnabled ? "On" : "Off"}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <Shield className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <span className="text-slate-600 dark:text-slate-300">Security alerts: {securityAlertsEnabled ? "On" : "Off"}</span>
              </div>
            </div>

            <Button
              className="mt-4 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              onClick={() => pushToast("Settings Saved", "Your preference updates are stored locally.", "success")}
            >
              Save preferences
            </Button>
          </article>
        </aside>
      </div>
    </>
  );
}
