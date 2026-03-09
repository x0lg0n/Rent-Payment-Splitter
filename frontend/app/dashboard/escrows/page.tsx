"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { useEscrowStore } from "@/lib/store";

function formatXlm(value: string) {
  const amount = Number(value) / 10_000_000;
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(2);
}

function formatDate(value: string) {
  const date = new Date(Number(value) * 1000);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default function EscrowsPage() {
  const router = useRouter();
  const { escrows } = useEscrowStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEscrows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return escrows;
    return escrows.filter((escrow) => {
      return (
        escrow.id.toLowerCase().includes(query) ||
        escrow.landlord.toLowerCase().includes(query) ||
        escrow.status.toLowerCase().includes(query)
      );
    });
  }, [escrows, searchTerm]);

  return (
    <>
      <DashboardPageHeader
        title="View escrows"
        subtitle="Track active escrow contracts, funding progress, and deadlines."
        badgeLabel="Escrow board"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by escrow ID, landlord, or status"
      />

      <div className="mt-6 grid gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-300">Total escrows</p>
              <p className="text-2xl font-semibold text-slate-950 dark:text-white">{escrows.length}</p>
            </div>
            <Button
              className="rounded-xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              onClick={() => router.push("/dashboard/escrow-create")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create escrow
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          {filteredEscrows.length > 0 ? (
            <div className="space-y-3">
              {filteredEscrows.map((escrow) => {
                const depositedCount = escrow.participants.filter((p: { deposited: boolean }) => p.deposited).length;
                const participantCount = escrow.participants.length;
                const progress = participantCount > 0 ? (depositedCount / participantCount) * 100 : 0;

                return (
                  <button
                    key={escrow.id}
                    type="button"
                    onClick={() => router.push(`/dashboard/escrows/${escrow.id}`)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-sky-500 dark:hover:bg-slate-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Escrow #{escrow.id.slice(-8)}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-300">Landlord: {escrow.landlord.slice(0, 8)}...</p>
                      </div>
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {escrow.status}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
                      <p>Rent: {formatXlm(escrow.total_rent)} XLM</p>
                      <p>Deadline: {formatDate(escrow.deadline)}</p>
                      <p>Deposited: {depositedCount}/{participantCount}</p>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full bg-slate-950 transition-all dark:bg-white"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
              <Search className="mx-auto mb-2 h-5 w-5" />
              No escrows found. Try another search or create a new escrow.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
